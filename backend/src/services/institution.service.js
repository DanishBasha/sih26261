import { query } from '../config/supabase.js';

export async function getInstitutionProfile(id) {
  const res = await query('SELECT * FROM public.institutions WHERE id = $1', [id]);
  return res.rows[0];
}

export async function updateInstitutionProfile(id, data) {
  const { name, address, contact_email, phone } = data;
  const res = await query(`
    UPDATE public.institutions
    SET name = COALESCE($1, name),
        contact_email = COALESCE($2, contact_email),
        updated_at = now()
    WHERE id = $3
    RETURNING *
  `, [name, contact_email, id]);
  return res.rows[0];
}
