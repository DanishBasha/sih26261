import { query } from '../config/supabase.js';
import { sendNotificationEmail } from './email.service.js';

export async function saveDetails(userId, data) {
  const {
    legal_name,
    institution_type,
    aicte_permanent_id,
    state,
    district,
    official_email,
    website,
    contact_number
  } = data;

  // Check if institution already exists for this user
  const userRes = await query('SELECT institution_id FROM public.user_profiles WHERE id = $1', [userId]);
  const existingInstId = userRes.rows[0]?.institution_id;

  let institution;
  if (existingInstId) {
    const res = await query(`
      UPDATE public.institutions
      SET legal_name = COALESCE($1, legal_name),
          institution_type = COALESCE($2, institution_type),
          aicte_permanent_id = COALESCE($3, aicte_permanent_id),
          state = COALESCE($4, state),
          district = COALESCE($5, district),
          official_email = COALESCE($6, official_email),
          website = COALESCE($7, website),
          contact_number = COALESCE($8, contact_number),
          updated_at = now()
      WHERE id = $9
      RETURNING *
    `, [legal_name, institution_type, aicte_permanent_id, state, district, official_email, website, contact_number, existingInstId]);
    institution = res.rows[0];
  } else {
    const res = await query(`
      INSERT INTO public.institutions (
        legal_name, institution_type, aicte_permanent_id, state, district,
        official_email, website, contact_number, submitted_by, verification_status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'draft')
      RETURNING *
    `, [legal_name, institution_type, aicte_permanent_id, state, district, official_email, website, contact_number, userId]);
    institution = res.rows[0];

    // Link institution to user profile
    await query('UPDATE public.user_profiles SET institution_id = $1 WHERE id = $2', [institution.id, userId]);
  }

  return institution;
}

export async function submitVerification(userId) {
  const userRes = await query('SELECT institution_id, email, full_name FROM public.user_profiles WHERE id = $1', [userId]);
  const instId = userRes.rows[0]?.institution_id;
  if (!instId) {
    throw new Error('Please save institution details first before requesting verification');
  }

  const res = await query(`
    UPDATE public.institutions
    SET verification_status = 'pending_verification', updated_at = now()
    WHERE id = $1
    RETURNING *
  `, [instId]);
  const institution = res.rows[0];

  sendNotificationEmail({
    to: userRes.rows[0].email,
    subject: `Institution Verification Submitted: ${institution.legal_name}`,
    html: `
      <p>Dear ${userRes.rows[0].full_name},</p>
      <p>Your institution details for <strong>${institution.legal_name}</strong> have been submitted for official scrutiny.</p>
      <p>Status: <strong>Pending Official Verification</strong></p>
    `
  }).catch(console.error);

  return institution;
}

export async function getVerificationStatus(userId) {
  const res = await query(`
    SELECT i.* 
    FROM public.institutions i
    JOIN public.user_profiles u ON u.institution_id = i.id
    WHERE u.id = $1
  `, [userId]);
  return res.rows[0] || null;
}

export async function listPendingVerifications() {
  const res = await query(`
    SELECT i.*, u.full_name as representative_name, u.email as representative_email, u.mobile_number
    FROM public.institutions i
    LEFT JOIN public.user_profiles u ON i.submitted_by = u.id
    ORDER BY i.updated_at DESC
  `);
  return res.rows;
}

export async function reviewVerification({ institution_id, decision, remarks, reviewer_name = 'Scrutiny Officer' }) {
  const res = await query(`
    UPDATE public.institutions
    SET verification_status = $1,
        verification_remarks = $2,
        updated_at = now()
    WHERE id = $3
    RETURNING *
  `, [decision, remarks, institution_id]);

  if (res.rows.length === 0) throw new Error('Institution not found');
  const institution = res.rows[0];

  // Send update email to institution email
  if (institution.official_email) {
    sendNotificationEmail({
      to: institution.official_email,
      subject: `Institution Verification Update: ${decision.toUpperCase()}`,
      html: `
        <p>Dear Institution Representative,</p>
        <p>Your institution verification status for <strong>${institution.legal_name}</strong> has been updated to: <strong>${decision}</strong>.</p>
        <p>Remarks: ${remarks || 'None'}</p>
        <p>Reviewer: ${reviewer_name}</p>
      `
    }).catch(console.error);
  }

  return institution;
}
