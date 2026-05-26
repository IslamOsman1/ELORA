import React from 'react';
import { Sparkles, ShieldCheck, Sun, Smile, HeartPulse, Baby } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { localizedField, serviceImage } from '../../utils/content';

const icons = { Sparkles, ShieldCheck, Sun, Smile, HeartPulse, Baby };

export default function ServiceCard({ service }) {
  const { t, language } = useLanguage();
  const Icon = icons[service.icon] || Sparkles;

  return (
    <article className="premium-card overflow-hidden">
      <img src={serviceImage(service)} alt={localizedField(service, language, 'title')} className="h-28 w-full object-cover sm:h-52" />
      <div className="p-3 sm:p-6">
        <div className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#f2d38d]/15 text-[#f2d38d] sm:mb-4 sm:h-12 sm:w-12 sm:rounded-2xl">
          <Icon size={18} />
        </div>
        <h3 className="text-base font-semibold sm:text-2xl">{localizedField(service, language, 'title')}</h3>
        <p className="mt-2 line-clamp-3 text-[0.74rem] leading-5 text-white/65 sm:mt-3 sm:min-h-24 sm:text-sm sm:leading-7">
          {localizedField(service, language, 'description')}
        </p>
        <div className="mt-3 flex flex-col gap-1 text-[0.72rem] text-white/55 sm:mt-5 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:text-sm">
          <span>{service.duration} {t('common.minutes')}</span>
          <span className="font-semibold text-[#f2d38d]">{t('common.from')} ${service.priceFrom}</span>
        </div>
      </div>
    </article>
  );
}
