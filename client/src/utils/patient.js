export const appointmentStatusMeta = {
  pending_review: { ar: 'قيد المراجعة', en: 'Pending review', className: 'bg-amber-500/15 text-amber-200 border-amber-400/20' },
  confirmed: { ar: 'مؤكد', en: 'Confirmed', className: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/20' },
  completed: { ar: 'مكتمل', en: 'Completed', className: 'bg-sky-500/15 text-sky-200 border-sky-400/20' },
  cancelled: { ar: 'ملغي', en: 'Cancelled', className: 'bg-rose-500/15 text-rose-200 border-rose-400/20' },
  rejected: { ar: 'مرفوض', en: 'Rejected', className: 'bg-red-500/15 text-red-200 border-red-400/20' },
  attended: { ar: 'تم الحضور', en: 'Attended', className: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/20' },
  no_show: { ar: 'لم يحضر', en: 'No show', className: 'bg-slate-500/15 text-slate-200 border-slate-400/20' },
  reschedule_requested: { ar: 'تم طلب التأجيل', en: 'Reschedule requested', className: 'bg-orange-500/15 text-orange-200 border-orange-400/20' },
  reschedule_approved: { ar: 'تم قبول التأجيل', en: 'Reschedule approved', className: 'bg-cyan-500/15 text-cyan-200 border-cyan-400/20' },
  reschedule_rejected: { ar: 'تم رفض التأجيل', en: 'Reschedule rejected', className: 'bg-red-500/15 text-red-200 border-red-400/20' },
  cancellation_requested: { ar: 'تم طلب الإلغاء', en: 'Cancellation requested', className: 'bg-orange-500/15 text-orange-200 border-orange-400/20' },
  cancellation_approved: { ar: 'تم قبول الإلغاء', en: 'Cancellation approved', className: 'bg-rose-500/15 text-rose-200 border-rose-400/20' },
  cancellation_rejected: { ar: 'تم رفض الإلغاء', en: 'Cancellation rejected', className: 'bg-red-500/15 text-red-200 border-red-400/20' }
};

export const medicalSessionStatusMeta = {
  completed: { ar: 'مكتملة', en: 'Completed', className: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/20' },
  postponed: { ar: 'مؤجلة', en: 'Postponed', className: 'bg-amber-500/15 text-amber-200 border-amber-400/20' },
  attended: { ar: 'تم الحضور', en: 'Attended', className: 'bg-cyan-500/15 text-cyan-200 border-cyan-400/20' },
  no_show: { ar: 'لم يحضر', en: 'No show', className: 'bg-slate-500/15 text-slate-200 border-slate-400/20' },
  under_follow_up: { ar: 'تحت المتابعة', en: 'Under follow-up', className: 'bg-violet-500/15 text-violet-200 border-violet-400/20' },
  needs_review: { ar: 'تحتاج مراجعة', en: 'Needs review', className: 'bg-orange-500/15 text-orange-200 border-orange-400/20' },
  closed: { ar: 'منتهية', en: 'Closed', className: 'bg-sky-500/15 text-sky-200 border-sky-400/20' }
};

export const medicalFileTypeMeta = {
  xray: { ar: 'أشعة', en: 'X-ray' },
  lab: { ar: 'تحاليل', en: 'Lab' },
  before_after: { ar: 'قبل وبعد', en: 'Before / after' },
  pdf_report: { ar: 'تقرير PDF', en: 'PDF report' },
  medical_image: { ar: 'صورة طبية', en: 'Medical image' },
  follow_up: { ar: 'متابعة الحالة', en: 'Follow-up file' }
};

export function getStatusMeta(map, status, isArabic) {
  const meta = map[status] || { ar: status, en: status, className: 'bg-white/10 text-white border-white/10' };
  return {
    label: isArabic ? meta.ar : meta.en,
    className: meta.className
  };
}

export function formatDisplayDate(value, locale = 'ar-EG') {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    const fallback = new Date(`${value}T00:00:00`);
    if (Number.isNaN(fallback.getTime())) return value;
    return fallback.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
  }
  return date.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDisplayDateTime(value, locale = 'ar-EG') {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
