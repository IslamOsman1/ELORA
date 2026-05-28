import express from 'express';
import multer from 'multer';
import mongoose from 'mongoose';
import { protect } from '../middleware/auth.js';
import Appointment from '../models/Appointment.js';
import Message from '../models/Message.js';
import Service from '../models/Service.js';
import Doctor from '../models/Doctor.js';
import User from '../models/User.js';
import SiteSettings from '../models/SiteSettings.js';
import { isCloudinaryConfigured } from '../config/cloudinary.js';
import { uploadBufferToCloudinary } from '../utils/uploadToCloudinary.js';
import { getOrCreateSiteSettings } from '../utils/getSiteSettings.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.use(protect('admin'));

router.get('/stats', async (req, res) => {
  const [appointments, pending, confirmed, messages, services, doctors, customers] = await Promise.all([
    Appointment.countDocuments(), Appointment.countDocuments({ status: 'pending' }), Appointment.countDocuments({ status: 'confirmed' }),
    Message.countDocuments({ read: false }), Service.countDocuments(), Doctor.countDocuments(), User.countDocuments({ role: 'customer' })
  ]);
  res.json({ appointments, pending, confirmed, unreadMessages: messages, services, doctors, customers });
});
router.get('/appointments', async (req, res) => res.json(await Appointment.find().populate('service doctor user').sort({ createdAt: -1 })));
router.patch('/appointments/:id', async (req, res) => res.json(await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('service doctor')));
router.delete('/appointments/:id', async (req, res) => { await Appointment.findByIdAndDelete(req.params.id); res.json({ ok: true }); });

router.post('/appointments/:id/check-in', async (req, res) => {
  const appointment = await Appointment.findById(req.params.id).populate('service doctor user');
  if (!appointment) {
    return res.status(404).json({ message: 'Appointment not found' });
  }

  appointment.attendanceConfirmed = true;
  appointment.attendanceConfirmedAt = new Date();
  if (appointment.status === 'pending') {
    appointment.status = 'confirmed';
  }

  await appointment.save();
  res.json(appointment);
});

router.get('/messages', async (req, res) => res.json(await Message.find().sort({ createdAt: -1 })));
router.patch('/messages/:id', async (req, res) => res.json(await Message.findByIdAndUpdate(req.params.id, req.body, { new: true })));
router.delete('/messages/:id', async (req, res) => { await Message.findByIdAndDelete(req.params.id); res.json({ ok: true }); });

router.get('/users', async (req, res) => {
  const users = await User.find({ role: 'customer' })
    .select('name email avatar authProviders qrCodeToken createdAt updatedAt')
    .sort({ createdAt: -1 });

  res.json(users);
});

router.delete('/users/:id', async (req, res) => {
  const user = await User.findOneAndDelete({ _id: req.params.id, role: 'customer' });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({ ok: true });
});

router.post('/users/verify-qr', async (req, res) => {
  const rawCode = String(req.body?.code || '').trim();
  if (!rawCode) {
    return res.status(400).json({ message: 'QR code value is required' });
  }

  const qrCodeToken = rawCode.startsWith('ELORA_USER:') ? rawCode.slice('ELORA_USER:'.length) : rawCode;
  const user = await User.findOne({ role: 'customer', qrCodeToken }).select('name email avatar authProviders qrCodeToken createdAt');
  if (!user) {
    return res.status(404).json({ message: 'User not found for this QR code' });
  }

  const appointments = await Appointment.find({
    user: new mongoose.Types.ObjectId(user._id),
    status: { $in: ['pending', 'confirmed'] }
  })
    .populate('service doctor')
    .sort({ date: 1, time: 1 })
    .limit(10);

  res.json({ user, appointments });
});

router.get('/site-settings', async (req, res) => {
  res.json(await getOrCreateSiteSettings());
});

router.put('/site-settings', async (req, res) => {
  const current = await getOrCreateSiteSettings();
  const payload = req.body || {};

  current.branding = { ...current.branding.toObject?.(), ...(payload.branding || {}) };
  current.contact = { ...current.contact.toObject?.(), ...(payload.contact || {}) };
  current.images = { ...current.images.toObject?.(), ...(payload.images || {}) };
  current.copyOverrides = {
    ar: { ...(current.copyOverrides?.ar || {}), ...(payload.copyOverrides?.ar || {}) },
    en: { ...(current.copyOverrides?.en || {}), ...(payload.copyOverrides?.en || {}) }
  };

  await current.save();
  res.json(current);
});

router.post('/upload', upload.single('image'), async (req, res) => {
  if (!isCloudinaryConfigured()) {
    return res.status(500).json({ message: 'Cloudinary is not configured on the server.' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'Image file is required.' });
  }

  const folderType = req.body.type === 'doctors'
    ? 'doctors'
    : req.body.type === 'settings'
      ? 'settings'
      : 'services';
  const result = await uploadBufferToCloudinary(req.file.buffer, {
    folder: `elora/${folderType}`,
    resource_type: 'image'
  });

  res.status(201).json({
    url: result.secure_url,
    publicId: result.public_id
  });
});

router.post('/services', async (req, res) => res.status(201).json(await Service.create(req.body)));
router.patch('/services/:id', async (req, res) => res.json(await Service.findByIdAndUpdate(req.params.id, req.body, { new: true })));
router.delete('/services/:id', async (req, res) => { await Service.findByIdAndDelete(req.params.id); res.json({ ok: true }); });

router.post('/doctors', async (req, res) => res.status(201).json(await Doctor.create(req.body)));
router.patch('/doctors/:id', async (req, res) => res.json(await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true })));
router.delete('/doctors/:id', async (req, res) => { await Doctor.findByIdAndDelete(req.params.id); res.json({ ok: true }); });

export default router;
