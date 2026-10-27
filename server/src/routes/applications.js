import express from 'express';
import { query } from '../db.js';
import { sendEmail } from '../services/emailService.js';

const router = express.Router();

/**
 * GET /api/applications
 * Returns all submitted applications with document and finding counts
 */
router.get('/', async (req, res) => {
  try {
    const result = await query(`
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
    res.json({ success: true, applications: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/applications
 * Create a new application
 */
router.post('/', async (req, res) => {
  try {
    const { institution_name, institution_email, category, academic_year = '2025-26' } = req.body;
    if (!institution_name || !institution_email || !category) {
      return res.status(400).json({ success: false, error: 'institution_name, institution_email, and category are required' });
    }

    const appNumber = `AICTE-${Date.now().toString().slice(-6)}`;
    const result = await query(`
      INSERT INTO public.applications (application_number, institution_name, institution_email, category, academic_year, status)
      VALUES ($1, $2, $3, $4, $5, 'Draft')
      RETURNING *
    `, [appNumber, institution_name, institution_email, category, academic_year]);

    const app = result.rows[0];

    // Send confirmation email
    sendEmail({
      to: institution_email,
      subject: `Application Initiated: ${app.application_number} (${category})`,
      text: `Your AICTE application ${app.application_number} has been created in Draft status. Please upload all required documents.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #2b6cb0;">AICTE Scrutiny & Compliance Portal</h2>
          <p>Dear <strong>${institution_name}</strong>,</p>
          <p>Your application <strong>${app.application_number}</strong> for category <em>"${category}"</em> has been initialized.</p>
          <p>Please log in to your institution dashboard to review the generated checklist and upload all mandatory certificates.</p>
          <hr style="border: none; border-top: 1px solid #edf2f7; margin: 20px 0;" />
          <p style="color: #718096; font-size: 13px;">AICTE Approval Process Handbook Compliance System (SIH26261)</p>
        </div>
      `,
      applicationId: app.id
    }).catch(e => console.error('Email error:', e));

    res.status(201).json({ success: true, application: app });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/applications/:id
 * Retrieve single application with all documents and findings
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const appRes = await query('SELECT * FROM public.applications WHERE id = $1', [id]);
    if (appRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    const docsRes = await query(`
      SELECT * FROM public.uploaded_documents 
      WHERE application_id = $1 
      ORDER BY uploaded_at DESC
    `, [id]);

    const findingsRes = await query(`
      SELECT * FROM public.validation_findings 
      WHERE application_id = $1 
      ORDER BY created_at DESC
    `, [id]);

    res.json({
      success: true,
      application: appRes.rows[0],
      documents: docsRes.rows,
      findings: findingsRes.rows
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * PATCH /api/applications/:id/submit
 * Submits the application for official review
 */
router.patch('/:id/submit', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query(`
      UPDATE public.applications
      SET status = 'Review required', submitted_at = now(), updated_at = now()
      WHERE id = $1
      RETURNING *
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }

    const app = result.rows[0];

    // Send submission confirmation email
    sendEmail({
      to: app.institution_email,
      subject: `Application Submitted for Scrutiny: ${app.application_number}`,
      text: `Your AICTE application ${app.application_number} is now under official review.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #2b6cb0;">Application Successfully Submitted</h2>
          <p>Dear <strong>${app.institution_name}</strong>,</p>
          <p>Your application <strong>${app.application_number}</strong> has been submitted and queued for scrutiny by AICTE review committees.</p>
          <p>You can track findings, reviewer observations, or deficiency notices directly from your dashboard.</p>
        </div>
      `,
      applicationId: app.id
    }).catch(e => console.error('Email error:', e));

    res.json({ success: true, application: app });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
