import React from 'react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Navigate, useLocation } from 'react-router-dom';
import PageHero from '../components/common/PageHero';
import SectionHeading from '../components/common/SectionHeading';
import { api } from '../utils/api';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { localizedField } from '../utils/content';

const initialForm = {
  patientName: '',
  phone: '',
  email: '',
  service: '',
  doctor: '',
  date: '',
  time: '',
  notes: ''
};

export default function BookingPage() {
  const { t, language } = useLanguage();
  const location = useLocation();
  const { user, isAuthenticated, loading } = useCustomerAuth();
  const { branding, contact, getImage, getText } = useSiteSettings();
  const [services, setServices] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [slots, setSlots] = useState(['10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '14:00', '14:30', '15:00', '15:30', '16:00']);
  const [form, setForm] = useState(initialForm);

  useEffect(() => {
    if (!user) return;
    setForm((current) => ({
      ...current,
      patientName: user.name || current.patientName || '',
      email: current.email || user.email || ''
    }));
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.get('/services').then((response) => setServices(response.data));
    api.get('/doctors').then((response) => setDoctors(response.data));
  }, [isAuthenticated]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const selectedService = params.get('service');
    const selectedDoctor = params.get('doctor');
    if (!selectedService && !selectedDoctor) return;
    setForm((current) => ({
      ...current,
      service: current.service || selectedService || '',
      doctor: current.doctor || selectedDoctor || ''
    }));
  }, [location.search]);

  useEffect(() => {
    if (!isAuthenticated || !form.date) return;
    api.get('/slots', { params: { date: form.date, doctor: form.doctor } }).then((response) => setSlots(response.data)).catch(() => {});
  }, [form.date, form.doctor, isAuthenticated]);

  async function submit(event) {
    event.preventDefault();
    try {
      await api.post('/auth/customer/appointments', form);
      toast.success(t('booking.success'));
      setForm((current) => ({ ...initialForm, patientName: current.patientName, email: current.email }));
    } catch (error) {
      toast.error(error.response?.data?.message || t('booking.fail'));
    }
  }

  if (loading) {
    return <main className="grid min-h-screen place-items-center px-4 text-white/70">{t('common.loading')}</main>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/account/auth" replace state={{ mode: 'login', redirectTo: '/booking' }} />;
  }

  return (
    <main>
      <PageHero
        eyebrow={branding.brandName || 'ELORA'}
        title={getText(language, 'booking.heroTitle', t('booking.heroTitle'))}
        text={getText(language, 'booking.heroText', t('booking.heroText'))}
        image={getImage('bookingHero', 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=1400&q=80')}
      />
      <section className="px-4 py-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[.9fr_1.1fr]">
          <div>
            <SectionHeading eyebrow={t('nav.booking')} title={t('booking.formTitle')} text={t('booking.formText')} align="start" />
            <div className="premium-card p-6 text-sm leading-7 text-white/68">
              <p><span className="font-semibold text-white">{t('booking.info.branch')}:</span> {branding.brandName || t('booking.info.branchValue')}</p>
              <p><span className="font-semibold text-white">{t('booking.info.email')}:</span> {contact.email || t('booking.info.emailValue')}</p>
              <p><span className="font-semibold text-white">{t('booking.info.phone')}:</span> {contact.phone || t('booking.info.phoneValue')}</p>
            </div>
          </div>
          <form onSubmit={submit} className="premium-card grid gap-4 p-6 sm:grid-cols-2">
            <input className="input" placeholder={t('booking.patientName')} value={form.patientName} onChange={(e) => setForm({ ...form, patientName: e.target.value })} required />
            <input className="input" placeholder={t('booking.phone')} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            <input className="input" type="email" placeholder={t('booking.email')} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <select className="input" value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value })} required>
              <option value="">{t('booking.selectService')}</option>
              {services.map((service) => <option key={service._id} value={service._id}>{localizedField(service, language, 'title')}</option>)}
            </select>
            <select className="input" value={form.doctor} onChange={(e) => setForm({ ...form, doctor: e.target.value })}>
              <option value="">{t('booking.anyDoctor')}</option>
              {doctors.map((doctor) => <option key={doctor._id} value={doctor._id}>{doctor.name}</option>)}
            </select>
            <input className="input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
            <select className="input" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} required>
              <option value="">{t('booking.selectTime')}</option>
              {slots.map((slot) => <option key={slot} value={slot}>{slot}</option>)}
            </select>
            <textarea className="input sm:col-span-2" rows="5" placeholder={t('booking.notes')} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            <button className="btn-gold sm:col-span-2">{t('booking.submit')}</button>
          </form>
        </div>
      </section>
    </main>
  );
}
