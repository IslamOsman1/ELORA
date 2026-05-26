import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/auth.js';
import Appointment from '../models/Appointment.js';
import Message from '../models/Message.js';
import Service from '../models/Service.js';
import Doctor from '../models/Doctor.js';
import { isCloudinaryConfigured } from '../config/cloudinary.js';
import { uploadBufferToCloudinary } from '../utils/uploadToCloudinary.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.use(protect);

router.get('/stats', async (req, res) => {
  const [appointments, pending, confirmed, messages, services, doctors] = await Promise.all([
    Appointment.countDocuments(), Appointment.countDocuments({ status: 'pending' }), Appointment.countDocuments({ status: 'confirmed' }),
    Message.countDocuments({ read: false }), Service.countDocuments(), Doctor.countDocuments()
  ]);
  res.json({ appointments, pending, confirmed, unreadMessages: messages, services, doctors });
});
router.get('/appointments', async (req, res) => res.json(await Appointment.find().populate('service doctor').sort({ createdAt: -1 })));
router.patch('/appointments/:id', async (req, res) => res.json(await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('service doctor')));
router.delete('/appointments/:id', async (req, res) => { await Appointment.findByIdAndDelete(req.params.id); res.json({ ok: true }); });

router.get('/messages', async (req, res) => res.json(await Message.find().sort({ createdAt: -1 })));
router.patch('/messages/:id', async (req, res) => res.json(await Message.findByIdAndUpdate(req.params.id, req.body, { new: true })));
router.delete('/messages/:id', async (req, res) => { await Message.findByIdAndDelete(req.params.id); res.json({ ok: true }); });

router.post('/upload', upload.single('image'), async (req, res) => {
  if (!isCloudinaryConfigured()) {
    return res.status(500).json({ message: 'Cloudinary is not configured on the server.' });
  }

  if (!req.file) {
    return res.status(400).json({ message: 'Image file is required.' });
  }

  const folderType = req.body.type === 'doctors' ? 'doctors' : 'services';
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
