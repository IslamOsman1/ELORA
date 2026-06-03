import twilio from 'twilio';

let twilioClient = null;
const DEFAULT_CLINIC_WHATSAPP_NUMBER = '+201511110061';

function getTwilioClient() {
  if (twilioClient) return twilioClient;

  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    return null;
  }

  twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  return twilioClient;
}

function normalizePhone(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';

  const cleaned = raw.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) return cleaned;
  if (cleaned.startsWith('00')) return `+${cleaned.slice(2)}`;
  return `+${cleaned}`;
}

function toWhatsappAddress(value) {
  const phone = normalizePhone(value);
  return phone ? `whatsapp:${phone}` : '';
}

function getClinicWhatsappNumber(settings) {
  return process.env.CLINIC_WHATSAPP_TO || settings?.contact?.whatsapp || settings?.contact?.phone || DEFAULT_CLINIC_WHATSAPP_NUMBER;
}

function buildAppointmentMessage(appointment, settings) {
  const brandName = settings?.branding?.brandName || 'ELORA';
  const serviceName = appointment.service?.titleAr || appointment.service?.title || '-';
  const doctorName = appointment.doctor?.name || 'Any doctor';
  const notes = String(appointment.notes || '').trim() || 'No notes';

  return [
    `حجز جديد في ${brandName}`,
    `رقم الحجز: ${appointment.bookingNumber}`,
    `الاسم: ${appointment.patientName}`,
    `الهاتف: ${appointment.phone}`,
    `البريد: ${appointment.email}`,
    `الخدمة: ${serviceName}`,
    `الطبيب: ${doctorName}`,
    `التاريخ: ${appointment.date}`,
    `الوقت: ${appointment.time}`,
    `ملاحظات: ${notes}`
  ].join('\n');
}

export async function sendAppointmentWhatsappNotification({ appointment, settings }) {
  const client = getTwilioClient();
  const from = toWhatsappAddress(process.env.TWILIO_WHATSAPP_FROM);
  const to = toWhatsappAddress(getClinicWhatsappNumber(settings));

  if (!client || !from || !to) {
    return { skipped: true };
  }

  const body = buildAppointmentMessage(appointment, settings);
  const message = await client.messages.create({ from, to, body });

  return { skipped: false, sid: message.sid };
}
