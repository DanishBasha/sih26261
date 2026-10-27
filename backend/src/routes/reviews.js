import express from 'express';
import { query } from '../db.js';
import { sendEmail } from '../services/emailService.js';

const router = express.Router();

/**
 * POST /api/reviews/deficiency
 * Official Reviewer raises a deficiency on an application
 */
router.post('/deficiency', async (req, res) => {
  try {
    const { application_id, document_id, rule_id, clause, reason, reviewer_name = 'Scrutiny Committee' } = req.body;
    if (!application_id || !reason) {
      return res.status(400).json({ success: false, error: 'application_id and reason are required' });
    }

    // Update application status
    const appRes = await query(`
      UPDATE public.applications
      SET status = 'Deficiency raised', updated_at = now()
      WHERE id = $1
      RETURNING *
    `, [application_id]);

    if (appRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }
    const app = appRes.rows[0];

    // Log finding
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

    // Send instant email notification via Gmail SMTP
    const emailResult = await sendEmail({
      to: app.institution_email,
      subject: `Deficiency Raised: Application ${app.application_number}`,
      text: `A deficiency has been raised on your AICTE application ${app.application_number}: ${reason}. Please log in to your dashboard to respond and upload corrected documents.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; border: 1px solid #fed7d7; border-radius: 8px; background: #fffaf0;">
          <h2 style="color: #c53030; margin-top: 0;">AICTE Scrutiny: Deficiency Notice</h2>
          <p>Dear <strong>${app.institution_name}</strong>,</p>
          <p>During the scrutiny of your application <strong>${app.application_number}</strong> (${app.category}), the Scrutiny Committee recorded the following deficiency:</p>
          <blockquote style="background: white; border-left: 4px solid #e53e3e; margin: 16px 0; padding: 12px 16px; font-style: italic;">
            "${reason}"
          </blockquote>
          ${clause ? `<p><strong>Applicable Rule / Clause:</strong> ${clause}</p>` : ''}
          <p><strong>Required Action:</strong> Please log in to the institution portal immediately to review the observation and upload the rectified document.</p>
          <hr style="border: none; border-top: 1px solid #feebc8; margin: 20px 0;" />
          <p style="color: #742a2a; font-size: 13px;">Official Scrutiny Commitee | AICTE Regulatory Compliance System</p>
        </div>
      `,
      applicationId: app.id
    });

    res.json({
      success: true,
      message: 'Deficiency recorded and email notification dispatched',
      application: app,
      emailSent: emailResult.success
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/reviews/approve
 * Official Reviewer records an approval decision
 */
router.post('/approve', async (req, res) => {
  try {
    const { application_id, remarks = 'Compliant with all AICTE norms', reviewer_name = 'Scrutiny Committee' } = req.body;
    if (!application_id) {
      return res.status(400).json({ success: false, error: 'application_id is required' });
    }

    const appRes = await query(`
      UPDATE public.applications
      SET status = 'Decision recorded', updated_at = now()
      WHERE id = $1
      RETURNING *
    `, [application_id]);

    if (appRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }
    const app = appRes.rows[0];

    // Send congratulatory approval email
    sendEmail({
      to: app.institution_email,
      subject: `Approval Granted: Application ${app.application_number}`,
      text: `Congratulations! Your AICTE application ${app.application_number} has been approved by the Scrutiny Committee.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 24px; border: 1px solid #c6f6d5; border-radius: 8px; background: #f0fff4;">
          <h2 style="color: #276749; margin-top: 0;">AICTE Approval Granted</h2>
          <p>Dear <strong>${app.institution_name}</strong>,</p>
          <p>We are pleased to inform you that your application <strong>${app.application_number}</strong> (${app.category}) has been verified and found fully compliant with all applicable AICTE handbook requirements.</p>
          <p><strong>Reviewer Remarks:</strong> ${remarks}</p>
          <hr style="border: none; border-top: 1px solid #c6f6d5; margin: 20px 0;" />
          <p style="color: #22543d; font-size: 13px;">Approval Process System | AICTE SIH26261</p>
        </div>
      `,
      applicationId: app.id
    }).catch(e => console.error('Approval email error:', e));

    res.json({ success: true, application: app });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/reviews/override
 * Reviewer overrides an automated AI deficiency / flag
 */
router.post('/override', async (req, res) => {
  try {
    const { finding_id, override_reason, reviewer_name = 'Authorized Official' } = req.body;
    if (!finding_id || !override_reason) {
      return res.status(400).json({ success: false, error: 'finding_id and override_reason are required' });
    }

    const result = await query(`
      UPDATE public.validation_findings
      SET is_overridden = true,
          override_reason = $1,
          reviewed_by = $2,
          finding_type = 'passed'
      WHERE id = $3
      RETURNING *
    `, [override_reason, reviewer_name, finding_id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Finding not found' });
    }

    res.json({
      success: true,
      message: 'AI finding overridden by authorized official',
      finding: result.rows[0]
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
