import mongoose from 'mongoose';

const faqItemSchema = new mongoose.Schema({
  question: { type: String, default: '' },
  answer: { type: String, default: '' },
  questionAr: { type: String, default: '' },
  answerAr: { type: String, default: '' }
}, { _id: true });

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  titleAr: { type: String, default: '' },
  description: { type: String, required: true },
  descriptionAr: { type: String, default: '' },
  duration: { type: Number, default: 45 },
  priceFrom: { type: Number, default: 0 },
  icon: { type: String, default: 'Sparkles' },
  image: { type: String, default: '' },
  bannerImage: { type: String, default: '' },
  features: { type: [String], default: [] },
  featuresAr: { type: [String], default: [] },
  treatmentSteps: { type: [String], default: [] },
  treatmentStepsAr: { type: [String], default: [] },
  faqItems: { type: [faqItemSchema], default: [] },
  featured: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Service', serviceSchema);
