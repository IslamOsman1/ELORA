import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import PageHero from '../components/common/PageHero';
import SectionHeading from '../components/common/SectionHeading';
import TreatmentCaseCard from '../components/public/TreatmentCaseCard';
import { api } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';
import { useSiteSettings } from '../context/SiteSettingsContext';

export default function TreatmentCasesPage() {
  const { t, isArabic, language } = useLanguage();
  const { branding, getImage } = useSiteSettings();
  const [cases, setCases] = useState([]);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.get('/cases'), api.get('/services')])
      .then(([casesResponse, servicesResponse]) => {
        setCases(casesResponse.data || []);
        setServices(servicesResponse.data || []);
      })
      .catch(() => {
        setCases([]);
        setServices([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredCases = useMemo(() => {
    if (selectedService === 'all') return cases;
    return cases.filter((item) => (item.service?._id || item.service) === selectedService);
  }, [cases, selectedService]);

  return (
    <main>
      <PageHero
        eyebrow={branding.brandName || 'ELORA'}
        title={isArabic ? 'حالات تم علاجها' : 'Treated Cases'}
        text={isArabic ? 'استعرض نتائج حقيقية من أعمال العيادة، مع إمكانية فتح كل حالة ومعرفة تفاصيل العلاج والصور.' : 'Browse real treatment results from the clinic and open each case to explore the treatment details and images.'}
        image={getImage('servicesHero', 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1400&q=80')}
      />

      <section className="px-4 py-20">
        <SectionHeading
          eyebrow={isArabic ? 'نتائج من أعمالنا' : 'Results from our work'}
          title={isArabic ? 'حالات منشورة من العيادة' : 'Published clinic cases'}
          text={isArabic ? 'يمكنك تصفح الحالات بحسب الخدمة، ثم فتح أي حالة لعرض الصور والتفاصيل الكاملة.' : 'Browse cases by service, then open any case to view the gallery and full treatment story.'}
        />

        <div className="mx-auto mb-8 flex max-w-7xl flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setSelectedService('all')}
            className={`rounded-full border px-4 py-2 text-sm transition ${selectedService === 'all' ? 'border-[#f2d38d]/40 bg-[#f2d38d]/12 text-[#f2d38d]' : 'border-white/10 bg-white/[0.03] text-white/70 hover:border-white/20'}`}
          >
            {isArabic ? 'كل الخدمات' : 'All services'}
          </button>
          {services.map((service) => {
            const label = language === 'ar' && service.titleAr ? service.titleAr : service.title;
            return (
              <button
                key={service._id}
                type="button"
                onClick={() => setSelectedService(service._id)}
                className={`rounded-full border px-4 py-2 text-sm transition ${selectedService === service._id ? 'border-[#f2d38d]/40 bg-[#f2d38d]/12 text-[#f2d38d]' : 'border-white/10 bg-white/[0.03] text-white/70 hover:border-white/20'}`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="grid min-h-[16rem] place-items-center text-white/60">
            {t('common.loading')}
          </div>
        ) : filteredCases.length ? (
          <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredCases.map((item) => <TreatmentCaseCard key={item._id} treatmentCase={item} />)}
          </div>
        ) : (
          <div className="mx-auto max-w-3xl rounded-[2rem] border border-dashed border-white/10 bg-white/[0.03] p-10 text-center text-white/55">
            {isArabic ? 'لا توجد حالات منشورة لهذه الخدمة حاليًا.' : 'There are no published cases for this service yet.'}
          </div>
        )}
      </section>
    </main>
  );
}
