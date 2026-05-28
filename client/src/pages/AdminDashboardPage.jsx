import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Calendar, CheckCircle2, Clock3, Image, LogOut, MailOpen, PencilLine, ShieldCheck, Stethoscope, Trash2, UserRoundCog, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';
import { clearAdminToken } from '../utils/auth';
import SiteSettingsPanel from '../components/admin/SiteSettingsPanel';

const serviceInitial = {
  title: '',
  titleAr: '',
  description: '',
  descriptionAr: '',
  duration: 45,
  priceFrom: 0,
  icon: 'Sparkles',
  image: '',
  featured: false
};

const doctorInitial = {
  name: '',
  specialty: '',
  specialtyAr: '',
  bio: '',
  bioAr: '',
  image: '',
  experienceYears: 5,
  availableDays: 'Sunday, Monday'
};

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="premium-card p-5">
      <Icon className="text-[#f2d38d]" />
      <p className="mt-4 text-3xl font-semibold">{value || 0}</p>
      <p className="mt-2 text-sm text-white/55">{label}</p>
    </div>
  );
}

function AdminPanel({ title, children }) {
  return (
    <section className="premium-card p-5">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { t, isArabic } = useLanguage();
  const [tab, setTab] = useState('appointments');
  const [stats, setStats] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [services, setServices] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [users, setUsers] = useState([]);
  const [qrLookupCode, setQrLookupCode] = useState('');
  const [qrLookupResult, setQrLookupResult] = useState(null);
  const [qrLookupLoading, setQrLookupLoading] = useState(false);
  const [serviceForm, setServiceForm] = useState(serviceInitial);
  const [doctorForm, setDoctorForm] = useState(doctorInitial);
  const [editingServiceId, setEditingServiceId] = useState('');
  const [editingDoctorId, setEditingDoctorId] = useState('');
  const [serviceImageUploading, setServiceImageUploading] = useState(false);
  const [doctorImageUploading, setDoctorImageUploading] = useState(false);

  const labels = useMemo(() => ({
    users: t('admin.tabs.users') === 'admin.tabs.users' ? (isArabic ? 'المستخدمون' : 'Users') : t('admin.tabs.users'),
    usersStats: t('admin.stats.users') === 'admin.stats.users' ? (isArabic ? 'المستخدمون' : 'Users') : t('admin.stats.users'),
    usersJoined: t('admin.users.joined') === 'admin.users.joined' ? (isArabic ? 'تاريخ إنشاء الحساب' : 'Joined') : t('admin.users.joined'),
    usersProviders: t('admin.users.providers') === 'admin.users.providers' ? (isArabic ? 'طرق تسجيل الدخول' : 'Sign-in methods') : t('admin.users.providers'),
    usersEmpty: t('admin.users.empty') === 'admin.users.empty' ? (isArabic ? 'لا يوجد مستخدمون حتى الآن' : 'No users yet') : t('admin.users.empty'),
    settings: isArabic ? 'إعدادات الموقع' : 'Site settings',
    qrPanelTitle: isArabic ? 'التحقق عبر QR' : 'QR verification',
    qrPanelText: isArabic ? 'الصق قيمة QR أو امسحها من جهاز الاستقبال للتحقق من هوية المريض وإظهار مواعيده المفتوحة.' : 'Paste the QR value or scan it from your reader to verify identity and show open appointments.',
    qrInputLabel: isArabic ? 'قيمة QR أو رمز الحساب' : 'QR value or account token',
    qrLookupAction: isArabic ? 'تحقق من المستخدم' : 'Verify user',
    qrAppointments: isArabic ? 'المواعيد المفتوحة' : 'Open appointments',
    qrConfirmAttendance: isArabic ? 'تأكيد حضور الجلسة' : 'Confirm attendance',
    qrAttendanceDone: isArabic ? 'تم التأكيد' : 'Confirmed',
    qrNoAppointments: isArabic ? 'لا توجد مواعيد مفتوحة لهذا المستخدم حالياً' : 'This user has no open appointments right now',
    qrVerified: isArabic ? 'تم التحقق من المستخدم' : 'User verified',
    qrError: isArabic ? 'تعذر التحقق من الكود' : 'Unable to verify QR code',
    attendanceDone: isArabic ? 'تم تأكيد حضور الجلسة' : 'Attendance confirmed',
    patient: isArabic ? 'المريض' : 'Patient',
    contact: isArabic ? 'التواصل' : 'Contact',
    service: isArabic ? 'الخدمة' : 'Service',
    doctor: isArabic ? 'الطبيب' : 'Doctor',
    date: isArabic ? 'التاريخ' : 'Date',
    status: isArabic ? 'الحالة' : 'Status',
    delete: isArabic ? 'حذف' : 'Delete'
  }), [isArabic, t]);

  const statsCards = useMemo(() => ([
    [Calendar, t('admin.stats.appointments'), stats.appointments],
    [Clock3, t('admin.stats.pending'), stats.pending],
    [CheckCircle2, t('admin.stats.confirmed'), stats.confirmed],
    [MailOpen, t('admin.stats.unread'), stats.unreadMessages],
    [Stethoscope, t('admin.stats.services'), stats.services],
    [Users, t('admin.stats.doctors'), stats.doctors],
    [ShieldCheck, labels.usersStats, stats.customers]
  ]), [labels.usersStats, stats, t]);

  const tabEntries = useMemo(() => {
    const baseTabs = Object.entries(t('admin.tabs'));
    const nextTabs = [...baseTabs];
    if (!nextTabs.some(([key]) => key === 'users')) nextTabs.push(['users', labels.users]);
    if (!nextTabs.some(([key]) => key === 'settings')) nextTabs.push(['settings', labels.settings]);
    return nextTabs;
  }, [labels.settings, labels.users, t]);

  async function load() {
    const [statsRes, appointmentsRes, messagesRes, servicesRes, doctorsRes, usersRes] = await Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/appointments'),
      api.get('/admin/messages'),
      api.get('/services'),
      api.get('/doctors'),
      api.get('/admin/users')
    ]);

    setStats(statsRes.data);
    setAppointments(appointmentsRes.data);
    setMessages(messagesRes.data);
    setServices(servicesRes.data);
    setDoctors(doctorsRes.data);
    setUsers(usersRes.data);
  }

  useEffect(() => {
    load().catch(() => toast.error(t('admin.errors.server')));
  }, []);

  function logout() {
    clearAdminToken();
    navigate('/');
  }

  function editService(service) {
    setEditingServiceId(service._id);
    setServiceForm({
      title: service.title || '',
      titleAr: service.titleAr || '',
      description: service.description || '',
      descriptionAr: service.descriptionAr || '',
      duration: service.duration || 45,
      priceFrom: service.priceFrom || 0,
      icon: service.icon || 'Sparkles',
      image: service.image || '',
      featured: Boolean(service.featured)
    });
  }

  function editDoctor(doctor) {
    setEditingDoctorId(doctor._id);
    setDoctorForm({
      name: doctor.name || '',
      specialty: doctor.specialty || '',
      specialtyAr: doctor.specialtyAr || '',
      bio: doctor.bio || '',
      bioAr: doctor.bioAr || '',
      image: doctor.image || '',
      experienceYears: doctor.experienceYears || 5,
      availableDays: (doctor.availableDays || []).join(', ')
    });
  }

  async function uploadImage(file, type) {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);

    const response = await api.post('/admin/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    return response.data.url;
  }

  async function handleServiceImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setServiceImageUploading(true);
      const imageUrl = await uploadImage(file, 'services');
      setServiceForm((current) => ({ ...current, image: imageUrl }));
      toast.success('Image uploaded');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Image upload failed');
    } finally {
      setServiceImageUploading(false);
      event.target.value = '';
    }
  }

  async function handleDoctorImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setDoctorImageUploading(true);
      const imageUrl = await uploadImage(file, 'doctors');
      setDoctorForm((current) => ({ ...current, image: imageUrl }));
      toast.success('Image uploaded');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Image upload failed');
    } finally {
      setDoctorImageUploading(false);
      event.target.value = '';
    }
  }

  async function saveService(event) {
    event.preventDefault();
    const payload = { ...serviceForm, duration: Number(serviceForm.duration), priceFrom: Number(serviceForm.priceFrom) };
    if (editingServiceId) await api.patch(`/admin/services/${editingServiceId}`, payload);
    else await api.post('/admin/services', payload);
    toast.success('Saved');
    setEditingServiceId('');
    setServiceForm(serviceInitial);
    await load();
  }

  async function saveDoctor(event) {
    event.preventDefault();
    const payload = {
      ...doctorForm,
      experienceYears: Number(doctorForm.experienceYears),
      availableDays: doctorForm.availableDays.split(',').map((day) => day.trim()).filter(Boolean)
    };
    if (editingDoctorId) await api.patch(`/admin/doctors/${editingDoctorId}`, payload);
    else await api.post('/admin/doctors', payload);
    toast.success('Saved');
    setEditingDoctorId('');
    setDoctorForm(doctorInitial);
    await load();
  }

  async function removeItem(type, id) {
    await api.delete(`/admin/${type}/${id}`);
    toast.success('Deleted');
    await load();
  }

  async function updateAppointment(id, status) {
    await api.patch(`/admin/appointments/${id}`, { status });
    await load();
  }

  async function markMessageRead(message) {
    await api.patch(`/admin/messages/${message._id}`, { read: !message.read });
    await load();
  }

  async function lookupQrCode(event) {
    event.preventDefault();
    if (!qrLookupCode.trim()) return;

    try {
      setQrLookupLoading(true);
      const response = await api.post('/admin/users/verify-qr', { code: qrLookupCode.trim() });
      setQrLookupResult(response.data);
      toast.success(labels.qrVerified);
    } catch (error) {
      setQrLookupResult(null);
      toast.error(error.response?.data?.message || labels.qrError);
    } finally {
      setQrLookupLoading(false);
    }
  }

  async function confirmAttendance(appointmentId) {
    await api.post(`/admin/appointments/${appointmentId}/check-in`);
    toast.success(labels.attendanceDone);

    if (qrLookupCode.trim()) {
      const response = await api.post('/admin/users/verify-qr', { code: qrLookupCode.trim() });
      setQrLookupResult(response.data);
    }

    await load();
  }

  function formatDate(value) {
    if (!value) return '-';
    return new Date(value).toLocaleDateString(isArabic ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img src="/logo.jpg" alt="ELORA" className="h-16 w-16 rounded-3xl object-cover" />
            <div>
              <p className="eyebrow !mb-0">{t('admin.dashboard')}</p>
              <h1 className="mt-2 font-display text-5xl">ELORA</h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/admin/verify" className="btn-gold inline-flex items-center gap-2">
              <ShieldCheck size={16} />
              {isArabic ? 'التحقق بالكاميرا' : 'Verify with camera'}
            </Link>
            <button onClick={logout} className="btn-dark inline-flex items-center gap-2"><LogOut size={18} />{t('admin.logout')}</button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
          {statsCards.map(([Icon, label, value]) => <StatCard key={label} icon={Icon} label={label} value={value} />)}
        </div>

        <div className="my-8 flex flex-wrap gap-3">
          {tabEntries.map(([key, label]) => (
            <button key={key} className={tab === key ? 'btn-gold' : 'btn-dark'} onClick={() => setTab(key)}>{label}</button>
          ))}
        </div>

        {tab === 'appointments' && (
          <AdminPanel title={t('admin.tabs.appointments')}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead className="text-white/50">
                  <tr>
                    <th className="pb-3 text-start">{labels.patient}</th>
                    <th className="pb-3 text-start">{labels.contact}</th>
                    <th className="pb-3 text-start">{labels.service}</th>
                    <th className="pb-3 text-start">{labels.doctor}</th>
                    <th className="pb-3 text-start">{labels.date}</th>
                    <th className="pb-3 text-start">{labels.status}</th>
                    <th className="pb-3 text-start">{labels.delete}</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.map((appointment) => (
                    <tr key={appointment._id} className="border-t border-white/10">
                      <td className="py-4">
                        {appointment.patientName}
                        {appointment.attendanceConfirmed ? <div className="mt-1 text-xs text-emerald-300">{labels.qrAttendanceDone}</div> : null}
                      </td>
                      <td>{appointment.phone}<div className="text-white/45">{appointment.email}</div></td>
                      <td>{appointment.service?.title}</td>
                      <td>{appointment.doctor?.name || '-'}</td>
                      <td>{appointment.date} {appointment.time}</td>
                      <td>
                        <select className="input !rounded-xl !py-2" value={appointment.status} onChange={(event) => updateAppointment(appointment._id, event.target.value)}>
                          {['pending', 'confirmed', 'completed', 'cancelled'].map((status) => <option key={status} value={status}>{status}</option>)}
                        </select>
                      </td>
                      <td><button onClick={() => removeItem('appointments', appointment._id)} className="icon-btn"><Trash2 size={16} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </AdminPanel>
        )}

        {tab === 'messages' && (
          <AdminPanel title={t('admin.tabs.messages')}>
            <div className="grid gap-4">
              {messages.map((message) => (
                <article key={message._id} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold">{message.name}</h3>
                      <p className="mt-1 text-sm text-white/55">{message.email}{message.phone ? ` | ${message.phone}` : ''}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => markMessageRead(message)} className="btn-dark !px-4 !py-2 text-sm">{t('admin.forms.markRead')}</button>
                      <button onClick={() => removeItem('messages', message._id)} className="icon-btn"><Trash2 size={16} /></button>
                    </div>
                  </div>
                  <p className="mt-3 text-[#f2d38d]">{message.subject || '-'}</p>
                  <p className="mt-3 text-sm leading-7 text-white/70">{message.message}</p>
                </article>
              ))}
            </div>
          </AdminPanel>
        )}

        {tab === 'services' && (
          <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
            <AdminPanel title={t('admin.forms.addService')}>
              <form onSubmit={saveService} className="grid gap-3">
                <input className="input" placeholder={t('admin.forms.title')} value={serviceForm.title} onChange={(event) => setServiceForm({ ...serviceForm, title: event.target.value })} required />
                <input className="input" placeholder={t('admin.forms.titleAr')} value={serviceForm.titleAr} onChange={(event) => setServiceForm({ ...serviceForm, titleAr: event.target.value })} />
                <textarea className="input" rows="4" placeholder={t('admin.forms.description')} value={serviceForm.description} onChange={(event) => setServiceForm({ ...serviceForm, description: event.target.value })} required />
                <textarea className="input" rows="4" placeholder={t('admin.forms.descriptionAr')} value={serviceForm.descriptionAr} onChange={(event) => setServiceForm({ ...serviceForm, descriptionAr: event.target.value })} />
                <input className="input" placeholder={t('admin.forms.image')} value={serviceForm.image} onChange={(event) => setServiceForm({ ...serviceForm, image: event.target.value })} />
                <label className="rounded-[1.4rem] border border-dashed border-white/15 bg-white/[0.03] px-4 py-3 text-sm text-white/70">
                  <span className="block font-medium text-white">{t('admin.forms.imageUpload')}</span>
                  <span className="mt-1 block text-white/45">{serviceImageUploading ? t('admin.forms.uploading') : t('admin.forms.imageUploadHint')}</span>
                  <input className="mt-3 block w-full text-xs text-white/70 file:mr-3 file:rounded-full file:border-0 file:bg-[#f2d38d] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-[#1a1614]" type="file" accept="image/*" onChange={handleServiceImageChange} disabled={serviceImageUploading} />
                </label>
                {serviceForm.image ? <img src={serviceForm.image} alt="Service preview" className="h-36 w-full rounded-[1.4rem] object-cover" /> : null}
                <div className="grid grid-cols-2 gap-3">
                  <input className="input" type="number" placeholder={t('admin.forms.duration')} value={serviceForm.duration} onChange={(event) => setServiceForm({ ...serviceForm, duration: event.target.value })} />
                  <input className="input" type="number" placeholder={t('admin.forms.priceFrom')} value={serviceForm.priceFrom} onChange={(event) => setServiceForm({ ...serviceForm, priceFrom: event.target.value })} />
                </div>
                <input className="input" placeholder={t('admin.forms.icon')} value={serviceForm.icon} onChange={(event) => setServiceForm({ ...serviceForm, icon: event.target.value })} />
                <label className="inline-flex items-center gap-3 text-sm text-white/70">
                  <input type="checkbox" checked={serviceForm.featured} onChange={(event) => setServiceForm({ ...serviceForm, featured: event.target.checked })} />
                  {t('admin.forms.featured')}
                </label>
                <div className="flex gap-3">
                  <button className="btn-gold flex-1">{editingServiceId ? t('admin.forms.update') : t('admin.forms.create')}</button>
                  <button type="button" className="btn-dark flex-1" onClick={() => { setEditingServiceId(''); setServiceForm(serviceInitial); }}>{t('admin.forms.reset')}</button>
                </div>
              </form>
            </AdminPanel>

            <AdminPanel title={t('admin.tabs.services')}>
              <div className="grid gap-4">
                {services.map((service) => (
                  <article key={service._id} className="grid grid-cols-[120px_1fr_auto] items-center gap-4 rounded-[2rem] border border-white/10 bg-white/[0.04] p-4">
                    <div className="overflow-hidden rounded-2xl border border-white/10">
                      {service.image ? <img src={service.image} alt={service.title} className="h-24 w-full object-cover" /> : <div className="grid h-24 place-items-center text-white/35"><Image size={22} /></div>}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{service.title}</h3>
                      <p className="text-sm text-white/45">{service.titleAr}</p>
                      <p className="mt-2 text-sm text-white/65">{service.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => editService(service)} className="icon-btn"><PencilLine size={16} /></button>
                      <button onClick={() => removeItem('services', service._id)} className="icon-btn"><Trash2 size={16} /></button>
                    </div>
                  </article>
                ))}
              </div>
            </AdminPanel>
          </div>
        )}

        {tab === 'doctors' && (
          <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
            <AdminPanel title={t('admin.forms.addDoctor')}>
              <form onSubmit={saveDoctor} className="grid gap-3">
                <input className="input" placeholder="Name" value={doctorForm.name} onChange={(event) => setDoctorForm({ ...doctorForm, name: event.target.value })} required />
                <input className="input" placeholder={t('admin.forms.specialty')} value={doctorForm.specialty} onChange={(event) => setDoctorForm({ ...doctorForm, specialty: event.target.value })} required />
                <input className="input" placeholder={t('admin.forms.specialtyAr')} value={doctorForm.specialtyAr} onChange={(event) => setDoctorForm({ ...doctorForm, specialtyAr: event.target.value })} />
                <textarea className="input" rows="4" placeholder={t('admin.forms.bio')} value={doctorForm.bio} onChange={(event) => setDoctorForm({ ...doctorForm, bio: event.target.value })} required />
                <textarea className="input" rows="4" placeholder={t('admin.forms.bioAr')} value={doctorForm.bioAr} onChange={(event) => setDoctorForm({ ...doctorForm, bioAr: event.target.value })} />
                <input className="input" placeholder={t('admin.forms.image')} value={doctorForm.image} onChange={(event) => setDoctorForm({ ...doctorForm, image: event.target.value })} />
                <label className="rounded-[1.4rem] border border-dashed border-white/15 bg-white/[0.03] px-4 py-3 text-sm text-white/70">
                  <span className="block font-medium text-white">{t('admin.forms.imageUpload')}</span>
                  <span className="mt-1 block text-white/45">{doctorImageUploading ? t('admin.forms.uploading') : t('admin.forms.imageUploadHint')}</span>
                  <input className="mt-3 block w-full text-xs text-white/70 file:mr-3 file:rounded-full file:border-0 file:bg-[#f2d38d] file:px-4 file:py-2 file:text-xs file:font-semibold file:text-[#1a1614]" type="file" accept="image/*" onChange={handleDoctorImageChange} disabled={doctorImageUploading} />
                </label>
                {doctorForm.image ? <img src={doctorForm.image} alt="Doctor preview" className="h-36 w-full rounded-[1.4rem] object-cover" /> : null}
                <input className="input" type="number" placeholder={t('admin.forms.experienceYears')} value={doctorForm.experienceYears} onChange={(event) => setDoctorForm({ ...doctorForm, experienceYears: event.target.value })} />
                <input className="input" placeholder={t('admin.forms.availableDays')} value={doctorForm.availableDays} onChange={(event) => setDoctorForm({ ...doctorForm, availableDays: event.target.value })} />
                <div className="flex gap-3">
                  <button className="btn-gold flex-1">{editingDoctorId ? t('admin.forms.update') : t('admin.forms.create')}</button>
                  <button type="button" className="btn-dark flex-1" onClick={() => { setEditingDoctorId(''); setDoctorForm(doctorInitial); }}>{t('admin.forms.reset')}</button>
                </div>
              </form>
            </AdminPanel>

            <AdminPanel title={t('admin.tabs.doctors')}>
              <div className="grid gap-4">
                {doctors.map((doctor) => (
                  <article key={doctor._id} className="grid grid-cols-[120px_1fr_auto] items-center gap-4 rounded-[2rem] border border-white/10 bg-white/[0.04] p-4">
                    <img src={doctor.image || '/logo.jpg'} alt={doctor.name} className="h-24 w-full rounded-2xl object-cover" />
                    <div>
                      <h3 className="text-xl font-semibold">{doctor.name}</h3>
                      <p className="text-sm text-white/45">{doctor.specialty}</p>
                      <p className="mt-2 text-sm text-white/65">{doctor.bio}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => editDoctor(doctor)} className="icon-btn"><UserRoundCog size={16} /></button>
                      <button onClick={() => removeItem('doctors', doctor._id)} className="icon-btn"><Trash2 size={16} /></button>
                    </div>
                  </article>
                ))}
              </div>
            </AdminPanel>
          </div>
        )}

        {tab === 'users' && (
          <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
            <AdminPanel title={labels.qrPanelTitle}>
              <form onSubmit={lookupQrCode} className="grid gap-4">
                <p className="text-sm leading-7 text-white/62">{labels.qrPanelText}</p>
                <textarea className="input min-h-28" placeholder={labels.qrInputLabel} value={qrLookupCode} onChange={(event) => setQrLookupCode(event.target.value)} />
                <button className="btn-gold" disabled={qrLookupLoading}>{qrLookupLoading ? t('common.loading') : labels.qrLookupAction}</button>
              </form>

              {qrLookupResult ? (
                <div className="mt-5 grid gap-4">
                  <article className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-center gap-4">
                      {qrLookupResult.user.avatar ? (
                        <img src={qrLookupResult.user.avatar} alt={qrLookupResult.user.name} className="h-16 w-16 rounded-[1.1rem] object-cover" />
                      ) : (
                        <div className="grid h-16 w-16 place-items-center rounded-[1.1rem] border border-white/10 bg-white/[0.02]">
                          <Users size={22} className="text-[#f2d38d]" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-semibold">{qrLookupResult.user.name}</h3>
                        <p className="mt-1 text-sm text-white/45">{qrLookupResult.user.email}</p>
                      </div>
                    </div>
                  </article>

                  <div>
                    <p className="mb-3 text-sm text-white/45">{labels.qrAppointments}</p>
                    <div className="grid gap-3">
                      {qrLookupResult.appointments.length ? qrLookupResult.appointments.map((appointment) => (
                        <article key={appointment._id} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-white">{appointment.service?.title || '-'}</p>
                              <p className="mt-1 text-sm text-white/45">{appointment.date} · {appointment.time}</p>
                              <p className="mt-1 text-sm text-white/45">{appointment.doctor?.name || '-'}</p>
                            </div>
                            <button className="btn-gold !px-4 !py-2 text-sm" onClick={() => confirmAttendance(appointment._id)} disabled={appointment.attendanceConfirmed}>
                              {appointment.attendanceConfirmed ? labels.qrAttendanceDone : labels.qrConfirmAttendance}
                            </button>
                          </div>
                        </article>
                      )) : (
                        <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/[0.02] p-4 text-sm text-white/55">
                          {labels.qrNoAppointments}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : null}
            </AdminPanel>

            <AdminPanel title={labels.users}>
              <div className="grid gap-4">
                {users.length ? users.map((user) => (
                  <article key={user._id} className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 lg:grid-cols-[auto_1fr_auto] lg:items-center">
                    <div className="flex items-center gap-4">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="h-16 w-16 rounded-[1.2rem] object-cover ring-1 ring-white/10" />
                      ) : (
                        <div className="grid h-16 w-16 place-items-center rounded-[1.2rem] border border-white/10 bg-white/[0.03]">
                          <Users size={22} className="text-[#f2d38d]" />
                        </div>
                      )}
                      <div>
                        <h3 className="text-xl font-semibold">{user.name}</h3>
                        <p className="mt-1 text-sm text-white/45">{user.email}</p>
                        <p className="mt-2 break-all font-mono text-xs text-[#f2d38d]/85">{user.qrCodeToken || '-'}</p>
                      </div>
                    </div>
                    <div className="grid gap-3 text-sm text-white/65 sm:grid-cols-2">
                      <div>
                        <p className="text-white/40">{labels.usersJoined}</p>
                        <p className="mt-1">{formatDate(user.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-white/40">{labels.usersProviders}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {(user.authProviders || []).map((provider) => (
                            <span key={provider} className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs uppercase tracking-[0.18em] text-[#f2d38d]">
                              {provider}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => removeItem('users', user._id)} className="icon-btn"><Trash2 size={16} /></button>
                    </div>
                  </article>
                )) : (
                  <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/[0.03] p-8 text-center text-white/55">
                    {labels.usersEmpty}
                  </div>
                )}
              </div>
            </AdminPanel>
          </div>
        )}

        {tab === 'settings' && (
          <AdminPanel title={labels.settings}>
            <SiteSettingsPanel />
          </AdminPanel>
        )}
      </div>
    </main>
  );
}
