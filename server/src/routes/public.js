import express from 'express';
import { z } from 'zod';
import Service from '../models/Service.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import Message from '../models/Message.js';
import TreatmentCase from '../models/TreatmentCase.js';
import { getOrCreateSiteSettings } from '../utils/getSiteSettings.js';

const router = express.Router();
const appointmentSchema = z.object({
  patientName: z.string().min(2), phone: z.string().min(6), email: z.string().email(),
  service: z.string().min(8), doctor: z.string().optional().nullable(), date: z.string().min(8), time: z.string().min(3), notes: z.string().optional()
});
const messageSchema = z.object({ name: z.string().min(2), email: z.string().email(), phone: z.string().optional(), subject: z.string().optional(), message: z.string().min(5) });
const weekdayKeys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

function getTodayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function isPastDate(dateString) {
  return dateString < getTodayDateString();
}

function isPastSlot(dateString, timeString) {
  if (dateString !== getTodayDateString()) return false;
  const now = new Date();
  const [hours, minutes] = String(timeString || '').split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return false;
  return (hours * 60 + minutes) <= (now.getHours() * 60 + now.getMinutes());
}

function getDayKey(dateString) {
  const date = new Date(`${dateString}T00:00:00`);
  return weekdayKeys[date.getDay()];
}

function toMinutes(value) {
  const [hours, minutes] = String(value || '').split(':').map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return hours * 60 + minutes;
}

function formatMinutes(totalMinutes) {
  const hours = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const minutes = String(totalMinutes % 60).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function buildSlotsForWorkingDay(dayConfig) {
  if (!dayConfig?.enabled) return [];

  const start = toMinutes(dayConfig.from);
  const end = toMinutes(dayConfig.to);
  if (start === null || end === null || end < start) return [];

  const result = [];
  for (let minutes = start; minutes <= end; minutes += 30) {
    result.push(formatMinutes(minutes));
  }
  return result;
}

function getSlotsForDate(settings, dateString) {
  const dayKey = getDayKey(dateString);
  const dayConfig = (settings?.workingHours || []).find((item) => item.dayKey === dayKey);
  return buildSlotsForWorkingDay(dayConfig);
}

router.get('/services', async (req, res) => res.json(await Service.find().sort({ featured: -1, createdAt: -1 })));
router.get('/services/:id', async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) return res.status(404).json({ message: 'Service not found' });
  return res.json(service);
});
router.get('/services/:id/cases', async (req, res) => {
  const cases = await TreatmentCase.find({ service: req.params.id, published: true })
    .populate('service doctor')
    .sort({ displayOrder: 1, caseDate: -1, createdAt: -1 });
  return res.json(cases);
});
router.get('/cases', async (req, res) => {
  const query = { published: true };

  if (req.query.service) query.service = req.query.service;
  if (req.query.doctor) query.doctor = req.query.doctor;
  if (req.query.search) {
    query.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { titleAr: { $regex: req.query.search, $options: 'i' } },
      { shortDescription: { $regex: req.query.search, $options: 'i' } },
      { shortDescriptionAr: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  const limit = Number(req.query.limit) > 0 ? Number(req.query.limit) : 0;

  let request = TreatmentCase.find(query)
    .populate('service doctor')
    .sort({ displayOrder: 1, caseDate: -1, createdAt: -1 });

  if (limit) request = request.limit(limit);

  return res.json(await request);
});
router.get('/cases/:id', async (req, res) => {
  const treatmentCase = await TreatmentCase.findOne({ _id: req.params.id, published: true }).populate('service doctor');
  if (!treatmentCase) return res.status(404).json({ message: 'Case not found' });

  const similarCases = await TreatmentCase.find({
    _id: { $ne: treatmentCase._id },
    service: treatmentCase.service?._id || treatmentCase.service,
    published: true
  })
    .populate('service doctor')
    .sort({ displayOrder: 1, caseDate: -1, createdAt: -1 })
    .limit(6);

  return res.json({ treatmentCase, similarCases });
});
router.get('/doctors', async (req, res) => res.json(await Doctor.find().sort({ createdAt: -1 })));
router.get('/doctors/:id', async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
  return res.json(doctor);
});
router.get('/site-settings', async (req, res) => res.json(await getOrCreateSiteSettings()));
router.get('/slots', async (req, res) => {
  const { date, doctor } = req.query;
  if (!date || isPastDate(String(date))) {
    return res.json([]);
  }

  const settings = await getOrCreateSiteSettings();
  const availableSlots = getSlotsForDate(settings, String(date));
  if (!availableSlots.length) {
    return res.json([]);
  }

  const query = { date, status: { $ne: 'cancelled' } };
  if (doctor) query.doctor = doctor;
  const booked = await Appointment.find(query).select('time');
  const taken = new Set(booked.map(b => b.time));
  res.json(availableSlots.filter((slot) => !taken.has(slot) && !isPastSlot(String(date), slot)));
});
router.post('/appointments', async (req, res) => {
  try {
    const data = appointmentSchema.parse(req.body);
    const settings = await getOrCreateSiteSettings();
    const availableSlots = getSlotsForDate(settings, data.date);

    if (isPastDate(data.date) || isPastSlot(data.date, data.time)) {
      return res.status(400).json({ message: 'You cannot book a past appointment date or time' });
    }
    if (!availableSlots.includes(data.time)) {
      return res.status(400).json({ message: 'This time is outside working hours or unavailable for this day' });
    }

    const conflictingAppointment = await Appointment.exists({
      date: data.date,
      time: data.time,
      doctor: data.doctor || null,
      status: { $ne: 'cancelled' }
    });

    if (conflictingAppointment) {
      return res.status(409).json({ message: 'This slot is already booked' });
    }

    const appointment = await Appointment.create(data);
    res.status(201).json({ message: 'Appointment booked successfully', appointment });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'This slot is already booked' });
    res.status(400).json({ message: error.errors?.[0]?.message || error.message });
  }
});
router.post('/messages', async (req, res) => {
  try { const data = messageSchema.parse(req.body); res.status(201).json(await Message.create(data)); }
  catch (error) { res.status(400).json({ message: error.errors?.[0]?.message || error.message }); }
});

export default router;
