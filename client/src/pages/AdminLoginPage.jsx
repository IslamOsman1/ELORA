import React from 'react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import Seo from '../components/common/Seo';
import { api } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';
import { setAdminToken } from '../utils/auth';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const { t, isArabic } = useLanguage();
  const [identifier, setIdentifier] = useState('admin');
  const [password, setPassword] = useState('Admin@12345');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { identifier: identifier.trim(), password });
      setAdminToken(response.data.token);
      toast.success('Welcome back');
      navigate('/admin');
    } catch (error) {
      toast.error(error.response?.data?.message || t('admin.errors.server'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <Seo
        title={`ELORA | ${t('admin.loginTitle')}`}
        description={t('admin.loginText')}
        path="/admin/login"
        noindex
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(244,213,154,0.2),transparent_32%),radial-gradient(circle_at_bottom,rgba(98,65,35,0.32),transparent_38%)]" />
      <form onSubmit={submit} className="premium-card relative w-full max-w-lg p-8">
        <img src="/logo.png" alt="ELORA" className="mx-auto h-24 w-24 rounded-3xl object-cover" />
        <h1 className="mt-6 text-center font-display text-5xl">{t('admin.loginTitle')}</h1>
        <p className="mt-3 text-center text-white/60">{t('admin.loginText')}</p>
        <div className="mt-8 grid gap-4">
          <input className="input" value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder={isArabic ? 'اسم المستخدم أو البريد' : 'Username or email'} />
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('admin.password')} />
          <button className="btn-gold mt-2 w-full" disabled={loading}>{loading ? t('admin.loggingIn') : t('admin.login')}</button>
          <Link className="text-center text-white/55 transition hover:text-white" to="/">{t('nav.home')}</Link>
        </div>
      </form>
    </main>
  );
}
