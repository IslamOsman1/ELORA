import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  specialtyAr: { type: String, default: '' },
  bio: { type: String, required: true },
  bioAr: { type: String, default: '' },
  image: { type: String, default: '' },
  experienceYears: { type: Number, default: 5 },
  availableDays: [{ type: String }]
}, { timestamps: true });

export default mongoose.model('Doctor', doctorSchema);
