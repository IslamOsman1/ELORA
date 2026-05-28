import React from 'react';
import { Bell, CheckCheck } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useNotifications } from '../context/NotificationsContext';
import { formatDisplayDateTime } from '../utils/patient';

export default function NotificationsPage() {
  const { isArabic } = useLanguage();
  const { isAuthenticated, loading } = useCustomerAuth();
  const { notifications, unreadCount, loading: notificationsLoading, markAsRead, markAllAsRead, enableBrowserNotifications, browserPermission } = useNotifications();

  const text = {
    title: isArabic ? 'الإشعارات' : 'Notifications',
    subtitle: isArabic ? 'هنا ستجد تحديثات الحجوزات والمتابعة الطبية داخل الموقع والمتصفح.' : 'Here you can find booking and medical follow-up updates inside the site and browser.',
    empty: isArabic ? 'لا توجد إشعارات حاليًا.' : 'No notifications yet.',
    markAll: isArabic ? 'تحديد الكل كمقروء' : 'Mark all as read',
    enableBrowser: isArabic ? 'تفعيل إشعارات المتصفح' : 'Enable browser notifications',
    unread: isArabic ? 'غير مقروءة' : 'Unread',
    loading: isArabic ? 'جارٍ تحميل الإشعارات...' : 'Loading notifications...'
  };

  if (loading) {
    return <main className="grid min-h-screen place-items-center px-4 text-white/70">{text.loading}</main>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/account/auth" replace state={{ mode: 'login', redirectTo: '/account/notifications' }} />;
  }

  return (
    <main className="px-4 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="premium-card p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow">{text.title}</p>
              <h1 className="mt-2 font-display text-4xl sm:text-5xl">{text.title}</h1>
              <p className="mt-4 max-w-3xl text-white/60">{text.subtitle}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button className="btn-dark" onClick={enableBrowserNotifications}>
                {browserPermission === 'granted' ? (isArabic ? 'مفعلة' : 'Enabled') : text.enableBrowser}
              </button>
              <button className="btn-gold" onClick={markAllAsRead} disabled={!unreadCount}>
                <CheckCheck size={16} /> {text.markAll}
              </button>
            </div>
          </div>

          <div className="mt-8 grid gap-4">
            {notificationsLoading ? (
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 text-center text-white/55">{text.loading}</div>
            ) : notifications.length ? notifications.map((notification) => (
              <article key={notification._id} className={`rounded-[2rem] border p-5 ${notification.readAt ? 'border-white/10 bg-white/[0.03]' : 'border-[#f2d38d]/30 bg-[#f2d38d]/8'}`}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex gap-4">
                    <div className="grid h-12 w-12 place-items-center rounded-[1.1rem] border border-white/10 bg-white/[0.04] text-[#f2d38d]">
                      <Bell size={18} />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-white">{notification.title}</p>
                        {!notification.readAt ? <span className="rounded-full border border-[#f2d38d]/20 bg-[#f2d38d]/10 px-2 py-1 text-[11px] text-[#f2d38d]">{text.unread}</span> : null}
                      </div>
                      <p className="mt-2 text-sm text-white/65">{notification.message}</p>
                      <p className="mt-3 text-xs text-white/45">{formatDisplayDateTime(notification.createdAt, isArabic ? 'ar-EG' : 'en-US')}</p>
                    </div>
                  </div>
                  {!notification.readAt ? (
                    <button className="btn-dark !px-4 !py-2 text-sm" onClick={() => markAsRead(notification._id)}>
                      {isArabic ? 'تمت القراءة' : 'Mark as read'}
                    </button>
                  ) : null}
                </div>
              </article>
            )) : (
              <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/[0.03] p-10 text-center text-white/55">
                {text.empty}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
