import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Award, CalendarDays } from 'lucide-react';
import PageHero from '../components/common/PageHero';
import SectionHeading from '../components/common/SectionHeading';
import TreatmentCaseCard from '../components/public/TreatmentCaseCard';
import { api } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { doctorImage, localizedField } from '../utils/content';

export default function DoctorDetailsPage() {
  const { doctorId } = useParams();
  const { t, language, isArabic } = useLanguage();
  const { branding } = useSiteSettings();
  const [doctor, setDoctor] = useState(null);
  const [treatmentCases, setTreatmentCases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/doctors/${doctorId}`),
      api.get('/cases', { params: { doctor: doctorId } })
    ])
      .then(([doctorResponse, casesResponse]) => {
        setDoctor(doctorResponse.data);
        setTreatmentCases(casesResponse.data || []);
      })
      .catch(() => {
        setDoctor(null);
        setTreatmentCases([]);
      })
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
        <div className="mx-auto grid max-w-4xl gap-4">
          <div className="premium-card p-5 sm:p-6">
            <p className="text-xs uppercase tracking-[0.3em] text-[#f2d38d]">{isArabic ? 'معلومات سريعة' : 'Quick info'}</p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.03] p-3 sm:rounded-[1.5rem] sm:p-4">
                <div className="flex items-center gap-2 text-white">
                  <Award size={16} className="text-[#f2d38d] sm:h-[18px] sm:w-[18px]" />
                  <span className="text-sm font-semibold sm:text-base">{doctor.experienceYears}+ {t('common.years')}</span>
                </div>
              </div>
              <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.03] p-3 sm:rounded-[1.5rem] sm:p-4">
                <div className="flex items-center gap-2 text-white">
                  <CalendarDays size={16} className="text-[#f2d38d] sm:h-[18px] sm:w-[18px]" />
                  <span className="text-sm font-semibold sm:text-base">{t('common.availableDays')}</span>
                </div>
                <p className="mt-2 text-xs leading-6 text-white/65 sm:mt-3 sm:text-sm sm:leading-7">{availableDays}</p>
              </div>
            </div>
          </div>

          <div className="premium-card p-4 sm:p-8">
            <h2 className="text-xl font-semibold text-white sm:text-4xl">{doctor.name}</h2>
            <p className="mt-2 text-xs uppercase tracking-[0.22em] text-[#f2d38d] sm:mt-3 sm:text-sm sm:tracking-[0.28em]">{specialty}</p>
            <p className="mt-4 text-xs leading-6 text-white/70 sm:mt-5 sm:text-base sm:leading-8">{bio}</p>
          </div>

          <div className="premium-card p-4 sm:p-6">
            <p className="text-xs leading-6 text-white/65 sm:text-sm sm:leading-7">
              {isArabic ? 'يمكنك الانتقال مباشرة إلى صفحة الحجز ثم اختيار هذا الطبيب مع الخدمة المناسبة.' : 'You can continue to the booking page and choose this doctor with the appropriate service.'}
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:mt-5 sm:gap-3 sm:flex-row">
              <Link to={`/booking?doctor=${doctor._id}`} className="btn-gold inline-flex items-center justify-center !py-3 sm:!py-4">
                {t('common.bookNow')}
              </Link>
              <Link to="/doctors" className="btn-dark inline-flex items-center justify-center !py-3 sm:!py-4">
                {isArabic ? 'العودة لكل الأطباء' : 'View all doctors'}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {treatmentCases.length ? (
        <section className="bg-white/[0.02] px-4 py-20">
          <div className="mx-auto max-w-7xl">
            <SectionHeading
              eyebrow={isArabic ? 'حالات هذا الطبيب' : 'This doctor cases'}
              title={isArabic ? 'حالات تم علاجها بواسطة هذا الطبيب' : 'Cases treated by this doctor'}
              text={isArabic ? 'نعرض هنا فقط الحالات المنشورة التي ارتبطت بهذا الطبيب داخل لوحة التحكم.' : 'Only the published treatment cases linked to this doctor in the dashboard are shown here.'}
            />
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {treatmentCases.map((item) => <TreatmentCaseCard key={item._id} treatmentCase={item} />)}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
