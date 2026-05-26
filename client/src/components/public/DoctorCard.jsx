import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { doctorImage, localizedField } from '../../utils/content';

export default function DoctorCard({ doctor }) {
  const { t, language } = useLanguage();

  return (
    <article className="premium-card overflow-hidden">
      <img src={doctorImage(doctor)} alt={doctor.name} className="h-36 w-full object-cover object-top sm:h-72" />
      <div className="p-3 sm:p-6">
        <p className="eyebrow !mb-0 !tracking-[0.2em]">{localizedField(doctor, language, 'specialty')}</p>
        <h3 className="mt-2 text-base font-semibold sm:mt-3 sm:text-2xl">{doctor.name}</h3>
        <p className="mt-2 line-clamp-3 text-[0.74rem] leading-5 text-white/65 sm:mt-4 sm:text-sm sm:leading-7">
          {localizedField(doctor, language, 'bio')}
        </p>
        <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 text-[0.72rem] text-white/65 sm:mt-5 sm:rounded-2xl sm:p-4 sm:text-sm">
          <p className="font-semibold text-white">{doctor.experienceYears}+ {t('common.years')}</p>
          <p className="mt-1 sm:mt-2">{t('common.availableDays')}: {(doctor.availableDays || []).join(' | ')}</p>
        </div>
      </div>
    </article>
  );
}
