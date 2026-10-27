import { query } from '../config/supabase.js';
import { sendNotificationEmail } from './email.service.js';

export async function createNotification({ recipient_email, subject, message, applicationId }) {
  await query(`
    INSERT INTO public.notification_logs (application_id, recipient_email, subject, status)
    VALUES ($1, $2, $3, 'sent')
  `, [applicationId || null, recipient_email, subject]);

  return sendNotificationEmail({ to: recipient_email, subject, html: message });
}
