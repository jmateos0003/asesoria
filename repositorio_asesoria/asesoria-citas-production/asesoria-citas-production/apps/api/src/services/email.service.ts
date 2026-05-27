import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const hasSmtpConfig = Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);

const transporter = hasSmtpConfig
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS
      }
    })
  : null;

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail(input: SendEmailInput) {
  if (!transporter) {
    console.info('[email:disabled]', {
      to: input.to,
      subject: input.subject
    });
    return;
  }

  await transporter.sendMail({
    from: env.MAIL_FROM,
    to: input.to,
    subject: input.subject,
    html: input.html
  });
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Europe/Madrid'
  }).format(date);
}

export async function notifyAdminNewAppointment(appointment: {
  id: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string | null;
  startsAt: Date;
  reason?: string | null;
}) {
  if (!env.ADMIN_NOTIFICATION_EMAIL) return;

  const adminUrl = `${env.PUBLIC_APP_URL}/admin`;
  await sendEmail({
    to: env.ADMIN_NOTIFICATION_EMAIL,
    subject: `Nueva solicitud de cita de ${appointment.clientName}`,
    html: `
      <h2>Nueva solicitud de cita</h2>
      <p><strong>Cliente:</strong> ${appointment.clientName}</p>
      <p><strong>Email:</strong> ${appointment.clientEmail}</p>
      <p><strong>Teléfono:</strong> ${appointment.clientPhone || '-'}</p>
      <p><strong>Fecha:</strong> ${formatDate(appointment.startsAt)}</p>
      <p><strong>Motivo:</strong> ${appointment.reason || '-'}</p>
      <p><a href="${adminUrl}">Abrir panel de administración</a></p>
    `
  });
}

export async function sendClientRequestReceived(appointment: {
  clientEmail: string;
  clientName: string;
  startsAt: Date;
}) {
  await sendEmail({
    to: appointment.clientEmail,
    subject: 'Hemos recibido tu solicitud de cita',
    html: `
      <h2>Solicitud recibida</h2>
      <p>Hola ${appointment.clientName},</p>
      <p>Hemos recibido tu solicitud de cita para el <strong>${formatDate(appointment.startsAt)}</strong>.</p>
      <p>Te avisaremos por email cuando la asesoría la apruebe o rechace.</p>
    `
  });
}

export async function sendClientApproved(appointment: {
  clientEmail: string;
  clientName: string;
  startsAt: Date;
}) {
  await sendEmail({
    to: appointment.clientEmail,
    subject: 'Tu cita ha sido confirmada',
    html: `
      <h2>Cita confirmada</h2>
      <p>Hola ${appointment.clientName},</p>
      <p>Tu cita ha sido aprobada para el <strong>${formatDate(appointment.startsAt)}</strong>.</p>
      <p>Gracias por confiar en nosotros.</p>
    `
  });
}

export async function sendClientRejected(appointment: {
  clientEmail: string;
  clientName: string;
  startsAt: Date;
  adminNotes?: string | null;
}) {
  await sendEmail({
    to: appointment.clientEmail,
    subject: 'No hemos podido confirmar tu cita',
    html: `
      <h2>Solicitud de cita rechazada</h2>
      <p>Hola ${appointment.clientName},</p>
      <p>No hemos podido confirmar la cita solicitada para el <strong>${formatDate(appointment.startsAt)}</strong>.</p>
      ${appointment.adminNotes ? `<p><strong>Mensaje:</strong> ${appointment.adminNotes}</p>` : ''}
      <p>Puedes solicitar otro horario desde nuestra web.</p>
    `
  });
}

export async function sendClientReminder(appointment: {
  clientEmail: string;
  clientName: string;
  startsAt: Date;
}) {
  await sendEmail({
    to: appointment.clientEmail,
    subject: 'Recordatorio de tu cita',
    html: `
      <h2>Recordatorio de cita</h2>
      <p>Hola ${appointment.clientName},</p>
      <p>Te recordamos que tienes una cita confirmada el <strong>${formatDate(appointment.startsAt)}</strong>.</p>
    `
  });
}
