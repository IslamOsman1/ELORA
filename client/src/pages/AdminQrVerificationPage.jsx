import React from 'react';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { ArrowLeft, Camera, CameraOff, CheckCircle2, QrCode, RefreshCcw, ShieldCheck, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BrowserCodeReader, BrowserQRCodeReader } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';
import { api } from '../utils/api';
import { useLanguage } from '../context/LanguageContext';

export default function AdminQrVerificationPage() {
  const { isArabic } = useLanguage();
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const controlsRef = useRef(null);
  const streamRef = useRef(null);
  const scanTimerRef = useRef(null);
  const barcodeDetectorRef = useRef(null);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [availableCameras, setAvailableCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupResult, setLookupResult] = useState(null);

  const text = {
    title: isArabic ? 'التحقق من الموعد عبر QR' : 'QR appointment verification',
    subtitle: isArabic ? 'استخدم الكاميرا لمسح كود المريض أو ألصق الرمز يدويًا لتأكيد الهوية والحضور.' : 'Use the camera to scan the patient QR code or paste it manually to verify identity and confirm attendance.',
    back: isArabic ? 'العودة للوحة التحكم' : 'Back to dashboard',
    camera: isArabic ? 'تشغيل الكاميرا' : 'Enable camera',
    stopCamera: isArabic ? 'إيقاف الكاميرا' : 'Stop camera',
    manualLabel: isArabic ? 'قيمة QR أو رمز الحساب' : 'QR value or account token',
    verify: isArabic ? 'تحقق من المستخدم' : 'Verify user',
    rescan: isArabic ? 'إعادة المسح' : 'Scan again',
    cameraSelect: isArabic ? 'اختر الكاميرا' : 'Choose camera',
    openAppointments: isArabic ? 'المواعيد المفتوحة' : 'Open appointments',
    confirmAttendance: isArabic ? 'تأكيد حضور الجلسة' : 'Confirm attendance',
    confirmed: isArabic ? 'تم التأكيد' : 'Confirmed',
    empty: isArabic ? 'لا توجد مواعيد مفتوحة لهذا المستخدم حاليًا' : 'This user has no open appointments right now',
    cameraHint: isArabic ? 'اسمح للمتصفح باستخدام الكاميرا ثم وجّهها نحو QR الخاص بالمستخدم. إذا كانت هناك أكثر من كاميرا فاختر الخلفية للحصول على أفضل نتيجة.' : 'Allow camera access in the browser, then point it at the user QR code. If more than one camera is available, choose the rear camera for best results.',
    cameraReady: isArabic ? 'الكاميرا جاهزة للمسح' : 'Camera is ready to scan',
    cameraUnavailable: isArabic ? 'تعذر تشغيل الكاميرا. يمكنك التحقق يدويًا من خلال لصق الرمز.' : 'Unable to start the camera. You can still verify manually by pasting the code.',
    verified: isArabic ? 'تم التحقق من المستخدم' : 'User verified',
    attendanceDone: isArabic ? 'تم تأكيد حضور الجلسة' : 'Attendance confirmed',
    resultTitle: isArabic ? 'نتيجة التحقق' : 'Verification result',
    cameraTitle: isArabic ? 'مسح الكاميرا' : 'Camera scan',
    scanPlaceholder: isArabic ? 'ابدأ المسح بالكاميرا أو ألصق الرمز لعرض بيانات الموعد.' : 'Start a camera scan or paste the code to display appointment details.',
    scanningNow: isArabic ? 'جارٍ البحث عن كود QR...' : 'Scanning for a QR code...'
  };

  useEffect(() => {
    loadVideoDevices().catch(() => {});

    return () => {
      stopScanner();
    };
  }, []);

  async function loadVideoDevices() {
    const devices = await BrowserCodeReader.listVideoInputDevices();
    setAvailableCameras(devices);

    if (!devices.length) return devices;

    if (!selectedCameraId || !devices.some((device) => device.deviceId === selectedCameraId)) {
      const preferredBackCamera = devices.find((device) => /back|rear|environment|world/i.test(device.label || ''));
      setSelectedCameraId(preferredBackCamera?.deviceId || devices[0].deviceId);
    }

    return devices;
  }

  function stopScanner() {
    controlsRef.current?.stop?.();
    controlsRef.current = null;
    readerRef.current?.reset?.();
    if (scanTimerRef.current) {
      clearInterval(scanTimerRef.current);
      scanTimerRef.current = null;
    }

    const stream = streamRef.current || videoRef.current?.srcObject;
    if (stream && typeof stream.getTracks === 'function') {
      stream.getTracks().forEach((track) => track.stop());
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    streamRef.current = null;
    setCameraEnabled(false);
  }

  async function verifyCode(code) {
    const cleanedCode = String(code || '').trim();
    if (!cleanedCode) return null;

    try {
      setLookupLoading(true);
      const response = await api.post('/admin/users/verify-qr', { code: cleanedCode });
      setManualCode(cleanedCode);
      setLookupResult(response.data);
      toast.success(text.verified);
      return response.data;
    } catch (error) {
      setLookupResult(null);
      toast.error(error.response?.data?.message || text.cameraUnavailable);
      return null;
    } finally {
      setLookupLoading(false);
    }
  }

  async function startScanner() {
    if (!videoRef.current) return;

    try {
      setCameraLoading(true);
      setLookupResult(null);
      stopScanner();

      if (!readerRef.current) {
        const hints = new Map();
        hints.set(DecodeHintType.POSSIBLE_FORMATS, [BarcodeFormat.QR_CODE]);
        hints.set(DecodeHintType.TRY_HARDER, true);
        readerRef.current = new BrowserQRCodeReader(hints);
      }

      const devices = await loadVideoDevices().catch(() => availableCameras);
      const preferredDeviceId =
        selectedCameraId ||
        devices?.find((device) => /back|rear|environment|world/i.test(device.label || ''))?.deviceId ||
        devices?.[0]?.deviceId ||
        '';

      const callback = async (result) => {
        if (!result) return;
        const qrText = result.getText();
        stopScanner();
        await verifyCode(qrText);
      };

      const constraints = preferredDeviceId
        ? {
            audio: false,
            video: {
              deviceId: { exact: preferredDeviceId },
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          }
        : {
            audio: false,
            video: {
              facingMode: { ideal: 'environment' },
              width: { ideal: 1280 },
              height: { ideal: 720 }
            }
          };

      const NativeBarcodeDetector = globalThis.BarcodeDetector;

      if (NativeBarcodeDetector) {
        if (!barcodeDetectorRef.current) {
          barcodeDetectorRef.current = new NativeBarcodeDetector({ formats: ['qr_code'] });
        }

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();

        scanTimerRef.current = setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState < 2 || lookupLoading) return;

          try {
            const barcodes = await barcodeDetectorRef.current.detect(videoRef.current);
            const qrCode = barcodes.find((item) => item.rawValue);
            if (!qrCode?.rawValue) return;
            stopScanner();
            await verifyCode(qrCode.rawValue);
          } catch (_) {
            // Ignore transient frame read failures while the camera warms up.
          }
        }, 250);
      } else {
        controlsRef.current = await readerRef.current.decodeFromConstraints(constraints, videoRef.current, callback);
      }

      setCameraEnabled(true);
      toast.success(text.cameraReady);
    } catch (error) {
      stopScanner();
      toast.error(text.cameraUnavailable);
    } finally {
      setCameraLoading(false);
    }
  }

  async function handleManualVerify(event) {
    event.preventDefault();
    await verifyCode(manualCode);
  }

  async function confirmAttendance(appointmentId) {
    await api.post(`/admin/appointments/${appointmentId}/check-in`);
    toast.success(text.attendanceDone);
    await verifyCode(manualCode);
  }

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="eyebrow">{text.title}</p>
            <h1 className="mt-3 font-display text-5xl">ELORA Scan Desk</h1>
            <p className="mt-3 max-w-3xl text-white/60">{text.subtitle}</p>
          </div>
          <Link to="/admin" className="btn-dark inline-flex items-center gap-2">
            <ArrowLeft size={16} />
            {text.back}
          </Link>
        </div>

        <div className="grid gap-6 xl:grid-cols-[460px_1fr]">
          <section className="premium-card p-5">
            <div className="flex items-center gap-3 text-[#f2d38d]">
              <Camera size={18} />
              <h2 className="text-2xl font-semibold">{text.cameraTitle}</h2>
            </div>
            <p className="mt-3 text-sm leading-7 text-white/62">{text.cameraHint}</p>

            <div className="mt-5 overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#090708]">
              <div className="relative">
                <video ref={videoRef} className="aspect-[4/5] w-full object-cover" muted playsInline />
                {cameraEnabled ? (
                  <>
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_24%,rgba(5,4,5,0.28)_64%,rgba(5,4,5,0.72)_100%)]" />
                    <div className="pointer-events-none absolute left-1/2 top-1/2 h-52 w-52 -translate-x-1/2 -translate-y-1/2 rounded-[2rem] border-2 border-[#f2d38d] shadow-[0_0_0_9999px_rgba(0,0,0,0.18)]">
                      <div className="absolute inset-x-6 top-0 h-[2px] bg-[#f2d38d]" />
                      <div className="absolute bottom-0 left-6 right-6 h-[2px] bg-[#f2d38d]" />
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 rounded-full border border-white/10 bg-black/35 px-4 py-2 text-center text-xs text-white/80 backdrop-blur">
                      {text.scanningNow}
                    </div>
                  </>
                ) : null}
              </div>
            </div>

            {availableCameras.length > 1 ? (
              <div className="mt-4">
                <label className="mb-2 block text-sm text-white/55">{text.cameraSelect}</label>
                <select className="input" value={selectedCameraId} onChange={(event) => setSelectedCameraId(event.target.value)}>
                  {availableCameras.map((device, index) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label || `${text.cameraSelect} ${index + 1}`}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-3">
              {!cameraEnabled ? (
                <button className="btn-gold inline-flex items-center gap-2" onClick={startScanner} disabled={cameraLoading}>
                  <Camera size={16} />
                  {text.camera}
                </button>
              ) : (
                <button className="btn-dark inline-flex items-center gap-2" onClick={stopScanner}>
                  <CameraOff size={16} />
                  {text.stopCamera}
                </button>
              )}

              <button className="btn-dark inline-flex items-center gap-2" onClick={startScanner} disabled={cameraLoading}>
                <RefreshCcw size={16} />
                {text.rescan}
              </button>
            </div>

            <form onSubmit={handleManualVerify} className="mt-6 grid gap-3">
              <textarea className="input min-h-28" placeholder={text.manualLabel} value={manualCode} onChange={(event) => setManualCode(event.target.value)} />
              <button className="btn-gold" disabled={lookupLoading}>{text.verify}</button>
            </form>
          </section>

          <section className="premium-card p-5">
            <div className="flex items-center gap-3 text-[#f2d38d]">
              <ShieldCheck size={18} />
              <h2 className="text-2xl font-semibold">{text.resultTitle}</h2>
            </div>

            {lookupResult ? (
              <div className="mt-5 grid gap-5">
                <article className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex flex-wrap items-center gap-4">
                    {lookupResult.user.avatar ? (
                      <img src={lookupResult.user.avatar} alt={lookupResult.user.name} className="h-20 w-20 rounded-[1.2rem] object-cover" />
                    ) : (
                      <div className="grid h-20 w-20 place-items-center rounded-[1.2rem] border border-white/10 bg-white/[0.03]">
                        <Users size={26} className="text-[#f2d38d]" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-2xl font-semibold">{lookupResult.user.name}</h3>
                      <p className="mt-1 text-white/50">{lookupResult.user.email}</p>
                      <p className="mt-2 break-all font-mono text-xs text-[#f2d38d]/85">{lookupResult.user.qrCodeToken}</p>
                    </div>
                  </div>
                </article>

                <div>
                  <p className="mb-3 text-sm text-white/45">{text.openAppointments}</p>
                  <div className="grid gap-3">
                    {lookupResult.appointments.length ? lookupResult.appointments.map((appointment) => (
                      <article key={appointment._id} className="rounded-[1.75rem] border border-white/10 bg-white/[0.03] p-5">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="space-y-1">
                            <p className="font-semibold text-white">{appointment.service?.title || '-'}</p>
                            <p className="text-sm text-white/50">{appointment.date} · {appointment.time}</p>
                            <p className="text-sm text-white/50">{appointment.doctor?.name || '-'}</p>
                            <p className="text-sm text-white/40">{appointment.status}</p>
                          </div>
                          <button className="btn-gold !px-4 !py-2 text-sm" onClick={() => confirmAttendance(appointment._id)} disabled={appointment.attendanceConfirmed}>
                            {appointment.attendanceConfirmed ? (
                              <span className="inline-flex items-center gap-2"><CheckCircle2 size={15} />{text.confirmed}</span>
                            ) : text.confirmAttendance}
                          </button>
                        </div>
                      </article>
                    )) : (
                      <div className="rounded-[1.75rem] border border-dashed border-white/10 bg-white/[0.02] p-5 text-white/55">
                        {text.empty}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 grid min-h-[420px] place-items-center rounded-[1.75rem] border border-dashed border-white/10 bg-white/[0.02] p-8 text-center text-white/45">
                <div>
                  <QrCode size={36} className="mx-auto text-[#f2d38d]" />
                  <p className="mt-4">{text.scanPlaceholder}</p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
