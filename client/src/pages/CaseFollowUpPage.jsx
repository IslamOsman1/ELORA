import React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Download, FileImage, FileText, Pill, Printer, Stethoscope } from 'lucide-react';
import toast from 'react-hot-toast';
import { Navigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useLanguage } from '../context/LanguageContext';
import { formatDisplayDate, getStatusMeta, medicalFileTypeMeta, medicalSessionStatusMeta } from '../utils/patient';

function SessionBadge({ status, isArabic }) {
  const meta = getStatusMeta(medicalSessionStatusMeta, status, isArabic);
  return <span className={`rounded-full border px-3 py-1 text-xs font-medium ${meta.className}`}>{meta.label}</span>;
}

export default function CaseFollowUpPage() {
  const { isArabic } = useLanguage();
  const { user, isAuthenticated, loading } = useCustomerAuth();
  const [sessions, setSessions] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const printRef = useRef(null);
  const locale = isArabic ? 'ar-EG' : 'en-US';

  const text = {
    title: isArabic ? 'متابعة الحالة' : 'Case follow-up',
    subtitle: isArabic ? 'هذا الملف للعرض فقط ويحتوي على الجلسات والملاحظات الطبية والروشتات والملفات المضافة من العيادة.' : 'This read-only file contains your sessions, medical notes, prescriptions, and uploaded files.',
    loading: isArabic ? 'جارٍ تحميل الملف الطبي...' : 'Loading your medical file...',
    empty: isArabic ? 'لا توجد جلسات مضافة إلى ملفك الطبي بعد.' : 'No medical sessions have been added yet.',
    session: isArabic ? 'الجلسة' : 'Session',
    diagnosis: isArabic ? 'التشخيص' : 'Diagnosis',
    treatment: isArabic ? 'خطة العلاج' : 'Treatment plan',
    notes: isArabic ? 'ملاحظات الطبيب' : 'Doctor notes',
    instructions: isArabic ? 'تعليمات ما بعد الجلسة' : 'Post-session instructions',
    followUp: isArabic ? 'موعد المتابعة القادم' : 'Next follow-up',
    files: isArabic ? 'الملفات الطبية' : 'Medical files',
    prescription: isArabic ? 'الروشتة' : 'Prescription',
    print: isArabic ? 'طباعة الروشتة' : 'Print prescription',
    download: isArabic ? 'تحميل PDF' : 'Download PDF'
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    setPageLoading(true);
    api.get('/patient/medical-sessions')
      .then((response) => setSessions(response.data))
      .catch((error) => toast.error(error.response?.data?.message || 'Failed to load medical file'))
      .finally(() => setPageLoading(false));
  }, [isAuthenticated]);

  function downloadPrescription(session) {
    const lines = [
      `${text.session} #${session.sessionNumber}`,
      `${text.followUp}: ${session.followUpDate || '-'}`,
      ''
    ];
    (session.prescription?.items || []).forEach((item, index) => {
      lines.push(`${index + 1}. ${item.medicineName}`);
      lines.push(`- ${item.dosage || '-'}`);
      lines.push(`- ${item.frequencyPerDay || '-'}`);
      lines.push(`- ${item.duration || '-'}`);
      lines.push(`- ${item.instructions || '-'}`);
      lines.push(`- ${item.notes || '-'}`);
      lines.push('');
    });

    const blob = new Blob([lines.join('\n')], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `prescription-session-${session.sessionNumber}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function printPrescription(session) {
    const popup = window.open('', '_blank', 'width=900,height=700');
    if (!popup) return;
    popup.document.write(`<html><head><title>Prescription</title></head><body style="font-family: Arial; padding: 24px;">`);
    popup.document.write(`<h1>Prescription - Session #${session.sessionNumber}</h1>`);
    popup.document.write(`<p>${text.followUp}: ${session.followUpDate || '-'}</p>`);
    (session.prescription?.items || []).forEach((item) => {
      popup.document.write(`<div style="margin-bottom:16px;"><h3>${item.medicineName}</h3><p>${item.dosage || '-'}</p><p>${item.frequencyPerDay || '-'}</p><p>${item.duration || '-'}</p><p>${item.instructions || '-'}</p><p>${item.notes || '-'}</p></div>`);
    });
    popup.document.write('</body></html>');
    popup.document.close();
    popup.print();
  }

  if (loading) {
    return <main className="grid min-h-screen place-items-center px-4 text-white/70">{text.loading}</main>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/account/auth" replace state={{ mode: 'login', redirectTo: '/account/case-follow-up' }} />;
  }

  return (
    <main className="px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="premium-card p-6 sm:p-8">
          <p className="eyebrow">{text.title}</p>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl">{text.title}</h1>
          <p className="mt-4 max-w-3xl text-white/60">{text.subtitle}</p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <article className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm text-white/45">{isArabic ? 'الاسم' : 'Name'}</p>
              <p className="mt-2 text-lg font-semibold">{user?.name || '-'}</p>
            </article>
            <article className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm text-white/45">{isArabic ? 'البريد' : 'Email'}</p>
              <p className="mt-2 text-lg font-semibold">{user?.email || '-'}</p>
            </article>
            <article className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-4">
              <p className="text-sm text-white/45">{isArabic ? 'الهاتف' : 'Phone'}</p>
              <p className="mt-2 text-lg font-semibold">{user?.phone || '-'}</p>
            </article>
          </div>

          <div ref={printRef} className="mt-10 grid gap-6">
            {pageLoading ? (
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 text-center text-white/55">{text.loading}</div>
            ) : sessions.length ? sessions.map((session) => (
              <article key={session._id} className="relative rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 before:absolute before:bottom-0 before:right-[1.45rem] before:top-0 before:w-px before:bg-[#f2d38d]/20 before:content-[''] md:before:right-auto md:before:left-7">
                <div className="relative z-10 flex flex-col gap-4 md:ps-16">
                  <div className="absolute top-1 h-5 w-5 rounded-full border-4 border-[#120f12] bg-[#f2d38d] md:left-5" />
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-semibold">{text.session} #{session.sessionNumber}</p>
                      <p className="mt-1 text-sm text-white/50">{formatDisplayDate(session.date, locale)} · {session.doctor?.name || session.doctorNameSnapshot || '-'}</p>
                    </div>
                    <SessionBadge status={session.status} isArabic={isArabic} />
                  </div>

                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-[1.5rem] border border-white/10 bg-black/15 p-4">
                      <p className="text-sm text-[#f2d38d]">{text.diagnosis}</p>
                      <p className="mt-2 text-sm text-white/65">{session.diagnosis || '-'}</p>
                    </div>
                    <div className="rounded-[1.5rem] border border-white/10 bg-black/15 p-4">
                      <p className="text-sm text-[#f2d38d]">{text.treatment}</p>
                      <p className="mt-2 text-sm text-white/65">{session.treatmentPlan || '-'}</p>
                    </div>
                    <div className="rounded-[1.5rem] border border-white/10 bg-black/15 p-4">
                      <p className="text-sm text-[#f2d38d]">{text.notes}</p>
                      <p className="mt-2 text-sm text-white/65">{session.notes || '-'}</p>
                    </div>
                    <div className="rounded-[1.5rem] border border-white/10 bg-black/15 p-4">
                      <p className="text-sm text-[#f2d38d]">{text.instructions}</p>
                      <p className="mt-2 text-sm text-white/65">{session.postCareInstructions || '-'}</p>
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-white/10 bg-black/15 p-4">
                    <p className="text-sm text-[#f2d38d]">{text.followUp}</p>
                    <p className="mt-2 text-sm text-white/65">{session.followUpDate ? formatDisplayDate(session.followUpDate, locale) : '-'}</p>
                  </div>

                  {session.prescription?.items?.length ? (
                    <div className="rounded-[1.5rem] border border-white/10 bg-black/15 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-[#f2d38d]">
                          <Pill size={16} />
                          <p className="font-medium">{text.prescription}</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="btn-dark !px-4 !py-2 text-sm" onClick={() => printPrescription(session)}><Printer size={14} /> {text.print}</button>
                          <button className="btn-gold !px-4 !py-2 text-sm" onClick={() => downloadPrescription(session)}><Download size={14} /> {text.download}</button>
                        </div>
                      </div>
                      <div className="mt-4 grid gap-3">
                        {session.prescription.items.map((item) => (
                          <div key={item._id} className="rounded-[1.2rem] border border-white/10 bg-white/[0.02] p-3">
                            <p className="font-semibold text-white">{item.medicineName}</p>
                            <p className="mt-2 text-sm text-white/65">{item.dosage || '-'} · {item.frequencyPerDay || '-'} · {item.duration || '-'}</p>
                            <p className="mt-2 text-sm text-white/55">{item.instructions || '-'}</p>
                            {item.notes ? <p className="mt-2 text-xs text-white/45">{item.notes}</p> : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {session.files?.length ? (
                    <div className="rounded-[1.5rem] border border-white/10 bg-black/15 p-4">
                      <div className="flex items-center gap-2 text-[#f2d38d]">
                        <Stethoscope size={16} />
                        <p className="font-medium">{text.files}</p>
                      </div>
                      <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {session.files.map((file) => (
                          <article key={file._id} className="rounded-[1.2rem] border border-white/10 bg-white/[0.02] p-3">
                            {String(file.mimeType || '').startsWith('image/') ? (
                              <img src={file.url} alt={file.title} className="h-40 w-full rounded-[1rem] object-cover" />
                            ) : (
                              <div className="grid h-40 place-items-center rounded-[1rem] border border-white/10 bg-white/[0.02] text-white/45">
                                <FileImage />
                              </div>
                            )}
                            <p className="mt-3 font-medium text-white">{file.title}</p>
                            <p className="mt-1 text-xs text-white/45">
                              {(medicalFileTypeMeta[file.type]?.[isArabic ? 'ar' : 'en']) || file.type}
                            </p>
                            <div className="mt-3 flex gap-2">
                              <a className="btn-dark !px-4 !py-2 text-sm" href={file.url} target="_blank" rel="noreferrer"><FileText size={14} /> {isArabic ? 'عرض' : 'Open'}</a>
                              <a className="btn-gold !px-4 !py-2 text-sm" href={file.url} download><Download size={14} /> {isArabic ? 'تحميل' : 'Download'}</a>
                            </div>
                          </article>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </article>
            )) : (
              <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/[0.03] p-10 text-center text-white/55">
                {text.empty}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
