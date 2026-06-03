import express from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import mongoose from 'mongoose';
import { z } from 'zod';
import { protect } from '../middleware/auth.js';
import Appointment from '../models/Appointment.js';
import Message from '../models/Message.js';
import Service from '../models/Service.js';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import SiteSettings from '../models/SiteSettings.js';
import MedicalSession from '../models/MedicalSession.js';
import Prescription from '../models/Prescription.js';
import MedicalFile from '../models/MedicalFile.js';
import ActivityLog from '../models/ActivityLog.js';
import TreatmentCase from '../models/TreatmentCase.js';
import { isCloudinaryConfigured } from '../config/cloudinary.js';
import { uploadBufferToCloudinary } from '../utils/uploadToCloudinary.js';
import { getOrCreateSiteSettings } from '../utils/getSiteSettings.js';
import { appointmentStatuses, canRequestCancellation, canRequestReschedule } from '../utils/booking.js';
import { createNotification } from '../utils/notifications.js';
import { createActivityLog } from '../utils/activity.js';
import { syncAdminEnvFile } from '../utils/syncAdminEnv.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }
});

const medicalSessionSchema = z.object({
  doctor: z.string().optional().nullable(),
  appointment: z.string().optional().nullable(),
  date: z.string().min(8),
  status: z.string().min(3),
  notes: z.string().optional(),
  diagnosis: z.string().optional(),
  treatmentPlan: z.string().optional(),
  postCareInstructions: z.string().optional(),
  followUpDate: z.string().optional(),
  prescriptionItems: z.array(z.object({
    medicineName: z.string().min(1),
    dosage: z.string().optional(),
    frequencyPerDay: z.string().optional(),
    duration: z.string().optional(),
    instructions: z.string().optional(),
    notes: z.string().optional()
  })).optional()
});

const treatmentCaseSchema = z.object({
  service: z.string().min(8),
  doctor: z.string().optional().nullable(),
  title: z.string().min(2),
  titleAr: z.string().optional(),
  shortDescription: z.string().optional(),
  shortDescriptionAr: z.string().optional(),
  fullDescription: z.string().optional(),
  fullDescriptionAr: z.string().optional(),
  patientProblem: z.string().optional(),
  patientProblemAr: z.string().optional(),
  treatmentSteps: z.array(z.string()).optional(),
  treatmentStepsAr: z.array(z.string()).optional(),
  durationText: z.string().optional(),
  durationTextAr: z.string().optional(),
  resultSummary: z.string().optional(),
  resultSummaryAr: z.string().optional(),
  mainImage: z.string().optional(),
  beforeImages: z.array(z.string()).optional(),
  afterImages: z.array(z.string()).optional(),
  galleryImages: z.array(z.string()).optional(),
  videos: z.array(z.string()).optional(),
  caseDate: z.string().optional(),
  published: z.boolean().optional(),
  displayOrder: z.coerce.number().optional()
});

const adminSecuritySchema = z.object({
  currentPassword: z.string().min(1),
  email: z.string().email().optional(),
  newPassword: z.string().min(6).optional()
});

function isDoctorUser(user) {
  return user?.role === 'doctor';
}

function requireDoctorProfile(req, res) {
  if (isDoctorUser(req.user) && !req.user.doctorProfile) {
    res.status(403).json({ message: 'Doctor account is not linked to a doctor profile' });
    return true;
  }
  return false;
}

function applyRoleScope(query, req) {
  if (isDoctorUser(req.user) && req.user.doctorProfile) {
    query.doctor = req.user.doctorProfile;
  }
  return query;
}

function buildAppointmentFilters(req) {
  const query = {};
  const { status, dateFrom, dateTo, doctor, search, patientPhone } = req.query;

  if (status && status !== 'all') query.status = status;
  if (doctor && doctor !== 'all') query.doctor = doctor;
  if (dateFrom || dateTo) {
    query.date = {};
    if (dateFrom) query.date.$gte = dateFrom;
    if (dateTo) query.date.$lte = dateTo;
  }
  if (patientPhone) {
    query.phone = { $regex: String(patientPhone).trim(), $options: 'i' };
  }
  if (search) {
    const safe = String(search).trim();
    query.$or = [
      { patientName: { $regex: safe, $options: 'i' } },
      { bookingNumber: { $regex: safe, $options: 'i' } },
      { email: { $regex: safe, $options: 'i' } }
    ];
  }
  return query;
}

async function hydratePatientFile(patientId) {
  const patient = await User.findOne({ _id: patientId, role: 'customer' }).select('name email phone avatar createdAt');
  if (!patient) return null;

  const [appointments, sessions, prescriptions, files] = await Promise.all([
    Appointment.find({ user: patientId }).populate('service doctor').sort({ date: -1, time: -1 }),
    MedicalSession.find({ patient: patientId }).populate('doctor appointment').sort({ date: -1, sessionNumber: -1 }),
    Prescription.find({ patient: patientId }).populate('doctor session').sort({ createdAt: -1 }),
    MedicalFile.find({ patient: patientId }).populate('doctor session uploadedBy', 'name email').sort({ createdAt: -1 })
  ]);

  return { patient, appointments, sessions, prescriptions, files };
}

async function sendPatientNotification(userId, payload) {
  await createNotification({ user: userId, ...payload });
}

router.use(protect('admin', 'doctor'));

router.get('/stats', async (req, res) => {
  if (requireDoctorProfile(req, res)) return;

  const appointmentQuery = applyRoleScope({}, req);
  const patientIds = isDoctorUser(req.user)
    ? await Appointment.distinct('user', appointmentQuery)
    : null;
  const sessionQuery = isDoctorUser(req.user) && req.user.doctorProfile
    ? { doctor: req.user.doctorProfile }
    : {};

  const [appointments, pending, confirmed, messages, services, doctors, customers, sessions] = await Promise.all([
    Appointment.countDocuments(appointmentQuery),
    Appointment.countDocuments({ ...appointmentQuery, status: { $in: ['pending_review', 'reschedule_requested', 'cancellation_requested'] } }),
    Appointment.countDocuments({ ...appointmentQuery, status: 'confirmed' }),
    isDoctorUser(req.user) ? Promise.resolve(0) : Message.countDocuments({ read: false }),
    Service.countDocuments(),
    Doctor.countDocuments(),
    isDoctorUser(req.user) ? Promise.resolve(patientIds.length) : User.countDocuments({ role: 'customer' }),
    MedicalSession.countDocuments(sessionQuery)
  ]);

  res.json({ appointments, pending, confirmed, unreadMessages: messages, services, doctors, customers, sessions });
});

router.get('/appointments', async (req, res) => {
  if (requireDoctorProfile(req, res)) return;

  const query = applyRoleScope(buildAppointmentFilters(req), req);
  const appointments = await Appointment.find(query)
    .populate('service doctor user')
    .populate('statusHistory.actor', 'name email role')
    .sort({ date: -1, time: -1, createdAt: -1 });

  res.json(appointments);
});

router.get('/appointments/:id', async (req, res) => {
  if (requireDoctorProfile(req, res)) return;

  const query = applyRoleScope({ _id: req.params.id }, req);
  const appointment = await Appointment.findOne(query)
    .populate('service doctor user')
    .populate('statusHistory.actor', 'name email role');

  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  res.json(appointment);
});

router.patch('/appointments/:id', async (req, res) => {
  if (requireDoctorProfile(req, res)) return;

  const appointment = await Appointment.findOne(applyRoleScope({ _id: req.params.id }, req)).populate('service doctor user');
  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  const previous = appointment.toObject();
  const nextStatus = req.body?.status || appointment.status;
  const nextAdminNotes = typeof req.body?.adminNotes === 'string' ? req.body.adminNotes : appointment.adminNotes;

  appointment.previousStatus = appointment.status;
  appointment.status = nextStatus;
  appointment.adminNotes = nextAdminNotes;
  appointment.details = typeof req.body?.details === 'string' ? req.body.details : appointment.details;
  appointment.statusHistory.push({
    status: nextStatus,
    previousStatus: previous.status,
    actor: req.user._id,
    note: req.body?.statusNote || nextAdminNotes || ''
  });
  await appointment.save();

  await createActivityLog({
    actor: req.user,
    actionType: 'appointment_updated',
    entityType: 'Appointment',
    entityId: appointment._id,
    summary: `Appointment ${appointment.bookingNumber} updated`,
    oldData: previous,
    newData: appointment.toObject()
  });

  const patientNotificationMap = {
    confirmed: { type: 'booking_confirmed', title: 'تم تأكيد الحجز', message: `تم تأكيد الحجز رقم ${appointment.bookingNumber}.` },
    rejected: { type: 'booking_rejected', title: 'تم رفض الحجز', message: `تم رفض الحجز رقم ${appointment.bookingNumber}.` }
  };

  if (appointment.user && patientNotificationMap[nextStatus]) {
    await sendPatientNotification(appointment.user, {
      ...patientNotificationMap[nextStatus],
      link: '/account/bookings'
    });
  }

  res.json(appointment);
});

router.delete('/appointments/:id', async (req, res) => {
  if (isDoctorUser(req.user)) {
    return res.status(403).json({ message: 'Doctors cannot delete appointments' });
  }
  await Appointment.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

router.post('/appointments/:id/check-in', async (req, res) => {
  if (requireDoctorProfile(req, res)) return;

  const appointment = await Appointment.findOne(applyRoleScope({ _id: req.params.id }, req)).populate('service doctor user');
  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  const previous = appointment.toObject();
  appointment.attendanceConfirmed = true;
  appointment.attendanceConfirmedAt = new Date();
  appointment.previousStatus = appointment.status;
  appointment.status = appointmentStatuses.attended;
  appointment.statusHistory.push({
    status: appointmentStatuses.attended,
    previousStatus: previous.status,
    actor: req.user._id,
    note: 'Attendance confirmed from QR verification'
  });
  await appointment.save();

  await createActivityLog({
    actor: req.user,
    actionType: 'appointment_check_in',
    entityType: 'Appointment',
    entityId: appointment._id,
    summary: `Attendance confirmed for ${appointment.bookingNumber}`,
    oldData: previous,
    newData: appointment.toObject()
  });

  res.json(appointment);
});

router.post('/appointments/:id/reschedule/approve', async (req, res) => {
  if (requireDoctorProfile(req, res)) return;

  const appointment = await Appointment.findOne(applyRoleScope({ _id: req.params.id }, req)).populate('service doctor user');
  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }
  if (appointment.rescheduleRequest?.status !== 'pending') {
    return res.status(400).json({ message: 'No pending reschedule request found' });
  }

  const previous = appointment.toObject();
  appointment.previousStatus = appointment.status;
  appointment.date = appointment.rescheduleRequest.proposedDate;
  appointment.time = appointment.rescheduleRequest.proposedTime;
  appointment.status = appointmentStatuses.reschedule_approved;
  appointment.rescheduleRequest.status = 'approved';
  appointment.rescheduleRequest.reviewedAt = new Date();
  appointment.rescheduleRequest.reviewedBy = req.user._id;
  appointment.rescheduleRequest.decisionNote = String(req.body?.decisionNote || '');
  appointment.statusHistory.push({
    status: appointmentStatuses.reschedule_approved,
    previousStatus: previous.status,
    actor: req.user._id,
    note: appointment.rescheduleRequest.decisionNote
  });
  await appointment.save();

  await createActivityLog({
    actor: req.user,
    actionType: 'appointment_reschedule_approved',
    entityType: 'Appointment',
    entityId: appointment._id,
    summary: `Reschedule request approved for ${appointment.bookingNumber}`,
    oldData: previous,
    newData: appointment.toObject()
  });

  if (appointment.user) {
    await sendPatientNotification(appointment.user, {
      type: 'reschedule_approved',
      title: 'تم قبول طلب التأجيل',
      message: `تم قبول طلب تأجيل الحجز ${appointment.bookingNumber} إلى ${appointment.date} ${appointment.time}.`,
      link: '/account/bookings'
    });
    await sendPatientNotification(appointment.user, {
      type: 'booking_rescheduled',
      title: 'تم تعديل موعد الحجز',
      message: `تم تحديث موعد الحجز ${appointment.bookingNumber}.`,
      link: '/account/bookings'
    });
  }

  res.json(appointment);
});

router.post('/appointments/:id/reschedule/reject', async (req, res) => {
  if (requireDoctorProfile(req, res)) return;

  const appointment = await Appointment.findOne(applyRoleScope({ _id: req.params.id }, req)).populate('service doctor user');
  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }
  if (appointment.rescheduleRequest?.status !== 'pending') {
    return res.status(400).json({ message: 'No pending reschedule request found' });
  }

  const previous = appointment.toObject();
  appointment.status = appointmentStatuses.reschedule_rejected;
  appointment.rescheduleRequest.status = 'rejected';
  appointment.rescheduleRequest.reviewedAt = new Date();
  appointment.rescheduleRequest.reviewedBy = req.user._id;
  appointment.rescheduleRequest.decisionNote = String(req.body?.decisionNote || '');
  appointment.statusHistory.push({
    status: appointmentStatuses.reschedule_rejected,
    previousStatus: previous.status,
    actor: req.user._id,
    note: appointment.rescheduleRequest.decisionNote
  });
  await appointment.save();

  await createActivityLog({
    actor: req.user,
    actionType: 'appointment_reschedule_rejected',
    entityType: 'Appointment',
    entityId: appointment._id,
    summary: `Reschedule request rejected for ${appointment.bookingNumber}`,
    oldData: previous,
    newData: appointment.toObject()
  });

  if (appointment.user) {
    await sendPatientNotification(appointment.user, {
      type: 'reschedule_rejected',
      title: 'تم رفض طلب التأجيل',
      message: `تم رفض طلب تأجيل الحجز ${appointment.bookingNumber}.`,
      link: '/account/bookings'
    });
  }

  res.json(appointment);
});

router.post('/appointments/:id/cancellation/approve', async (req, res) => {
  if (requireDoctorProfile(req, res)) return;

  const appointment = await Appointment.findOne(applyRoleScope({ _id: req.params.id }, req)).populate('service doctor user');
  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }
  if (appointment.cancellationRequest?.status !== 'pending') {
    return res.status(400).json({ message: 'No pending cancellation request found' });
  }

  const previous = appointment.toObject();
  appointment.previousStatus = appointment.status;
  appointment.status = appointmentStatuses.cancelled;
  appointment.cancellationRequest.status = 'approved';
  appointment.cancellationRequest.reviewedAt = new Date();
  appointment.cancellationRequest.reviewedBy = req.user._id;
  appointment.cancellationRequest.decisionNote = String(req.body?.decisionNote || '');
  appointment.statusHistory.push({
    status: appointmentStatuses.cancellation_approved,
    previousStatus: previous.status,
    actor: req.user._id,
    note: appointment.cancellationRequest.decisionNote
  });
  await appointment.save();

  await createActivityLog({
    actor: req.user,
    actionType: 'appointment_cancellation_approved',
    entityType: 'Appointment',
    entityId: appointment._id,
    summary: `Cancellation request approved for ${appointment.bookingNumber}`,
    oldData: previous,
    newData: appointment.toObject()
  });

  if (appointment.user) {
    await sendPatientNotification(appointment.user, {
      type: 'cancellation_approved',
      title: 'تم قبول طلب الإلغاء',
      message: `تم قبول طلب إلغاء الحجز ${appointment.bookingNumber}.`,
      link: '/account/bookings'
    });
  }

  res.json(appointment);
});

router.post('/appointments/:id/cancellation/reject', async (req, res) => {
  if (requireDoctorProfile(req, res)) return;

  const appointment = await Appointment.findOne(applyRoleScope({ _id: req.params.id }, req)).populate('service doctor user');
  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }
  if (appointment.cancellationRequest?.status !== 'pending') {
    return res.status(400).json({ message: 'No pending cancellation request found' });
  }

  const previous = appointment.toObject();
  appointment.status = appointmentStatuses.cancellation_rejected;
  appointment.cancellationRequest.status = 'rejected';
  appointment.cancellationRequest.reviewedAt = new Date();
  appointment.cancellationRequest.reviewedBy = req.user._id;
  appointment.cancellationRequest.decisionNote = String(req.body?.decisionNote || '');
  appointment.statusHistory.push({
    status: appointmentStatuses.cancellation_rejected,
    previousStatus: previous.status,
    actor: req.user._id,
    note: appointment.cancellationRequest.decisionNote
  });
  await appointment.save();

  await createActivityLog({
    actor: req.user,
    actionType: 'appointment_cancellation_rejected',
    entityType: 'Appointment',
    entityId: appointment._id,
    summary: `Cancellation request rejected for ${appointment.bookingNumber}`,
    oldData: previous,
    newData: appointment.toObject()
  });

  if (appointment.user) {
    await sendPatientNotification(appointment.user, {
      type: 'cancellation_rejected',
      title: 'تم رفض طلب الإلغاء',
      message: `تم رفض طلب إلغاء الحجز ${appointment.bookingNumber}.`,
      link: '/account/bookings'
    });
  }

  res.json(appointment);
});

router.get('/messages', async (req, res) => {
  if (isDoctorUser(req.user)) return res.json([]);
  res.json(await Message.find().sort({ createdAt: -1 }));
});

router.patch('/messages/:id', async (req, res) => {
  if (isDoctorUser(req.user)) return res.status(403).json({ message: 'Forbidden' });
  res.json(await Message.findByIdAndUpdate(req.params.id, req.body, { new: true }));
});

router.delete('/messages/:id', async (req, res) => {
  if (isDoctorUser(req.user)) return res.status(403).json({ message: 'Forbidden' });
  await Message.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

router.get('/users', async (req, res) => {
  if (isDoctorUser(req.user)) return res.status(403).json({ message: 'Forbidden' });
  const users = await User.find({ role: 'customer' })
    .select('name email phone avatar authProviders qrCodeToken createdAt updatedAt')
    .sort({ createdAt: -1 });

  res.json(users);
});

router.get('/patients', async (req, res) => {
  if (requireDoctorProfile(req, res)) return;

  const { search, patientPhone } = req.query;
  const baseQuery = { role: 'customer' };
  if (search) {
    baseQuery.$or = [
      { name: { $regex: String(search).trim(), $options: 'i' } },
      { email: { $regex: String(search).trim(), $options: 'i' } }
    ];
  }
  if (patientPhone) {
    baseQuery.phone = { $regex: String(patientPhone).trim(), $options: 'i' };
  }

  let patients = await User.find(baseQuery)
    .select('name email phone avatar authProviders qrCodeToken createdAt updatedAt')
    .sort({ createdAt: -1 });

  if (isDoctorUser(req.user)) {
    const allowedIds = await Appointment.distinct('user', { doctor: req.user.doctorProfile });
    const allowedSet = new Set(allowedIds.map(String));
    patients = patients.filter((patient) => allowedSet.has(String(patient._id)));
  }

  res.json(patients);
});

router.get('/patients/:id', async (req, res) => {
  if (requireDoctorProfile(req, res)) return;

  if (isDoctorUser(req.user)) {
    const hasAccess = await Appointment.exists({ user: req.params.id, doctor: req.user.doctorProfile });
    if (!hasAccess) {
      return res.status(403).json({ message: 'Forbidden' });
    }
  }

  const file = await hydratePatientFile(req.params.id);
  if (!file) {
    return res.status(404).json({ message: 'Patient not found' });
  }
  res.json(file);
});

router.delete('/users/:id', async (req, res) => {
  if (isDoctorUser(req.user)) return res.status(403).json({ message: 'Forbidden' });
  const user = await User.findOneAndDelete({ _id: req.params.id, role: 'customer' });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  res.json({ ok: true });
});

router.post('/users/verify-qr', async (req, res) => {
  if (requireDoctorProfile(req, res)) return;

  const rawCode = String(req.body?.code || '').trim();
  if (!rawCode) {
    return res.status(400).json({ message: 'QR code value is required' });
  }

  const qrCodeToken = rawCode.startsWith('ELORA_USER:') ? rawCode.slice('ELORA_USER:'.length) : rawCode;
  const user = await User.findOne({ role: 'customer', qrCodeToken }).select('name email avatar authProviders qrCodeToken createdAt');
  if (!user) {
    return res.status(404).json({ message: 'User not found for this QR code' });
  }

  const appointments = await Appointment.find(
    applyRoleScope({
      user: new mongoose.Types.ObjectId(user._id),
      status: { $in: ['pending_review', 'confirmed', 'attended'] }
    }, req)
  )
    .populate('service doctor')
    .sort({ date: 1, time: 1 })
    .limit(10);

  res.json({ user, appointments });
});

router.get('/medical-sessions', async (req, res) => {
  if (requireDoctorProfile(req, res)) return;

  const query = {};
  if (req.query.patient) query.patient = req.query.patient;
  if (req.query.doctor) query.doctor = req.query.doctor;
  if (isDoctorUser(req.user)) query.doctor = req.user.doctorProfile;

  const sessions = await MedicalSession.find(query)
    .populate('patient', 'name email phone avatar')
    .populate('doctor')
    .populate('appointment', 'bookingNumber date time status')
    .sort({ date: -1, sessionNumber: -1, createdAt: -1 });

  res.json(sessions);
});

router.post('/patients/:id/medical-sessions', async (req, res) => {
  if (requireDoctorProfile(req, res)) return;
  const payload = medicalSessionSchema.parse(req.body || {});

  if (isDoctorUser(req.user) && payload.doctor && String(payload.doctor) !== String(req.user.doctorProfile)) {
    return res.status(403).json({ message: 'Doctors can only create sessions for their own profile' });
  }

  const patient = await User.findOne({ _id: req.params.id, role: 'customer' });
  if (!patient) {
    return res.status(404).json({ message: 'Patient not found' });
  }

  const lastSession = await MedicalSession.findOne({ patient: patient._id }).sort({ sessionNumber: -1 });
  const nextNumber = (lastSession?.sessionNumber || 0) + 1;
  const session = await MedicalSession.create({
    patient: patient._id,
    doctor: payload.doctor || req.user.doctorProfile || null,
    appointment: payload.appointment || null,
    sessionNumber: nextNumber,
    date: payload.date,
    status: payload.status,
    notes: payload.notes || '',
    diagnosis: payload.diagnosis || '',
    treatmentPlan: payload.treatmentPlan || '',
    postCareInstructions: payload.postCareInstructions || '',
    followUpDate: payload.followUpDate || '',
    doctorNameSnapshot: ''
  });

  if (payload.prescriptionItems?.length) {
    await Prescription.create({
      patient: patient._id,
      session: session._id,
      doctor: session.doctor,
      items: payload.prescriptionItems
    });
  }

  const hydrated = await MedicalSession.findById(session._id).populate('doctor appointment');
  await createActivityLog({
    actor: req.user,
    actionType: 'medical_session_created',
    entityType: 'MedicalSession',
    entityId: session._id,
    summary: `Medical session #${session.sessionNumber} created for ${patient.name}`,
    newData: hydrated.toObject()
  });

  await sendPatientNotification(patient._id, {
    type: 'medical_session_added',
    title: 'تمت إضافة جلسة جديدة',
    message: `تمت إضافة جلسة متابعة جديدة إلى ملفك الطبي.`,
    link: `/account/case-follow-up`
  });

  if (payload.prescriptionItems?.length) {
    await sendPatientNotification(patient._id, {
      type: 'prescription_added',
      title: 'تمت إضافة روشتة جديدة',
      message: `تمت إضافة روشتة جديدة داخل الجلسة رقم ${nextNumber}.`,
      link: `/account/case-follow-up`
    });
  }

  if (payload.followUpDate) {
    await sendPatientNotification(patient._id, {
      type: 'follow_up_added',
      title: 'تم تحديد موعد متابعة',
      message: `تم تحديد موعد متابعة جديد بتاريخ ${payload.followUpDate}.`,
      link: `/account/case-follow-up`
    });
  }

  res.status(201).json(hydrated);
});

router.patch('/medical-sessions/:id', async (req, res) => {
  if (requireDoctorProfile(req, res)) return;
  const payload = medicalSessionSchema.partial().parse(req.body || {});

  const session = await MedicalSession.findById(req.params.id);
  if (!session) {
    return res.status(404).json({ message: 'Session not found' });
  }
  if (isDoctorUser(req.user) && String(session.doctor) !== String(req.user.doctorProfile)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const previous = session.toObject();
  Object.assign(session, {
    doctor: payload.doctor ?? session.doctor,
    appointment: payload.appointment ?? session.appointment,
    date: payload.date ?? session.date,
    status: payload.status ?? session.status,
    notes: payload.notes ?? session.notes,
    diagnosis: payload.diagnosis ?? session.diagnosis,
    treatmentPlan: payload.treatmentPlan ?? session.treatmentPlan,
    postCareInstructions: payload.postCareInstructions ?? session.postCareInstructions,
    followUpDate: payload.followUpDate ?? session.followUpDate
  });
  await session.save();

  if (payload.prescriptionItems) {
    await Prescription.findOneAndUpdate(
      { session: session._id, patient: session.patient },
      {
        patient: session.patient,
        session: session._id,
        doctor: session.doctor,
        items: payload.prescriptionItems
      },
      { upsert: true, new: true }
    );
  }

  await createActivityLog({
    actor: req.user,
    actionType: 'medical_session_updated',
    entityType: 'MedicalSession',
    entityId: session._id,
    summary: `Medical session #${session.sessionNumber} updated`,
    oldData: previous,
    newData: session.toObject()
  });

  if (payload.notes || payload.diagnosis || payload.treatmentPlan) {
    await sendPatientNotification(session.patient, {
      type: 'doctor_note_added',
      title: 'تم تحديث ملاحظات الحالة',
      message: `تم تحديث بيانات جلستك الطبية رقم ${session.sessionNumber}.`,
      link: `/account/case-follow-up`
    });
  }

  res.json(await MedicalSession.findById(session._id).populate('doctor appointment'));
});

router.delete('/medical-sessions/:id', async (req, res) => {
  const session = await MedicalSession.findById(req.params.id);
  if (!session) {
    return res.status(404).json({ message: 'Session not found' });
  }
  if (isDoctorUser(req.user) && String(session.doctor) !== String(req.user.doctorProfile)) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const previous = session.toObject();
  await Prescription.deleteMany({ session: session._id });
  await MedicalFile.deleteMany({ session: session._id });
  await session.deleteOne();

  await createActivityLog({
    actor: req.user,
    actionType: 'medical_session_deleted',
    entityType: 'MedicalSession',
    entityId: req.params.id,
    summary: `Medical session #${previous.sessionNumber} deleted`,
    oldData: previous
  });

  res.json({ ok: true });
});

router.get('/prescriptions/:sessionId', async (req, res) => {
  const prescription = await Prescription.findOne({ session: req.params.sessionId }).populate('doctor session');
  if (!prescription) {
    return res.status(404).json({ message: 'Prescription not found' });
  }
  res.json(prescription);
});

router.post('/patients/:id/medical-files', upload.single('file'), async (req, res) => {
  if (requireDoctorProfile(req, res)) return;
  const patient = await User.findOne({ _id: req.params.id, role: 'customer' });
  if (!patient) {
    return res.status(404).json({ message: 'Patient not found' });
  }
  if (!req.file) {
    return res.status(400).json({ message: 'File is required' });
  }
  if (!isCloudinaryConfigured()) {
    return res.status(500).json({ message: 'Cloudinary is not configured on the server.' });
  }

  const isPdfFile = req.file.mimetype === 'application/pdf' || /\.pdf$/i.test(req.file.originalname || '');
  const uploaded = await uploadBufferToCloudinary(req.file.buffer, {
    folder: 'elora/medical-files',
    resource_type: isPdfFile ? 'raw' : 'auto'
  });

  const resolvedUrl = isPdfFile
    ? String(uploaded.secure_url || '').replace('/image/upload/', '/raw/upload/')
    : uploaded.secure_url;

  const file = await MedicalFile.create({
    patient: patient._id,
    session: req.body?.session || null,
    uploadedBy: req.user._id,
    doctor: req.body?.doctor || req.user.doctorProfile || null,
    type: req.body?.type || 'medical_image',
    title: req.body?.title || req.file.originalname,
    note: req.body?.note || '',
    url: resolvedUrl,
    publicId: uploaded.public_id,
    mimeType: req.file.mimetype,
    originalName: req.file.originalname
  });

  await createActivityLog({
    actor: req.user,
    actionType: 'medical_file_uploaded',
    entityType: 'MedicalFile',
    entityId: file._id,
    summary: `Medical file uploaded for ${patient.name}`,
    newData: file.toObject()
  });

  await sendPatientNotification(patient._id, {
    type: 'medical_file_added',
    title: 'تم رفع ملف طبي جديد',
    message: `تمت إضافة ملف طبي جديد إلى ملفك.`,
    link: `/account/case-follow-up`
  });

  res.status(201).json(file);
});

router.get('/activity-logs', async (req, res) => {
  const logs = await ActivityLog.find()
    .populate('actor', 'name email role')
    .sort({ createdAt: -1 })
    .limit(200);
  res.json(logs);
});

router.get('/site-settings', async (req, res) => {
  res.json(await getOrCreateSiteSettings());
});

router.get('/security', async (req, res) => {
  if (isDoctorUser(req.user)) return res.status(403).json({ message: 'Forbidden' });

  const adminUser = await User.findById(req.user._id).select('name email username');
  if (!adminUser) {
    return res.status(404).json({ message: 'Admin user not found' });
  }

  res.json({
    name: adminUser.name,
    email: adminUser.email
  });
});

router.patch('/security', async (req, res) => {
  if (isDoctorUser(req.user)) return res.status(403).json({ message: 'Forbidden' });

  const normalizedBody = {
    ...req.body,
    email: String(req.body?.email || '').trim() || undefined,
    newPassword: String(req.body?.newPassword || '').trim() || undefined
  };
  const validation = adminSecuritySchema.safeParse(normalizedBody);
  if (!validation.success) {
    const firstIssue = validation.error.issues?.[0];
    return res.status(400).json({ message: firstIssue?.message || 'Invalid security data' });
  }

  const payload = validation.data;
  const adminUser = await User.findById(req.user._id);
  if (!adminUser || adminUser.role !== 'admin') {
    return res.status(404).json({ message: 'Admin user not found' });
  }

  const passwordMatches = adminUser.password && await bcrypt.compare(payload.currentPassword, adminUser.password);
  if (!passwordMatches) {
    return res.status(400).json({ message: 'Current password is incorrect' });
  }

  const nextEmail = payload.email ? String(payload.email).trim().toLowerCase() : adminUser.email;
  const wantsEmailChange = Boolean(payload.email) && nextEmail !== adminUser.email;
  const wantsPasswordChange = Boolean(payload.newPassword);

  if (!wantsEmailChange && !wantsPasswordChange) {
    return res.status(400).json({ message: 'No security changes were provided' });
  }

  if (wantsEmailChange) {
    const existingUser = await User.findOne({ email: nextEmail, _id: { $ne: adminUser._id } }).select('_id');
    if (existingUser) {
      return res.status(409).json({ message: 'This email is already in use' });
    }
    adminUser.email = nextEmail;
  }

  if (wantsPasswordChange) {
    adminUser.password = await bcrypt.hash(payload.newPassword, 10);
  }

  await adminUser.save();

  try {
    await syncAdminEnvFile({
      email: wantsEmailChange ? adminUser.email : undefined,
      password: wantsPasswordChange ? payload.newPassword : undefined
    });
  } catch (envError) {
    console.error('Failed to sync admin credentials to .env:', envError.message);
  }

  res.json({
    message: 'Admin security settings updated successfully',
    user: {
      name: adminUser.name,
      email: adminUser.email
    }
  });
});

router.put('/site-settings', async (req, res) => {
  if (isDoctorUser(req.user)) return res.status(403).json({ message: 'Forbidden' });
  const current = await getOrCreateSiteSettings();
  const payload = req.body || {};

  current.branding = { ...current.branding.toObject?.(), ...(payload.branding || {}) };
  current.contact = { ...current.contact.toObject?.(), ...(payload.contact || {}) };
  current.workingHours = Array.isArray(payload.workingHours)
    ? payload.workingHours.map((item) => ({
        dayKey: item.dayKey || '',
        labelAr: item.labelAr || '',
        labelEn: item.labelEn || '',
        enabled: Boolean(item.enabled),
        from: item.from || '10:00',
        to: item.to || '17:00'
      }))
    : current.workingHours;
  current.images = { ...current.images.toObject?.(), ...(payload.images || {}) };
  current.copyOverrides = {
    ar: { ...(current.copyOverrides?.ar || {}), ...(payload.copyOverrides?.ar || {}) },
    en: { ...(current.copyOverrides?.en || {}), ...(payload.copyOverrides?.en || {}) }
  };

  await current.save();
  res.json(current);
});

router.post('/upload', upload.single('image'), async (req, res) => {
  if (isDoctorUser(req.user)) return res.status(403).json({ message: 'Forbidden' });
  if (!isCloudinaryConfigured()) {
    return res.status(500).json({ message: 'Cloudinary is not configured on the server.' });
  }
  if (!req.file) {
    return res.status(400).json({ message: 'Media file is required.' });
  }

  const folderType = req.body.type === 'doctors'
    ? 'doctors'
    : req.body.type === 'settings'
      ? 'settings'
      : req.body.type === 'cases'
        ? 'cases'
      : 'services';
  const requestedResourceType = req.body.resourceType === 'video' ? 'video' : 'image';
  const result = await uploadBufferToCloudinary(req.file.buffer, {
    folder: `elora/${folderType}`,
    resource_type: requestedResourceType
  });

  res.status(201).json({
    url: result.secure_url,
    publicId: result.public_id,
    resourceType: requestedResourceType
  });
});

router.post('/services', async (req, res) => {
  if (isDoctorUser(req.user)) return res.status(403).json({ message: 'Forbidden' });
  res.status(201).json(await Service.create(req.body));
});
router.patch('/services/:id', async (req, res) => {
  if (isDoctorUser(req.user)) return res.status(403).json({ message: 'Forbidden' });
  res.json(await Service.findByIdAndUpdate(req.params.id, req.body, { new: true }));
});
router.delete('/services/:id', async (req, res) => {
  if (isDoctorUser(req.user)) return res.status(403).json({ message: 'Forbidden' });
  await Service.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

router.post('/doctors', async (req, res) => {
  if (isDoctorUser(req.user)) return res.status(403).json({ message: 'Forbidden' });
  res.status(201).json(await Doctor.create(req.body));
});
router.patch('/doctors/:id', async (req, res) => {
  if (isDoctorUser(req.user)) return res.status(403).json({ message: 'Forbidden' });
  res.json(await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true }));
});
router.delete('/doctors/:id', async (req, res) => {
  if (isDoctorUser(req.user)) return res.status(403).json({ message: 'Forbidden' });
  await Doctor.findByIdAndDelete(req.params.id);
  res.json({ ok: true });
});

router.get('/cases', async (req, res) => {
  const query = {};
  if (req.query.service && req.query.service !== 'all') query.service = req.query.service;
  if (req.query.published === 'true') query.published = true;
  if (req.query.published === 'false') query.published = false;
  if (req.query.search) {
    const safe = String(req.query.search).trim();
    query.$or = [
      { title: { $regex: safe, $options: 'i' } },
      { titleAr: { $regex: safe, $options: 'i' } },
      { shortDescription: { $regex: safe, $options: 'i' } },
      { shortDescriptionAr: { $regex: safe, $options: 'i' } }
    ];
  }

  const cases = await TreatmentCase.find(query)
    .populate('service doctor')
    .sort({ service: 1, displayOrder: 1, caseDate: -1, createdAt: -1 });

  res.json(cases);
});

router.post('/cases', async (req, res) => {
  const payload = treatmentCaseSchema.parse(req.body || {});
  const treatmentCase = await TreatmentCase.create(payload);

  await createActivityLog({
    actor: req.user,
    actionType: 'treatment_case_created',
    entityType: 'TreatmentCase',
    entityId: treatmentCase._id,
    summary: `Treatment case created: ${treatmentCase.title}`,
    newData: treatmentCase.toObject()
  });

  res.status(201).json(await TreatmentCase.findById(treatmentCase._id).populate('service doctor'));
});

router.patch('/cases/:id', async (req, res) => {
  const payload = treatmentCaseSchema.partial().parse(req.body || {});
  const current = await TreatmentCase.findById(req.params.id);
  if (!current) {
    return res.status(404).json({ message: 'Case not found' });
  }
  const previous = current.toObject();
  Object.assign(current, payload);
  await current.save();

  await createActivityLog({
    actor: req.user,
    actionType: 'treatment_case_updated',
    entityType: 'TreatmentCase',
    entityId: current._id,
    summary: `Treatment case updated: ${current.title}`,
    oldData: previous,
    newData: current.toObject()
  });

  res.json(await TreatmentCase.findById(current._id).populate('service doctor'));
});

router.delete('/cases/:id', async (req, res) => {
  const current = await TreatmentCase.findById(req.params.id);
  if (!current) {
    return res.status(404).json({ message: 'Case not found' });
  }
  await current.deleteOne();

  await createActivityLog({
    actor: req.user,
    actionType: 'treatment_case_deleted',
    entityType: 'TreatmentCase',
    entityId: req.params.id,
    summary: `Treatment case deleted: ${current.title}`,
    oldData: current.toObject()
  });

  res.json({ ok: true });
});

export default router;
