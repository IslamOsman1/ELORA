import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { CalendarClock, CircleAlert, FileText, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { Navigate } from 'react-router-dom';
import Seo from '../components/common/Seo';
import { api } from '../utils/api';
import { useCustomerAuth } from '../context/CustomerAuthContext';
import { useLanguage } from '../context/LanguageContext';
import { appointmentStatusMeta, formatDisplayDate, formatDisplayDateTime, getStatusMeta } from '../utils/patient';

const initialFilters = {
  status: 'all',
  dateFrom: '',
  dateTo: '',
  search: ''
};

const initialReschedule = {
  proposedDate: '',
  proposedTime: '',
  reason: ''
};

const initialCancellation = {
  reason: ''
};

function StatusBadge({ status, isArabic }) {
  const meta = getStatusMeta(appointmentStatusMeta, status, isArabic);
  return <span className={`rounded-full border px-3 py-1 text-xs font-medium ${meta.className}`}>{meta.label}</span>;
}

export default function PatientBookingsPage() {
  const { isArabic } = useLanguage();
  const { isAuthenticated, loading } = useCustomerAuth();
  const [bookings, setBookings] = useState([]);
  const [filters, setFilters] = useState(initialFilters);
  const [pageLoading, setPageLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState(initialReschedule);
  const [cancellationForm, setCancellationForm] = useState(initialCancellation);
  const [submitting, setSubmitting] = useState(false);
  const locale = isArabic ? 'ar-EG' : 'en-US';

  const text = {
    title: isArabic ? 'حجوزاتي' : 'My bookings',
    subtitle: isArabic ? 'تابع حجوزاتك الحالية والسابقة واطلب التأجيل أو الإلغاء عند الحاجة.' : 'Track your current and previous bookings and request reschedule or cancellation when needed.',
    empty: isArabic ? 'لا توجد حجوزات مطابقة حاليًا.' : 'No matching bookings yet.',
    loading: isArabic ? 'جارٍ تحميل الحجوزات...' : 'Loading bookings...',
    search: isArabic ? 'ابحث برقم الحجز أو اسم الخدمة' : 'Search by booking number or service',
    filterStatus: isArabic ? 'الحالة' : 'Status',
    filterFrom: isArabic ? 'من تاريخ' : 'From date',
    filterTo: isArabic ? 'إلى تاريخ' : 'To date',
    bookingNumber: isArabic ? 'رقم الحجز' : 'Booking number',
    doctor: isArabic ? 'الطبيب' : 'Doctor',
    service: isArabic ? 'الخدمة' : 'Service',
    date: isArabic ? 'الموعد' : 'Appointment',
    createdAt: isArabic ? 'تاريخ الإنشاء' : 'Created at',
    details: isArabic ? 'تفاصيل الحجز' : 'Booking details',
    adminNotes: isArabic ? 'ملاحظات إدارية' : 'Admin notes',
    notes: isArabic ? 'ملاحظاتك' : 'Your notes',
    close: isArabic ? 'إغلاق' : 'Close',
    requestReschedule: isArabic ? 'طلب تأجيل' : 'Request reschedule',
    requestCancellation: isArabic ? 'طلب إلغاء' : 'Request cancellation',
    proposedDate: isArabic ? 'الموعد الجديد المقترح' : 'Proposed new date',
    proposedTime: isArabic ? 'الوقت المقترح' : 'Proposed time',
    reason: isArabic ? 'السبب' : 'Reason',
    send: isArabic ? 'إرسال الطلب' : 'Send request',
    noDetails: isArabic ? 'لا توجد تفاصيل إضافية.' : 'No extra details.',
    noAdminNotes: isArabic ? 'لا توجد ملاحظات إدارية.' : 'No admin notes.',
    noNotes: isArabic ? 'لا توجد ملاحظات.' : 'No notes.'
  };

  const statusOptions = useMemo(() => [
    ['all', isArabic ? 'كل الحالات' : 'All statuses'],
    ...Object.keys(appointmentStatusMeta).map((status) => [status, getStatusMeta(appointmentStatusMeta, status, isArabic).label])
  ], [isArabic]);

  async function loadBookings(nextFilters = filters) {
    setPageLoading(true);
    try {
      const response = await api.get('/patient/appointments', { params: nextFilters });
      setBookings(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load bookings');
    } finally {
      setPageLoading(false);
    }
  }

  useEffect(() => {
    if (!isAuthenticated) return;
    loadBookings().catch(() => {});
  }, [isAuthenticated]);

  async function openBookingDetails(bookingId) {
    try {
      const response = await api.get(`/patient/appointments/${bookingId}`);
      setSelectedBooking(response.data);
      setRescheduleForm(initialReschedule);
      setCancellationForm(initialCancellation);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load booking details');
    }
  }

  async function submitReschedule() {
    if (!selectedBooking) return;
    if (!window.confirm(isArabic ? 'هل تريد إرسال طلب التأجيل؟' : 'Send reschedule request?')) return;
    try {
      setSubmitting(true);
      const response = await api.post(`/patient/appointments/${selectedBooking._id}/reschedule-request`, rescheduleForm);
      toast.success(response.data.message);
      await loadBookings();
      await openBookingDetails(selectedBooking._id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  }

  async function submitCancellation() {
    if (!selectedBooking) return;
    if (!window.confirm(isArabic ? 'هل تريد إرسال طلب الإلغاء؟' : 'Send cancellation request?')) return;
    try {
      setSubmitting(true);
      const response = await api.post(`/patient/appointments/${selectedBooking._id}/cancellation-request`, cancellationForm);
      toast.success(response.data.message);
      await loadBookings();
      await openBookingDetails(selectedBooking._id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <main className="grid min-h-screen place-items-center px-4 text-white/70">{text.loading}</main>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/account/auth" replace state={{ mode: 'login', redirectTo: '/account/bookings' }} />;
  }

  return (
    <main className="px-4 py-10">
      <Seo
        title={`ELORA | ${text.title}`}
        description={text.subtitle}
        path="/account/bookings"
        noindex
      />
      <div className="mx-auto max-w-7xl">
        <div className="premium-card p-6 sm:p-8">
          <p className="eyebrow">{text.title}</p>
          <h1 className="mt-2 font-display text-4xl sm:text-5xl">{text.title}</h1>
          <p className="mt-4 max-w-3xl text-white/60">{text.subtitle}</p>

          <div className="mt-8 grid gap-3 lg:grid-cols-[1.4fr_repeat(3,1fr)_auto]">
            <label className="input flex items-center gap-3">
              <Search size={16} className="text-white/40" />
              <input className="w-full bg-transparent outline-none" placeholder={text.search} value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} />
            </label>
            <select className="input" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}>
              {statusOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <input className="input" type="date" value={filters.dateFrom} onChange={(event) => setFilters((current) => ({ ...current, dateFrom: event.target.value }))} />
            <input className="input" type="date" value={filters.dateTo} onChange={(event) => setFilters((current) => ({ ...current, dateTo: event.target.value }))} />
            <button className="btn-gold" onClick={() => loadBookings()}>{isArabic ? 'تطبيق' : 'Apply'}</button>
          </div>

          <div className="mt-8 grid gap-4">
            {pageLoading ? (
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8 text-center text-white/55">{text.loading}</div>
            ) : bookings.length ? bookings.map((booking) => (
              <article key={booking._id} className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <p className="text-lg font-semibold text-white">{booking.service?.titleAr || booking.service?.title || '-'}</p>
                      <StatusBadge status={booking.status} isArabic={isArabic} />
                    </div>
                    <p className="text-sm text-white/50">{text.bookingNumber}: <span className="font-mono text-[#f2d38d]">{booking.bookingNumber}</span></p>
                    <div className="grid gap-2 text-sm text-white/70 sm:grid-cols-2 xl:grid-cols-4">
                      <p>{text.doctor}: {booking.doctor?.name || '-'}</p>
                      <p>{text.date}: {booking.date} · {booking.time}</p>
                      <p>{text.createdAt}: {formatDisplayDateTime(booking.createdAt, locale)}</p>
                      <p>{text.service}: {booking.service?.titleAr || booking.service?.title || '-'}</p>
                    </div>
                  </div>
                  <button className="btn-dark" onClick={() => openBookingDetails(booking._id)}>
                    {text.details}
                  </button>
                </div>
              </article>
            )) : (
              <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/[0.03] p-10 text-center text-white/55">
                <CircleAlert className="mx-auto text-[#f2d38d]" />
                <p className="mt-4">{text.empty}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedBooking ? (
        <div className="fixed inset-0 z-[80] bg-black/70 px-4 py-6 backdrop-blur-sm">
          <div className="mx-auto max-h-full max-w-4xl overflow-y-auto rounded-[2rem] border border-white/10 bg-[#171316] p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold">{selectedBooking.service?.titleAr || selectedBooking.service?.title}</h2>
                <p className="mt-2 text-sm text-white/50">{text.bookingNumber}: <span className="font-mono text-[#f2d38d]">{selectedBooking.bookingNumber}</span></p>
              </div>
              <button className="icon-btn" onClick={() => setSelectedBooking(null)}><X size={16} /></button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <article className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center gap-2 text-[#f2d38d]"><CalendarClock size={16} /> {text.details}</div>
                <div className="mt-4 grid gap-2 text-sm text-white/70">
                  <p>{text.doctor}: {selectedBooking.doctor?.name || '-'}</p>
                  <p>{text.date}: {selectedBooking.date} · {selectedBooking.time}</p>
                  <p>{text.createdAt}: {formatDisplayDateTime(selectedBooking.createdAt, locale)}</p>
                  <div className="pt-2"><StatusBadge status={selectedBooking.status} isArabic={isArabic} /></div>
                </div>
                <p className="mt-4 text-sm text-white/55">{selectedBooking.details || text.noDetails}</p>
              </article>

              <article className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-4">
                <div className="flex items-center gap-2 text-[#f2d38d]"><FileText size={16} /> {text.adminNotes}</div>
                <p className="mt-4 text-sm text-white/60">{selectedBooking.adminNotes || text.noAdminNotes}</p>
                <div className="mt-5 rounded-[1.25rem] border border-white/10 bg-black/20 p-3 text-sm text-white/55">
                  <p className="font-medium text-white/80">{text.notes}</p>
                  <p className="mt-2">{selectedBooking.notes || text.noNotes}</p>
                </div>
              </article>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <article className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-4">
                <h3 className="font-semibold text-white">{text.requestReschedule}</h3>
                <div className="mt-4 grid gap-3">
                  <input className="input" type="date" value={rescheduleForm.proposedDate} onChange={(event) => setRescheduleForm((current) => ({ ...current, proposedDate: event.target.value }))} />
                  <input className="input" type="time" value={rescheduleForm.proposedTime} onChange={(event) => setRescheduleForm((current) => ({ ...current, proposedTime: event.target.value }))} />
                  <textarea className="input" rows="4" placeholder={text.reason} value={rescheduleForm.reason} onChange={(event) => setRescheduleForm((current) => ({ ...current, reason: event.target.value }))} />
                  <button className="btn-gold" onClick={submitReschedule} disabled={submitting}>{text.send}</button>
                </div>
              </article>

              <article className="rounded-[1.6rem] border border-white/10 bg-white/[0.03] p-4">
                <h3 className="font-semibold text-white">{text.requestCancellation}</h3>
                <div className="mt-4 grid gap-3">
                  <textarea className="input" rows="6" placeholder={text.reason} value={cancellationForm.reason} onChange={(event) => setCancellationForm((current) => ({ ...current, reason: event.target.value }))} />
                  <button className="btn-dark" onClick={submitCancellation} disabled={submitting}>{text.send}</button>
                </div>
              </article>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}
