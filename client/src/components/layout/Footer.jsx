import React from 'react';
import { Link } from 'react-router-dom';
import {
  BadgeInfo,
  Building2,
  Contact,
  Facebook,
  Info,
  Instagram,
  Landmark,
  LocateFixed,
  Mail,
  MapPin,
  MapPinned,
  MessageCircle,
  Phone,
  PhoneCall,
  Smartphone
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useSiteSettings } from '../../context/SiteSettingsContext';

const iconMap = {
  Mail,
  MapPin,
  Phone,
  Building2,
  MapPinned,
  LocateFixed,
  Landmark,
  Smartphone,
  PhoneCall,
  BadgeInfo,
  Contact,
  Info,
  MessageCircle,
  Instagram,
  Facebook
};

function resolveIcon(name, fallback) {
  return iconMap[name] || fallback;
}

function normalizePhone(phone) {
  return (phone || '').replace(/[^\d+]/g, '');
}

function resolveWhatsappLink(value) {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  const digits = value.replace(/[^\d]/g, '');
  return digits ? `https://wa.me/${digits}` : '';
}

function resolveSocialLink(value, baseUrl) {
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) return value;
  return `${baseUrl.replace(/\/$/, '')}/${value.replace(/^@/, '').replace(/^\//, '')}`;
}

function ContactButton({ as: Component = 'a', href, icon: Icon, children, external = false }) {
  const className = 'inline-flex min-h-12 items-center gap-3 rounded-full border border-white/12 bg-white/[0.04] px-4 py-3 text-sm text-white/78 transition hover:border-[#f4d59a]/40 hover:bg-white/[0.08] hover:text-white';

  if (Component === 'span') {
    return (
      <span className={className}>
        <Icon size={17} className="shrink-0 text-[#f4d59a]" />
        <span>{children}</span>
      </span>
    );
  }

  return (
    <Component
      href={href}
      className={className}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
    >
      <Icon size={17} className="shrink-0 text-[#f4d59a]" />
      <span>{children}</span>
    </Component>
  );
}

export default function Footer() {
  const { t, language, isArabic } = useLanguage();
  const { branding, contact, getText } = useSiteSettings();
  const brandName = branding.brandName || 'ELORA';
  const footerTagline = getText(language, 'footer.tagline', t('footer.tagline'));
  const LocationIcon = resolveIcon(contact.locationIcon, MapPin);
  const PhoneIcon = resolveIcon(contact.phoneIcon, Phone);
  const EmailIcon = resolveIcon(contact.emailIcon, Mail);
  const WhatsappIcon = resolveIcon(contact.whatsappIcon, MessageCircle);
  const InstagramIcon = resolveIcon(contact.instagramIcon, Instagram);
  const FacebookIcon = resolveIcon(contact.facebookIcon, Facebook);

  const links = [
    ['/', t('nav.home')],
    ['/about', t('nav.about')],
    ['/services', t('nav.services')],
    ['/doctors', t('nav.doctors')],
    ['/booking', t('nav.booking')],
    ['/contact', t('nav.contact')]
  ];

  const socialButtons = [
    {
      key: 'whatsapp',
      label: isArabic ? 'واتساب' : 'WhatsApp',
      value: contact.whatsapp,
      href: resolveWhatsappLink(contact.whatsapp),
      Icon: WhatsappIcon
    },
    {
      key: 'instagram',
      label: isArabic ? 'إنستجرام' : 'Instagram',
      value: contact.instagram,
      href: resolveSocialLink(contact.instagram, 'https://instagram.com'),
      Icon: InstagramIcon
    },
    {
      key: 'facebook',
      label: isArabic ? 'فيسبوك' : 'Facebook',
      value: contact.facebook,
      href: resolveSocialLink(contact.facebook, 'https://facebook.com'),
      Icon: FacebookIcon
    }
  ].filter((item) => item.value && item.href);

  return (
    <footer className="border-t border-white/10 bg-[#100d10]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-2 lg:grid-cols-[1.2fr_.8fr_.95fr]">
        <div>
          <p className="font-display text-3xl tracking-[0.18em] text-[#f4d59a]">{brandName}</p>
          <p className="mt-4 max-w-md text-sm leading-7 text-white/65">{footerTagline}</p>
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
          <div className="mt-4 grid gap-3">
            <ContactButton as="span" icon={LocationIcon}>
              {contact.location || 'Istanbul / Cairo'}
            </ContactButton>
            <ContactButton href={`tel:${normalizePhone(contact.phone) || '+201000000000'}`} icon={PhoneIcon}>
              {contact.phone || '+20 100 000 0000'}
            </ContactButton>
            <ContactButton href={`mailto:${contact.email || 'contact@elora-dental.com'}`} icon={EmailIcon}>
              {contact.email || 'contact@elora-dental.com'}
            </ContactButton>
          </div>
          {socialButtons.length > 0 ? (
            <div className="mt-5">
              <p className="text-xs uppercase tracking-[0.28em] text-white/35">
                {isArabic ? 'وسائل التواصل' : 'Social links'}
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                {socialButtons.map(({ key, label, href, Icon }) => (
                  <ContactButton key={key} href={href} icon={Icon} external>
                    {label}
                  </ContactButton>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-sm text-white/45">
        Copyright {new Date().getFullYear()} {brandName}. {t('footer.rights')}
      </div>
    </footer>
  );
}
