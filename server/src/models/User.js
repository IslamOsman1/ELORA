import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String },
  role: { type: String, enum: ['admin', 'doctor', 'customer'], default: 'customer' },
  doctorProfile: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', default: null },
  phone: { type: String, default: '' },
  googleId: { type: String },
  avatar: { type: String },
  qrCodeToken: { type: String, unique: true, sparse: true },
  browserNotificationsEnabled: { type: Boolean, default: false },
  lastNotificationSeenAt: { type: Date, default: null },
  authProviders: {
    type: [String],
    enum: ['manual', 'google'],
    default: ['manual']
  }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
