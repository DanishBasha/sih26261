import { query } from '../config/supabase.js';

export async function logAuditEvent({ actor, action, target_type, target_id, details }) {
  console.log(`[AUDIT LOG] ${new Date().toISOString()} | ${actor} performed ${action} on ${target_type}:${target_id}`);
}
