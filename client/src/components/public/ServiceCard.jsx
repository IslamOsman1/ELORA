import React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sparkles, ShieldCheck, Sun, Smile, HeartPulse, Baby, ArrowRight, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { localizedField, serviceImage } from '../../utils/content';
import { formatPriceInEgp } from '../../utils/currency';

const icons = { Sparkles, ShieldCheck, Sun, Smile, HeartPulse, Baby };

export default function ServiceCard({ service, compact = false, expandable = false, className = '' }) {
  const { t, language, isArabic } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const Icon = icons[service.icon] || Sparkles;
  const title = localizedField(service, language, 'title');
  const description = localizedField(service, language, 'description');
  const detailsHref = `/services/${service._id}`;
  const bookingHref = `/booking?service=${service._id}`;
  const formattedPrice = formatPriceInEgp(service.priceFrom, language);

  if (compact) {
    return (
      <motion.div whileHover={{ y: -6, scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
        <Link
          to={detailsHref}
          className={`group block overflow-hidden rounded-[1.7rem] border border-white/10 bg-white/[0.04] ${className}`}
        >
          <div className="relative overflow-hidden">
            <img
              src={serviceImage(service)}
              alt={title}
              className="h-44 w-full object-cover transition duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#110d10] via-[#110d10]/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#f2d38d]/20 bg-black/25 text-[#f2d38d] backdrop-blur">
                <Icon size={18} />
              </div>
              <h3 className="mt-3 text-lg font-semibold text-white">{title}</h3>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  if (expandable) {
    return (
      <motion.article
        whileHover={{ y: -8, scale: 1.015 }}
        whileTap={{ scale: 0.99 }}
        transition={{ duration: 0.2 }}
        className={`group overflow-hidden rounded-[1.9rem] border border-white/10 bg-white/[0.04] ${className}`}
      >
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="block w-full text-start"
        >
          <div className="relative overflow-hidden">
            <img
              src={serviceImage(service)}
              alt={title}
              className="h-52 w-full object-cover transition duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f0b0f] via-[#0f0b0f]/18 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[#f2d38d]/20 bg-black/25 text-[#f2d38d] backdrop-blur">
                    <Icon size={18} />
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-white sm:text-xl">{title}</h3>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-black/25 text-white/75 backdrop-blur">
                  <ChevronDown size={18} className={`transition ${isOpen ? 'rotate-180 text-[#f2d38d]' : ''}`} />
                </div>
              </div>
            </div>
          </div>
        </button>

        <AnimatePresence initial={false}>
          {isOpen ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="overflow-hidden"
            >
              <div className="border-t border-white/10 p-4 sm:p-6">
                <p className="text-sm leading-7 text-white/68">{description}</p>
                <div className="mt-4 flex flex-col gap-1 text-sm text-white/55 sm:flex-row sm:items-center sm:justify-between">
                  <span>{service.duration} {t('common.minutes')}</span>
                  <span className="font-semibold text-[#f2d38d]">{t('common.from')} {formattedPrice}</span>
                </div>
                <div className="mt-5 flex flex-col gap-2 sm:flex-row">
                  <Link to={detailsHref} className="btn-dark inline-flex items-center justify-center gap-2 text-sm">
                    {isArabic ? 'التفاصيل' : 'Details'}
                    <ArrowRight size={16} className={isArabic ? 'rotate-180' : ''} />
                  </Link>
                  <Link to={bookingHref} className="btn-gold inline-flex items-center justify-center text-sm">
                    {t('common.bookNow')}
                  </Link>
                </div>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.article>
    );
  }

  return (
    <motion.article
      whileHover={{ y: -8, scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      transition={{ duration: 0.2 }}
      className={`premium-card group overflow-hidden ${className}`}
    >
      <Link to={detailsHref} className="block">
        <div className="overflow-hidden">
          <img
            src={serviceImage(service)}
            alt={title}
            className="h-28 w-full object-cover transition duration-500 group-hover:scale-110 sm:h-52"
          />
        </div>
        <div className="p-3 sm:p-6">
          <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#f2d38d]/15 text-[#f2d38d] sm:mb-4 sm:h-12 sm:w-12 sm:rounded-2xl">
            <Icon size={18} />
          </div>
          <h3 className="text-base font-semibold sm:text-2xl">{title}</h3>
          <p className="mt-2 line-clamp-3 text-[0.74rem] leading-5 text-white/65 sm:mt-3 sm:min-h-24 sm:text-sm sm:leading-7">
            {description}
          </p>
          <div className="mt-3 flex flex-col gap-1 text-[0.72rem] text-white/55 sm:mt-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:text-sm">
            <span>{service.duration} {t('common.minutes')}</span>
            <span className="font-semibold text-[#f2d38d]">{t('common.from')} {formattedPrice}</span>
          </div>
        </div>
      </Link>
      <div className="px-3 pb-3 sm:px-6 sm:pb-6">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link to={detailsHref} className="btn-dark inline-flex items-center justify-center gap-2 text-sm">
            {isArabic ? 'التفاصيل' : 'Details'}
            <ArrowRight size={16} className={isArabic ? 'rotate-180' : ''} />
          </Link>
          <Link to={bookingHref} className="btn-gold inline-flex items-center justify-center text-sm">
            {t('common.bookNow')}
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
