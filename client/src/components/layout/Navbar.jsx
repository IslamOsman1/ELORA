import React from 'react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { CircleUserRound, LogOut, Menu, UserPlus, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useSiteSettings } from '../../context/SiteSettingsContext';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { t, toggleLanguage, isArabic, language } = useLanguage();
  const { user, logout } = useCustomerAuth();
  const { branding, getText } = useSiteSettings();
  const brandName = branding.brandName || 'ELORA';
  const brandFull = getText(language, 'common.brandFull', t('common.brandFull'));
  const logoUrl = branding.logoUrl || '/logo.jpg';

  const links = [
    ['/', t('nav.home')],
    ['/about', t('nav.about')],
    ['/services', t('nav.services')],
    ['/doctors', t('nav.doctors')],
    ['/booking', t('nav.booking')],
    ['/contact', t('nav.contact')]
  ];

  const profileLabel = isArabic ? 'الملف الشخصي' : 'Profile';
  const loginLabel = isArabic ? 'دخول العميل' : 'Patient login';
  const registerLabel = isArabic ? 'إنشاء حساب' : 'Create account';
  const logoutLabel = isArabic ? 'تسجيل الخروج' : 'Logout';

  function renderProfileMenu({ desktop = false } = {}) {
    return (
      <div
        className={
          desktop
            ? 'absolute end-0 top-[calc(100%+0.75rem)] w-64 rounded-[1.5rem] border border-white/10 bg-[#181316]/95 p-3 shadow-2xl backdrop-blur-xl'
            : 'fixed left-4 right-4 top-24 z-[70] rounded-[1.5rem] border border-white/10 bg-[#181316]/95 p-3 shadow-2xl backdrop-blur-xl'
        }
      >
        {user ? (
          <>
            <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-3">
              <p className="font-semibold text-white">{user.name}</p>
              <p className="mt-1 text-sm text-white/45">{user.email}</p>
            </div>
            <div className="mt-3 grid gap-2">
              <Link to="/account" className="btn-dark w-full !justify-start gap-2 !rounded-[1rem] !px-4 !py-3" onClick={() => setProfileOpen(false)}>
                <CircleUserRound size={16} />
                {profileLabel}
              </Link>
              <button
                className="btn-dark w-full !justify-start gap-2 !rounded-[1rem] !px-4 !py-3"
                onClick={() => {
                  logout();
                  setProfileOpen(false);
                }}
              >
                <LogOut size={16} />
                {logoutLabel}
              </button>
            </div>
          </>
        ) : (
          <div className="grid gap-2">
            <Link to="/account/auth" state={{ mode: 'login' }} className="btn-dark w-full !justify-start gap-2 !rounded-[1rem] !px-4 !py-3" onClick={() => setProfileOpen(false)}>
              <CircleUserRound size={16} />
              {loginLabel}
            </Link>
            <Link to="/account/auth" state={{ mode: 'register' }} className="btn-gold w-full !justify-start gap-2 !rounded-[1rem] !px-4 !py-3" onClick={() => setProfileOpen(false)}>
              <UserPlus size={16} />
              {registerLabel}
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#120f12]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-3">
          <img src={logoUrl} alt={brandName} className="h-12 w-12 rounded-2xl object-cover ring-1 ring-[#f2d38d]/40" />
          <div>
            <p className="font-display text-2xl tracking-[0.16em] text-[#f4d59a]">{brandName}</p>
            <p className="text-xs text-white/60">{brandFull}</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 lg:flex">
          {links.map(([href, label]) => (
            <NavLink key={href} to={href} className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <div className="relative">
            <button className="icon-btn" aria-label={profileLabel} onClick={() => setProfileOpen((current) => !current)}>
              {user?.avatar ? <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-full object-cover" /> : <CircleUserRound size={18} />}
            </button>
            {profileOpen ? renderProfileMenu({ desktop: true }) : null}
          </div>
          <button onClick={toggleLanguage} className="btn-dark !px-4 !py-2 text-sm">{t('nav.language')}</button>
        </div>

        <div className="flex items-center gap-3 lg:hidden">
          <div className="relative">
            <button className="icon-btn" aria-label={profileLabel} onClick={() => setProfileOpen((current) => !current)}>
              {user?.avatar ? <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-full object-cover" /> : <CircleUserRound size={18} />}
            </button>
            {profileOpen ? renderProfileMenu() : null}
          </div>
          <button className="inline-flex rounded-full border border-white/10 p-3" onClick={() => setOpen((value) => !value)}>
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-white/10 bg-[#120f12]/95 px-4 py-4 lg:hidden">
          <div className="grid gap-3">
            {links.map(([href, label]) => (
              <NavLink key={href} to={href} className="nav-link" onClick={() => setOpen(false)}>
                {label}
              </NavLink>
            ))}
            <div className="mt-2 flex gap-3">
              <button onClick={toggleLanguage} className="btn-dark flex-1">{t('nav.language')}</button>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
