import React from 'react';
import { useEffect, useState } from 'react';
import PageHero from '../components/common/PageHero';
import SectionHeading from '../components/common/SectionHeading';
import DoctorCard from '../components/public/DoctorCard';
import { api } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';
import { useSiteSettings } from '../context/SiteSettingsContext';

export default function DoctorsPage() {
  const { t, language, isArabic } = useLanguage();
  const { branding, getImage, getText } = useSiteSettings();
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    api.get('/doctors').then((response) => setDoctors(response.data));
  }, []);

  return (
    <main>
      <PageHero
        eyebrow={branding.brandName || 'ELORA'}
        title={getText(language, 'doctors.heroTitle', t('doctors.heroTitle'))}
        text={getText(language, 'doctors.heroText', t('doctors.heroText'))}
        image={getImage('doctorsHero', 'https://images.unsplash.com/photo-1666214280391-8ff5bd3c0bf0?auto=format&fit=crop&w=1400&q=80')}
      />
      <section className="px-4 py-20">
        <SectionHeading eyebrow={t('nav.doctors')} title={t('doctors.sectionTitle')} text={t('doctors.sectionText')} />

        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 md:hidden">
          {doctors.map((doctor) => <DoctorCard key={doctor._id} doctor={doctor} compact />)}
        </div>

        <div className="mx-auto hidden max-w-7xl gap-3 sm:gap-6 md:grid md:grid-cols-2 xl:grid-cols-3">
          {doctors.map((doctor) => <DoctorCard key={doctor._id} doctor={doctor} />)}
        </div>

        <div className="mx-auto mt-8 max-w-7xl md:hidden">
          <div className="rounded-[1.7rem] border border-white/10 bg-white/[0.03] p-4 text-sm leading-7 text-white/60">
            {isArabic ? 'في الموبايل اضغط على اسم الطبيب لفتح صفحة التفاصيل الكاملة.' : 'On mobile, tap the doctor card to open the full details page.'}
          </div>
        </div>
      </section>
    </main>
  );
}
