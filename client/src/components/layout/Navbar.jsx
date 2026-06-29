import React from 'react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Bell, CircleUserRound, ClipboardList, LogOut, Menu, ShieldPlus, UserPlus, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useNotifications } from '../../context/NotificationsContext';
import { useSiteSettings } from '../../context/SiteSettingsContext';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { t, toggleLanguage, isArabic, language } = useLanguage();
  const { user, logout } = useCustomerAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, enableBrowserNotifications, browserPermission } = useNotifications();
  const { branding, getText } = useSiteSettings();
  const brandName = branding.brandName || 'ELORA';
  const brandFull = getText(language, 'common.brandFull', t('common.brandFull'));
  const logoUrl = branding.logoUrl || '/logo.png';

  const links = [
    ['/', t('nav.home')],
    ['/about', t('nav.about')],
    ['/services', t('nav.services')],
    ['/cases', isArabic ? 'حالات تم علاجها' : 'Treated cases'],
    ['/doctors', t('nav.doctors')],
    ['/booking', t('nav.booking')],
    ['/contact', t('nav.contact')]
  ];

  const labels = {
    profile: isArabic ? 'الملف الشخصي' : 'Profile',
    bookings: isArabic ? 'حجوزاتي' : 'My bookings',
    followUp: isArabic ? 'متابعة الحالة' : 'Case follow-up',
    notifications: isArabic ? 'الإشعارات' : 'Notifications',
    login: isArabic ? 'دخول العميل' : 'Patient login',
    register: isArabic ? 'إنشاء حساب' : 'Create account',
    logout: isArabic ? 'تسجيل الخروج' : 'Logout',
    readAll: isArabic ? 'قراءة الكل' : 'Read all',
    noNotifications: isArabic ? 'لا توجد إشعارات جديدة.' : 'No new notifications.',
    enableBrowser: isArabic ? 'تفعيل إشعارات المتصفح' : 'Enable browser notifications',
    enabledBrowser: isArabic ? 'إشعارات المتصفح مفعلة' : 'Browser notifications enabled',
    showAll: isArabic ? 'عرض كل الإشعارات' : 'View all notifications'
  };

  function closeMenus() {
    setProfileOpen(false);
    setNotificationsOpen(false);
  }

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
              <Link to="/account/bookings" className="btn-dark w-full !justify-start gap-2 !rounded-[1rem] !px-4 !py-3" onClick={closeMenus}>
                <ClipboardList size={16} />
                {labels.bookings}
              </Link>
              <Link to="/account/case-follow-up" className="btn-dark w-full !justify-start gap-2 !rounded-[1rem] !px-4 !py-3" onClick={closeMenus}>
                <ShieldPlus size={16} />
                {labels.followUp}
              </Link>
              <Link to="/account" className="btn-dark w-full !justify-start gap-2 !rounded-[1rem] !px-4 !py-3" onClick={closeMenus}>
                <CircleUserRound size={16} />
                {labels.profile}
              </Link>
              <button
                className="btn-dark w-full !justify-start gap-2 !rounded-[1rem] !px-4 !py-3"
                onClick={() => {
                  logout();
                  closeMenus();
                }}
              >
                <LogOut size={16} />
                {labels.logout}
              </button>
            </div>
          </>
        ) : (
          <div className="grid gap-2">
            <Link to="/account/auth" state={{ mode: 'login' }} className="btn-dark w-full !justify-start gap-2 !rounded-[1rem] !px-4 !py-3" onClick={closeMenus}>
              <CircleUserRound size={16} />
              {labels.login}
            </Link>
            <Link to="/account/auth" state={{ mode: 'register' }} className="btn-gold w-full !justify-start gap-2 !rounded-[1rem] !px-4 !py-3" onClick={closeMenus}>
              <UserPlus size={16} />
              {labels.register}
            </Link>
          </div>
        )}
      </div>
    );
  }

  function renderNotificationsMenu({ desktop = false } = {}) {
    return (
      <div
        className={
          desktop
            ? 'absolute end-0 top-[calc(100%+0.75rem)] w-80 rounded-[1.5rem] border border-white/10 bg-[#181316]/95 p-3 shadow-2xl backdrop-blur-xl'
            : 'fixed left-4 right-4 top-24 z-[70] rounded-[1.5rem] border border-white/10 bg-[#181316]/95 p-3 shadow-2xl backdrop-blur-xl'
        }
      >
        <div className="flex items-center justify-between gap-3">
          <p className="font-semibold text-white">{labels.notifications}</p>
          {unreadCount ? (
            <button className="text-xs text-[#f2d38d]" onClick={markAllAsRead}>
              {labels.readAll}
            </button>
          ) : null}
        </div>
        <div className="mt-3 grid gap-2">
          <button className="btn-dark w-full !justify-start !rounded-[1rem] !px-4 !py-3 text-sm" onClick={enableBrowserNotifications}>
            {browserPermission === 'granted' ? labels.enabledBrowser : labels.enableBrowser}
          </button>
          {notifications.slice(0, 5).length ? notifications.slice(0, 5).map((item) => (
            <Link
              key={item._id}
              to={item.link || '/account/notifications'}
              className={`rounded-[1rem] border p-3 text-start ${item.readAt ? 'border-white/10 bg-white/[0.03]' : 'border-[#f2d38d]/20 bg-[#f2d38d]/8'}`}
              onClick={async () => {
                if (!item.readAt) await markAsRead(item._id);
                closeMenus();
              }}
            >
              <p className="font-medium text-white">{item.title}</p>
              <p className="mt-1 text-xs text-white/55">{item.message}</p>
            </Link>
          )) : (
            <div className="rounded-[1rem] border border-dashed border-white/10 bg-white/[0.02] p-4 text-sm text-white/45">
              {labels.noNotifications}
            </div>
          )}
          <Link to="/account/notifications" className="btn-gold w-full !rounded-[1rem] !px-4 !py-3 text-sm" onClick={closeMenus}>
            {labels.showAll}
          </Link>
        </div>
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
          {user ? (
            <div className="relative">
              <button className="icon-btn relative" aria-label={labels.notifications} onClick={() => { setNotificationsOpen((current) => !current); setProfileOpen(false); }}>
                <Bell size={18} />
                {unreadCount ? <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-[#f2d38d] px-1 text-[10px] font-bold text-[#161210]">{unreadCount}</span> : null}
              </button>
              {notificationsOpen ? renderNotificationsMenu({ desktop: true }) : null}
            </div>
          ) : null}
          <div className="relative">
            <button className="icon-btn" aria-label={labels.profile} onClick={() => { setProfileOpen((current) => !current); setNotificationsOpen(false); }}>
              {user?.avatar ? <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-full object-cover" /> : <CircleUserRound size={18} />}
            </button>
            {profileOpen ? renderProfileMenu({ desktop: true }) : null}
          </div>
          <button onClick={toggleLanguage} className="btn-dark !px-4 !py-2 text-sm">{t('nav.language')}</button>
        </div>

        <div className="flex items-center gap-3 lg:hidden">
          {user ? (
            <div className="relative">
              <button className="icon-btn relative" aria-label={labels.notifications} onClick={() => { setNotificationsOpen((current) => !current); setProfileOpen(false); }}>
                <Bell size={18} />
                {unreadCount ? <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-[#f2d38d] px-1 text-[10px] font-bold text-[#161210]">{unreadCount}</span> : null}
              </button>
              {notificationsOpen ? renderNotificationsMenu() : null}
            </div>
          ) : null}
          <div className="relative">
            <button className="icon-btn" aria-label={labels.profile} onClick={() => { setProfileOpen((current) => !current); setNotificationsOpen(false); }}>
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
