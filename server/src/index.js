import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { connectDB } from './config/db.js';
import { ensureAdmin } from './utils/ensureAdmin.js';
import authRoutes from './routes/auth.js';
import publicRoutes from './routes/public.js';
import adminRoutes from './routes/admin.js';
import patientRoutes from './routes/patient.js';

const app = express();
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

function isDatabaseReady() {
  return mongoose.connection.readyState === 1;
}

function requireDatabase(req, res, next) {
  if (isDatabaseReady()) return next();
  return res.status(503).json({ message: 'Service temporarily unavailable' });
}

function isDatabaseUnavailableError(err) {
  const message = err?.message || '';
  return [
    'MongooseServerSelectionError',
    'MongoServerSelectionError',
    'MongoNetworkError'
  ].includes(err?.name) || /buffering timed out/i.test(message);
}

app.get('/ping', (req, res) => res.status(200).type('text/plain').send('OK'));

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (!allowedOrigins.length || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true
}));
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 300 }));

app.get('/', (req, res) => res.json({ message: 'ELORA Dental API is running' }));
app.get('/api/health', (req, res) => res.json({ ok: true, service: 'elora-dental-api' }));
app.use('/api/auth', requireDatabase, authRoutes);
app.use('/api', requireDatabase, publicRoutes);
app.use('/api/patient', requireDatabase, patientRoutes);
app.use('/api/admin', requireDatabase, adminRoutes);
app.use((err, req, res, next) => {
  if (err instanceof ZodError) {
    const firstIssue = err.issues?.[0];
    return res.status(400).json({
      message: firstIssue?.message || 'Invalid request data',
      issues: err.issues || []
    });
  }

  if (isDatabaseUnavailableError(err)) {
    return res.status(503).json({ message: 'Service temporarily unavailable' });
  }

  return res.status(500).json({ message: err.message || 'Server error' });
});

const port = process.env.PORT || 5000;
app.listen(port, '0.0.0.0', () => console.log(`Server running on ${port}`));

async function initializeDatabase() {
  try {
    await connectDB();
    await ensureAdmin();
  } catch (error) {
    console.error('MongoDB initialization failed', error);
  }
}

void initializeDatabase();
