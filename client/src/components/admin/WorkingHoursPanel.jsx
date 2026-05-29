import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../utils/api';
import { useLanguage } from '../../context/LanguageContext';
import { useSiteSettings } from '../../context/SiteSettingsContext';

const fallbackDays = [
  { dayKey: 'sunday', labelAr: 'الأحد', labelEn: 'Sunday', enabled: true, from: '10:00', to: '17:00' },
  { dayKey: 'monday', labelAr: 'الاثنين', labelEn: 'Monday', enabled: true, from: '10:00', to: '17:00' },
  { dayKey: 'tuesday', labelAr: 'الثلاثاء', labelEn: 'Tuesday', enabled: true, from: '10:00', to: '17:00' },
  { dayKey: 'wednesday', labelAr: 'الأربعاء', labelEn: 'Wednesday', enabled: true, from: '10:00', to: '17:00' },
  { dayKey: 'thursday', labelAr: 'الخميس', labelEn: 'Thursday', enabled: true, from: '10:00', to: '17:00' },
  { dayKey: 'friday', labelAr: 'الجمعة', labelEn: 'Friday', enabled: false, from: '10:00', to: '17:00' },
  { dayKey: 'saturday', labelAr: 'السبت', labelEn: 'Saturday', enabled: true, from: '10:00', to: '17:00' }
];

function normalizeWorkingHours(value) {
  if (!Array.isArray(value) || !value.length) return fallbackDays;
  return fallbackDays.map((day) => {
    const existing = value.find((item) => item.dayKey === day.dayKey);
    return existing
      ? {
          dayKey: existing.dayKey || day.dayKey,
          labelAr: existing.labelAr || day.labelAr,
          labelEn: existing.labelEn || day.labelEn,
          enabled: typeof existing.enabled === 'boolean' ? existing.enabled : day.enabled,
          from: existing.from || day.from,
          to: existing.to || day.to
        }
      : day;
  });
}

export default function WorkingHoursPanel() {
  const { isArabic } = useLanguage();
  const { refreshSettings } = useSiteSettings();
  const [workingHours, setWorkingHours] = useState(fallbackDays);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/admin/site-settings')
      .then((response) => setWorkingHours(normalizeWorkingHours(response.data?.workingHours)))
      .finally(() => setLoading(false));
  }, []);

  function updateDay(dayKey, field, value) {
    setWorkingHours((current) => current.map((item) => (
      item.dayKey === dayKey ? { ...item, [field]: value } : item
    )));
  }

  async function save(event) {
    event.preventDefault();
    try {
      setSaving(true);
      await api.put('/admin/site-settings', { workingHours });
      await refreshSettings();
      toast.success(isArabic ? 'تم حفظ مواعيد العمل' : 'Working hours saved');
    } catch (error) {
      toast.error(error.response?.data?.message || (isArabic ? 'تعذر حفظ مواعيد العمل' : 'Unable to save working hours'));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-white/65">{isArabic ? 'جارٍ تحميل مواعيد العمل...' : 'Loading working hours...'}</div>;
  }

  return (
    <form onSubmit={save} className="grid gap-5">
      <div className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5 text-sm leading-7 text-white/60">
        {isArabic
          ? 'من هنا تحدد الأيام التي تعمل فيها العيادة وساعات العمل لكل يوم. هذه المواعيد تُستخدم لإظهار الأوقات المتاحة في صفحة الحجز.'
          : 'Set the clinic working days and the hours for each day. These hours are used to show available booking slots.'}
      </div>

      <div className="grid gap-4">
        {workingHours.map((day) => (
          <article key={day.dayKey} className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-4">
            <div className="grid gap-4 md:grid-cols-[1fr_auto_auto] md:items-center">
              <div>
                <p className="text-lg font-semibold text-white">{isArabic ? day.labelAr : day.labelEn}</p>
                <p className="mt-1 text-sm text-white/45">{isArabic ? day.labelEn : day.labelAr}</p>
              </div>

              <label className="inline-flex items-center gap-3 text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={day.enabled}
                  onChange={(event) => updateDay(day.dayKey, 'enabled', event.target.checked)}
                />
                {isArabic ? 'اليوم متاح للحجز' : 'Available for booking'}
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label>
                  <span className="mb-2 block text-sm text-white/55">{isArabic ? 'من' : 'From'}</span>
                  <input
                    className="input"
                    type="time"
                    value={day.from}
                    disabled={!day.enabled}
                    onChange={(event) => updateDay(day.dayKey, 'from', event.target.value)}
                  />
                </label>
                <label>
                  <span className="mb-2 block text-sm text-white/55">{isArabic ? 'إلى' : 'To'}</span>
                  <input
                    className="input"
                    type="time"
                    value={day.to}
                    disabled={!day.enabled}
                    onChange={(event) => updateDay(day.dayKey, 'to', event.target.value)}
                  />
                </label>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="flex justify-end">
        <button className="btn-gold min-w-56" disabled={saving}>
          {saving ? (isArabic ? 'جارٍ الحفظ...' : 'Saving...') : (isArabic ? 'حفظ مواعيد العمل' : 'Save working hours')}
        </button>
      </div>
    </form>
  );
}
