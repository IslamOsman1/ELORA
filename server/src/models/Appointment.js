import mongoose from 'mongoose';

const appointmentStatusValues = [
  'pending_review',
  'confirmed',
  'completed',
  'cancelled',
  'rejected',
  'attended',
  'no_show',
  'reschedule_requested',
  'reschedule_approved',
  'reschedule_rejected',
  'cancellation_requested',
  'cancellation_approved',
  'cancellation_rejected'
];

const requestStatusValues = ['none', 'pending', 'approved', 'rejected'];

const appointmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  patientName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  bookingNumber: { type: String, unique: true, index: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  notes: { type: String, default: '' },
  details: { type: String, default: '' },
  adminNotes: { type: String, default: '' },
  status: { type: String, enum: appointmentStatusValues, default: 'pending_review' },
  previousStatus: { type: String, enum: appointmentStatusValues, default: 'pending_review' },
  rescheduleRequest: {
    status: { type: String, enum: requestStatusValues, default: 'none' },
    requestedAt: { type: Date, default: null },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    proposedDate: { type: String, default: '' },
    proposedTime: { type: String, default: '' },
    reason: { type: String, default: '' },
    reviewedAt: { type: Date, default: null },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    decisionNote: { type: String, default: '' },
    originalDate: { type: String, default: '' },
    originalTime: { type: String, default: '' }
  },
  cancellationRequest: {
    status: { type: String, enum: requestStatusValues, default: 'none' },
    requestedAt: { type: Date, default: null },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    reason: { type: String, default: '' },
    reviewedAt: { type: Date, default: null },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    decisionNote: { type: String, default: '' }
  },
  statusHistory: [{
    status: { type: String, enum: appointmentStatusValues, required: true },
    previousStatus: { type: String, enum: appointmentStatusValues, default: null },
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    note: { type: String, default: '' },
    changedAt: { type: Date, default: Date.now }
  }],
  attendanceConfirmed: { type: Boolean, default: false },
  attendanceConfirmedAt: { type: Date, default: null }
}, { timestamps: true });

appointmentSchema.index(
  { date: 1, time: 1, doctor: 1 },
  { unique: true, partialFilterExpression: { status: { $ne: 'cancelled' } } }
);

appointmentSchema.pre('validate', function setBookingDefaults(next) {
  if (!this.bookingNumber) {
    const stamp = Date.now().toString().slice(-8);
    const random = Math.floor(100 + Math.random() * 900);
    this.bookingNumber = `EL-${stamp}-${random}`;
  }

  if (!this.rescheduleRequest?.originalDate) {
    this.rescheduleRequest.originalDate = this.date;
  }

  if (!this.rescheduleRequest?.originalTime) {
    this.rescheduleRequest.originalTime = this.time;
  }

  next();
});

export { appointmentStatusValues };
export default mongoose.model('Appointment', appointmentSchema);
