import mongoose from 'mongoose';

const siteSettingsSchema = new mongoose.Schema({
  singletonKey: { type: String, required: true, unique: true, default: 'main' },
  branding: {
    brandName: { type: String, default: 'ELORA' },
    brandFullAr: { type: String, default: '' },
    brandFullEn: { type: String, default: '' },
    logoUrl: { type: String, default: '/logo.jpg' }
  },
  contact: {
    location: { type: String, default: '' },
    locationUrl: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    locationIcon: { type: String, default: 'MapPin' },
    phoneIcon: { type: String, default: 'Phone' },
    emailIcon: { type: String, default: 'Mail' },
    whatsapp: { type: String, default: '' },
    instagram: { type: String, default: '' },
    facebook: { type: String, default: '' },
    whatsappIcon: { type: String, default: 'MessageCircle' },
    instagramIcon: { type: String, default: 'Instagram' },
    facebookIcon: { type: String, default: 'Facebook' }
  },
  workingHours: {
    type: [{
      dayKey: { type: String, required: true },
      labelAr: { type: String, default: '' },
      labelEn: { type: String, default: '' },
      enabled: { type: Boolean, default: true },
      from: { type: String, default: '10:00' },
      to: { type: String, default: '17:00' }
    }],
    default: []
  },
  images: {
    homeShowcaseImages: { type: [String], default: [] },
    aboutHero: { type: String, default: '' },
    aboutStory: { type: String, default: '' },
    aboutValuesImages: { type: [String], default: [] },
    servicesHero: { type: String, default: '' },
    doctorsHero: { type: String, default: '' },
    bookingHero: { type: String, default: '' },
    contactHero: { type: String, default: '' }
  },
  copyOverrides: {
    ar: { type: mongoose.Schema.Types.Mixed, default: {} },
    en: { type: mongoose.Schema.Types.Mixed, default: {} }
  }
}, { timestamps: true });

export default mongoose.model('SiteSettings', siteSettingsSchema);
