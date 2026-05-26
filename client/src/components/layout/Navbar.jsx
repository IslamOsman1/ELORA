import React from 'react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { t, toggleLanguage } = useLanguage();
  const links = [
    ['/', t('nav.home')],
    ['/about', t('nav.about')],
    ['/services', t('nav.services')],
    ['/doctors', t('nav.doctors')],
    ['/booking', t('nav.booking')],
    ['/contact', t('nav.contact')]
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#120f12]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.jpg" alt="ELORA" className="h-12 w-12 rounded-2xl object-cover ring-1 ring-[#f2d38d]/40" />
          <div>
            <p className="font-display text-2xl tracking-[0.16em] text-[#f4d59a]">ELORA</p>
            <p className="text-xs text-white/60">{t('common.brandFull')}</p>
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
          <button onClick={toggleLanguage} className="btn-dark !px-4 !py-2 text-sm">{t('nav.language')}</button>
          <Link to="/admin/login" className="btn-gold !px-5 !py-2">{t('nav.admin')}</Link>
        </div>
        <button className="inline-flex rounded-full border border-white/10 p-3 lg:hidden" onClick={() => setOpen((value) => !value)}>
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>
      {open && (
        <div className="border-t border-white/10 bg-[#120f12]/95 px-4 py-4 lg:hidden">
          <div className="grid gap-3">
            {links.map(([href, label]) => (
              <NavLink key={href} to={href} className="nav-link" onClick={() => setOpen(false)}>
                {label}
              </NavLink>
            ))}
            <div className="mt-2 flex gap-3">
              <button onClick={toggleLanguage} className="btn-dark flex-1">{t('nav.language')}</button>
              <Link to="/admin/login" className="btn-gold flex-1 text-center" onClick={() => setOpen(false)}>{t('nav.admin')}</Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
