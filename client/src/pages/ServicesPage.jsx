import React from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageHero from '../components/common/PageHero';
import SectionHeading from '../components/common/SectionHeading';
import Seo from '../components/common/Seo';
import ServiceCard from '../components/public/ServiceCard';
import { api } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { localizedField, serviceImage } from '../utils/content';

function MobileServiceTile({ service }) {
  const { language } = useLanguage();

  return (
    <motion.div
      initial={{ opacity: 0.3, y: 60, scale: 0.88, rotateX: 10 }}
      whileInView={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
      viewport={{ once: false, amount: 0.45 }}
      whileTap={{ scale: 0.975 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformPerspective: 1200 }}
    >
      <Link to={`/services/${service._id}`} className="group block overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/[0.04]">
        <motion.div
          className="relative"
          initial={{ boxShadow: '0 0 0 rgba(242,211,141,0)' }}
          whileInView={{ boxShadow: '0 24px 60px rgba(0,0,0,0.28)' }}
          viewport={{ once: false, amount: 0.45 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
        >
          <motion.img
            src={serviceImage(service)}
            alt={localizedField(service, language, 'title')}
            loading="lazy"
            decoding="async"
            className="h-44 w-full object-cover"
            initial={{ scale: 1.16, filter: 'saturate(0.8) brightness(0.75)' }}
            whileInView={{ scale: 1, filter: 'saturate(1) brightness(1)' }}
            viewport={{ once: false, amount: 0.45 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.div
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent_18%,rgba(244,213,154,0.2)_42%,transparent_68%)]"
            initial={{ x: '-135%', opacity: 0 }}
            whileInView={{ x: '135%', opacity: [0, 0.95, 0] }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.95, ease: 'easeOut', delay: 0.08 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0b0e] via-[#0e0b0e]/15 to-transparent" />
          <motion.div
            className="absolute inset-x-0 bottom-0 p-4"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.55 }}
            transition={{ duration: 0.45, delay: 0.12, ease: 'easeOut' }}
          >
            <h3 className="text-lg font-semibold text-white">{localizedField(service, language, 'title')}</h3>
          </motion.div>
          <motion.div
            className="pointer-events-none absolute -inset-x-6 bottom-0 h-24 bg-[radial-gradient(circle_at_center,rgba(244,213,154,0.28),transparent_65%)]"
            initial={{ opacity: 0, scale: 0.75 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: false, amount: 0.45 }}
            transition={{ duration: 0.5, delay: 0.08, ease: 'easeOut' }}
          />
        </motion.div>
      </Link>
    </motion.div>
  );
}

export default function ServicesPage() {
  const { t, language, isArabic } = useLanguage();
  const { branding, getImage, getText } = useSiteSettings();
  const [services, setServices] = useState([]);
  const heroTitle = getText(language, 'services.heroTitle', t('services.heroTitle'));
  const heroText = getText(language, 'services.heroText', t('services.heroText'));
  const heroImage = getImage('servicesHero', 'https://images.unsplash.com/photo-1606265752439-1f18756aa5fc?auto=format&fit=crop&w=1400&q=80');

  useEffect(() => {
    api.get('/services').then((response) => setServices(response.data));
  }, []);

  return (
    <main>
      <Seo
        title={`${branding.brandName || 'ELORA'} | ${heroTitle}`}
        description={heroText}
        image={heroImage}
        path="/services"
      />
      <PageHero
        eyebrow={branding.brandName || 'ELORA'}
        title={heroTitle}
        text={heroText}
        image={heroImage}
      />
      <section className="px-4 py-20">
        <SectionHeading eyebrow={t('nav.services')} title={t('services.sectionTitle')} text={t('services.sectionText')} />
        <div className="scrollbar-hide mx-auto mb-10 flex max-w-7xl snap-x snap-mandatory gap-4 overflow-x-auto pb-3">
          {t('services.highlights').map((item) => (
            <div key={item} className="premium-card min-w-[78vw] snap-start p-5 text-sm leading-7 text-white/70 sm:min-w-[22rem] lg:min-w-[24rem]">
              {item}
            </div>
          ))}
        </div>

        <div className="mx-auto grid max-w-7xl gap-4 md:hidden">
          {services.map((service) => <MobileServiceTile key={service._id} service={service} />)}
        </div>

        <div className="mx-auto hidden max-w-7xl gap-3 sm:gap-6 md:grid md:grid-cols-2 xl:grid-cols-3">
          {services.map((service) => <ServiceCard key={service._id} service={service} />)}
        </div>
      </section>
    </main>
  );
}
