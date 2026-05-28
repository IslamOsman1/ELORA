import mongoose from 'mongoose';

const prescriptionItemSchema = new mongoose.Schema({
  medicineName: { type: String, required: true },
  dosage: { type: String, default: '' },
  frequencyPerDay: { type: String, default: '' },
  duration: { type: String, default: '' },
  instructions: { type: String, default: '' },
  notes: { type: String, default: '' }
}, { _id: true });

const prescriptionSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'MedicalSession', required: true, index: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', default: null },
  items: { type: [prescriptionItemSchema], default: [] }
}, { timestamps: true });

export default mongoose.model('Prescription', prescriptionSchema);
