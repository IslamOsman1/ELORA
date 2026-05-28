import React from 'react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Clock3, Sparkles, ShieldCheck, Sun, Smile, HeartPulse, Baby } from 'lucide-react';
import PageHero from '../components/common/PageHero';
import { api } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { localizedField, serviceImage } from '../utils/content';

const icons = { Sparkles, ShieldCheck, Sun, Smile, HeartPulse, Baby };

export default function ServiceDetailsPage() {
  const { serviceId } = useParams();
  const { t, language, isArabic } = useLanguage();
  const { branding } = useSiteSettings();
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/services/${serviceId}`)
      .then((response) => setService(response.data))
      .catch(() => setService(null))
      .finally(() => setLoading(false));
  }, [serviceId]);

  if (loading) {
    return <main className="grid min-h-screen place-items-center px-4 text-white/70">{t('common.loading')}</main>;
  }

  if (!service) {
    return (
      <main className="grid min-h-screen place-items-center px-4">
        <div className="premium-card max-w-xl p-8 text-center">
          <h1 className="font-display text-3xl text-[#f2d38d]">{isArabic ? 'الخدمة غير موجودة' : 'Service not found'}</h1>
          <Link to="/services" className="btn-dark mt-6 inline-flex items-center gap-2">
            <ArrowRight size={16} className={isArabic ? 'rotate-180' : ''} />
            {isArabic ? 'العودة للخدمات' : 'Back to services'}
          </Link>
        </div>
      </main>
    );
  }

  const Icon = icons[service.icon] || Sparkles;
  const title = localizedField(service, language, 'title');
  const description = localizedField(service, language, 'description');

  return (
    <main>
      <PageHero
        eyebrow={branding.brandName || 'ELORA'}
        title={title}
        text={description}
        image={serviceImage(service)}
      />
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_.9fr]">
          <div className="premium-card overflow-hidden">
            <img src={serviceImage(service)} alt={title} className="h-64 w-full object-cover sm:h-80" />
            <div className="p-5 sm:p-8">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f2d38d]/15 text-[#f2d38d]">
                <Icon size={22} />
              </div>
              <h2 className="mt-5 text-2xl font-semibold sm:text-4xl">{title}</h2>
              <p className="mt-4 text-sm leading-7 text-white/70 sm:text-base sm:leading-8">{description}</p>
            </div>
          </div>
          <aside className="grid gap-4 self-start">
            <div className="premium-card p-5 sm:p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-[#f2d38d]">{isArabic ? 'معلومات سريعة' : 'Quick info'}</p>
              <div className="mt-5 grid gap-3">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm text-white/50">{isArabic ? 'مدة الجلسة' : 'Session duration'}</p>
                  <div className="mt-2 flex items-center gap-2 text-white">
                    <Clock3 size={18} className="text-[#f2d38d]" />
                    <span className="font-semibold">{service.duration} {t('common.minutes')}</span>
                  </div>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm text-white/50">{isArabic ? 'السعر يبدأ من' : 'Starting from'}</p>
                  <p className="mt-2 text-2xl font-semibold text-[#f2d38d]">${service.priceFrom}</p>
                </div>
              </div>
            </div>
            <div className="premium-card p-5 sm:p-6">
              <p className="text-sm leading-7 text-white/65">
                {isArabic ? 'يمكنك الانتقال مباشرة إلى صفحة الحجز وسيتم اختيار هذه الخدمة لك تلقائيًا.' : 'You can continue to booking and this service will be preselected for you.'}
              </p>
              <div className="mt-5 flex flex-col gap-3">
                <Link to={`/booking?service=${service._id}`} className="btn-gold inline-flex items-center justify-center">
                  {t('common.bookNow')}
                </Link>
                <Link to="/services" className="btn-dark inline-flex items-center justify-center gap-2">
                  <ArrowRight size={16} className={isArabic ? 'rotate-180' : ''} />
                  {isArabic ? 'العودة لكل الخدمات' : 'View all services'}
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
