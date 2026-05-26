import express from 'express';
import { z } from 'zod';
import Service from '../models/Service.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import Message from '../models/Message.js';

const router = express.Router();
const appointmentSchema = z.object({
  patientName: z.string().min(2), phone: z.string().min(6), email: z.string().email(),
  service: z.string().min(8), doctor: z.string().optional().nullable(), date: z.string().min(8), time: z.string().min(3), notes: z.string().optional()
});
const messageSchema = z.object({ name: z.string().min(2), email: z.string().email(), phone: z.string().optional(), subject: z.string().optional(), message: z.string().min(5) });

router.get('/services', async (req, res) => res.json(await Service.find().sort({ featured: -1, createdAt: -1 })));
router.get('/doctors', async (req, res) => res.json(await Doctor.find().sort({ createdAt: -1 })));
router.get('/slots', async (req, res) => {
  const { date, doctor } = req.query;
  const slots = ['10:00','10:30','11:00','11:30','12:00','12:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00'];
  const query = { date, status: { $ne: 'cancelled' } };
  if (doctor) query.doctor = doctor;
  const booked = await Appointment.find(query).select('time');
  const taken = new Set(booked.map(b => b.time));
  res.json(slots.filter(slot => !taken.has(slot)));
});
router.post('/appointments', async (req, res) => {
  try {
    const data = appointmentSchema.parse(req.body);
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
