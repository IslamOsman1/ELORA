import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  titleAr: { type: String, default: '' },
  description: { type: String, required: true },
  descriptionAr: { type: String, default: '' },
  duration: { type: Number, default: 45 },
  priceFrom: { type: Number, default: 0 },
  icon: { type: String, default: 'Sparkles' },
  image: { type: String, default: '' },
  featured: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model('Service', serviceSchema);
