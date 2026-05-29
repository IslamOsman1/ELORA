import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import { localizedField } from '../../utils/content';

function caseTitle(item, language) {
  return localizedField(item, language, 'title');
}

function caseShortDescription(item, language) {
  return localizedField(item, language, 'shortDescription');
}

function caseImage(item) {
  return item?.mainImage || item?.beforeImages?.[0] || item?.afterImages?.[0] || item?.galleryImages?.[0] || 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=1200&q=80';
}

export default function TreatmentCaseCard({ treatmentCase, className = '' }) {
  const { isArabic, language } = useLanguage();
  const title = caseTitle(treatmentCase, language);
  const description = caseShortDescription(treatmentCase, language);

  return (
    <motion.article
      whileHover={{ y: -8, scale: 1.015 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.2 }}
      className={`group overflow-hidden rounded-[1.9rem] border border-white/10 bg-white/[0.04] ${className}`}
    >
      <Link to={`/cases/${treatmentCase._id}`} className="block">
        <div className="relative overflow-hidden">
          <img
            src={caseImage(treatmentCase)}
            alt={title}
            className="h-56 w-full object-cover transition duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0b0f] via-[#0f0b0f]/15 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5">
            <p className="text-xs uppercase tracking-[0.22em] text-[#f2d38d]">
              {localizedField(treatmentCase.service || {}, language, 'title') || (isArabic ? 'حالة علاج' : 'Treatment case')}
            </p>
            <h3 className="mt-3 text-xl font-semibold text-white">{title}</h3>
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition duration-300 group-hover:opacity-100">
            <span className="btn-gold inline-flex items-center gap-2 text-sm">
              {isArabic ? 'عرض التفاصيل' : 'View details'}
              <ArrowRight size={16} className={isArabic ? 'rotate-180' : ''} />
            </span>
          </div>
        </div>
        <div className="p-5">
          <p className="line-clamp-3 text-sm leading-7 text-white/65">{description}</p>
          <div className="mt-4 flex items-center justify-between text-xs text-white/45">
            <span>{treatmentCase.caseDate || '-'}</span>
            <span>{treatmentCase.durationTextAr || treatmentCase.durationText || '-'}</span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
