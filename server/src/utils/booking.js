export const appointmentStatuses = {
  pending_review: 'pending_review',
  confirmed: 'confirmed',
  completed: 'completed',
  cancelled: 'cancelled',
  rejected: 'rejected',
  attended: 'attended',
  no_show: 'no_show',
  reschedule_requested: 'reschedule_requested',
  reschedule_approved: 'reschedule_approved',
  reschedule_rejected: 'reschedule_rejected',
  cancellation_requested: 'cancellation_requested',
  cancellation_approved: 'cancellation_approved',
  cancellation_rejected: 'cancellation_rejected'
};

export function combineAppointmentDateTime(date, time) {
  if (!date || !time) return null;
  const parsed = new Date(`${date}T${time}:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function isWithinHours(date, time, hours) {
  const appointmentDate = combineAppointmentDateTime(date, time);
  if (!appointmentDate) return false;
  return appointmentDate.getTime() - Date.now() < hours * 60 * 60 * 1000;
}

export function normalizeAppointmentStatus(status) {
  if (!status) return appointmentStatuses.pending_review;
  if (status === 'pending') return appointmentStatuses.pending_review;
  return status;
}

export function canRequestReschedule(appointment) {
  if (!appointment) return 'Appointment not found';
  if ([appointmentStatuses.cancelled, appointmentStatuses.cancellation_approved, appointmentStatuses.completed].includes(appointment.status)) {
    return 'This appointment cannot be rescheduled';
  }
  if (appointment.rescheduleRequest?.status === 'pending') {
    return 'A reschedule request is already pending for this appointment';
  }
  if (isWithinHours(appointment.date, appointment.time, 24)) {
    return 'Reschedule requests are not allowed within 24 hours of the appointment';
  }
  return '';
}

export function canRequestCancellation(appointment) {
  if (!appointment) return 'Appointment not found';
  if ([appointmentStatuses.completed].includes(appointment.status)) {
    return 'This appointment cannot be cancelled';
  }
  if (appointment.cancellationRequest?.status === 'pending') {
    return 'A cancellation request is already pending for this appointment';
  }
  if (isWithinHours(appointment.date, appointment.time, 24)) {
    return 'Cancellation requests are not allowed within 24 hours of the appointment';
  }
  return '';
}
