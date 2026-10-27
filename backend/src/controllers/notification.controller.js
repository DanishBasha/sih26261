import { query } from '../config/supabase.js';

export async function list(req, res) {
  const result = await query('SELECT * FROM public.notification_logs ORDER BY sent_at DESC LIMIT 50');
  res.json({ success: true, notifications: result.rows });
}
