import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String },
  role: { type: String, enum: ['admin', 'customer'], default: 'customer' },
  googleId: { type: String },
  avatar: { type: String },
  qrCodeToken: { type: String, unique: true, sparse: true },
  authProviders: {
    type: [String],
    enum: ['manual', 'google'],
    default: ['manual']
  }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
