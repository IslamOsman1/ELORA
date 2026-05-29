import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, Clock3, Expand, Image as ImageIcon } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import PageHero from '../components/common/PageHero';
import TreatmentCaseCard from '../components/public/TreatmentCaseCard';
import { api } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';
import { localizedField, serviceImage } from '../utils/content';

function caseImage(item) {
  return item?.mainImage || item?.beforeImages?.[0] || item?.afterImages?.[0] || item?.galleryImages?.[0] || serviceImage(item?.service);
}

function compareLabel(isArabic, type) {
  return type === 'before'
    ? (isArabic ? 'قبل العلاج' : 'Before')
    : (isArabic ? 'بعد العلاج' : 'After');
}

export default function CaseDetailsPage() {
  const { caseId } = useParams();
  const { language, isArabic } = useLanguage();
  const [caseData, setCaseData] = useState(null);
  const [similarCases, setSimilarCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState(-1);
  const [comparisonValue, setComparisonValue] = useState(50);

  useEffect(() => {
    setLoading(true);
    api.get(`/cases/${caseId}`)
      .then((response) => {
        setCaseData(response.data.treatmentCase);
        setSimilarCases(response.data.similarCases || []);
      })
      .catch(() => {
        setCaseData(null);
        setSimilarCases([]);
      })
      .finally(() => setLoading(false));
  }, [caseId]);

  const gallery = useMemo(() => {
    if (!caseData) return [];
    return Array.from(new Set([
      ...(caseData.beforeImages || []),
      ...(caseData.afterImages || []),
      ...(caseData.galleryImages || []),
      caseData.mainImage || ''
    ].filter(Boolean)));
  }, [caseData]);

  const title = localizedField(caseData, language, 'title');
  const shortDescription = localizedField(caseData, language, 'shortDescription');
  const fullDescription = localizedField(caseData, language, 'fullDescription');
  const patientProblem = localizedField(caseData, language, 'patientProblem');
  const resultSummary = localizedField(caseData, language, 'resultSummary');
  const treatmentSteps = language === 'ar' && caseData?.treatmentStepsAr?.length ? caseData.treatmentStepsAr : (caseData?.treatmentSteps || []);
  const beforeImage = caseData?.beforeImages?.[0];
  const afterImage = caseData?.afterImages?.[0];

  if (loading) {
    return <main className="grid min-h-screen place-items-center px-4 text-white/70">{isArabic ? 'جارٍ تحميل الحالة...' : 'Loading case...'}</main>;
  }

  if (!caseData) {
    return (
      <main className="grid min-h-screen place-items-center px-4">
        <div className="premium-card max-w-xl p-8 text-center">
          <h1 className="font-display text-3xl text-[#f2d38d]">{isArabic ? 'الحالة غير موجودة' : 'Case not found'}</h1>
          <Link to="/services" className="btn-dark mt-6 inline-flex items-center gap-2">
            <ArrowRight size={16} className={isArabic ? 'rotate-180' : ''} />
            {isArabic ? 'العودة للخدمات' : 'Back to services'}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main>
      <PageHero
        eyebrow={localizedField(caseData.service || {}, language, 'title')}
        title={title}
        text={shortDescription || fullDescription}
        image={caseImage(caseData)}
      />

      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1.2fr_.8fr]">
          <div className="grid gap-6">
            {(beforeImage && afterImage) ? (
              <article className="premium-card overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-[#f2d38d]">{isArabic ? 'مقارنة قبل وبعد' : 'Before / After'}</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">{isArabic ? 'نتيجة العلاج' : 'Treatment result'}</h2>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-white/60">
                    {comparisonValue}%
                  </div>
                </div>
                <div className="relative h-[22rem] overflow-hidden sm:h-[28rem]">
                  <img src={afterImage} alt={compareLabel(isArabic, 'after')} className="h-full w-full object-cover" />
                  <div className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${comparisonValue}%` }}>
                    <img src={beforeImage} alt={compareLabel(isArabic, 'before')} className="h-full w-[calc(100vw-2rem)] max-w-[67rem] object-cover" />
                  </div>
                  <div className="absolute inset-y-0" style={{ left: `calc(${comparisonValue}% - 1px)` }}>
                    <div className="h-full w-0.5 bg-white shadow-[0_0_0_1px_rgba(255,255,255,0.4)]" />
                  </div>
                  <div className="absolute left-5 top-5 rounded-full border border-white/15 bg-black/35 px-4 py-2 text-xs text-white/85 backdrop-blur">
                    {compareLabel(isArabic, 'before')}
                  </div>
                  <div className="absolute right-5 top-5 rounded-full border border-white/15 bg-black/35 px-4 py-2 text-xs text-white/85 backdrop-blur">
                    {compareLabel(isArabic, 'after')}
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="95"
                    value={comparisonValue}
                    onChange={(event) => setComparisonValue(Number(event.target.value))}
                    className="absolute inset-x-5 bottom-5 accent-[#f2d38d]"
                  />
                </div>
              </article>
            ) : null}

            <article className="premium-card p-6 sm:p-8">
              <h2 className="text-2xl font-semibold text-white">{isArabic ? 'تفاصيل الحالة' : 'Case details'}</h2>
              <p className="mt-4 text-sm leading-8 text-white/68">{fullDescription || shortDescription || '-'}</p>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm text-[#f2d38d]">{isArabic ? 'المشكلة' : 'Patient concern'}</p>
                  <p className="mt-3 text-sm leading-7 text-white/65">{patientProblem || '-'}</p>
                </div>
                <div className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm text-[#f2d38d]">{isArabic ? 'النتيجة النهائية' : 'Final result'}</p>
                  <p className="mt-3 text-sm leading-7 text-white/65">{resultSummary || '-'}</p>
                </div>
              </div>
              <div className="mt-6 rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-5">
                <p className="text-sm text-[#f2d38d]">{isArabic ? 'خطوات العلاج' : 'Treatment steps'}</p>
                <div className="mt-4 grid gap-3">
                  {treatmentSteps.length ? treatmentSteps.map((step, index) => (
                    <div key={`${step}-${index}`} className="rounded-[1.2rem] border border-white/10 bg-black/15 p-4 text-sm text-white/68">
                      <span className="me-2 inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#f2d38d]/25 bg-[#f2d38d]/10 text-xs font-semibold text-[#f2d38d]">{index + 1}</span>
                      {step}
                    </div>
                  )) : (
                    <p className="text-sm text-white/50">{isArabic ? 'لا توجد خطوات علاج مضافة.' : 'No treatment steps added.'}</p>
                  )}
                </div>
              </div>
            </article>

            <article className="premium-card p-6 sm:p-8">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-[#f2d38d]">{isArabic ? 'معرض الصور' : 'Gallery'}</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">{isArabic ? 'صور الحالة' : 'Case images'}</h2>
                </div>
                <div className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs text-white/55">
                  {gallery.length} {isArabic ? 'صورة' : 'images'}
                </div>
              </div>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {gallery.map((image, index) => (
                  <button
                    key={`${image}-${index}`}
                    type="button"
                    onClick={() => setLightboxIndex(index)}
                    className="group relative overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/[0.03] text-start"
                  >
                    <img src={image} alt={`${title} ${index + 1}`} className="h-56 w-full object-cover transition duration-500 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0e0a0d]/65 via-transparent to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-4 py-3">
                      <span className="text-sm text-white/85">{isArabic ? 'صورة' : 'Image'} {index + 1}</span>
                      <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/25 text-white/85 backdrop-blur">
                        <Expand size={14} />
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </article>
          </div>

          <aside className="grid gap-4 self-start">
            <div className="premium-card p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-[#f2d38d]">{isArabic ? 'معلومات سريعة' : 'Quick info'}</p>
              <div className="mt-5 grid gap-3">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm text-white/50">{isArabic ? 'الخدمة المرتبطة' : 'Related service'}</p>
                  <p className="mt-2 font-semibold text-white">{localizedField(caseData.service || {}, language, 'title') || '-'}</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm text-white/50">{isArabic ? 'الطبيب المعالج' : 'Treating doctor'}</p>
                  <p className="mt-2 font-semibold text-white">{caseData.doctor?.name || '-'}</p>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm text-white/50">{isArabic ? 'مدة العلاج' : 'Treatment duration'}</p>
                  <div className="mt-2 flex items-center gap-2 text-white">
                    <Clock3 size={18} className="text-[#f2d38d]" />
                    <span className="font-semibold">{localizedField(caseData, language, 'durationText') || '-'}</span>
                  </div>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="text-sm text-white/50">{isArabic ? 'تاريخ الحالة' : 'Case date'}</p>
                  <p className="mt-2 font-semibold text-white">{caseData.caseDate || '-'}</p>
                </div>
              </div>
            </div>
            <div className="premium-card p-6">
              <p className="text-sm leading-7 text-white/65">
                {isArabic ? 'يمكنك حجز نفس الخدمة مباشرة من العيادة وسيتم اختيارها تلقائيًا لك.' : 'You can book the same service directly and it will be preselected for you.'}
              </p>
              <div className="mt-5 flex flex-col gap-3">
                <Link to={`/booking?service=${caseData.service?._id || ''}`} className="btn-gold inline-flex items-center justify-center">
                  {isArabic ? 'احجز موعد' : 'Book now'}
                </Link>
                <Link to={`/services/${caseData.service?._id || ''}`} className="btn-dark inline-flex items-center justify-center gap-2">
                  <ArrowRight size={16} className={isArabic ? 'rotate-180' : ''} />
                  {isArabic ? 'العودة للخدمة' : 'Back to service'}
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {similarCases.length ? (
        <section className="bg-white/[0.02] px-4 py-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8">
              <p className="text-sm uppercase tracking-[0.24em] text-[#f2d38d]">{isArabic ? 'حالات مشابهة' : 'Similar cases'}</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">{isArabic ? 'نتائج مشابهة من أعمالنا' : 'More similar results'}</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {similarCases.map((item) => <TreatmentCaseCard key={item._id} treatmentCase={item} />)}
            </div>
          </div>
        </section>
      ) : null}

      {lightboxIndex >= 0 && gallery[lightboxIndex] ? (
        <div className="fixed inset-0 z-[90] bg-black/90 px-4 py-6 backdrop-blur-sm">
          <div className="mx-auto flex h-full max-w-6xl flex-col">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-white/70">
                <ImageIcon size={18} className="text-[#f2d38d]" />
                <span>{isArabic ? 'صورة' : 'Image'} {lightboxIndex + 1} / {gallery.length}</span>
              </div>
              <button className="icon-btn" onClick={() => setLightboxIndex(-1)}>
                <ArrowRight size={16} className="rotate-45" />
              </button>
            </div>
            <div className="relative flex-1 overflow-hidden rounded-[2rem] border border-white/10 bg-[#0d0a0d]">
              <img src={gallery[lightboxIndex]} alt={`${title} ${lightboxIndex + 1}`} className="h-full w-full object-contain" />
              {gallery.length > 1 ? (
                <>
                  <button className="absolute left-4 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/35 text-white backdrop-blur" onClick={() => setLightboxIndex((current) => (current - 1 + gallery.length) % gallery.length)}>
                    <ChevronLeft size={18} />
                  </button>
                  <button className="absolute right-4 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/35 text-white backdrop-blur" onClick={() => setLightboxIndex((current) => (current + 1) % gallery.length)}>
                    <ChevronRight size={18} />
                  </button>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
