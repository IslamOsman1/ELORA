import React from 'react';
import { useEffect, useState } from 'react';
import PageHero from '../components/common/PageHero';
import SectionHeading from '../components/common/SectionHeading';
import ServiceCard from '../components/public/ServiceCard';
import { api } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';

export default function ServicesPage() {
  const { t } = useLanguage();
  const [services, setServices] = useState([]);

  useEffect(() => {
    api.get('/services').then((response) => setServices(response.data));
  }, []);

  return (
    <main>
      <PageHero
        eyebrow="ELORA"
        title={t('services.heroTitle')}
        text={t('services.heroText')}
        image="https://images.unsplash.com/photo-1606265752439-1f18756aa5fc?auto=format&fit=crop&w=1400&q=80"
      />
      <section className="px-4 py-20">
        <SectionHeading eyebrow={t('nav.services')} title={t('services.sectionTitle')} text={t('services.sectionText')} />
        <div className="mx-auto mb-10 grid max-w-7xl grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
          {t('services.highlights').map((item) => <div key={item} className="premium-card p-5 text-sm leading-7 text-white/70">{item}</div>)}
        </div>
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => <ServiceCard key={service._id} service={service} />)}
        </div>
      </section>
    </main>
  );
}
