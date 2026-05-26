import React from 'react';
import { useEffect, useState } from 'react';
import PageHero from '../components/common/PageHero';
import SectionHeading from '../components/common/SectionHeading';
import DoctorCard from '../components/public/DoctorCard';
import { api } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';

export default function DoctorsPage() {
  const { t } = useLanguage();
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    api.get('/doctors').then((response) => setDoctors(response.data));
  }, []);

  return (
    <main>
      <PageHero
        eyebrow="ELORA"
        title={t('doctors.heroTitle')}
        text={t('doctors.heroText')}
        image="https://images.unsplash.com/photo-1666214280391-8ff5bd3c0bf0?auto=format&fit=crop&w=1400&q=80"
      />
      <section className="px-4 py-20">
        <SectionHeading eyebrow={t('nav.doctors')} title={t('doctors.sectionTitle')} text={t('doctors.sectionText')} />
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
          {doctors.map((doctor) => <DoctorCard key={doctor._id} doctor={doctor} />)}
        </div>
      </section>
    </main>
  );
}
