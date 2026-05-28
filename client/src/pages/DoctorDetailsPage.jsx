import React from 'react';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Award, CalendarDays, Stethoscope } from 'lucide-react';
import PageHero from '../components/common/PageHero';
import { api } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { doctorImage, localizedField } from '../utils/content';

export default function DoctorDetailsPage() {
  const { doctorId } = useParams();
  const { t, language, isArabic } = useLanguage();
  const { branding } = useSiteSettings();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/doctors/${doctorId}`)
      .then((response) => setDoctor(response.data))
      .catch(() => setDoctor(null))
      .finally(() => setLoading(false));
  }, [doctorId]);

  if (loading) {
    return <main className="grid min-h-screen place-items-center px-4 text-white/70">{t('common.loading')}</main>;
  }

  if (!doctor) {
    return (
      <main className="grid min-h-screen place-items-center px-4">
        <div className="premium-card max-w-xl p-8 text-center">
          <h1 className="font-display text-3xl text-[#f2d38d]">{isArabic ? 'الطبيب غير موجود' : 'Doctor not found'}</h1>
          <Link to="/doctors" className="btn-dark mt-6 inline-flex items-center justify-center">
            {isArabic ? 'العودة للأطباء' : 'Back to doctors'}
          </Link>
        </div>
      </main>
    );
  }

  const specialty = localizedField(doctor, language, 'specialty');
  const bio = localizedField(doctor, language, 'bio');
  const availableDays = (doctor.availableDays || []).join(' | ');

  return (
    <main>
      <PageHero
        eyebrow={branding.brandName || 'ELORA'}
        title={doctor.name}
        text={specialty}
        image={doctorImage(doctor)}
      />
      <section className="px-4 py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.1fr_.9fr]">
          <div className="premium-card overflow-hidden">
            <img src={doctorImage(doctor)} alt={doctor.name} className="h-64 w-full object-cover object-top sm:h-80" />
            <div className="p-5 sm:p-8">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f2d38d]/15 text-[#f2d38d]">
                <Stethoscope size={22} />
              </div>
              <p className="mt-5 text-sm uppercase tracking-[0.28em] text-[#f2d38d]">{specialty}</p>
              <h2 className="mt-3 text-2xl font-semibold sm:text-4xl">{doctor.name}</h2>
              <p className="mt-4 text-sm leading-7 text-white/70 sm:text-base sm:leading-8">{bio}</p>
            </div>
          </div>
          <aside className="grid gap-4 self-start">
            <div className="premium-card p-5 sm:p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-[#f2d38d]">{isArabic ? 'معلومات سريعة' : 'Quick info'}</p>
              <div className="mt-5 grid gap-3">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center gap-2 text-white">
                    <Award size={18} className="text-[#f2d38d]" />
                    <span className="font-semibold">{doctor.experienceYears}+ {t('common.years')}</span>
                  </div>
                </div>
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex items-center gap-2 text-white">
                    <CalendarDays size={18} className="text-[#f2d38d]" />
                    <span className="font-semibold">{t('common.availableDays')}</span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-white/65">{availableDays}</p>
                </div>
              </div>
            </div>
            <div className="premium-card p-5 sm:p-6">
              <p className="text-sm leading-7 text-white/65">
                {isArabic ? 'يمكنك الانتقال مباشرة إلى صفحة الحجز ثم اختيار هذا الطبيب مع الخدمة المناسبة.' : 'You can continue to the booking page and choose this doctor with the appropriate service.'}
              </p>
              <div className="mt-5 flex flex-col gap-3">
                <Link to={`/booking?doctor=${doctor._id}`} className="btn-gold inline-flex items-center justify-center">
                  {t('common.bookNow')}
                </Link>
                <Link to="/doctors" className="btn-dark inline-flex items-center justify-center">
                  {isArabic ? 'العودة لكل الأطباء' : 'View all doctors'}
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
