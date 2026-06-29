import React from 'react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { BadgeInfo, Building2, Contact, Info, Landmark, LocateFixed, Mail, MapPin, MapPinned, Phone, PhoneCall, Smartphone } from 'lucide-react';
import PageHero from '../components/common/PageHero';
import SectionHeading from '../components/common/SectionHeading';
import Seo from '../components/common/Seo';
import { api } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';
import { useSiteSettings } from '../context/SiteSettingsContext';

const initialForm = { name: '', email: '', phone: '', subject: '', message: '' };

const iconMap = {
  Mail,
  MapPin,
  Phone,
  Building2,
  MapPinned,
  LocateFixed,
  Landmark,
  Smartphone,
  PhoneCall,
  BadgeInfo,
  Contact,
  Info
};

function resolveIcon(name, fallback) {
  return iconMap[name] || fallback;
}

export default function ContactPage() {
  const { t, language } = useLanguage();
  const { branding, contact, getImage, getText } = useSiteSettings();
  const [form, setForm] = useState(initialForm);
  const heroTitle = getText(language, 'contact.heroTitle', t('contact.heroTitle'));
  const heroText = getText(language, 'contact.heroText', t('contact.heroText'));
  const heroImage = getImage('contactHero', 'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1400&q=80');
  const LocationIcon = resolveIcon(contact.locationIcon, MapPin);
  const PhoneIcon = resolveIcon(contact.phoneIcon, Phone);
  const EmailIcon = resolveIcon(contact.emailIcon, Mail);
  const locationHref = contact.locationUrl
    ? (/^https?:\/\//i.test(contact.locationUrl) ? contact.locationUrl : `https://${contact.locationUrl.replace(/^\/+/, '')}`)
    : '';
  const socialLinks = [
    contact.instagram ? `https://www.instagram.com/${String(contact.instagram).replace(/^@/, '')}` : null,
    contact.facebook ? `https://www.facebook.com/${contact.facebook}` : null,
    contact.whatsapp ? `https://wa.me/${String(contact.whatsapp).replace(/\D/g, '')}` : null
  ].filter(Boolean);
  const seoJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Dentist',
    name: branding.brandName || 'ELORA',
    url: 'https://eloradental.care/contact',
    image: branding.logoUrl || '/logo.png',
    description: heroText,
    telephone: contact.phone || undefined,
    email: contact.email || undefined,
    address: contact.location ? { '@type': 'PostalAddress', streetAddress: contact.location } : undefined,
    sameAs: socialLinks.length ? socialLinks : undefined,
    contactPoint: (contact.phone || contact.email) ? [{
      '@type': 'ContactPoint',
      telephone: contact.phone || undefined,
      email: contact.email || undefined,
      contactType: 'customer service'
    }] : undefined
  };

  async function submit(event) {
    event.preventDefault();
    try {
      await api.post('/messages', form);
      toast.success(t('contact.success'));
      setForm(initialForm);
    } catch (error) {
      toast.error(error.response?.data?.message || t('contact.fail'));
    }
  }

  return (
    <main>
      <Seo
        title={`${branding.brandName || 'ELORA'} | ${heroTitle}`}
        description={heroText}
        image={heroImage}
        path="/contact"
        keywords={language === 'ar'
          ? 'تواصل مع عيادة أسنان, عنوان عيادة أسنان, رقم عيادة أسنان, حجز استشارة أسنان'
          : 'contact dental clinic, dentist phone number, dental clinic address, book dental consultation'}
        imageAlt={`${branding.brandName || 'ELORA'} contact page`}
        jsonLd={seoJsonLd}
      />
      <PageHero
        eyebrow={branding.brandName || 'ELORA'}
        title={heroTitle}
        text={heroText}
        image={heroImage}
      />
      <section className="px-4 py-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[.9fr_1.1fr]">
          <div>
            <SectionHeading eyebrow={t('nav.contact')} title={t('contact.title')} text={t('contact.text')} align="start" />
            <div className="grid gap-4">
              <div className="premium-card p-5 text-sm text-white/70">
                <LocationIcon className="mb-3 text-[#f2d38d]" />
                <p className="font-semibold text-white">{t('contact.info.location')}</p>
                <p className="mt-1">{contact.location || t('contact.info.locationValue')}</p>
                {locationHref ? (
                  <a href={locationHref} target="_blank" rel="noreferrer" className="btn-dark mt-4 inline-flex !px-4 !py-2 text-xs sm:text-sm">
                    {language === 'ar' ? 'افتح الموقع' : 'Open location'}
                  </a>
                ) : null}
              </div>
              <div className="premium-card p-5 text-sm text-white/70">
                <PhoneIcon className="mb-3 text-[#f2d38d]" />
                <p className="font-semibold text-white">{t('contact.info.phone')}</p>
                <p className="mt-1">{contact.phone || t('contact.info.phoneValue')}</p>
              </div>
              <div className="premium-card p-5 text-sm text-white/70">
                <EmailIcon className="mb-3 text-[#f2d38d]" />
                <p className="font-semibold text-white">{t('contact.info.email')}</p>
                <p className="mt-1">{contact.email || t('contact.info.emailValue')}</p>
              </div>
            </div>
          </div>
          <form onSubmit={submit} className="premium-card grid gap-4 p-6">
            <input className="input" placeholder={t('contact.name')} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input className="input" type="email" placeholder={t('contact.email')} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <input className="input" placeholder={t('contact.phone')} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <input className="input" placeholder={t('contact.subject')} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            <textarea className="input" rows="6" placeholder={t('contact.message')} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
            <button className="btn-gold">{t('contact.submit')}</button>
          </form>
        </div>
      </section>
    </main>
  );
}
