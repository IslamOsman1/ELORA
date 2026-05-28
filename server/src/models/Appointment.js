import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  patientName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  date: { type: String, required: true },
  time: { type: String, required: true },
  notes: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' },
  attendanceConfirmed: { type: Boolean, default: false },
  attendanceConfirmedAt: { type: Date, default: null }
}, { timestamps: true });

appointmentSchema.index({ date: 1, time: 1, doctor: 1 }, { unique: true, partialFilterExpression: { status: { $ne: 'cancelled' } } });
export default mongoose.model('Appointment', appointmentSchema);
