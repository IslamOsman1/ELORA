import mongoose from 'mongoose';

export const medicalSessionStatusValues = [
  'completed',
  'postponed',
  'attended',
  'no_show',
  'under_follow_up',
  'needs_review',
  'closed'
];

const medicalSessionSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', default: null },
  appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment', default: null },
  sessionNumber: { type: Number, required: true },
  date: { type: String, required: true },
  status: { type: String, enum: medicalSessionStatusValues, default: 'under_follow_up' },
  doctorNameSnapshot: { type: String, default: '' },
  notes: { type: String, default: '' },
  diagnosis: { type: String, default: '' },
  treatmentPlan: { type: String, default: '' },
  postCareInstructions: { type: String, default: '' },
  followUpDate: { type: String, default: '' }
}, { timestamps: true });

medicalSessionSchema.index({ patient: 1, sessionNumber: 1 }, { unique: true });

export default mongoose.model('MedicalSession', medicalSessionSchema);
