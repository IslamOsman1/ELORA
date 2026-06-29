import React from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../utils/api';

const SiteSettingsContext = createContext(null);

function getValue(source, path) {
  return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), source);
}

export function SiteSettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refreshSettings() {
    const response = await api.get('/site-settings');
    setSettings(response.data);
    return response.data;
  }

  useEffect(() => {
    refreshSettings().finally(() => setLoading(false));
  }, []);

  const value = useMemo(() => {
    const branding = { ...(settings?.branding || {}) };

    if (!branding.logoUrl || branding.logoUrl === '/logo.jpg') {
      branding.logoUrl = '/logo.png';
    }

    return {
      settings,
      loading,
      refreshSettings,
      getText(language, path, fallback) {
        return getValue(settings?.copyOverrides?.[language], path) ?? fallback;
      },
      getImage(path, fallback) {
        return getValue(settings?.images, path) ?? fallback;
      },
      branding,
      contact: settings?.contact || {},
      workingHours: settings?.workingHours || [],
      homeStats: settings?.homeStats || {}
    };
  }, [loading, settings]);

  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (!context) throw new Error('useSiteSettings must be used within SiteSettingsProvider');
  return context;
}
