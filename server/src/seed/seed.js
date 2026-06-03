import dotenv from 'dotenv';
dotenv.config();
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Service from '../models/Service.js';
import Doctor from '../models/Doctor.js';
import mongoose from 'mongoose';

await connectDB();
await User.deleteMany();
await Service.deleteMany();
await Doctor.deleteMany();

await User.create({
  name: 'ELORA Admin',
  email: process.env.ADMIN_EMAIL || 'admin@elora.com',
  username: process.env.ADMIN_USERNAME || 'admin',
  password: await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@12345', 10),
  role: 'admin'
});

await Service.insertMany([
  { title: 'Hollywood Smile', titleAr: 'ابتسامة هوليوود', description: 'Digital smile design, veneers, and premium esthetic planning for a confident smile.', descriptionAr: 'تصميم رقمي للابتسامة مع عدسات تجميلية وخطة متكاملة لابتسامة واثقة.', duration: 60, priceFrom: 250, icon: 'Sparkles', image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1200&q=80', featured: true },
  { title: 'Dental Implants', titleAr: 'زراعة الأسنان', description: 'Modern implant solutions to replace missing teeth with natural-looking results.', descriptionAr: 'حلول زراعة حديثة لتعويض الأسنان المفقودة بنتائج طبيعية وثابتة.', duration: 90, priceFrom: 700, icon: 'ShieldCheck', image: 'https://images.unsplash.com/photo-1588776814546-ec7e4c2f2f5b?auto=format&fit=crop&w=1200&q=80', featured: true },
  { title: 'Teeth Whitening', titleAr: 'تبييض الأسنان', description: 'Safe professional whitening sessions for a brighter smile.', descriptionAr: 'جلسات تبييض احترافية وآمنة للحصول على ابتسامة أكثر إشراقًا.', duration: 45, priceFrom: 120, icon: 'Sun', image: 'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80', featured: true },
  { title: 'Orthodontics', titleAr: 'تقويم الأسنان', description: 'Braces and clear aligner consultations for adults and teens.', descriptionAr: 'استشارات التقويم الشفاف والتقويم التقليدي للبالغين والمراهقين.', duration: 45, priceFrom: 500, icon: 'Smile', image: 'https://images.unsplash.com/photo-1598257006626-5b0f6f22a59e?auto=format&fit=crop&w=1200&q=80', featured: false },
  { title: 'Root Canal Treatment', titleAr: 'علاج العصب', description: 'Pain-relief and tooth-saving endodontic treatment with modern techniques.', descriptionAr: 'علاج جذور متطور لتخفيف الألم والحفاظ على الأسنان بأحدث التقنيات.', duration: 75, priceFrom: 180, icon: 'HeartPulse', image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1200&q=80', featured: false },
  { title: 'Kids Dentistry', titleAr: 'أسنان الأطفال', description: 'Gentle pediatric dental care in a friendly and calm environment.', descriptionAr: 'رعاية أسنان لطيفة للأطفال في بيئة مريحة وودية.', duration: 40, priceFrom: 80, icon: 'Baby', image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=1200&q=80', featured: false }
]);

await Doctor.insertMany([
  { name: 'Dr. Lina Kareem', specialty: 'Cosmetic Dentistry', specialtyAr: 'طب الأسنان التجميلي', bio: 'Specialist in smile design, veneers, whitening, and facially driven esthetics.', bioAr: 'متخصصة في تصميم الابتسامة والعدسات وتبييض الأسنان والحلول التجميلية المتقدمة.', image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=900&q=80', experienceYears: 10, availableDays: ['Sunday','Monday','Tuesday','Wednesday'] },
  { name: 'Dr. Omar Nabil', specialty: 'Implantology & Oral Surgery', specialtyAr: 'زراعة الأسنان وجراحة الفم', bio: 'Focused on dental implants, surgical planning, and advanced restorative care.', bioAr: 'يركز على زراعة الأسنان والتخطيط الجراحي والحلول التعويضية المتقدمة.', image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=900&q=80', experienceYears: 12, availableDays: ['Monday','Tuesday','Thursday'] },
  { name: 'Dr. Sara Adel', specialty: 'Orthodontics', specialtyAr: 'تقويم الأسنان', bio: 'Creates comfortable orthodontic plans for clear aligners and braces.', bioAr: 'تضع خطط تقويم مريحة باستخدام التقويم الشفاف والتقويم التقليدي.', image: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=900&q=80', experienceYears: 8, availableDays: ['Sunday','Wednesday','Thursday'] }
]);

console.log('Seed completed');
await mongoose.disconnect();
