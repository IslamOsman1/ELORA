import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../utils/api';
import { useLanguage } from '../../context/LanguageContext';
import { useSiteSettings } from '../../context/SiteSettingsContext';

const initialContact = {
  location: '',
  locationUrl: '',
  phone: '',
  email: '',
  whatsapp: '',
  instagram: '',
  facebook: '',
  locationIcon: 'MapPin',
  phoneIcon: 'Phone',
  emailIcon: 'Mail',
  whatsappIcon: 'MessageCircle',
  instagramIcon: 'Instagram',
  facebookIcon: 'Facebook'
};

const fields = [
  ['location', 'الموقع / Location'],
  ['locationUrl', 'رابط زر الموقع / Location Button Link'],
  ['phone', 'رقم الهاتف / Phone'],
  ['email', 'البريد الإلكتروني / Email'],
  ['whatsapp', 'واتساب / WhatsApp'],
  ['instagram', 'إنستجرام / Instagram'],
  ['facebook', 'فيس بوك / Facebook'],
  ['locationIcon', 'أيقونة الموقع / Location Icon'],
  ['phoneIcon', 'أيقونة الهاتف / Phone Icon'],
  ['emailIcon', 'أيقونة البريد / Email Icon'],
  ['whatsappIcon', 'أيقونة واتساب / WhatsApp Icon'],
  ['instagramIcon', 'أيقونة إنستجرام / Instagram Icon'],
  ['facebookIcon', 'أيقونة فيس بوك / Facebook Icon']
];

export default function ContactSettingsPanel() {
  const { isArabic } = useLanguage();
  const { refreshSettings } = useSiteSettings();
  const [contact, setContact] = useState(initialContact);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/admin/site-settings')
      .then((response) => setContact({ ...initialContact, ...(response.data?.contact || {}) }))
      .finally(() => setLoading(false));
  }, []);

  async function save(event) {
    event.preventDefault();
    try {
      setSaving(true);
      await api.put('/admin/site-settings', { contact });
      await refreshSettings();
      toast.success(isArabic ? 'تم حفظ بيانات التواصل' : 'Contact settings saved');
    } catch (error) {
      toast.error(error.response?.data?.message || (isArabic ? 'تعذر حفظ بيانات التواصل' : 'Unable to save contact settings'));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-white/65">{isArabic ? 'جارٍ تحميل بيانات التواصل...' : 'Loading contact settings...'}</div>;
  }

  return (
    <form onSubmit={save} className="grid gap-6">
      <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 text-sm leading-7 text-white/60">
        {isArabic
          ? 'من هنا تتحكم في أزرار وبيانات التواصل الظاهرة في الفوتر وصفحة التواصل، بما في ذلك رابط زر الموقع.'
          : 'Manage the contact buttons and contact details shown in the footer and contact page, including the location button link.'}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {fields.map(([key, label]) => (
          <label key={key} className={key === 'locationUrl' ? 'md:col-span-2' : ''}>
            <span className="mb-2 block text-sm text-white/55">{label}</span>
            <input
              className="input"
              value={contact[key] || ''}
              onChange={(event) => setContact((current) => ({ ...current, [key]: event.target.value }))}
            />
          </label>
        ))}
      </div>

      <div className="flex justify-end">
        <button className="btn-gold min-w-56" disabled={saving}>
          {saving ? (isArabic ? 'جارٍ الحفظ...' : 'Saving...') : (isArabic ? 'حفظ بيانات التواصل' : 'Save contact settings')}
        </button>
      </div>
    </form>
  );
}
