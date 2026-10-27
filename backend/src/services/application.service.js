import { query } from '../config/supabase.js';
import { sendNotificationEmail } from './email.service.js';

export async function listApplications() {
  const res = await query(`
    SELECT 
      a.*,
      COUNT(DISTINCT d.id) AS document_count,
      COUNT(DISTINCT CASE WHEN vf.finding_type = 'deficiency' THEN vf.id END) AS deficiency_count,
      COUNT(DISTINCT CASE WHEN vf.finding_type = 'passed' THEN vf.id END) AS passed_count
    FROM public.applications a
    LEFT JOIN public.uploaded_documents d ON a.id = d.application_id
    LEFT JOIN public.validation_findings vf ON a.id = vf.application_id
    GROUP BY a.id
    ORDER BY a.created_at DESC
  `);
  return res.rows;
}

export async function createApplication({ institution_name, institution_email, category, academic_year }) {
  const appNumber = `AICTE-${Date.now().toString().slice(-6)}`;
  const res = await query(`
    INSERT INTO public.applications (application_number, institution_name, institution_email, category, academic_year, status)
    VALUES ($1, $2, $3, $4, $5, 'Draft')
    RETURNING *
  `, [appNumber, institution_name, institution_email, category, academic_year || '2025-26']);
  const app = res.rows[0];

  sendNotificationEmail({
    to: institution_email,
    subject: `Application Initiated: ${app.application_number} (${category})`,
    html: `<h3>AICTE Scrutiny Portal</h3><p>Your application <strong>${app.application_number}</strong> has been created in Draft status.</p>`
  }).catch(e => console.error(e));

  return app;
}

export async function getApplicationById(id) {
  const appRes = await query('SELECT * FROM public.applications WHERE id = $1', [id]);
  if (!appRes.rows.length) return null;

  const docsRes = await query('SELECT * FROM public.uploaded_documents WHERE application_id = $1 ORDER BY uploaded_at DESC', [id]);
  const findingsRes = await query('SELECT * FROM public.validation_findings WHERE application_id = $1 ORDER BY created_at DESC', [id]);

  return {
    application: appRes.rows[0],
    documents: docsRes.rows,
    findings: findingsRes.rows
  };
}

export async function submitApplication(id) {
  const res = await query(`
    UPDATE public.applications
    SET status = 'Review required', submitted_at = now(), updated_at = now()
    WHERE id = $1
    RETURNING *
  `, [id]);
  return res.rows[0];
}
