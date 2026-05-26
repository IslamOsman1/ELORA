import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();
  const links = [
    ['/', t('nav.home')],
    ['/about', t('nav.about')],
    ['/services', t('nav.services')],
    ['/doctors', t('nav.doctors')],
    ['/booking', t('nav.booking')],
    ['/contact', t('nav.contact')]
  ];

  return (
    <footer className="border-t border-white/10 bg-[#100d10]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-2 lg:grid-cols-[1.2fr_.8fr_.8fr]">
        <div>
          <p className="font-display text-3xl tracking-[0.18em] text-[#f4d59a]">ELORA</p>
          <p className="mt-4 max-w-md text-sm leading-7 text-white/65">{t('footer.tagline')}</p>
        </div>
        <div>
          <h3 className="text-sm uppercase tracking-[0.32em] text-[#f4d59a]">{t('footer.quickLinks')}</h3>
          <div className="mt-4 grid gap-3">
            {links.map(([href, label]) => (
              <Link key={href} to={href} className="text-white/70 transition hover:text-white">
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-sm uppercase tracking-[0.32em] text-[#f4d59a]">{t('footer.contact')}</h3>
          <div className="mt-4 grid gap-3 text-sm text-white/70">
            <p className="inline-flex items-center gap-2"><MapPin size={16} /> Istanbul / Cairo</p>
            <p className="inline-flex items-center gap-2"><Phone size={16} /> +20 100 000 0000</p>
            <p className="inline-flex items-center gap-2"><Mail size={16} /> contact@elora-dental.com</p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-sm text-white/45">
        Copyright {new Date().getFullYear()} ELORA. {t('footer.rights')}
      </div>
    </footer>
  );
}
