import React from 'react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Mail, MapPin, Phone } from 'lucide-react';
import PageHero from '../components/common/PageHero';
import SectionHeading from '../components/common/SectionHeading';
import { api } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';

const initialForm = { name: '', email: '', phone: '', subject: '', message: '' };

export default function ContactPage() {
  const { t } = useLanguage();
  const [form, setForm] = useState(initialForm);

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
      <PageHero
        eyebrow="ELORA"
        title={t('contact.heroTitle')}
        text={t('contact.heroText')}
        image="https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1400&q=80"
      />
      <section className="px-4 py-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[.9fr_1.1fr]">
          <div>
            <SectionHeading eyebrow={t('nav.contact')} title={t('contact.title')} text={t('contact.text')} align="start" />
            <div className="grid gap-4">
              <div className="premium-card p-5 text-sm text-white/70">
                <MapPin className="mb-3 text-[#f2d38d]" />
                <p className="font-semibold text-white">{t('contact.info.location')}</p>
                <p className="mt-1">{t('contact.info.locationValue')}</p>
              </div>
              <div className="premium-card p-5 text-sm text-white/70">
                <Phone className="mb-3 text-[#f2d38d]" />
                <p className="font-semibold text-white">{t('contact.info.phone')}</p>
                <p className="mt-1">{t('contact.info.phoneValue')}</p>
              </div>
              <div className="premium-card p-5 text-sm text-white/70">
                <Mail className="mb-3 text-[#f2d38d]" />
                <p className="font-semibold text-white">{t('contact.info.email')}</p>
                <p className="mt-1">{t('contact.info.emailValue')}</p>
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
