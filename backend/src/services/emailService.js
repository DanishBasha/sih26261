import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Send an email and log it to the database
 */
export async function sendEmail({ to, subject, text, html, applicationId = null }) {
  try {
    const info = await transporter.sendMail({
      from: `"AICTE Compliance Verification Portal" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html
    });

    console.log(`📧 Notification email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Email send error to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}
