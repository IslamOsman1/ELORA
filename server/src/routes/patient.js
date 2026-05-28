import express from 'express';
import { z } from 'zod';
import Appointment from '../models/Appointment.js';
import MedicalSession from '../models/MedicalSession.js';
import Prescription from '../models/Prescription.js';
import MedicalFile from '../models/MedicalFile.js';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';
import { appointmentStatuses, canRequestCancellation, canRequestReschedule } from '../utils/booking.js';
import { createActivityLog } from '../utils/activity.js';

const router = express.Router();

const dateFilterSchema = z.object({
  status: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional()
});

const rescheduleSchema = z.object({
  proposedDate: z.string().min(8),
  proposedTime: z.string().min(3),
  reason: z.string().min(5)
});

const cancellationSchema = z.object({
  reason: z.string().min(5)
});

router.use(protect('customer'));

router.get('/appointments', async (req, res) => {
  const filters = dateFilterSchema.parse(req.query || {});
  const query = { user: req.user._id };

  if (filters.status && filters.status !== 'all') {
    query.status = filters.status;
  }
  if (filters.dateFrom || filters.dateTo) {
    query.date = {};
    if (filters.dateFrom) query.date.$gte = filters.dateFrom;
    if (filters.dateTo) query.date.$lte = filters.dateTo;
  }

  const appointments = await Appointment.find(query)
    .populate('service doctor')
    .sort({ date: -1, time: -1, createdAt: -1 });

  const searchTerm = String(filters.search || '').trim().toLowerCase();
  const filtered = searchTerm
    ? appointments.filter((appointment) =>
        appointment.bookingNumber?.toLowerCase().includes(searchTerm) ||
        appointment.service?.title?.toLowerCase().includes(searchTerm) ||
        appointment.service?.titleAr?.toLowerCase().includes(searchTerm)
      )
    : appointments;

  res.json(filtered);
});

router.get('/appointments/:id', async (req, res) => {
  const appointment = await Appointment.findOne({ _id: req.params.id, user: req.user._id })
    .populate('service doctor')
    .populate('statusHistory.actor', 'name email role');

  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  res.json(appointment);
});

router.post('/appointments/:id/reschedule-request', async (req, res) => {
  const payload = rescheduleSchema.parse(req.body || {});
  const appointment = await Appointment.findOne({ _id: req.params.id, user: req.user._id }).populate('service doctor');

  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  const blockedReason = canRequestReschedule(appointment);
  if (blockedReason) {
    return res.status(400).json({ message: blockedReason });
  }

  const previousSnapshot = appointment.toObject();
  appointment.previousStatus = appointment.status;
  appointment.status = appointmentStatuses.reschedule_requested;
  appointment.rescheduleRequest = {
    status: 'pending',
    requestedAt: new Date(),
    requestedBy: req.user._id,
    proposedDate: payload.proposedDate,
    proposedTime: payload.proposedTime,
    reason: payload.reason,
    reviewedAt: null,
    reviewedBy: null,
    decisionNote: '',
    originalDate: appointment.date,
    originalTime: appointment.time
  };
  appointment.statusHistory.push({
    status: appointmentStatuses.reschedule_requested,
    previousStatus: previousSnapshot.status,
    actor: req.user._id,
    note: payload.reason
  });

  await appointment.save();
  await createActivityLog({
    actor: req.user,
    actionType: 'appointment_reschedule_requested',
    entityType: 'Appointment',
    entityId: appointment._id,
    summary: `Reschedule request submitted for ${appointment.bookingNumber}`,
    oldData: previousSnapshot,
    newData: appointment.toObject()
  });

  res.status(201).json({ message: 'Reschedule request submitted', appointment });
});

router.post('/appointments/:id/cancellation-request', async (req, res) => {
  const payload = cancellationSchema.parse(req.body || {});
  const appointment = await Appointment.findOne({ _id: req.params.id, user: req.user._id }).populate('service doctor');

  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  const blockedReason = canRequestCancellation(appointment);
  if (blockedReason) {
    return res.status(400).json({ message: blockedReason });
  }

  const previousSnapshot = appointment.toObject();
  appointment.previousStatus = appointment.status;
  appointment.status = appointmentStatuses.cancellation_requested;
  appointment.cancellationRequest = {
    status: 'pending',
    requestedAt: new Date(),
    requestedBy: req.user._id,
    reason: payload.reason,
    reviewedAt: null,
    reviewedBy: null,
    decisionNote: ''
  };
  appointment.statusHistory.push({
    status: appointmentStatuses.cancellation_requested,
    previousStatus: previousSnapshot.status,
    actor: req.user._id,
    note: payload.reason
  });

  await appointment.save();
  await createActivityLog({
    actor: req.user,
    actionType: 'appointment_cancellation_requested',
    entityType: 'Appointment',
    entityId: appointment._id,
    summary: `Cancellation request submitted for ${appointment.bookingNumber}`,
    oldData: previousSnapshot,
    newData: appointment.toObject()
  });

  res.status(201).json({ message: 'Cancellation request submitted', appointment });
});

router.get('/medical-sessions', async (req, res) => {
  const sessions = await MedicalSession.find({ patient: req.user._id })
    .populate('doctor')
    .sort({ date: -1, sessionNumber: -1, createdAt: -1 });

  const sessionIds = sessions.map((session) => session._id);
  const [prescriptions, files] = await Promise.all([
    Prescription.find({ patient: req.user._id, session: { $in: sessionIds } }).lean(),
    MedicalFile.find({ patient: req.user._id, session: { $in: sessionIds } }).lean()
  ]);

  const prescriptionsBySession = new Map();
  prescriptions.forEach((item) => {
    prescriptionsBySession.set(String(item.session), item);
  });

  const filesBySession = new Map();
  files.forEach((file) => {
    const key = String(file.session || 'unlinked');
    const existing = filesBySession.get(key) || [];
    existing.push(file);
    filesBySession.set(key, existing);
  });

  res.json(
    sessions.map((session) => ({
      ...session.toObject(),
      prescription: prescriptionsBySession.get(String(session._id)) || null,
      files: filesBySession.get(String(session._id)) || []
    }))
  );
});

router.get('/medical-sessions/:id', async (req, res) => {
  const session = await MedicalSession.findOne({ _id: req.params.id, patient: req.user._id }).populate('doctor');
  if (!session) {
    return res.status(404).json({ message: 'Session not found' });
  }

  const [prescription, files] = await Promise.all([
    Prescription.findOne({ patient: req.user._id, session: session._id }),
    MedicalFile.find({ patient: req.user._id, session: session._id }).sort({ createdAt: -1 })
  ]);

  res.json({
    ...session.toObject(),
    prescription,
    files
  });
});

router.get('/notifications', async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(100);
  const unreadCount = await Notification.countDocuments({ user: req.user._id, readAt: null });
  res.json({ notifications, unreadCount });
});

router.patch('/notifications/:id/read', async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id, readAt: null },
    { readAt: new Date() },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }

  res.json(notification);
});

router.patch('/notifications/read-all', async (req, res) => {
  await Notification.updateMany({ user: req.user._id, readAt: null }, { readAt: new Date() });
  res.json({ ok: true });
});

router.patch('/notifications/preferences', async (req, res) => {
  req.user.browserNotificationsEnabled = Boolean(req.body?.enabled);
  await req.user.save();
  res.json({ enabled: req.user.browserNotificationsEnabled });
});

export default router;
