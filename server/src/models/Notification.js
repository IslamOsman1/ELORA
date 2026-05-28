import mongoose from 'mongoose';

export const notificationTypeValues = [
  'booking_confirmed',
  'booking_rejected',
  'booking_rescheduled',
  'reschedule_approved',
  'reschedule_rejected',
  'cancellation_approved',
  'cancellation_rejected',
  'medical_session_added',
  'prescription_added',
  'doctor_note_added',
  'medical_file_added',
  'follow_up_added'
];

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: notificationTypeValues, required: true },
  link: { type: String, default: '' },
  readAt: { type: Date, default: null }
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);
