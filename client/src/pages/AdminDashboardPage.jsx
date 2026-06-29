import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Activity,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Clock3,
  FilePlus2,
  Image,
  LogOut,
  MailOpen,
  PencilLine,
  ShieldCheck,
  Stethoscope,
  Trash2,
  UserRoundCog,
  Users,
  X
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import Seo from '../components/common/Seo';
import { useLanguage } from '../context/LanguageContext';
import { clearAdminToken } from '../utils/auth';
import SiteSettingsPanel from '../components/admin/SiteSettingsPanel';
import WorkingHoursPanel from '../components/admin/WorkingHoursPanel';
import ContactSettingsPanel from '../components/admin/ContactSettingsPanel';
import SecuritySettingsPanel from '../components/admin/SecuritySettingsPanel';
import { appointmentStatusMeta, formatDisplayDate, formatDisplayDateTime, getStatusMeta, medicalSessionStatusMeta } from '../utils/patient';

const serviceInitial = {
  title: '',
  titleAr: '',
  description: '',
  descriptionAr: '',
  duration: 45,
  priceFrom: 0,
  icon: 'Sparkles',
  image: '',
  bannerImage: '',
  featuresText: '',
  featuresArText: '',
  treatmentStepsText: '',
  treatmentStepsArText: '',
  faqText: '',
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

const sessionInitial = {
  patientId: '',
  doctor: '',
  appointment: '',
  date: '',
  status: 'under_follow_up',
  diagnosis: '',
  notes: '',
  treatmentPlan: '',
  postCareInstructions: '',
  followUpDate: '',
  prescriptionItems: [
    { medicineName: '', dosage: '', frequencyPerDay: '', duration: '', instructions: '', notes: '' }
  ]
};

const caseInitial = {
  service: '',
  doctor: '',
  title: '',
  titleAr: '',
  shortDescription: '',
  shortDescriptionAr: '',
  fullDescription: '',
  fullDescriptionAr: '',
  patientProblem: '',
  patientProblemAr: '',
  treatmentStepsText: '',
  treatmentStepsArText: '',
  durationText: '',
  durationTextAr: '',
  resultSummary: '',
  resultSummaryAr: '',
  mainImage: '',
  beforeImagesText: '',
  afterImagesText: '',
  galleryImagesText: '',
  videosText: '',
  caseDate: '',
  published: true,
  displayOrder: 0
};

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="premium-card min-w-[10.5rem] p-4 sm:min-w-0 sm:p-5">
      <Icon className="text-[#f2d38d]" />
      <p className="mt-3 text-2xl font-semibold sm:mt-4 sm:text-3xl">{value || 0}</p>
      <p className="mt-2 text-sm text-white/55">{label}</p>
    </div>
  );
}

function AdminPanel({ title, children, actions = null }) {
  return (
    <section className="premium-card p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold sm:text-2xl">{title}</h2>
        {actions}
      </div>
      <div className="mt-4 sm:mt-5">{children}</div>
    </section>
  );
}

function StatusBadge({ map, status, isArabic }) {
  const meta = getStatusMeta(map, status, isArabic);
  return <span className={`rounded-full border px-3 py-1 text-xs font-medium ${meta.className}`}>{meta.label}</span>;
}

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const { isArabic } = useLanguage();
  const [tab, setTab] = useState('appointments');
  const [mobileTabsOpen, setMobileTabsOpen] = useState(false);
  const [stats, setStats] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [messages, setMessages] = useState([]);
  const [services, setServices] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [users, setUsers] = useState([]);
  const [patients, setPatients] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [treatmentCases, setTreatmentCases] = useState([]);
  const [serviceForm, setServiceForm] = useState(serviceInitial);
  const [doctorForm, setDoctorForm] = useState(doctorInitial);
  const [caseForm, setCaseForm] = useState(caseInitial);
  const [editingServiceId, setEditingServiceId] = useState('');
  const [editingDoctorId, setEditingDoctorId] = useState('');
  const [editingCaseId, setEditingCaseId] = useState('');
  const [appointmentFilters, setAppointmentFilters] = useState({ search: '', patientPhone: '', status: 'all', dateFrom: '', dateTo: '', doctor: 'all' });
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [selectedPatientFile, setSelectedPatientFile] = useState(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [sessionForm, setSessionForm] = useState(sessionInitial);
  const [medicalFileForm, setMedicalFileForm] = useState({ title: '', type: 'medical_image', note: '', file: null, session: '' });
  const [savingSession, setSavingSession] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [caseSearch, setCaseSearch] = useState('');
  const [caseServiceFilter, setCaseServiceFilter] = useState('all');

  const locale = isArabic ? 'ar-EG' : 'en-US';
  const labels = useMemo(() => ({
    dashboard: isArabic ? 'لوحة التحكم' : 'Dashboard',
    logout: isArabic ? 'تسجيل الخروج' : 'Logout',
    verifyCamera: isArabic ? 'التحقق بالكاميرا' : 'Verify with camera',
    appointments: isArabic ? 'الحجوزات' : 'Bookings',
    patients: isArabic ? 'المرضى' : 'Patients',
    followUp: isArabic ? 'متابعة الحالة' : 'Case follow-up',
    users: isArabic ? 'المستخدمون' : 'Users',
    services: isArabic ? 'الخدمات' : 'Services',
    doctors: isArabic ? 'الأطباء' : 'Doctors',
    messages: isArabic ? 'الرسائل' : 'Messages',
    settings: isArabic ? 'إعدادات الموقع' : 'Site settings',
    security: isArabic ? 'الأمان' : 'Security',
    activity: isArabic ? 'سجل النشاط' : 'Activity logs',
    patient: isArabic ? 'المريض' : 'Patient',
    doctor: isArabic ? 'الطبيب' : 'Doctor',
    date: isArabic ? 'التاريخ' : 'Date',
    status: isArabic ? 'الحالة' : 'Status',
    details: isArabic ? 'التفاصيل' : 'Details',
    adminNotes: isArabic ? 'ملاحظات إدارية' : 'Admin notes'
  }), [isArabic]);

  const tabEntries = [
    ['appointments', labels.appointments],
    ['patients', labels.patients],
    ['follow_up', labels.followUp],
    ['users', labels.users],
    ['services', labels.services],
    ['cases', isArabic ? 'الحالات المعالجة' : 'Treatment cases'],
    ['doctors', labels.doctors],
    ['messages', labels.messages],
    ['contact_settings', isArabic ? 'التواصل' : 'Contact'],
    ['working_hours', isArabic ? 'مواعيد العمل' : 'Working hours'],
    ['security', labels.security],
    ['activity', labels.activity],
    ['settings', labels.settings]
  ];

  const statsCards = [
    [Calendar, labels.appointments, stats.appointments],
    [Clock3, isArabic ? 'معلقة' : 'Pending', stats.pending],
    [CheckCircle2, isArabic ? 'مؤكدة' : 'Confirmed', stats.confirmed],
    [MailOpen, isArabic ? 'غير مقروءة' : 'Unread', stats.unreadMessages],
    [Stethoscope, labels.services, stats.services],
    [Users, labels.doctors, stats.doctors],
    [ShieldCheck, labels.users, stats.customers],
    [FilePlus2, labels.followUp, stats.sessions]
  ];

  const activeTabLabel = tabEntries.find(([key]) => key === tab)?.[1] || tab;

  async function loadCore() {
    const [statsRes, messagesRes, servicesRes, doctorsRes, usersRes, patientsRes, logsRes, casesRes] = await Promise.all([
      api.get('/admin/stats'),
      api.get('/admin/messages'),
      api.get('/services'),
      api.get('/doctors'),
      api.get('/admin/users'),
      api.get('/admin/patients', { params: { search: patientSearch, patientPhone } }),
      api.get('/admin/activity-logs'),
      api.get('/admin/cases', { params: { search: caseSearch, service: caseServiceFilter } })
    ]);

    setStats(statsRes.data);
    setMessages(messagesRes.data);
    setServices(servicesRes.data);
    setDoctors(doctorsRes.data);
    setUsers(usersRes.data);
    setPatients(patientsRes.data);
    setActivityLogs(logsRes.data);
    setTreatmentCases(casesRes.data);
  }

  async function loadAppointments() {
    const response = await api.get('/admin/appointments', { params: appointmentFilters });
    setAppointments(response.data);
  }

  async function loadPatientFile(patientId) {
    if (!patientId) {
      setSelectedPatientFile(null);
      return;
    }
    const response = await api.get(`/admin/patients/${patientId}`);
    setSelectedPatientFile(response.data);
  }

  async function loadAll() {
    await Promise.all([loadCore(), loadAppointments()]);
    if (selectedPatientId) {
      await loadPatientFile(selectedPatientId);
    }
  }

  useEffect(() => {
    loadAll().catch((error) => toast.error(error.response?.data?.message || 'Failed to load dashboard'));
  }, []);

  async function applyAppointmentFilters() {
    try {
      await loadAppointments();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load bookings');
    }
  }

  async function applyPatientFilters() {
    try {
      const response = await api.get('/admin/patients', { params: { search: patientSearch, patientPhone } });
      setPatients(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load patients');
    }
  }

  function logout() {
    clearAdminToken();
    navigate('/');
  }

  function linesToArray(value) {
    return String(value || '').split('\n').map((item) => item.trim()).filter(Boolean);
  }

  function arrayToLines(value) {
    return Array.isArray(value) ? value.join('\n') : '';
  }

  function faqItemsToLines(items) {
    return (items || [])
      .map((item) => [item.question || '', item.answer || '', item.questionAr || '', item.answerAr || ''].join(' | '))
      .join('\n');
  }

  function linesToFaqItems(value) {
    return linesToArray(value).map((line) => {
      const [question = '', answer = '', questionAr = '', answerAr = ''] = line.split('|').map((item) => item.trim());
      return { question, answer, questionAr, answerAr };
    });
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
      bannerImage: service.bannerImage || '',
      featuresText: arrayToLines(service.features),
      featuresArText: arrayToLines(service.featuresAr),
      treatmentStepsText: arrayToLines(service.treatmentSteps),
      treatmentStepsArText: arrayToLines(service.treatmentStepsAr),
      faqText: faqItemsToLines(service.faqItems),
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

  function editTreatmentCase(item) {
    setEditingCaseId(item._id);
    setCaseForm({
      service: item.service?._id || item.service || '',
      doctor: item.doctor?._id || item.doctor || '',
      title: item.title || '',
      titleAr: item.titleAr || '',
      shortDescription: item.shortDescription || '',
      shortDescriptionAr: item.shortDescriptionAr || '',
      fullDescription: item.fullDescription || '',
      fullDescriptionAr: item.fullDescriptionAr || '',
      patientProblem: item.patientProblem || '',
      patientProblemAr: item.patientProblemAr || '',
      treatmentStepsText: arrayToLines(item.treatmentSteps),
      treatmentStepsArText: arrayToLines(item.treatmentStepsAr),
      durationText: item.durationText || '',
      durationTextAr: item.durationTextAr || '',
      resultSummary: item.resultSummary || '',
      resultSummaryAr: item.resultSummaryAr || '',
      mainImage: item.mainImage || '',
      beforeImagesText: arrayToLines(item.beforeImages),
      afterImagesText: arrayToLines(item.afterImages),
      galleryImagesText: arrayToLines(item.galleryImages),
      videosText: arrayToLines(item.videos),
      caseDate: item.caseDate || '',
      published: Boolean(item.published),
      displayOrder: item.displayOrder || 0
    });
    setTab('cases');
  }

  async function uploadMedia(file, type, resourceType = 'image') {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);
    formData.append('resourceType', resourceType);
    const response = await api.post('/admin/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return response.data.url;
  }

  async function handleServiceImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const imageUrl = await uploadMedia(file, 'services');
      setServiceForm((current) => ({ ...current, image: imageUrl }));
      toast.success(isArabic ? 'تم رفع الصورة' : 'Image uploaded');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Image upload failed');
    } finally {
      event.target.value = '';
    }
  }

  async function handleDoctorImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const imageUrl = await uploadMedia(file, 'doctors');
      setDoctorForm((current) => ({ ...current, image: imageUrl }));
      toast.success(isArabic ? 'تم رفع الصورة' : 'Image uploaded');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Image upload failed');
    } finally {
      event.target.value = '';
    }
  }

  async function handleCaseImageUpload(event, field) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const imageUrl = await uploadMedia(file, 'cases', 'image');
      setCaseForm((current) => {
        if (field === 'mainImage') {
          return { ...current, mainImage: imageUrl };
        }
        const currentLines = linesToArray(current[field]);
        return { ...current, [field]: [...currentLines, imageUrl].join('\n') };
      });
      toast.success(isArabic ? 'تم رفع الصورة' : 'Image uploaded');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Image upload failed');
    } finally {
      event.target.value = '';
    }
  }

  async function handleCaseVideoUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const videoUrl = await uploadMedia(file, 'cases', 'video');
      setCaseForm((current) => {
        const currentLines = linesToArray(current.videosText);
        return { ...current, videosText: [...currentLines, videoUrl].join('\n') };
      });
      toast.success(isArabic ? 'تم رفع الفيديو' : 'Video uploaded');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Video upload failed');
    } finally {
      event.target.value = '';
    }
  }

  async function saveService(event) {
    event.preventDefault();
    const payload = {
      title: serviceForm.title,
      titleAr: serviceForm.titleAr,
      description: serviceForm.description,
      descriptionAr: serviceForm.descriptionAr,
      duration: Number(serviceForm.duration),
      priceFrom: Number(serviceForm.priceFrom),
      icon: serviceForm.icon,
      image: serviceForm.image,
      bannerImage: serviceForm.bannerImage,
      features: linesToArray(serviceForm.featuresText),
      featuresAr: linesToArray(serviceForm.featuresArText),
      treatmentSteps: linesToArray(serviceForm.treatmentStepsText),
      treatmentStepsAr: linesToArray(serviceForm.treatmentStepsArText),
      faqItems: linesToFaqItems(serviceForm.faqText),
      featured: Boolean(serviceForm.featured)
    };
    if (editingServiceId) await api.patch(`/admin/services/${editingServiceId}`, payload);
    else await api.post('/admin/services', payload);
    toast.success(isArabic ? 'تم الحفظ' : 'Saved');
    setEditingServiceId('');
    setServiceForm(serviceInitial);
    await loadCore();
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
    toast.success(isArabic ? 'تم الحفظ' : 'Saved');
    setEditingDoctorId('');
    setDoctorForm(doctorInitial);
    await loadCore();
  }

  async function saveTreatmentCase(event) {
    event.preventDefault();
    const payload = {
      service: caseForm.service,
      doctor: caseForm.doctor || null,
      title: caseForm.title,
      titleAr: caseForm.titleAr,
      shortDescription: caseForm.shortDescription,
      shortDescriptionAr: caseForm.shortDescriptionAr,
      fullDescription: caseForm.fullDescription,
      fullDescriptionAr: caseForm.fullDescriptionAr,
      patientProblem: caseForm.patientProblem,
      patientProblemAr: caseForm.patientProblemAr,
      treatmentSteps: linesToArray(caseForm.treatmentStepsText),
      treatmentStepsAr: linesToArray(caseForm.treatmentStepsArText),
      durationText: caseForm.durationText,
      durationTextAr: caseForm.durationTextAr,
      resultSummary: caseForm.resultSummary,
      resultSummaryAr: caseForm.resultSummaryAr,
      mainImage: caseForm.mainImage,
      beforeImages: linesToArray(caseForm.beforeImagesText),
      afterImages: linesToArray(caseForm.afterImagesText),
      galleryImages: linesToArray(caseForm.galleryImagesText),
      videos: linesToArray(caseForm.videosText),
      caseDate: caseForm.caseDate,
      published: Boolean(caseForm.published),
      displayOrder: Number(caseForm.displayOrder || 0)
    };
    if (editingCaseId) await api.patch(`/admin/cases/${editingCaseId}`, payload);
    else await api.post('/admin/cases', payload);
    toast.success(isArabic ? 'تم حفظ الحالة' : 'Case saved');
    setEditingCaseId('');
    setCaseForm(caseInitial);
    await loadCore();
  }

  async function removeItem(type, id) {
    await api.delete(`/admin/${type}/${id}`);
    toast.success(isArabic ? 'تم الحذف' : 'Deleted');
    await loadAll();
  }

  async function updateAppointment(id, payload) {
    await api.patch(`/admin/appointments/${id}`, payload);
    toast.success(isArabic ? 'تم تحديث الحجز' : 'Appointment updated');
    await loadAppointments();
    if (selectedPatientId) await loadPatientFile(selectedPatientId);
  }

  async function reviewAppointmentRequest(id, kind, approved, decisionNote = '') {
    const action = approved ? 'approve' : 'reject';
    await api.post(`/admin/appointments/${id}/${kind}/${action}`, { decisionNote });
    toast.success(isArabic ? 'تم تحديث الطلب' : 'Request updated');
    await loadAppointments();
    if (selectedPatientId) await loadPatientFile(selectedPatientId);
  }

  async function markMessageRead(message) {
    await api.patch(`/admin/messages/${message._id}`, { read: !message.read });
    await loadCore();
  }

  async function saveSession(event) {
    event.preventDefault();
    if (!sessionForm.patientId) {
      toast.error(isArabic ? 'اختر المريض أولًا' : 'Select a patient first');
      return;
    }
    try {
      setSavingSession(true);
      await api.post(`/admin/patients/${sessionForm.patientId}/medical-sessions`, {
        ...sessionForm,
        prescriptionItems: sessionForm.prescriptionItems.filter((item) => item.medicineName.trim())
      });
      toast.success(isArabic ? 'تمت إضافة الجلسة' : 'Session added');
      setSessionForm(sessionInitial);
      await loadAll();
      await loadPatientFile(sessionForm.patientId);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save session');
    } finally {
      setSavingSession(false);
    }
  }

  async function updateSessionStatus(id, status) {
    await api.patch(`/admin/medical-sessions/${id}`, { status });
    toast.success(isArabic ? 'تم تحديث الحالة' : 'Status updated');
    await loadAll();
    if (selectedPatientId) await loadPatientFile(selectedPatientId);
  }

  async function deleteSession(id) {
    if (!window.confirm(isArabic ? 'هل تريد حذف الجلسة؟' : 'Delete this session?')) return;
    await api.delete(`/admin/medical-sessions/${id}`);
    toast.success(isArabic ? 'تم حذف الجلسة' : 'Session deleted');
    await loadAll();
    if (selectedPatientId) await loadPatientFile(selectedPatientId);
  }

  async function uploadMedicalFile(event) {
    event.preventDefault();
    if (!selectedPatientId || !medicalFileForm.file) {
      toast.error(isArabic ? 'اختر المريض والملف أولًا' : 'Select a patient and a file first');
      return;
    }
    try {
      setUploadingFile(true);
      const formData = new FormData();
      formData.append('file', medicalFileForm.file);
      formData.append('title', medicalFileForm.title);
      formData.append('type', medicalFileForm.type);
      formData.append('note', medicalFileForm.note);
      if (medicalFileForm.session) formData.append('session', medicalFileForm.session);
      await api.post(`/admin/patients/${selectedPatientId}/medical-files`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(isArabic ? 'تم رفع الملف الطبي' : 'Medical file uploaded');
      setMedicalFileForm({ title: '', type: 'medical_image', note: '', file: null, session: '' });
      await loadPatientFile(selectedPatientId);
      await loadCore();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload file');
    } finally {
      setUploadingFile(false);
    }
  }

  return (
    <main className="min-h-screen px-3 py-4 sm:px-4 sm:py-8">
      <Seo
        title={`ELORA | ${labels.dashboard}`}
        description={labels.dashboard}
        path="/admin"
        noindex
      />
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <img src="/logo.png" alt="ELORA" className="h-16 w-16 rounded-3xl object-cover" />
            <div>
              <p className="eyebrow !mb-0">{labels.dashboard}</p>
              <h1 className="mt-2 font-display text-3xl sm:text-5xl">ELORA</h1>
            </div>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link to="/admin/verify" className="btn-gold inline-flex items-center gap-2">
              <ShieldCheck size={16} />
              {labels.verifyCamera}
            </Link>
            <button onClick={logout} className="btn-dark inline-flex items-center gap-2"><LogOut size={18} />{labels.logout}</button>
          </div>
        </div>

        <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible md:pb-0 xl:grid-cols-4 2xl:grid-cols-8">
          {statsCards.map(([Icon, label, value]) => <StatCard key={label} icon={Icon} label={label} value={value} />)}
        </div>

        <div className="my-8 hidden flex-wrap gap-3 md:flex">
          {tabEntries.map(([key, label]) => (
            <button key={key} className={tab === key ? 'btn-gold' : 'btn-dark'} onClick={() => setTab(key)}>{label}</button>
          ))}
        </div>

        <div className="my-6 md:hidden">
          <button className="premium-card flex w-full items-center justify-between px-4 py-3 text-start" onClick={() => setMobileTabsOpen((current) => !current)}>
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-white/40">{isArabic ? 'القسم الحالي' : 'Current section'}</p>
              <p className="mt-2 text-lg font-semibold text-white">{activeTabLabel}</p>
            </div>
            {mobileTabsOpen ? <X size={18} /> : <ChevronDown size={18} />}
          </button>
          {mobileTabsOpen ? (
            <div className="premium-card mt-3 grid gap-2 p-3">
              {tabEntries.map(([key, label]) => (
                <button key={key} className={tab === key ? 'btn-gold !justify-start' : 'btn-dark !justify-start'} onClick={() => { setTab(key); setMobileTabsOpen(false); }}>
                  {label}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {tab === 'appointments' && (
          <AdminPanel title={labels.appointments} actions={<button className="btn-dark !px-4 !py-2 text-sm" onClick={applyAppointmentFilters}>{isArabic ? 'تحديث' : 'Refresh'}</button>}>
            <div className="mb-5 grid gap-3 lg:grid-cols-6">
              <input className="input" placeholder={isArabic ? 'اسم المريض أو رقم الحجز' : 'Patient or booking number'} value={appointmentFilters.search} onChange={(event) => setAppointmentFilters((current) => ({ ...current, search: event.target.value }))} />
              <input className="input" placeholder={isArabic ? 'رقم الهاتف' : 'Phone'} value={appointmentFilters.patientPhone} onChange={(event) => setAppointmentFilters((current) => ({ ...current, patientPhone: event.target.value }))} />
              <select className="input" value={appointmentFilters.status} onChange={(event) => setAppointmentFilters((current) => ({ ...current, status: event.target.value }))}>
                <option value="all">{isArabic ? 'كل الحالات' : 'All statuses'}</option>
                {Object.keys(appointmentStatusMeta).map((status) => <option key={status} value={status}>{getStatusMeta(appointmentStatusMeta, status, isArabic).label}</option>)}
              </select>
              <select className="input" value={appointmentFilters.doctor} onChange={(event) => setAppointmentFilters((current) => ({ ...current, doctor: event.target.value }))}>
                <option value="all">{isArabic ? 'كل الأطباء' : 'All doctors'}</option>
                {doctors.map((doctor) => <option key={doctor._id} value={doctor._id}>{doctor.name}</option>)}
              </select>
              <input className="input" type="date" value={appointmentFilters.dateFrom} onChange={(event) => setAppointmentFilters((current) => ({ ...current, dateFrom: event.target.value }))} />
              <input className="input" type="date" value={appointmentFilters.dateTo} onChange={(event) => setAppointmentFilters((current) => ({ ...current, dateTo: event.target.value }))} />
            </div>

            <div className="grid gap-4">
              {appointments.map((appointment) => (
                <article key={appointment._id} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-lg font-semibold text-white">{appointment.patientName}</p>
                        <StatusBadge map={appointmentStatusMeta} status={appointment.status} isArabic={isArabic} />
                        <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs font-mono text-[#f2d38d]">{appointment.bookingNumber}</span>
                      </div>
                      <div className="grid gap-2 text-sm text-white/65 md:grid-cols-2 xl:grid-cols-4">
                        <p>{labels.doctor}: {appointment.doctor?.name || '-'}</p>
                        <p>{labels.patient}: {appointment.phone}</p>
                        <p>{labels.date}: {appointment.date} · {appointment.time}</p>
                        <p>{labels.details}: {appointment.service?.titleAr || appointment.service?.title || '-'}</p>
                      </div>
                      <textarea className="input min-h-24" placeholder={labels.adminNotes} value={appointment.adminNotes || ''} onChange={(event) => {
                        setAppointments((current) => current.map((item) => item._id === appointment._id ? { ...item, adminNotes: event.target.value } : item));
                      }} />
                    </div>
                    <div className="grid gap-3 xl:w-[320px]">
                      <select className="input" value={appointment.status} onChange={(event) => {
                        setAppointments((current) => current.map((item) => item._id === appointment._id ? { ...item, status: event.target.value } : item));
                      }}>
                        {Object.keys(appointmentStatusMeta).map((status) => <option key={status} value={status}>{getStatusMeta(appointmentStatusMeta, status, isArabic).label}</option>)}
                      </select>
                      <button className="btn-gold" onClick={() => updateAppointment(appointment._id, { status: appointment.status, adminNotes: appointment.adminNotes || '' })}>
                        {isArabic ? 'حفظ التحديث' : 'Save update'}
                      </button>
                      {appointment.rescheduleRequest?.status === 'pending' ? (
                        <div className="rounded-[1.4rem] border border-orange-400/20 bg-orange-500/10 p-3 text-sm text-orange-100">
                          <p>{isArabic ? 'طلب تأجيل:' : 'Reschedule request:'} {appointment.rescheduleRequest.proposedDate} · {appointment.rescheduleRequest.proposedTime}</p>
                          <p className="mt-2 text-xs text-orange-100/75">{appointment.rescheduleRequest.reason}</p>
                          <div className="mt-3 flex gap-2">
                            <button className="btn-gold !px-4 !py-2 text-sm" onClick={() => reviewAppointmentRequest(appointment._id, 'reschedule', true)}>{isArabic ? 'قبول' : 'Approve'}</button>
                            <button className="btn-dark !px-4 !py-2 text-sm" onClick={() => reviewAppointmentRequest(appointment._id, 'reschedule', false)}>{isArabic ? 'رفض' : 'Reject'}</button>
                          </div>
                        </div>
                      ) : null}
                      {appointment.cancellationRequest?.status === 'pending' ? (
                        <div className="rounded-[1.4rem] border border-rose-400/20 bg-rose-500/10 p-3 text-sm text-rose-100">
                          <p>{isArabic ? 'طلب إلغاء:' : 'Cancellation request:'}</p>
                          <p className="mt-2 text-xs text-rose-100/75">{appointment.cancellationRequest.reason}</p>
                          <div className="mt-3 flex gap-2">
                            <button className="btn-gold !px-4 !py-2 text-sm" onClick={() => reviewAppointmentRequest(appointment._id, 'cancellation', true)}>{isArabic ? 'قبول' : 'Approve'}</button>
                            <button className="btn-dark !px-4 !py-2 text-sm" onClick={() => reviewAppointmentRequest(appointment._id, 'cancellation', false)}>{isArabic ? 'رفض' : 'Reject'}</button>
                          </div>
                        </div>
                      ) : null}
                      <button onClick={() => removeItem('appointments', appointment._id)} className="btn-dark !px-4 !py-2 text-sm">{isArabic ? 'حذف الحجز' : 'Delete booking'}</button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </AdminPanel>
        )}

        {tab === 'patients' && (
          <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
            <AdminPanel title={labels.patients}>
              <div className="grid gap-3">
                <input className="input" placeholder={isArabic ? 'ابحث بالاسم أو البريد' : 'Search by name or email'} value={patientSearch} onChange={(event) => setPatientSearch(event.target.value)} />
                <input className="input" placeholder={isArabic ? 'ابحث برقم الهاتف' : 'Search by phone'} value={patientPhone} onChange={(event) => setPatientPhone(event.target.value)} />
                <button className="btn-gold" onClick={applyPatientFilters}>{isArabic ? 'تطبيق' : 'Apply'}</button>
              </div>
              <div className="mt-5 grid gap-3">
                {patients.map((patient) => (
                  <button key={patient._id} className={`rounded-[1.5rem] border p-4 text-start ${selectedPatientId === patient._id ? 'border-[#f2d38d]/35 bg-[#f2d38d]/10' : 'border-white/10 bg-white/[0.03]'}`} onClick={async () => {
                    setSelectedPatientId(patient._id);
                    setSessionForm((current) => ({ ...current, patientId: patient._id }));
                    await loadPatientFile(patient._id);
                  }}>
                    <p className="font-semibold text-white">{patient.name}</p>
                    <p className="mt-1 text-sm text-white/45">{patient.email}</p>
                    <p className="mt-1 text-sm text-white/45">{patient.phone || '-'}</p>
                  </button>
                ))}
              </div>
            </AdminPanel>

            <AdminPanel title={selectedPatientFile?.patient?.name || (isArabic ? 'ملف المريض' : 'Patient file')}>
              {selectedPatientFile ? (
                <div className="grid gap-6">
                  <div className="grid gap-4 md:grid-cols-3">
                    <article className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-sm text-white/45">{isArabic ? 'البريد' : 'Email'}</p>
                      <p className="mt-2">{selectedPatientFile.patient.email}</p>
                    </article>
                    <article className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-sm text-white/45">{isArabic ? 'الهاتف' : 'Phone'}</p>
                      <p className="mt-2">{selectedPatientFile.patient.phone || '-'}</p>
                    </article>
                    <article className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                      <p className="text-sm text-white/45">{isArabic ? 'تاريخ الانضمام' : 'Joined'}</p>
                      <p className="mt-2">{formatDisplayDateTime(selectedPatientFile.patient.createdAt, locale)}</p>
                    </article>
                  </div>

                  <div className="grid gap-4">
                    <h3 className="text-lg font-semibold">{isArabic ? 'حجوزات المريض' : 'Patient bookings'}</h3>
                    {selectedPatientFile.appointments.map((appointment) => (
                      <article key={appointment._id} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-white">{appointment.service?.titleAr || appointment.service?.title || '-'}</p>
                            <p className="mt-1 text-sm text-white/50">{appointment.bookingNumber} · {appointment.date} · {appointment.time}</p>
                          </div>
                          <StatusBadge map={appointmentStatusMeta} status={appointment.status} isArabic={isArabic} />
                        </div>
                      </article>
                    ))}
                  </div>

                  <div className="grid gap-4">
                    <h3 className="text-lg font-semibold">{isArabic ? 'الجلسات' : 'Sessions'}</h3>
                    {selectedPatientFile.sessions.map((session) => (
                      <article key={session._id} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-white">{isArabic ? 'جلسة' : 'Session'} #{session.sessionNumber}</p>
                            <p className="mt-1 text-sm text-white/50">{session.date} · {session.doctor?.name || '-'}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <select className="input !py-2" value={session.status} onChange={(event) => updateSessionStatus(session._id, event.target.value)}>
                              {Object.keys(medicalSessionStatusMeta).map((status) => <option key={status} value={status}>{getStatusMeta(medicalSessionStatusMeta, status, isArabic).label}</option>)}
                            </select>
                            <button className="icon-btn" onClick={() => deleteSession(session._id)}><Trash2 size={16} /></button>
                          </div>
                        </div>
                        <div className="mt-4 grid gap-3 text-sm text-white/65 md:grid-cols-2">
                          <p><span className="text-white/45">{isArabic ? 'التشخيص:' : 'Diagnosis:'}</span> {session.diagnosis || '-'}</p>
                          <p><span className="text-white/45">{isArabic ? 'خطة العلاج:' : 'Treatment plan:'}</span> {session.treatmentPlan || '-'}</p>
                        </div>
                      </article>
                    ))}
                  </div>

                  <div className="grid gap-4">
                    <h3 className="text-lg font-semibold">{isArabic ? 'الملفات الطبية' : 'Medical files'}</h3>
                    <div className="grid gap-3 md:grid-cols-2">
                      {selectedPatientFile.files.map((file) => (
                        <article key={file._id} className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                          <p className="font-semibold text-white">{file.title}</p>
                          <p className="mt-1 text-sm text-white/45">{file.type}</p>
                          <div className="mt-3 flex gap-2">
                            <a className="btn-dark !px-4 !py-2 text-sm" href={file.url} target="_blank" rel="noreferrer">{isArabic ? 'عرض' : 'Open'}</a>
                            <a className="btn-gold !px-4 !py-2 text-sm" href={file.url} download>{isArabic ? 'تحميل' : 'Download'}</a>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/[0.03] p-10 text-center text-white/55">{isArabic ? 'اختر مريضًا لفتح ملفه.' : 'Select a patient to open the file.'}</div>
              )}
            </AdminPanel>
          </div>
        )}

        {tab === 'follow_up' && (
          <div className="grid gap-6 xl:grid-cols-[430px_1fr]">
            <AdminPanel title={labels.followUp}>
              <form onSubmit={saveSession} className="grid gap-3">
                <select className="input" value={sessionForm.patientId} onChange={(event) => setSessionForm((current) => ({ ...current, patientId: event.target.value }))} required>
                  <option value="">{isArabic ? 'اختر المريض' : 'Select patient'}</option>
                  {patients.map((patient) => <option key={patient._id} value={patient._id}>{patient.name}</option>)}
                </select>
                <select className="input" value={sessionForm.doctor} onChange={(event) => setSessionForm((current) => ({ ...current, doctor: event.target.value }))}>
                  <option value="">{isArabic ? 'اختر الطبيب' : 'Select doctor'}</option>
                  {doctors.map((doctor) => <option key={doctor._id} value={doctor._id}>{doctor.name}</option>)}
                </select>
                <input className="input" type="date" value={sessionForm.date} onChange={(event) => setSessionForm((current) => ({ ...current, date: event.target.value }))} required />
                <select className="input" value={sessionForm.status} onChange={(event) => setSessionForm((current) => ({ ...current, status: event.target.value }))}>
                  {Object.keys(medicalSessionStatusMeta).map((status) => <option key={status} value={status}>{getStatusMeta(medicalSessionStatusMeta, status, isArabic).label}</option>)}
                </select>
                <textarea className="input" rows="3" placeholder={isArabic ? 'التشخيص' : 'Diagnosis'} value={sessionForm.diagnosis} onChange={(event) => setSessionForm((current) => ({ ...current, diagnosis: event.target.value }))} />
                <textarea className="input" rows="3" placeholder={isArabic ? 'ملاحظات الطبيب' : 'Doctor notes'} value={sessionForm.notes} onChange={(event) => setSessionForm((current) => ({ ...current, notes: event.target.value }))} />
                <textarea className="input" rows="3" placeholder={isArabic ? 'خطة العلاج' : 'Treatment plan'} value={sessionForm.treatmentPlan} onChange={(event) => setSessionForm((current) => ({ ...current, treatmentPlan: event.target.value }))} />
                <textarea className="input" rows="3" placeholder={isArabic ? 'تعليمات ما بعد الجلسة' : 'Post-session instructions'} value={sessionForm.postCareInstructions} onChange={(event) => setSessionForm((current) => ({ ...current, postCareInstructions: event.target.value }))} />
                <input className="input" type="date" value={sessionForm.followUpDate} onChange={(event) => setSessionForm((current) => ({ ...current, followUpDate: event.target.value }))} />
                <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4">
                  <p className="font-semibold text-white">{isArabic ? 'الروشتة' : 'Prescription'}</p>
                  {sessionForm.prescriptionItems.map((item, index) => (
                    <div key={index} className="mt-3 grid gap-2 rounded-[1rem] border border-white/10 bg-black/10 p-3">
                      <input className="input" placeholder={isArabic ? 'اسم الدواء' : 'Medicine name'} value={item.medicineName} onChange={(event) => setSessionForm((current) => ({
                        ...current,
                        prescriptionItems: current.prescriptionItems.map((entry, entryIndex) => entryIndex === index ? { ...entry, medicineName: event.target.value } : entry)
                      }))} />
                      <div className="grid gap-2 md:grid-cols-3">
                        <input className="input" placeholder={isArabic ? 'الجرعة' : 'Dosage'} value={item.dosage} onChange={(event) => setSessionForm((current) => ({
                          ...current,
                          prescriptionItems: current.prescriptionItems.map((entry, entryIndex) => entryIndex === index ? { ...entry, dosage: event.target.value } : entry)
                        }))} />
                        <input className="input" placeholder={isArabic ? 'عدد المرات' : 'Frequency'} value={item.frequencyPerDay} onChange={(event) => setSessionForm((current) => ({
                          ...current,
                          prescriptionItems: current.prescriptionItems.map((entry, entryIndex) => entryIndex === index ? { ...entry, frequencyPerDay: event.target.value } : entry)
                        }))} />
                        <input className="input" placeholder={isArabic ? 'المدة' : 'Duration'} value={item.duration} onChange={(event) => setSessionForm((current) => ({
                          ...current,
                          prescriptionItems: current.prescriptionItems.map((entry, entryIndex) => entryIndex === index ? { ...entry, duration: event.target.value } : entry)
                        }))} />
                      </div>
                      <textarea className="input" rows="2" placeholder={isArabic ? 'تعليمات الاستخدام' : 'Instructions'} value={item.instructions} onChange={(event) => setSessionForm((current) => ({
                        ...current,
                        prescriptionItems: current.prescriptionItems.map((entry, entryIndex) => entryIndex === index ? { ...entry, instructions: event.target.value } : entry)
                      }))} />
                    </div>
                  ))}
                  <button type="button" className="btn-dark mt-3 !px-4 !py-2 text-sm" onClick={() => setSessionForm((current) => ({
                    ...current,
                    prescriptionItems: [...current.prescriptionItems, { medicineName: '', dosage: '', frequencyPerDay: '', duration: '', instructions: '', notes: '' }]
                  }))}>{isArabic ? 'إضافة دواء' : 'Add medicine'}</button>
                </div>
                <button className="btn-gold" disabled={savingSession}>{savingSession ? (isArabic ? 'جارٍ الحفظ...' : 'Saving...') : (isArabic ? 'إضافة الجلسة' : 'Add session')}</button>
              </form>
            </AdminPanel>

            <AdminPanel title={isArabic ? 'رفع ملف طبي' : 'Upload medical file'}>
              <form onSubmit={uploadMedicalFile} className="grid gap-3">
                <select className="input" value={selectedPatientId} onChange={async (event) => {
                  setSelectedPatientId(event.target.value);
                  if (event.target.value) await loadPatientFile(event.target.value);
                }}>
                  <option value="">{isArabic ? 'اختر المريض' : 'Select patient'}</option>
                  {patients.map((patient) => <option key={patient._id} value={patient._id}>{patient.name}</option>)}
                </select>
                <select className="input" value={medicalFileForm.session} onChange={(event) => setMedicalFileForm((current) => ({ ...current, session: event.target.value }))}>
                  <option value="">{isArabic ? 'بدون ربط بجلسة' : 'No linked session'}</option>
                  {(selectedPatientFile?.sessions || []).map((session) => (
                    <option key={session._id} value={session._id}>{isArabic ? 'جلسة' : 'Session'} #{session.sessionNumber} · {session.date}</option>
                  ))}
                </select>
                <input className="input" placeholder={isArabic ? 'عنوان الملف' : 'File title'} value={medicalFileForm.title} onChange={(event) => setMedicalFileForm((current) => ({ ...current, title: event.target.value }))} />
                <select className="input" value={medicalFileForm.type} onChange={(event) => setMedicalFileForm((current) => ({ ...current, type: event.target.value }))}>
                  <option value="medical_image">{isArabic ? 'صورة طبية' : 'Medical image'}</option>
                  <option value="xray">{isArabic ? 'أشعة' : 'X-ray'}</option>
                  <option value="lab">{isArabic ? 'تحاليل' : 'Lab'}</option>
                  <option value="before_after">{isArabic ? 'قبل وبعد' : 'Before / after'}</option>
                  <option value="pdf_report">{isArabic ? 'تقرير PDF' : 'PDF report'}</option>
                  <option value="follow_up">{isArabic ? 'متابعة الحالة' : 'Follow-up'}</option>
                </select>
                <textarea className="input" rows="3" placeholder={isArabic ? 'ملاحظات الملف' : 'File note'} value={medicalFileForm.note} onChange={(event) => setMedicalFileForm((current) => ({ ...current, note: event.target.value }))} />
                <input className="input" type="file" onChange={(event) => setMedicalFileForm((current) => ({ ...current, file: event.target.files?.[0] || null }))} />
                <button className="btn-gold" disabled={uploadingFile}>{uploadingFile ? (isArabic ? 'جارٍ الرفع...' : 'Uploading...') : (isArabic ? 'رفع الملف' : 'Upload file')}</button>
              </form>
            </AdminPanel>
          </div>
        )}

        {tab === 'messages' && (
          <AdminPanel title={labels.messages}>
            <div className="grid gap-4">
              {messages.map((message) => (
                <article key={message._id} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-xl font-semibold">{message.name}</h3>
                      <p className="mt-1 text-sm text-white/55">{message.email}{message.phone ? ` | ${message.phone}` : ''}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => markMessageRead(message)} className="btn-dark !px-4 !py-2 text-sm">{isArabic ? 'تحديد كمقروء' : 'Toggle read'}</button>
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
            <AdminPanel title={isArabic ? 'إدارة الخدمات' : 'Manage services'}>
              <form onSubmit={saveService} className="grid gap-3">
                <input className="input" placeholder="Title" value={serviceForm.title} onChange={(event) => setServiceForm({ ...serviceForm, title: event.target.value })} required />
                <input className="input" placeholder="Arabic title" value={serviceForm.titleAr} onChange={(event) => setServiceForm({ ...serviceForm, titleAr: event.target.value })} />
                <textarea className="input" rows="4" placeholder="Description" value={serviceForm.description} onChange={(event) => setServiceForm({ ...serviceForm, description: event.target.value })} required />
                <textarea className="input" rows="4" placeholder="Arabic description" value={serviceForm.descriptionAr} onChange={(event) => setServiceForm({ ...serviceForm, descriptionAr: event.target.value })} />
                <input className="input" placeholder="Image URL" value={serviceForm.image} onChange={(event) => setServiceForm({ ...serviceForm, image: event.target.value })} />
                <input className="input" placeholder="Banner image URL" value={serviceForm.bannerImage} onChange={(event) => setServiceForm({ ...serviceForm, bannerImage: event.target.value })} />
                <input className="input" type="file" accept="image/*" onChange={handleServiceImageChange} />
                {serviceForm.image ? <img src={serviceForm.image} alt="Service preview" className="h-36 w-full rounded-[1.4rem] object-cover" /> : null}
                <div className="grid grid-cols-2 gap-3">
                  <input className="input" type="number" placeholder="Duration" value={serviceForm.duration} onChange={(event) => setServiceForm({ ...serviceForm, duration: event.target.value })} />
                  <input className="input" type="number" placeholder="Price from" value={serviceForm.priceFrom} onChange={(event) => setServiceForm({ ...serviceForm, priceFrom: event.target.value })} />
                </div>
                <textarea className="input" rows="4" placeholder="Features (one per line)" value={serviceForm.featuresText} onChange={(event) => setServiceForm({ ...serviceForm, featuresText: event.target.value })} />
                <textarea className="input" rows="4" placeholder="Arabic features (one per line)" value={serviceForm.featuresArText} onChange={(event) => setServiceForm({ ...serviceForm, featuresArText: event.target.value })} />
                <textarea className="input" rows="4" placeholder="Treatment steps (one per line)" value={serviceForm.treatmentStepsText} onChange={(event) => setServiceForm({ ...serviceForm, treatmentStepsText: event.target.value })} />
                <textarea className="input" rows="4" placeholder="Arabic treatment steps (one per line)" value={serviceForm.treatmentStepsArText} onChange={(event) => setServiceForm({ ...serviceForm, treatmentStepsArText: event.target.value })} />
                <textarea className="input" rows="4" placeholder="FAQs: question | answer | questionAr | answerAr" value={serviceForm.faqText} onChange={(event) => setServiceForm({ ...serviceForm, faqText: event.target.value })} />
                <button className="btn-gold">{editingServiceId ? (isArabic ? 'تحديث' : 'Update') : (isArabic ? 'إضافة' : 'Create')}</button>
              </form>
            </AdminPanel>

            <AdminPanel title={labels.services}>
              <div className="grid gap-4">
                {services.map((service) => (
                  <article key={service._id} className="grid grid-cols-[120px_1fr_auto] items-center gap-4 rounded-[2rem] border border-white/10 bg-white/[0.04] p-4">
                    <div className="overflow-hidden rounded-2xl border border-white/10">
                      {service.image ? <img src={service.image} alt={service.title} className="h-24 w-full object-cover" /> : <div className="grid h-24 place-items-center text-white/35"><Image size={22} /></div>}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{service.title}</h3>
                      <p className="text-sm text-white/45">{service.titleAr}</p>
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

        {tab === 'cases' && (
          <div className="grid gap-6 xl:grid-cols-[430px_1fr]">
            <AdminPanel title={isArabic ? 'إدارة الحالات المعالجة' : 'Manage treatment cases'}>
              <form onSubmit={saveTreatmentCase} className="grid gap-3">
                <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4 text-sm text-white/65">
                  {isArabic
                    ? 'اختر الخدمة والطبيب المرتبطين بالحالة حتى تظهر في القسم الصحيح داخل الموقع.'
                    : 'Choose the linked service and doctor so the case appears in the correct section on the site.'}
                </div>
                <select className="input" value={caseForm.service} onChange={(event) => setCaseForm({ ...caseForm, service: event.target.value })} required>
                  <option value="">{isArabic ? 'اختر الخدمة' : 'Select service'}</option>
                  {services.map((service) => <option key={service._id} value={service._id}>{service.titleAr || service.title}</option>)}
                </select>
                <select className="input" value={caseForm.doctor} onChange={(event) => setCaseForm({ ...caseForm, doctor: event.target.value })}>
                  <option value="">{isArabic ? 'اختر الطبيب' : 'Select doctor'}</option>
                  {doctors.map((doctor) => <option key={doctor._id} value={doctor._id}>{doctor.name}</option>)}
                </select>
                <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4 text-sm text-white/65">
                  {isArabic
                    ? 'اكتب عنوان الحالة والوصف المختصر الذي يظهر في الكارت، ثم أضف النص الكامل لصفحة التفاصيل.'
                    : 'Write the case title and short text for the card, then add the full text for the details page.'}
                </div>
                <input className="input" placeholder="Case title" value={caseForm.title} onChange={(event) => setCaseForm({ ...caseForm, title: event.target.value })} required />
                <input className="input" placeholder="Arabic case title" value={caseForm.titleAr} onChange={(event) => setCaseForm({ ...caseForm, titleAr: event.target.value })} />
                <textarea className="input" rows="3" placeholder="Short description" value={caseForm.shortDescription} onChange={(event) => setCaseForm({ ...caseForm, shortDescription: event.target.value })} />
                <textarea className="input" rows="3" placeholder="Arabic short description" value={caseForm.shortDescriptionAr} onChange={(event) => setCaseForm({ ...caseForm, shortDescriptionAr: event.target.value })} />
                <textarea className="input" rows="5" placeholder="Full description" value={caseForm.fullDescription} onChange={(event) => setCaseForm({ ...caseForm, fullDescription: event.target.value })} />
                <textarea className="input" rows="5" placeholder="Arabic full description" value={caseForm.fullDescriptionAr} onChange={(event) => setCaseForm({ ...caseForm, fullDescriptionAr: event.target.value })} />
                <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4 text-sm text-white/65">
                  {isArabic
                    ? 'اشرح هنا مشكلة الحالة وخطوات العلاج والمدة والنتيجة النهائية بشكل واضح ومختصر.'
                    : 'Explain the case problem, treatment steps, duration, and final result here in a clear short way.'}
                </div>
                <textarea className="input" rows="4" placeholder="Patient concern" value={caseForm.patientProblem} onChange={(event) => setCaseForm({ ...caseForm, patientProblem: event.target.value })} />
                <textarea className="input" rows="4" placeholder="Arabic patient concern" value={caseForm.patientProblemAr} onChange={(event) => setCaseForm({ ...caseForm, patientProblemAr: event.target.value })} />
                <textarea className="input" rows="4" placeholder="Treatment steps (one per line)" value={caseForm.treatmentStepsText} onChange={(event) => setCaseForm({ ...caseForm, treatmentStepsText: event.target.value })} />
                <textarea className="input" rows="4" placeholder="Arabic treatment steps (one per line)" value={caseForm.treatmentStepsArText} onChange={(event) => setCaseForm({ ...caseForm, treatmentStepsArText: event.target.value })} />
                <input className="input" placeholder="Duration text" value={caseForm.durationText} onChange={(event) => setCaseForm({ ...caseForm, durationText: event.target.value })} />
                <input className="input" placeholder="Arabic duration text" value={caseForm.durationTextAr} onChange={(event) => setCaseForm({ ...caseForm, durationTextAr: event.target.value })} />
                <textarea className="input" rows="3" placeholder="Result summary" value={caseForm.resultSummary} onChange={(event) => setCaseForm({ ...caseForm, resultSummary: event.target.value })} />
                <textarea className="input" rows="3" placeholder="Arabic result summary" value={caseForm.resultSummaryAr} onChange={(event) => setCaseForm({ ...caseForm, resultSummaryAr: event.target.value })} />
                <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4 text-sm text-white/65">
                  {isArabic
                    ? 'أضف صورة الكارت الرئيسية، ثم صور قبل العلاج وبعده، وبعد ذلك أي صور إضافية للمعرض. يمكنك أيضًا إضافة فيديوهات قصيرة للحالة.'
                    : 'Add the main card image, then before/after images, then any extra gallery images. You can also add short case videos.'}
                </div>
                <input className="input" placeholder="Main image URL" value={caseForm.mainImage} onChange={(event) => setCaseForm({ ...caseForm, mainImage: event.target.value })} />
                <input className="input" type="file" accept="image/*" onChange={(event) => handleCaseImageUpload(event, 'mainImage')} />
                <textarea className="input" rows="3" placeholder="Before images URLs (one per line)" value={caseForm.beforeImagesText} onChange={(event) => setCaseForm({ ...caseForm, beforeImagesText: event.target.value })} />
                <input className="input" type="file" accept="image/*" onChange={(event) => handleCaseImageUpload(event, 'beforeImagesText')} />
                <textarea className="input" rows="3" placeholder="After images URLs (one per line)" value={caseForm.afterImagesText} onChange={(event) => setCaseForm({ ...caseForm, afterImagesText: event.target.value })} />
                <input className="input" type="file" accept="image/*" onChange={(event) => handleCaseImageUpload(event, 'afterImagesText')} />
                <textarea className="input" rows="3" placeholder="Gallery images URLs (one per line)" value={caseForm.galleryImagesText} onChange={(event) => setCaseForm({ ...caseForm, galleryImagesText: event.target.value })} />
                <input className="input" type="file" accept="image/*" onChange={(event) => handleCaseImageUpload(event, 'galleryImagesText')} />
                <textarea className="input" rows="3" placeholder="Short videos URLs (one per line)" value={caseForm.videosText} onChange={(event) => setCaseForm({ ...caseForm, videosText: event.target.value })} />
                <input className="input" type="file" accept="video/mp4,video/webm,video/quicktime" onChange={handleCaseVideoUpload} />
                <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] p-4 text-sm text-white/65">
                  {isArabic
                    ? 'يمكنك تحديد تاريخ الحالة وترتيب ظهورها، ثم اختيار نشرها بالموقع أو إبقائها مخفية.'
                    : 'Set the case date and display order, then choose whether to publish it or keep it hidden.'}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input className="input" type="date" value={caseForm.caseDate} onChange={(event) => setCaseForm({ ...caseForm, caseDate: event.target.value })} />
                  <input className="input" type="number" placeholder="Display order" value={caseForm.displayOrder} onChange={(event) => setCaseForm({ ...caseForm, displayOrder: event.target.value })} />
                </div>
                <label className="inline-flex items-center gap-3 text-sm text-white/70">
                  <input type="checkbox" checked={caseForm.published} onChange={(event) => setCaseForm({ ...caseForm, published: event.target.checked })} />
                  {isArabic ? 'منشورة للعرض' : 'Published'}
                </label>
                <div className="flex gap-3">
                  <button className="btn-gold flex-1">{editingCaseId ? (isArabic ? 'تحديث' : 'Update') : (isArabic ? 'إضافة' : 'Create')}</button>
                  <button type="button" className="btn-dark flex-1" onClick={() => { setEditingCaseId(''); setCaseForm(caseInitial); }}>{isArabic ? 'إعادة ضبط' : 'Reset'}</button>
                </div>
              </form>
            </AdminPanel>

            <AdminPanel title={isArabic ? 'الحالات المنشورة' : 'Published cases'} actions={
              <div className="flex flex-wrap gap-2">
                <input className="input !w-48" placeholder={isArabic ? 'بحث بالحالة' : 'Search case'} value={caseSearch} onChange={(event) => setCaseSearch(event.target.value)} />
                <select className="input !w-48" value={caseServiceFilter} onChange={(event) => setCaseServiceFilter(event.target.value)}>
                  <option value="all">{isArabic ? 'كل الخدمات' : 'All services'}</option>
                  {services.map((service) => <option key={service._id} value={service._id}>{service.titleAr || service.title}</option>)}
                </select>
                <button className="btn-dark !px-4 !py-2 text-sm" onClick={loadCore}>{isArabic ? 'تحديث' : 'Refresh'}</button>
              </div>
            }>
              <div className="grid gap-4">
                {treatmentCases.map((item) => (
                  <article key={item._id} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4">
                    <div className="grid gap-4 lg:grid-cols-[140px_1fr_auto] lg:items-center">
                      <div className="overflow-hidden rounded-[1.2rem] border border-white/10 bg-white/[0.03]">
                        {item.mainImage ? <img src={item.mainImage} alt={item.title} className="h-28 w-full object-cover" /> : <div className="grid h-28 place-items-center text-white/35"><Image size={22} /></div>}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                          <span className={`rounded-full border px-3 py-1 text-xs ${item.published ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-200' : 'border-white/10 bg-white/[0.04] text-white/55'}`}>
                            {item.published ? (isArabic ? 'منشورة' : 'Published') : (isArabic ? 'مخفية' : 'Hidden')}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-white/45">{item.service?.titleAr || item.service?.title || '-'} · {item.doctor?.name || '-'}</p>
                        <p className="mt-2 line-clamp-2 text-sm text-white/65">{item.shortDescriptionAr || item.shortDescription || '-'}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => editTreatmentCase(item)} className="icon-btn"><PencilLine size={16} /></button>
                        <button onClick={() => removeItem('cases', item._id)} className="icon-btn"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </AdminPanel>
          </div>
        )}

        {tab === 'doctors' && (
          <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
            <AdminPanel title={isArabic ? 'إدارة الأطباء' : 'Manage doctors'}>
              <form onSubmit={saveDoctor} className="grid gap-3">
                <input className="input" placeholder="Name" value={doctorForm.name} onChange={(event) => setDoctorForm({ ...doctorForm, name: event.target.value })} required />
                <input className="input" placeholder="Specialty" value={doctorForm.specialty} onChange={(event) => setDoctorForm({ ...doctorForm, specialty: event.target.value })} required />
                <input className="input" placeholder="Arabic specialty" value={doctorForm.specialtyAr} onChange={(event) => setDoctorForm({ ...doctorForm, specialtyAr: event.target.value })} />
                <textarea className="input" rows="4" placeholder="Bio" value={doctorForm.bio} onChange={(event) => setDoctorForm({ ...doctorForm, bio: event.target.value })} required />
                <textarea className="input" rows="4" placeholder="Arabic bio" value={doctorForm.bioAr} onChange={(event) => setDoctorForm({ ...doctorForm, bioAr: event.target.value })} />
                <input className="input" placeholder="Image URL" value={doctorForm.image} onChange={(event) => setDoctorForm({ ...doctorForm, image: event.target.value })} />
                <input className="input" type="file" accept="image/*" onChange={handleDoctorImageChange} />
                {doctorForm.image ? <img src={doctorForm.image} alt="Doctor preview" className="h-36 w-full rounded-[1.4rem] object-cover" /> : null}
                <input className="input" type="number" placeholder="Experience years" value={doctorForm.experienceYears} onChange={(event) => setDoctorForm({ ...doctorForm, experienceYears: event.target.value })} />
                <input className="input" placeholder="Available days" value={doctorForm.availableDays} onChange={(event) => setDoctorForm({ ...doctorForm, availableDays: event.target.value })} />
                <button className="btn-gold">{editingDoctorId ? (isArabic ? 'تحديث' : 'Update') : (isArabic ? 'إضافة' : 'Create')}</button>
              </form>
            </AdminPanel>

            <AdminPanel title={labels.doctors}>
              <div className="grid gap-4">
                {doctors.map((doctor) => (
                  <article key={doctor._id} className="grid grid-cols-[120px_1fr_auto] items-center gap-4 rounded-[2rem] border border-white/10 bg-white/[0.04] p-4">
                    <img src={doctor.image || '/logo.png'} alt={doctor.name} className="h-24 w-full rounded-2xl object-cover" />
                    <div>
                      <h3 className="text-xl font-semibold">{doctor.name}</h3>
                      <p className="text-sm text-white/45">{doctor.specialty}</p>
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
          <AdminPanel title={labels.users}>
            <div className="grid gap-4">
              {users.map((user) => (
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
                      <p className="mt-1 text-sm text-white/45">{user.phone || '-'}</p>
                    </div>
                  </div>
                  <div className="grid gap-3 text-sm text-white/65 sm:grid-cols-2">
                    <div>
                      <p className="text-white/40">{isArabic ? 'تاريخ الإنشاء' : 'Joined'}</p>
                      <p className="mt-1">{formatDisplayDateTime(user.createdAt, locale)}</p>
                    </div>
                    <div>
                      <p className="text-white/40">{isArabic ? 'طرق الدخول' : 'Providers'}</p>
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
              ))}
            </div>
          </AdminPanel>
        )}

        {tab === 'activity' && (
          <AdminPanel title={labels.activity}>
            <div className="grid gap-4">
              {activityLogs.map((log) => (
                <article key={log._id} className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-11 w-11 place-items-center rounded-[1rem] border border-white/10 bg-white/[0.04] text-[#f2d38d]">
                        <Activity size={16} />
                      </div>
                      <div>
                        <p className="font-semibold text-white">{log.summary || log.actionType}</p>
                        <p className="mt-1 text-xs text-white/45">{log.actor?.name || '-'} · {log.entityType} · {log.entityId}</p>
                      </div>
                    </div>
                    <p className="text-xs text-white/45">{formatDisplayDateTime(log.createdAt, locale)}</p>
                  </div>
                </article>
              ))}
            </div>
          </AdminPanel>
        )}

        {tab === 'working_hours' && (
          <AdminPanel title={isArabic ? 'مواعيد العمل' : 'Working hours'}>
            <WorkingHoursPanel />
          </AdminPanel>
        )}

        {tab === 'contact_settings' && (
          <AdminPanel title={isArabic ? 'التواصل' : 'Contact'}>
            <ContactSettingsPanel />
          </AdminPanel>
        )}

        {tab === 'settings' && (
          <AdminPanel title={labels.settings}>
            <SiteSettingsPanel />
          </AdminPanel>
        )}

        {tab === 'security' && (
          <AdminPanel title={labels.security}>
            <SecuritySettingsPanel />
          </AdminPanel>
        )}
      </div>
    </main>
  );
}
