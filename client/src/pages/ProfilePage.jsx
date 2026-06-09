import React from 'react';
import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { BadgeCheck, LogOut, Mail, QrCode, ShieldCheck, UserCircle2 } from 'lucide-react';
import QRCode from 'qrcode';
import Seo from '../components/common/Seo';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useLanguage } from '../context/LanguageContext';

export default function ProfilePage() {
  const { isArabic } = useLanguage();
  const { user, loading, refreshProfile, logout } = useCustomerAuth();
  const [qrCodeImage, setQrCodeImage] = useState('');

  useEffect(() => {
    refreshProfile().catch(() => {});
  }, []);

  useEffect(() => {
    if (!user?.qrCodeToken) return;

    QRCode.toDataURL(`ELORA_USER:${user.qrCodeToken}`, {
      width: 420,
      margin: 4,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#111111',
        light: '#ffffff'
      }
    }).then(setQrCodeImage).catch(() => setQrCodeImage(''));
  }, [user?.qrCodeToken]);

  if (loading) {
    return <main className="grid min-h-screen place-items-center px-4 text-white/70">{isArabic ? 'جارٍ تحميل الحساب...' : 'Loading account...'}</main>;
  }

  if (!user) {
    return <Navigate to="/account/auth" replace />;
  }

  const text = {
    title: isArabic ? 'الملف الشخصي' : 'Profile',
    subtitle: isArabic ? 'يمكنك استخدام نفس البريد لتسجيل الدخول يدويًا أو عبر Google.' : 'You can use the same email to sign in manually or with Google.',
    providers: isArabic ? 'طرق تسجيل الدخول' : 'Sign-in methods',
    qrTitle: isArabic ? 'كود الهوية داخل العيادة' : 'Clinic identity QR',
    qrText: isArabic ? 'اعرض هذا الكود في العيادة لتأكيد هويتك وتسريع تأكيد حضور الجلسة.' : 'Show this code at the clinic to verify your identity and confirm attendance quickly.',
    qrHint: isArabic ? 'يرتبط هذا الكود بحسابك ومواعيدك المسجلة.' : 'This code is linked to your account and booked sessions.',
    tokenLabel: isArabic ? 'رمز الحساب' : 'Account token',
    ready: isArabic ? 'جاهز للتحقق' : 'Ready for verification',
    logout: isArabic ? 'تسجيل الخروج' : 'Logout',
    booking: isArabic ? 'احجز موعدًا' : 'Book an appointment',
    linked: isArabic ? 'مرتبط' : 'Linked'
  };

  return (
    <main className="px-4 py-10">
      <Seo
        title={`ELORA | ${text.title}`}
        description={text.subtitle}
        path="/account"
        noindex
      />
      <div className="mx-auto max-w-4xl">
        <div className="premium-card overflow-hidden">
          <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top,rgba(242,211,141,0.18),transparent_44%)] p-8">
            <div className="flex flex-wrap items-center gap-5">
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="h-24 w-24 rounded-[2rem] object-cover ring-1 ring-[#f2d38d]/35" />
              ) : (
                <div className="grid h-24 w-24 place-items-center rounded-[2rem] border border-white/10 bg-white/[0.04]">
                  <UserCircle2 size={44} className="text-[#f2d38d]" />
                </div>
              )}
              <div>
                <p className="eyebrow">{text.title}</p>
                <h1 className="mt-2 font-display text-5xl">{user.name}</h1>
                <p className="mt-3 max-w-2xl text-white/60">{text.subtitle}</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-8 md:grid-cols-2">
            <article className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center gap-3 text-[#f2d38d]">
                <Mail size={18} />
                <span>{user.email}</span>
              </div>
              <p className="mt-3 text-sm text-white/55">{isArabic ? 'هذا البريد هو المفتاح الذي يربط Google والتسجيل اليدوي.' : 'This email is the key that links Google and manual sign-in.'}</p>
            </article>

            <article className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center gap-3 text-[#f2d38d]">
                <ShieldCheck size={18} />
                <span>{text.providers}</span>
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                {(user.authProviders || []).map((provider) => (
                  <span key={provider} className="rounded-full border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white/75">
                    {provider === 'manual' ? (isArabic ? 'كلمة مرور' : 'Password') : 'Google'} · {text.linked}
                  </span>
                ))}
              </div>
            </article>
          </div>

          <div className="px-8 pb-2">
            <article className="rounded-[1.9rem] border border-white/10 bg-[linear-gradient(145deg,rgba(242,211,141,0.09),rgba(255,255,255,0.03))] p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 text-[#f2d38d]">
                    <QrCode size={18} />
                    <span className="font-semibold">{text.qrTitle}</span>
                  </div>
                  <p className="mt-3 max-w-2xl text-sm text-white/65">{text.qrText}</p>
                  <p className="mt-2 text-xs text-white/45">{text.qrHint}</p>
                </div>
                <div className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-xs text-emerald-100/90">
                  <span className="inline-flex items-center gap-2"><BadgeCheck size={14} />{text.ready}</span>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-6">
                <div className="rounded-[1.5rem] border border-white/10 bg-white p-4 shadow-[0_12px_40px_rgba(0,0,0,0.2)]">
                  {qrCodeImage ? (
                    <img src={qrCodeImage} alt="ELORA QR" className="h-56 w-56 rounded-[1rem]" />
                  ) : (
                    <div className="grid h-56 w-56 place-items-center text-white/40">{isArabic ? 'جارٍ إنشاء الكود...' : 'Generating QR...'}</div>
                  )}
                </div>
                <div className="min-w-[240px] flex-1 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm text-white/45">{text.tokenLabel}</p>
                  <p className="mt-2 break-all font-mono text-sm text-[#f2d38d]">{user.qrCodeToken || '-'}</p>
                </div>
              </div>
            </article>
          </div>

          <div className="flex flex-wrap gap-3 px-8 pb-8 pt-6">
            <Link to="/booking" className="btn-gold">{text.booking}</Link>
            <button onClick={logout} className="btn-dark inline-flex items-center gap-2"><LogOut size={16} />{text.logout}</button>
          </div>
        </div>
      </div>
    </main>
  );
}
