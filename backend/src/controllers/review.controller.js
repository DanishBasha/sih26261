import { query } from '../config/supabase.js';
import { sendNotificationEmail } from '../services/email.service.js';

export async function raiseDeficiency(req, res) {
  const { application_id, document_id, rule_id, clause, reason, reviewer_name = 'Scrutiny Committee' } = req.body;
  const appRes = await query(`
    UPDATE public.applications
    SET status = 'Deficiency raised', updated_at = now()
    WHERE id = $1
    RETURNING *
  `, [application_id]);

  if (!appRes.rows.length) return res.status(404).json({ success: false, error: 'Application not found' });
  const app = appRes.rows[0];

  await query(`
    INSERT INTO public.validation_findings (
      application_id, document_id, rule_id, finding_type,
      clause_reference, message, explanation, reviewed_by
    )
    VALUES ($1, $2, $3, 'deficiency', $4, $5, $6, $7)
  `, [
    application_id,
    document_id || null,
    rule_id || 'GENERAL',
    clause || 'AICTE Handbook Clause',
    'Deficiency Raised by Reviewer',
    reason,
    reviewer_name
  ]);

  sendNotificationEmail({
    to: app.institution_email,
    subject: `Deficiency Raised: Application ${app.application_number}`,
    html: `<h3>AICTE Scrutiny: Deficiency Notice</h3><p>A deficiency has been raised on your application: "${reason}". Clause: ${clause || 'General'}</p>`
  }).catch(e => console.error(e));

  res.json({ success: true, application: app });
}

export async function approve(req, res) {
  const { application_id, remarks = 'Compliant with AICTE norms' } = req.body;
  const appRes = await query(`
    UPDATE public.applications
    SET status = 'Decision recorded', updated_at = now()
    WHERE id = $1
    RETURNING *
  `, [application_id]);

  if (!appRes.rows.length) return res.status(404).json({ success: false, error: 'Application not found' });
  const app = appRes.rows[0];

  sendNotificationEmail({
    to: app.institution_email,
    subject: `Approval Granted: Application ${app.application_number}`,
    html: `<h3>AICTE Approval Granted</h3><p>Application ${app.application_number} has been officially approved. Remarks: ${remarks}</p>`
  }).catch(e => console.error(e));

  res.json({ success: true, application: app });
}

export async function overrideFinding(req, res) {
  const { finding_id, override_reason, reviewer_name = 'Authorized Official' } = req.body;
  const result = await query(`
    UPDATE public.validation_findings
    SET is_overridden = true,
        override_reason = $1,
        reviewed_by = $2,
        finding_type = 'passed'
    WHERE id = $3
    RETURNING *
  `, [override_reason, reviewer_name, finding_id]);

  res.json({ success: true, finding: result.rows[0] });
}
