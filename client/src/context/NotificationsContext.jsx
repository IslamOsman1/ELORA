import React from 'react';
import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../utils/api';
import { useCustomerAuth } from './CustomerAuthContext';

const NotificationsContext = createContext(null);

const SEEN_KEY = 'elora_seen_notifications';

function readSeenIds() {
  try {
    return JSON.parse(localStorage.getItem(SEEN_KEY) || '[]');
  } catch {
    return [];
  }
}

function writeSeenIds(ids) {
  localStorage.setItem(SEEN_KEY, JSON.stringify(ids.slice(0, 200)));
}

export function NotificationsProvider({ children }) {
  const { isAuthenticated } = useCustomerAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [browserPermission, setBrowserPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? window.Notification.permission : 'default'
  );
  const lastIdsRef = useRef(new Set(readSeenIds()));

  async function loadNotifications({ silent = true } = {}) {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    if (!silent) setLoading(true);
    try {
      const response = await api.get('/patient/notifications');
      const incoming = response.data.notifications || [];
      setNotifications(incoming);
      setUnreadCount(response.data.unreadCount || 0);

      const unseenUnread = incoming.filter((item) => !item.readAt && !lastIdsRef.current.has(item._id));
      if (unseenUnread.length) {
        const nextIds = new Set(lastIdsRef.current);
        unseenUnread.forEach((item) => nextIds.add(item._id));
        lastIdsRef.current = nextIds;
        writeSeenIds(Array.from(nextIds));

        unseenUnread.forEach((item) => {
          toast(item.title);
          if (browserPermission === 'granted' && typeof window !== 'undefined' && 'Notification' in window) {
            new window.Notification(item.title, { body: item.message });
          }
        });
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications().catch(() => {});
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return undefined;
    const timer = window.setInterval(() => {
      loadNotifications().catch(() => {});
    }, 30000);

    return () => window.clearInterval(timer);
  }, [isAuthenticated, browserPermission]);

  async function markAsRead(notificationId) {
    await api.patch(`/patient/notifications/${notificationId}/read`);
    await loadNotifications();
  }

  async function markAllAsRead() {
    await api.patch('/patient/notifications/read-all');
    await loadNotifications();
  }

  async function enableBrowserNotifications() {
    if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
    const permission = await window.Notification.requestPermission();
    setBrowserPermission(permission);
    await api.patch('/patient/notifications/preferences', { enabled: permission === 'granted' });
    return permission;
  }

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    loading,
    browserPermission,
    refreshNotifications: loadNotifications,
    markAsRead,
    markAllAsRead,
    enableBrowserNotifications
  }), [notifications, unreadCount, loading, browserPermission]);

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) throw new Error('useNotifications must be used within NotificationsProvider');
  return context;
}
