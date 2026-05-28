import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarDays, Stethoscope } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { doctorImage, localizedField } from '../../utils/content';

export default function DoctorCard({ doctor, compact = false, className = '' }) {
  const { t, language } = useLanguage();
  const specialty = localizedField(doctor, language, 'specialty');
  const bio = localizedField(doctor, language, 'bio');
  const availableDays = (doctor.availableDays || []).join(' | ');
  const detailsHref = `/doctors/${doctor._id}`;

  if (compact) {
    return (
      <motion.div whileHover={{ y: -6, scale: 1.02 }} whileTap={{ scale: 0.98 }} transition={{ duration: 0.2 }}>
        <Link
          to={detailsHref}
          className={`group block overflow-hidden rounded-[1.35rem] border border-white/10 bg-white/[0.04] ${className}`}
        >
          <div className="relative overflow-hidden">
            <div className="flex h-56 w-full items-end justify-center bg-[radial-gradient(circle_at_top,rgba(244,213,154,0.16),transparent_55%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] sm:h-64">
              <img
                src={doctorImage(doctor)}
                alt={doctor.name}
                className="h-full w-full object-contain object-bottom p-2 transition duration-500 group-hover:scale-105"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#110d10] via-[#110d10]/28 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-3">
              <div className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-[#f2d38d]/20 bg-black/25 text-[#f2d38d] backdrop-blur">
                <Stethoscope size={14} />
              </div>
              <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-5 text-white sm:text-base">{doctor.name}</h3>
            </div>
          </div>
        </Link>
      </motion.div>
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
          <div className="flex h-36 w-full items-end justify-center bg-[radial-gradient(circle_at_top,rgba(244,213,154,0.16),transparent_55%),linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] sm:h-72">
            <img
              src={doctorImage(doctor)}
              alt={doctor.name}
              className="h-full w-full object-contain object-bottom p-3 transition duration-500 group-hover:scale-105"
            />
          </div>
        </div>
        <div className="p-3 sm:p-6">
          <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#f2d38d]/15 text-[#f2d38d] sm:mb-4 sm:h-12 sm:w-12 sm:rounded-2xl">
            <Stethoscope size={18} />
          </div>
          <p className="text-[0.72rem] uppercase tracking-[0.24em] text-[#f2d38d] sm:text-sm">{specialty}</p>
          <h3 className="mt-2 text-base font-semibold sm:mt-3 sm:text-2xl">{doctor.name}</h3>
          <p className="mt-2 line-clamp-3 text-[0.74rem] leading-5 text-white/65 sm:mt-3 sm:min-h-24 sm:text-sm sm:leading-7">
            {bio}
          </p>
          <div className="mt-3 flex flex-col gap-1 text-[0.72rem] text-white/55 sm:mt-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:text-sm">
            <span>{doctor.experienceYears}+ {t('common.years')}</span>
            <span className="font-semibold text-[#f2d38d]">{specialty}</span>
          </div>
        </div>
      </Link>
      <div className="px-3 pb-3 sm:px-6 sm:pb-6">
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-[0.72rem] text-white/65 sm:rounded-2xl sm:p-4 sm:text-sm">
          <div className="flex items-center gap-2 text-white/80">
            <CalendarDays size={16} className="text-[#f2d38d]" />
            <p className="font-semibold">{t('common.availableDays')}</p>
          </div>
          <p className="mt-2 leading-6 text-white/58">{availableDays}</p>
        </div>
      </div>
    </motion.article>
  );
}
