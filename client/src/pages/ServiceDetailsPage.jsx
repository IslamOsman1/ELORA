import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Clock3, Sparkles, ShieldCheck, Sun, Smile, HeartPulse, Baby } from 'lucide-react';
import PageHero from '../components/common/PageHero';
import Seo from '../components/common/Seo';
import TreatmentCaseCard from '../components/public/TreatmentCaseCard';
import { api } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { localizedField, serviceImage } from '../utils/content';
import { formatPriceInEgp } from '../utils/currency';

const icons = { Sparkles, ShieldCheck, Sun, Smile, HeartPulse, Baby };

function listForLanguage(item, language, englishKey, arabicKey) {
  if (language === 'ar' && Array.isArray(item?.[arabicKey]) && item[arabicKey].length) return item[arabicKey];
  return item?.[englishKey] || item?.[arabicKey] || [];
}

export default function ServiceDetailsPage() {
  const { serviceId } = useParams();
  const { language, isArabic, t } = useLanguage();
  const { branding } = useSiteSettings();
  const [service, setService] = useState(null);
  const [treatmentCases, setTreatmentCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/services/${serviceId}`),
      api.get(`/services/${serviceId}/cases`)
    ])
      .then(([serviceResponse, casesResponse]) => {
        setService(serviceResponse.data);
        setTreatmentCases(casesResponse.data || []);
      })
      .catch(() => {
        setService(null);
        setTreatmentCases([]);
      })
      .finally(() => setLoading(false));
  }, [serviceId]);

  const Icon = useMemo(() => icons[service?.icon] || Sparkles, [service?.icon]);

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

  const title = localizedField(service, language, 'title');
  const description = localizedField(service, language, 'description');
  const banner = service.bannerImage || serviceImage(service);
  const formattedPrice = formatPriceInEgp(service.priceFrom, language);

  return (
    <main>
      <Seo
        title={`${branding.brandName || 'ELORA'} | ${title}`}
        description={description}
        image={banner}
        path={`/services/${serviceId}`}
        type="article"
      />
      <PageHero
        eyebrow={branding.brandName || 'ELORA'}
        title={title}
        text={description}
        image={banner}
      />
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.15fr_.85fr]">
          <div className="grid gap-6">
            <article className="premium-card p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-[#f2d38d]">{isArabic ? 'حالات تم علاجها' : 'Cases treated'}</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">{isArabic ? 'نتائج من أعمالنا' : 'Results from our work'}</h2>
                  <p className="mt-3 text-sm leading-7 text-white/65">
                    {isArabic ? 'أمثلة حقيقية لحالات مرتبطة بهذه الخدمة، مع عرض النتائج بشكل احترافي يحافظ على الخصوصية.' : 'Real examples related to this service, presented professionally while protecting privacy.'}
                  </p>
                </div>
                <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-white/55">
                  {treatmentCases.length} {isArabic ? 'حالة' : 'cases'}
                </div>
              </div>
              {treatmentCases.length ? (
                <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {treatmentCases.map((item) => <TreatmentCaseCard key={item._id} treatmentCase={item} />)}
                </div>
              ) : (
                <div className="mt-6 rounded-[1.6rem] border border-dashed border-white/10 bg-white/[0.02] p-8 text-center text-white/50">
                  {isArabic ? 'سيتم إضافة حالات مرتبطة بهذه الخدمة قريبًا.' : 'Cases related to this service will appear here soon.'}
                </div>
              )}
            </article>
          </div>

          <aside className="grid gap-4 self-start">
            <div className="premium-card p-5 sm:p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-[#f2d38d]">{isArabic ? 'معلومات سريعة' : 'Quick info'}</p>
              <div className="mt-5 grid gap-3">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm text-white/50">{isArabic ? 'مدة العلاج المتوقعة' : 'Expected duration'}</p>
                  <div className="mt-2 flex items-center gap-2 text-white">
                    <Clock3 size={18} className="text-[#f2d38d]" />
                    <span className="font-semibold">{service.duration} {t('common.minutes')}</span>
                  </div>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm text-white/50">{isArabic ? 'السعر يبدأ من' : 'Starting from'}</p>
                  <p className="mt-2 text-2xl font-semibold text-[#f2d38d]">{formattedPrice}</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm text-white/50">{isArabic ? 'عدد الحالات المنشورة' : 'Published cases'}</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{treatmentCases.length}</p>
                </div>
              </div>
            </div>
            <div className="premium-card p-5 sm:p-6">
              <p className="text-sm leading-7 text-white/65">
                {isArabic ? 'يمكنك الانتقال مباشرة إلى صفحة الحجز وسيتم اختيار هذه الخدمة لك تلقائيًا.' : 'You can continue directly to booking and this service will be preselected for you.'}
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
