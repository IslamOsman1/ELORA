import React from 'react';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { copy } from '../data/copy';

const LanguageContext = createContext(null);

function getValue(source, path) {
  return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), source);
}

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => localStorage.getItem('elora_lang') || 'ar');

  useEffect(() => {
    localStorage.setItem('elora_lang', language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const value = useMemo(() => ({
    language,
    isArabic: language === 'ar',
    toggleLanguage: () => setLanguage((current) => (current === 'ar' ? 'en' : 'ar')),
    setLanguage,
    t: (path) => getValue(copy[language], path) ?? getValue(copy.en, path) ?? path
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
