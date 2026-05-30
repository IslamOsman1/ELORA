import mongoose from 'mongoose';

const treatmentCaseSchema = new mongoose.Schema({
  service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true, index: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', default: null },
  title: { type: String, required: true },
  titleAr: { type: String, default: '' },
  shortDescription: { type: String, default: '' },
  shortDescriptionAr: { type: String, default: '' },
  fullDescription: { type: String, default: '' },
  fullDescriptionAr: { type: String, default: '' },
  patientProblem: { type: String, default: '' },
  patientProblemAr: { type: String, default: '' },
  treatmentSteps: { type: [String], default: [] },
  treatmentStepsAr: { type: [String], default: [] },
  durationText: { type: String, default: '' },
  durationTextAr: { type: String, default: '' },
  resultSummary: { type: String, default: '' },
  resultSummaryAr: { type: String, default: '' },
  mainImage: { type: String, default: '' },
  beforeImages: { type: [String], default: [] },
  afterImages: { type: [String], default: [] },
  galleryImages: { type: [String], default: [] },
  videos: { type: [String], default: [] },
  caseDate: { type: String, default: '' },
  published: { type: Boolean, default: true },
  displayOrder: { type: Number, default: 0 }
}, { timestamps: true });

treatmentCaseSchema.index({ service: 1, published: 1, displayOrder: 1, createdAt: -1 });

export default mongoose.model('TreatmentCase', treatmentCaseSchema);
