import React from 'react';
import { useEffect, useState } from 'react';
import { Calendar, CheckCircle2, ShieldCheck, Sparkles, Stethoscope } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import SectionHeading from '../components/common/SectionHeading';
import ServiceCard from '../components/public/ServiceCard';
import DoctorCard from '../components/public/DoctorCard';

function DentalHeroAnimation() {
  return (
    <div className="pointer-events-none absolute -top-4 right-2 z-20 sm:right-6 lg:-top-6 lg:right-10">
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [0, 2, 0, -2, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="relative"
      >
        <motion.svg
          viewBox="0 0 160 190"
          className="h-24 w-24 drop-shadow-[0_0_30px_rgba(242,211,141,0.18)] sm:h-32 sm:w-32 lg:h-40 lg:w-40"
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <defs>
            <linearGradient id="toothGlow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff6d9" />
              <stop offset="55%" stopColor="#f2d38d" />
              <stop offset="100%" stopColor="#b9944e" />
            </linearGradient>
          </defs>
          <path
            d="M80 18c-24 0-46 10-46 38 0 22 11 38 16 53 4 11 4 32 14 32 7 0 11-11 13-19 2-9 4-16 12-16s10 7 12 16c2 8 6 19 13 19 10 0 10-21 14-32 5-15 16-31 16-53 0-28-22-38-46-38-7 0-13 2-18 4-5-2-11-4-18-4Z"
            fill="rgba(255,255,255,0.06)"
            stroke="url(#toothGlow)"
            strokeWidth="5"
            strokeLinejoin="round"
          />
          <motion.path
            d="M46 118c20 14 48 14 68 0"
            fill="none"
            stroke="rgba(255,255,255,0.18)"
            strokeWidth="4"
            strokeLinecap="round"
            animate={{ pathLength: [0.2, 1, 0.2], opacity: [0.2, 0.9, 0.2] }}
            transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.svg>

        <motion.div
          className="absolute -right-2 top-2 text-[#f2d38d]"
          animate={{ opacity: [0.35, 1, 0.35], scale: [0.8, 1.15, 0.8], rotate: [0, 14, 0] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
        </motion.div>

        <motion.div
          className="absolute -bottom-2 left-3 h-2 rounded-full bg-gradient-to-r from-transparent via-[#f2d38d] to-transparent sm:left-4"
          style={{ width: '72%' }}
          animate={{ x: [-10, 12, -10], opacity: [0.15, 0.65, 0.15] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        />
      </motion.div>
    </div>
  );
}

export default function HomePage() {
  const { t, language } = useLanguage();
  const { branding, getImage, getText } = useSiteSettings();
  const [services, setServices] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const showcaseImages = getImage('homeShowcaseImages', [
    'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1588776814546-daab30f310ce?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1571772996211-2f02c9727629?auto=format&fit=crop&w=1200&q=80'
  ]);
  const brandName = branding.brandName || 'ELORA';
  const brandFull = getText(language, 'common.brandFull', t('common.brandFull'));
  const homeEyebrow = getText(language, 'home.eyebrow', t('home.eyebrow'));
  const homeTitle = getText(language, 'home.title', t('home.title'));
  const homeDescription = getText(language, 'home.description', t('home.description'));
  const homeFeaturesTitle = getText(language, 'home.featuresTitle', t('home.featuresTitle'));
  const homeShowcaseText = getText(language, 'home.showcaseText', t('home.showcaseText'));
  const logoUrl = branding.logoUrl || '/logo.jpg';

  useEffect(() => {
    api.get('/services').then((response) => setServices(response.data.slice(0, 3)));
    api.get('/doctors').then((response) => setDoctors(response.data.slice(0, 3)));
  }, []);

  return (
    <main>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,213,154,0.24),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(96,54,31,0.38),transparent_35%)]" />
        <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
          <img
            src={logoUrl}
            alt=""
            aria-hidden="true"
            className="h-[180px] w-[180px] rounded-[2.5rem] object-cover opacity-[0.06] blur-[1px] sm:h-[260px] sm:w-[260px] sm:rounded-[3.5rem] lg:h-[420px] lg:w-[420px] lg:rounded-[5rem] lg:opacity-[0.08]"
          />
        </div>
        <div className="relative z-10 mx-auto grid max-w-7xl items-start gap-5 px-4 pt-12 sm:gap-10 sm:pt-16 md:pt-20 lg:grid-cols-[1fr_.95fr]">
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.65 }} className="relative z-10">
            <div className="sm:hidden">
              <div className="hero-card-glow-wrap premium-card relative overflow-hidden p-4">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(242,211,141,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(242,211,141,0.08),transparent_32%),linear-gradient(145deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))]" />
                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="logo-glow-wrap overflow-hidden rounded-[1.35rem] border border-[#f2d38d]/18 bg-white/[0.04] p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.16)]">
                        <img src={logoUrl} alt={`${brandName} logo`} className="relative z-10 h-14 w-14 rounded-[1rem] object-cover" />
                      </div>
                      <div>
                        <p className="text-[0.68rem] uppercase tracking-[0.35em] text-[#f2d38d]">{brandName}</p>
                        <p className="mt-3 max-w-[14rem] font-display text-[1.55rem] leading-[1.08] text-white">رعاية دقيقة لابتسامة مريحة</p>
                        <p className="mt-1 text-[0.72rem] uppercase tracking-[0.24em] text-[#f2d38d]/85">{brandFull}</p>
                        <p className="mt-3 max-w-[15rem] text-[0.8rem] leading-5 text-white/70">
                          تشخيص واضح وخيارات علاج مدروسة في أجواء هادئة
                        </p>
                        <p className="mt-1 max-w-[15rem] text-[0.68rem] leading-5 text-white/45">
                          Clear diagnosis and thoughtful treatment in a calm setting.
                        </p>
                      </div>
                    </div>
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-[#f2d38d]/25 bg-[#f2d38d]/10">
                      <Sparkles className="h-5 w-5 text-[#f2d38d]" />
                    </div>
                  </div>
                  <div className="mt-4 overflow-hidden rounded-[1.45rem] border border-[#f2d38d]/16 bg-white/[0.03]">
                    <div className="relative">
                      <img
                        src={showcaseImages[0]}
                        alt="Clear aligner smile"
                        className="h-32 w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#120f0d]/72 via-transparent to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-3 px-4 py-3">
                        <div>
                          <p className="text-[0.62rem] uppercase tracking-[0.24em] text-[#f2d38d]/85">Aligners | التقويم الشفاف</p>
                          <p className="mt-1 text-sm font-semibold text-white">حلول مريحة لتقويم الأسنان وتحسين الابتسامة</p>
                        </div>
                        <div className="rounded-full border border-white/15 bg-black/20 px-3 py-1 text-[0.66rem] text-white/80">
                          Modern Care
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 grid grid-cols-[1.1fr_.9fr] gap-3">
                    <div className="rounded-[1.4rem] border border-[#f2d38d]/18 bg-white/[0.04] p-4">
                      <p className="text-[0.64rem] uppercase tracking-[0.24em] text-white/40">Esthetics | التجميل</p>
                      <p className="mt-3 text-lg font-semibold text-white">تصميم وتجميل الابتسامة</p>
                      <p className="mt-1 text-[0.72rem] text-[#f2d38d]">Smile Design</p>
                      <p className="mt-2 text-[0.72rem] leading-5 text-white/55">خطط علاجية لتحسين اللون، التناسق، وإبراز جمال الابتسامة بشكل طبيعي.</p>
                    </div>
                    <div className="grid gap-3">
                      <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-3">
                        <p className="text-[0.62rem] uppercase tracking-[0.22em] text-white/40">Care | الرعاية</p>
                        <p className="mt-2 text-sm font-semibold text-white">استشارة واضحة</p>
                        <p className="mt-1 text-[0.68rem] text-white/50">Clear Consultation</p>
                      </div>
                      <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-3">
                        <p className="text-[0.62rem] uppercase tracking-[0.22em] text-white/40">Booking | الحجز</p>
                        <p className="mt-2 text-sm font-semibold text-white">مواعيد مرنة</p>
                        <p className="mt-1 text-[0.68rem] text-white/50">Flexible Booking</p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 rounded-[1.2rem] border border-white/10 bg-black/15 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[0.62rem] uppercase tracking-[0.22em] text-white/40">Treatments | العلاجات</p>
                        <p className="mt-1 text-sm font-semibold text-white">تقويم شفاف وعلاجات تجميلية</p>
                        <p className="mt-1 text-[0.68rem] text-white/50">Aligners & Esthetic Dentistry</p>
                      </div>
                      <div className="hero-mini-tooth" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden sm:block">
              <p className="eyebrow">{homeEyebrow}</p>
              <h1 className="mt-3 font-display text-[2rem] leading-[1.02] sm:mt-5 sm:text-5xl lg:text-7xl">{homeTitle}</h1>
              <p className="mt-3 max-w-2xl text-[0.92rem] leading-6 text-white/70 sm:mt-6 sm:text-lg sm:leading-8">{homeDescription}</p>
            </div>
            <div className="mt-5 grid gap-3 sm:mt-8 sm:flex sm:flex-wrap">
              <Link to="/booking" className="btn-gold inline-flex items-center justify-center gap-2 !px-4 !py-3 text-sm sm:!px-6 sm:!py-3 sm:text-base"><Calendar size={16} />{t('home.primaryCta')}</Link>
              <Link to="/about" className="btn-dark !px-4 !py-3 text-center text-sm sm:!px-6 sm:!py-3 sm:text-base">{t('home.secondaryCta')}</Link>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7 }} className="relative z-10 hidden lg:block">
            <DentalHeroAnimation />
            <div className="hidden content-start gap-4 sm:grid sm:grid-cols-2">
              <img src={showcaseImages[0]} alt="Clinic interior" className="h-[280px] w-full rounded-[2.25rem] object-cover" />
              <img src={showcaseImages[1]} alt="Dental treatment" className="mt-10 h-[280px] w-full rounded-[2.25rem] object-cover" />
            </div>
          </motion.div>
        </div>
        <div className="mx-auto max-w-7xl px-4 pt-4 sm:pt-8">
          <div className="grid w-full gap-3 md:grid-cols-3 md:gap-4">
            {[Sparkles, ShieldCheck, Stethoscope].map((Icon, index) => (
              <div key={index} className="rounded-[1.2rem] border border-white/10 bg-white/[0.04] p-3 sm:rounded-[1.8rem] sm:p-5">
                <Icon className="h-4 w-4 text-[#f2d38d] sm:h-6 sm:w-6" />
                <p className="mt-2 text-[0.72rem] leading-5 text-white/65 sm:mt-4 sm:text-sm sm:leading-7">{t('home.features')[index]}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-4 sm:pb-16 sm:pt-8 md:pb-20">
          <div className="grid w-full grid-cols-3 gap-2 sm:gap-4">
            {t('home.stats').map((stat) => (
              <div key={stat.label} className="premium-card min-w-0 p-3 text-center sm:p-5">
                <p className="text-xl font-semibold text-[#f2d38d] sm:text-3xl">{stat.value}</p>
                <p className="mt-1 text-[0.68rem] text-white/60 sm:mt-2 sm:text-sm">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20">
        <SectionHeading eyebrow={brandName} title={homeFeaturesTitle} text={homeShowcaseText} />
        <div className="scrollbar-hide mx-auto flex max-w-7xl snap-x snap-mandatory gap-4 overflow-x-auto pb-3">
          {showcaseImages.map((image, index) => (
            <article key={image} className="premium-card min-w-[78vw] snap-start overflow-hidden sm:min-w-[24rem] lg:min-w-[28rem]">
              <img src={image} alt={`Showcase ${index + 1}`} className="h-32 w-full object-cover sm:h-64" />
              <div className="p-3 sm:p-6">
                <div className="inline-flex items-center gap-2 text-[0.72rem] text-[#f2d38d] sm:text-sm"><CheckCircle2 size={14} /> {brandName}</div>
                <h3 className="mt-3 text-lg font-semibold sm:mt-4 sm:text-2xl">{t('home.features')[index]}</h3>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white/[0.02] px-4 py-20">
        <SectionHeading eyebrow={t('nav.services')} title={t('services.sectionTitle')} text={t('services.sectionText')} />
        <div className="scrollbar-hide mx-auto flex max-w-7xl snap-x snap-mandatory gap-4 overflow-x-auto pb-3">
          {services.map((service) => (
            <div key={service._id} className="min-w-[78vw] snap-start sm:min-w-[21rem] lg:min-w-[24rem]">
              <ServiceCard service={service} compact />
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-20">
        <SectionHeading eyebrow={t('nav.doctors')} title={t('doctors.sectionTitle')} text={t('doctors.sectionText')} />
        <div className="scrollbar-hide mx-auto flex max-w-7xl snap-x snap-mandatory gap-4 overflow-x-auto pb-3">
          {doctors.map((doctor) => (
            <div key={doctor._id} className="min-w-[78vw] snap-start sm:min-w-[22rem] lg:min-w-[25rem]">
              <DoctorCard doctor={doctor} compact />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
