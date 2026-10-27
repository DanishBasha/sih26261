import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS
  }
});

export async function sendNotificationEmail({ to, subject, text, html }) {
  try {
    const info = await transporter.sendMail({
      from: `"AICTE Compliance Verification Portal" <${env.EMAIL_USER}>`,
      to,
      subject,
      text: text || '',
      html: html || text
    });
    console.log(`📧 Notification email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Email send error to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}
