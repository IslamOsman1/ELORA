import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';
import { z } from 'zod';
import User from '../models/User.js';
import Appointment from '../models/Appointment.js';
import Service from '../models/Service.js';
import Doctor from '../models/Doctor.js';
import { protect } from '../middleware/auth.js';
import { getOrCreateSiteSettings } from '../utils/getSiteSettings.js';
import { sendAppointmentWhatsappNotification } from '../utils/whatsapp.js';

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const appointmentSchema = z.object({
  patientName: z.string().min(2),
  phone: z.string().min(6),
  email: z.string().email(),
  service: z.string().min(8),
  doctor: z.string().optional().nullable(),
  date: z.string().min(8),
  time: z.string().min(3),
  notes: z.string().optional()
});
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

function createAuthToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
}

function createPasswordSetupToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, action: 'complete-customer-password' },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
}

function normalizeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    username: user.username || '',
    phone: user.phone || '',
    role: user.role,
    avatar: user.avatar || '',
    qrCodeToken: user.qrCodeToken || '',
    authProviders: user.authProviders || []
  };
}

function ensurePasswordIsStrong(password) {
  return typeof password === 'string' && password.length >= 6;
}

function createQrCodeToken() {
  return `elora-user-${crypto.randomBytes(12).toString('hex')}`;
}

async function ensureUserQrToken(user) {
  if (user.qrCodeToken) return user.qrCodeToken;
  user.qrCodeToken = createQrCodeToken();
  await user.save();
  return user.qrCodeToken;
}

async function verifyGoogleCredential(credential) {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error('GOOGLE_CLIENT_ID is not configured');
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID
  });

  return ticket.getPayload();
}

router.post('/login', async (req, res) => {
  const identifier = String(req.body?.email || req.body?.identifier || '').trim().toLowerCase();
  const password = String(req.body?.password || '');

  if (!identifier || !password) {
    return res.status(400).json({ message: 'Username/email and password are required' });
  }

  const user = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }]
  });
  if (!user || user.role !== 'admin' || !user.password || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  res.json({ token: createAuthToken(user), user: normalizeUser(user) });
});

router.post('/customer/register', async (req, res) => {
  const name = String(req.body?.name || '').trim();
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  if (!ensurePasswordIsStrong(password)) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ message: 'This email is already registered. Use login or Google sign-in.' });
  }

  const user = await User.create({
    name,
    email,
    password: await bcrypt.hash(password, 10),
    role: 'customer',
    qrCodeToken: createQrCodeToken(),
    authProviders: ['manual']
  });

  res.status(201).json({
    token: createAuthToken(user),
    user: normalizeUser(user)
  });
});

router.post('/customer/login', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await User.findOne({ email });
  if (!user || user.role !== 'customer' || !user.password || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  res.json({
    token: createAuthToken(user),
    user: normalizeUser(user)
  });
});

router.post('/customer/google', async (req, res) => {
  const credential = String(req.body?.credential || '');
  if (!credential) {
    return res.status(400).json({ message: 'Google credential is required' });
  }

  let payload;
  try {
    payload = await verifyGoogleCredential(credential);
  } catch (error) {
    return res.status(401).json({ message: error.message || 'Unable to verify Google sign-in' });
  }

  const email = String(payload.email || '').trim().toLowerCase();
  if (!email || !payload.email_verified) {
    return res.status(400).json({ message: 'Google account email is not verified' });
  }

  const googleId = String(payload.sub || '');
  const name = String(payload.name || email.split('@')[0] || 'Customer').trim();
  const avatar = String(payload.picture || '').trim();

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name,
      email,
      role: 'customer',
      googleId,
      avatar,
      qrCodeToken: createQrCodeToken(),
      authProviders: ['google']
    });

    return res.status(200).json({
      needsPasswordSetup: true,
      setupToken: createPasswordSetupToken(user),
      user: normalizeUser(user)
    });
  }

  if (user.role !== 'customer') {
    return res.status(403).json({ message: 'This email is reserved for another account type' });
  }

  user.name = user.name || name;
  user.avatar = avatar || user.avatar;
  user.googleId = googleId || user.googleId;
  user.authProviders = Array.from(new Set([...(user.authProviders || []), 'google']));
  if (!user.qrCodeToken) {
    user.qrCodeToken = createQrCodeToken();
  }
  await user.save();

  if (!user.password) {
    return res.status(200).json({
      needsPasswordSetup: true,
      setupToken: createPasswordSetupToken(user),
      user: normalizeUser(user)
    });
  }

  return res.json({
    token: createAuthToken(user),
    user: normalizeUser(user)
  });
});

router.post('/customer/set-password', async (req, res) => {
  const setupToken = String(req.body?.setupToken || '');
  const password = String(req.body?.password || '');

  if (!setupToken || !password) {
    return res.status(400).json({ message: 'Setup token and password are required' });
  }

  if (!ensurePasswordIsStrong(password)) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  let decoded;
  try {
    decoded = jwt.verify(setupToken, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).json({ message: 'Password setup session expired. Please sign in with Google again.' });
  }

  if (decoded.action !== 'complete-customer-password') {
    return res.status(400).json({ message: 'Invalid password setup token' });
  }

  const user = await User.findById(decoded.id);
  if (!user || user.role !== 'customer') {
    return res.status(404).json({ message: 'Customer account not found' });
  }

  user.password = await bcrypt.hash(password, 10);
  user.authProviders = Array.from(new Set([...(user.authProviders || []), 'manual']));
  if (!user.qrCodeToken) {
    user.qrCodeToken = createQrCodeToken();
  }
  await user.save();

  res.json({
    token: createAuthToken(user),
    user: normalizeUser(user)
  });
});

router.get('/me', protect(), async (req, res) => {
  await ensureUserQrToken(req.user);
  res.json({ user: normalizeUser(req.user) });
});

router.post('/customer/appointments', protect('customer'), async (req, res) => {
  try {
    const data = appointmentSchema.parse(req.body);
    await ensureUserQrToken(req.user);
    const settings = await getOrCreateSiteSettings();
    const availableSlots = getSlotsForDate(settings, data.date);

    if (isPastDate(data.date) || isPastSlot(data.date, data.time)) {
      return res.status(400).json({ message: 'You cannot book a past appointment date or time' });
    }
    if (!availableSlots.includes(data.time)) {
      return res.status(400).json({ message: 'This time is outside working hours or unavailable for this day' });
    }

    const serviceExists = await Service.exists({ _id: data.service });
    if (!serviceExists) {
      return res.status(400).json({ message: 'Selected service is not available' });
    }

    if (data.doctor) {
      const doctorExists = await Doctor.exists({ _id: data.doctor });
      if (!doctorExists) {
        return res.status(400).json({ message: 'Selected doctor is not available' });
      }
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

    const appointment = await Appointment.create({
      ...data,
      user: req.user._id,
      patientName: req.user.name,
      email: req.user.email,
      status: 'pending_review'
    });
    await appointment.populate('service doctor');

    if (data.phone && req.user.phone !== data.phone) {
      req.user.phone = data.phone;
      await req.user.save();
    }

    try {
      await sendAppointmentWhatsappNotification({ appointment, settings });
    } catch (notificationError) {
      console.error('Failed to send booking WhatsApp notification:', notificationError.message);
    }

    res.status(201).json({ message: 'Appointment booked successfully', appointment });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'This slot is already booked' });
    res.status(400).json({ message: error.errors?.[0]?.message || error.message });
  }
});

export default router;
