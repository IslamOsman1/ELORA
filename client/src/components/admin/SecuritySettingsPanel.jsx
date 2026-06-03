import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../utils/api';
import { useLanguage } from '../../context/LanguageContext';

const initialForm = {
  email: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
};

export default function SecuritySettingsPanel() {
  const { isArabic } = useLanguage();
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [account, setAccount] = useState({ name: '', email: '' });

  useEffect(() => {
    api.get('/admin/security')
      .then((response) => {
        setAccount(response.data);
        setForm((current) => ({ ...current, email: response.data.email || '' }));
      })
      .catch((error) => {
        toast.error(error.response?.data?.message || 'Failed to load security settings');
      })
      .finally(() => setLoading(false));
  }, []);

  async function submit(event) {
    event.preventDefault();

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      toast.error(isArabic ? 'كلمتا المرور الجديدتان غير متطابقتين' : 'New passwords do not match');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        currentPassword: form.currentPassword,
        email: form.email.trim(),
        newPassword: form.newPassword || undefined
      };
      const response = await api.patch('/admin/security', payload);
      setAccount(response.data.user);
      setForm((current) => ({
        ...current,
        email: response.data.user.email || current.email,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      toast.success(isArabic ? 'تم تحديث بيانات الأمان' : 'Security settings updated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update security settings');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="text-sm text-white/55">{isArabic ? 'جارٍ تحميل بيانات الأمان...' : 'Loading security settings...'}</div>;
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-5 text-sm text-white/70">
        <p className="text-xs uppercase tracking-[0.24em] text-[#f2d38d]">{isArabic ? 'معلومات الحساب' : 'Account info'}</p>
        <div className="mt-4 grid gap-3">
          <div>
            <p className="text-white/45">{isArabic ? 'الاسم' : 'Name'}</p>
            <p className="mt-1 font-medium text-white">{account.name || '-'}</p>
          </div>
          <div>
            <p className="text-white/45">{isArabic ? 'البريد الحالي' : 'Current email'}</p>
            <p className="mt-1 font-medium text-white">{account.email || '-'}</p>
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="grid gap-4 rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-5">
        <div className="rounded-[1.2rem] border border-white/10 bg-black/15 p-4 text-sm text-white/65">
          {isArabic
            ? 'يمكنك تغيير الإيميل الإداري وكلمة مرور دخول لوحة التحكم. يلزم إدخال كلمة المرور الحالية قبل الحفظ.'
            : 'You can change the admin email and dashboard password. Enter the current password before saving.'}
        </div>

        <input
          className="input"
          type="email"
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          placeholder={isArabic ? 'الإيميل الإداري الجديد' : 'New admin email'}
          required
        />
        <input
          className="input"
          type="password"
          value={form.currentPassword}
          onChange={(event) => setForm((current) => ({ ...current, currentPassword: event.target.value }))}
          placeholder={isArabic ? 'كلمة المرور الحالية' : 'Current password'}
          required
        />
        <input
          className="input"
          type="password"
          value={form.newPassword}
          onChange={(event) => setForm((current) => ({ ...current, newPassword: event.target.value }))}
          placeholder={isArabic ? 'كلمة المرور الجديدة' : 'New password'}
        />
        <input
          className="input"
          type="password"
          value={form.confirmPassword}
          onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))}
          placeholder={isArabic ? 'تأكيد كلمة المرور الجديدة' : 'Confirm new password'}
        />
        <button className="btn-gold" disabled={saving}>
          {saving ? (isArabic ? 'جارٍ الحفظ...' : 'Saving...') : (isArabic ? 'حفظ التغييرات' : 'Save changes')}
        </button>
      </form>
    </div>
  );
}
