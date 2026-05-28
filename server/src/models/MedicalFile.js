import mongoose from 'mongoose';

export const medicalFileTypeValues = [
  'xray',
  'lab',
  'before_after',
  'pdf_report',
  'medical_image',
  'follow_up'
];

const medicalFileSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'MedicalSession', default: null },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', default: null },
  type: { type: String, enum: medicalFileTypeValues, default: 'medical_image' },
  title: { type: String, required: true },
  note: { type: String, default: '' },
  url: { type: String, required: true },
  publicId: { type: String, default: '' },
  mimeType: { type: String, default: '' },
  originalName: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('MedicalFile', medicalFileSchema);
