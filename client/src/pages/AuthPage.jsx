import React from 'react';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import GoogleSignInButton from '../components/auth/GoogleSignInButton';
import Seo from '../components/common/Seo';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useLanguage } from '../context/LanguageContext';

const initialLogin = { email: '', password: '' };
const initialRegister = { name: '', email: '', password: '', confirmPassword: '' };

export default function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, isArabic } = useLanguage();
  const { isAuthenticated, login, register, loginWithGoogle, completeGooglePasswordSetup } = useCustomerAuth();
  const [mode, setMode] = useState(location.state?.mode === 'register' ? 'register' : 'login');
  const [loginForm, setLoginForm] = useState(initialLogin);
  const [registerForm, setRegisterForm] = useState(initialRegister);
  const [setupSession, setSetupSession] = useState(null);
  const [googlePassword, setGooglePassword] = useState('');
  const [loading, setLoading] = useState(false);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  const redirectTo = location.state?.redirectTo || '/account';

  const text = useMemo(() => ({
    title: isArabic ? 'حسابك في إلورا' : 'Your ELORA account',
    subtitle: isArabic
      ? 'سجّل يدويًا أو عبر Google، وسنربط البريد نفسه بنفس الحساب.'
      : 'Sign in manually or with Google, and we will keep the same email under one account.',
    login: isArabic ? 'تسجيل الدخول' : 'Login',
    register: isArabic ? 'إنشاء حساب' : 'Create account',
    name: isArabic ? 'الاسم الكامل' : 'Full name',
    email: isArabic ? 'البريد الإلكتروني' : 'Email address',
    password: isArabic ? 'كلمة المرور' : 'Password',
    confirmPassword: isArabic ? 'تأكيد كلمة المرور' : 'Confirm password',
    continueGoogle: isArabic ? 'جارٍ تجهيز تسجيل Google...' : 'Preparing Google sign-in...',
    loginAction: isArabic ? 'دخول الحساب' : 'Sign in',
    registerAction: isArabic ? 'إنشاء الحساب' : 'Create account',
    googleSetupTitle: isArabic ? 'أكمِل كلمة المرور' : 'Complete your password',
    googleSetupText: isArabic
      ? 'تم التعرف على بريد Google. أضف كلمة مرور ليمكنك تسجيل الدخول يدويًا بنفس البريد لاحقًا.'
      : 'We found your Google account. Add a password so you can also log in manually with the same email later.',
    savePassword: isArabic ? 'حفظ كلمة المرور' : 'Save password',
    accountReady: isArabic ? 'تم تجهيز حسابك بنجاح' : 'Your account is ready',
    googleError: isArabic ? 'تعذر إكمال تسجيل الدخول عبر Google' : 'Unable to complete Google sign-in',
    passwordMismatch: isArabic ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match',
    passwordShort: isArabic ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters',
    welcome: isArabic ? 'مرحبًا بعودتك' : 'Welcome back',
    created: isArabic ? 'تم إنشاء الحساب بنجاح' : 'Account created successfully',
    home: isArabic ? 'العودة للرئيسية' : 'Back home'
  }), [isArabic]);

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  async function handleLogin(event) {
    event.preventDefault();
    setLoading(true);
    try {
      await login({ email: loginForm.email.trim(), password: loginForm.password });
      toast.success(text.welcome);
      navigate(redirectTo);
    } catch (error) {
      toast.error(error.response?.data?.message || text.googleError);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error(text.passwordMismatch);
      return;
    }

    if (registerForm.password.length < 6) {
      toast.error(text.passwordShort);
      return;
    }

    setLoading(true);
    try {
      await register({
        name: registerForm.name.trim(),
        email: registerForm.email.trim(),
        password: registerForm.password
      });
      toast.success(text.created);
      navigate(redirectTo);
    } catch (error) {
      toast.error(error.response?.data?.message || text.googleError);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleCredential(credential) {
    setLoading(true);
    try {
      const response = await loginWithGoogle(credential);
      if (response.needsPasswordSetup) {
        setSetupSession(response);
        toast.success(text.accountReady);
        return;
      }

      toast.success(text.welcome);
      navigate(redirectTo);
    } catch (error) {
      toast.error(error.response?.data?.message || text.googleError);
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordSetup(event) {
    event.preventDefault();
    if (googlePassword.length < 6) {
      toast.error(text.passwordShort);
      return;
    }

    setLoading(true);
    try {
      await completeGooglePasswordSetup(setupSession.setupToken, googlePassword);
      toast.success(text.accountReady);
      navigate(redirectTo);
    } catch (error) {
      toast.error(error.response?.data?.message || text.googleError);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <Seo
        title={`ELORA | ${text.title}`}
        description={text.subtitle}
        path="/account/auth"
        noindex
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(244,213,154,0.2),transparent_32%),radial-gradient(circle_at_bottom,rgba(98,65,35,0.32),transparent_38%)]" />
      <div className="premium-card relative w-full max-w-5xl overflow-hidden p-0 lg:grid lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative overflow-hidden border-b border-white/10 p-8 lg:border-b-0 lg:border-e">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(242,211,141,0.18),transparent_34%),linear-gradient(160deg,rgba(255,255,255,0.02),transparent_62%)]" />
          <div className="relative">
            <img src="/logo.png" alt="ELORA" className="h-24 w-24 rounded-[2rem] object-cover ring-1 ring-[#f2d38d]/35" />
            <h1 className="mt-6 font-display text-5xl text-[#f2d38d]">{text.title}</h1>
            <p className="mt-4 max-w-xl text-white/68">{text.subtitle}</p>
            <div className="mt-8 grid gap-4 text-sm text-white/72">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                {isArabic ? 'Google أولاً؟ سنطلب منك تعيين كلمة مرور مرة واحدة ثم يمكنك الدخول بالطريقتين.' : 'Using Google first? We will ask for a password once so both sign-in methods stay linked.'}
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                {isArabic ? 'إذا أنشأت الحساب يدويًا ثم استخدمت Google بنفس البريد، سنربط الدخولين بالحساب نفسه تلقائيًا.' : 'If you create an account manually and later use Google with the same email, we will automatically link both sign-in methods.'}
              </div>
            </div>
          </div>
        </section>

        <section className="p-8">
          <div className="mb-6 flex rounded-full border border-white/10 bg-white/[0.03] p-1">
            <button className={mode === 'login' ? 'btn-gold flex-1 !py-2' : 'btn-dark flex-1 !py-2 !shadow-none'} onClick={() => setMode('login')}>{text.login}</button>
            <button className={mode === 'register' ? 'btn-gold flex-1 !py-2' : 'btn-dark flex-1 !py-2 !shadow-none'} onClick={() => setMode('register')}>{text.register}</button>
          </div>

          {setupSession ? (
            <form onSubmit={handlePasswordSetup} className="grid gap-4">
              <div>
                <h2 className="text-2xl font-semibold">{text.googleSetupTitle}</h2>
                <p className="mt-2 text-sm text-white/60">{text.googleSetupText}</p>
                <p className="mt-2 text-sm text-[#f2d38d]">{setupSession.user?.email}</p>
              </div>
              <input className="input" type="password" value={googlePassword} onChange={(event) => setGooglePassword(event.target.value)} placeholder={text.password} />
              <button className="btn-gold w-full" disabled={loading}>{loading ? text.continueGoogle : text.savePassword}</button>
            </form>
          ) : (
            <>
              {mode === 'login' ? (
                <form onSubmit={handleLogin} className="grid gap-4">
                  <input className="input" type="email" value={loginForm.email} onChange={(event) => setLoginForm({ ...loginForm, email: event.target.value })} placeholder={text.email} required />
                  <input className="input" type="password" value={loginForm.password} onChange={(event) => setLoginForm({ ...loginForm, password: event.target.value })} placeholder={text.password} required />
                  <button className="btn-gold w-full" disabled={loading}>{loading ? text.continueGoogle : text.loginAction}</button>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="grid gap-4">
                  <input className="input" value={registerForm.name} onChange={(event) => setRegisterForm({ ...registerForm, name: event.target.value })} placeholder={text.name} required />
                  <input className="input" type="email" value={registerForm.email} onChange={(event) => setRegisterForm({ ...registerForm, email: event.target.value })} placeholder={text.email} required />
                  <input className="input" type="password" value={registerForm.password} onChange={(event) => setRegisterForm({ ...registerForm, password: event.target.value })} placeholder={text.password} required />
                  <input className="input" type="password" value={registerForm.confirmPassword} onChange={(event) => setRegisterForm({ ...registerForm, confirmPassword: event.target.value })} placeholder={text.confirmPassword} required />
                  <button className="btn-gold w-full" disabled={loading}>{loading ? text.continueGoogle : text.registerAction}</button>
                </form>
              )}

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xs uppercase tracking-[0.3em] text-white/35">Google</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>

              <GoogleSignInButton
                clientId={googleClientId}
                language={language}
                text={text.continueGoogle}
                onCredential={handleGoogleCredential}
                onError={() => toast.error(text.googleError)}
              />
            </>
          )}

          <Link className="mt-6 inline-block text-sm text-white/55 transition hover:text-white" to="/">{text.home}</Link>
        </section>
      </div>
    </main>
  );
}
