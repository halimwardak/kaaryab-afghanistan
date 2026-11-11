import { messageFor } from '../../../locales/catalog.mjs';
import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
export const mailConfigured = () => Boolean(process.env.SMTP_HOST && process.env.MAIL_FROM);
export async function sendReset(email, token, locale = 'en') {
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    requireTLS: process.env.SMTP_SECURE !== 'true',
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    connectionTimeout: 10000, socketTimeout: 10000,
  });
  const link = new URL('/account', env.FRONTEND_URL);
  link.searchParams.set('reset', token);
  link.searchParams.set('lang',locale);
  await transport.sendMail({ from: process.env.MAIL_FROM, to: email, subject: messageFor(locale,'Reset your KaarYab password'), text: `${messageFor(locale,'Use this link within 30 minutes to reset your password:')} ${link}\n${messageFor(locale,'If you did not request this, ignore this email.')}` });
}
