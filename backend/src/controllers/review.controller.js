import { query } from '../config/supabase.js';
import { 
  sendApprovalEmail, 
  sendApprovalWithAnomaliesEmail, 
  sendAdminAnomalyAlertEmail, 
  sendRejectionEmail, 
  sendDeficiencyEmail 
} from '../services/email.service.js';

/**
 * 1. Approve Application
 * Records decision, updates status, logs in notification_logs, dispatches approval email.
 */
export async function approve(req, res) {
  try {
    const { application_id, remarks = 'Compliant with AICTE norms' } = req.body;
    const reviewerName = req.user?.full_name || 'AICTE Scrutiny Committee';

    const appRes = await query(`
      UPDATE public.applications
      SET status = 'Approved', updated_at = now()
      WHERE id = $1
      RETURNING *
    `, [application_id]);

    if (!appRes.rows.length) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }
    const app = appRes.rows[0];

    // Record finding/decision audit entry
    await query(`
      INSERT INTO public.validation_findings (
        application_id, rule_id, finding_type, clause_reference, message, explanation, reviewed_by
      )
      VALUES ($1, 'DECISION', 'passed', 'AICTE Approval Norms', 'Official Approval Granted', $2, $3)
    `, [application_id, remarks, reviewerName]);

    // Record in-app / delivery notification log
    const subject = `AICTE Formal Approval Granted: Application ${app.application_number}`;
    await query(`
      INSERT INTO public.notification_logs (application_id, recipient_email, subject, status)
      VALUES ($1, $2, $3, 'sent')
    `, [application_id, app.institution_email, subject]);

    // Dispatch formal decision email
    sendApprovalEmail({
      to: app.institution_email,
      institutionName: app.institution_name,
      applicationNumber: app.application_number,
      category: app.category,
      remarks
    }).catch(e => console.error('Approval email error:', e));

    res.json({ success: true, decision: 'Approved', application: app });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * 2. Approve Application with Anomalies
 * Records decision, updates status, logs findings.
 * SENDS TWO EMAILS:
 *  a) Decision email to the institution.
 *  b) Higher-level administrator oversight alert to admin@aicte.gov.in.
 */
export async function approveWithAnomalies(req, res) {
  try {
    const { application_id, remarks, anomalies } = req.body;
    const reviewerName = req.user?.full_name || 'AICTE Scrutiny Committee';

    if (!anomalies || !anomalies.trim()) {
      return res.status(400).json({ success: false, error: 'Anomaly description is required for conditional approval.' });
    }

    const appRes = await query(`
      UPDATE public.applications
      SET status = 'Approved with anomalies', updated_at = now()
      WHERE id = $1
      RETURNING *
    `, [application_id]);

    if (!appRes.rows.length) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }
    const app = appRes.rows[0];

    // Record anomaly finding
    await query(`
      INSERT INTO public.validation_findings (
        application_id, rule_id, finding_type, clause_reference, message, explanation, reviewed_by
      )
      VALUES ($1, 'ANOMALY_APPROVAL', 'warning', 'AICTE Chapter II Condition', 'Approved with Identified Anomalies', $2, $3)
    `, [application_id, `Anomalies: ${anomalies}. Remarks: ${remarks || 'Conditional approval granted.'}`, reviewerName]);

    // 1. Institution Decision Notification Log & Email
    const instSubject = `Conditional Approval Granted (With Anomalies): Application ${app.application_number}`;
    await query(`
      INSERT INTO public.notification_logs (application_id, recipient_email, subject, status)
      VALUES ($1, $2, $3, 'sent')
    `, [application_id, app.institution_email, instSubject]);

    sendApprovalWithAnomaliesEmail({
      to: app.institution_email,
      institutionName: app.institution_name,
      applicationNumber: app.application_number,
      category: app.category,
      anomalies,
      remarks: remarks || 'Conditional approval subject to addressing identified anomalies before EVC inspection.'
    }).catch(e => console.error('Institution anomaly email error:', e));

    // 2. CRITICAL (Section 1.5, 2.2): Alert Higher-Level Administrators
    const adminSubject = `[OVERSIGHT ALERT] Application Approved with Anomalies: ${app.application_number} (${app.institution_name})`;
    const adminEmail = 'admin@aicte.gov.in';

    await query(`
      INSERT INTO public.notification_logs (application_id, recipient_email, subject, status)
      VALUES ($1, $2, $3, 'sent')
    `, [application_id, adminEmail, adminSubject]);

    sendAdminAnomalyAlertEmail({
      to: adminEmail,
      scrutinyOfficer: reviewerName,
      institutionName: app.institution_name,
      institutionEmail: app.institution_email,
      applicationNumber: app.application_number,
      category: app.category,
      anomalies,
      remarks: remarks || 'No additional remarks'
    }).catch(e => console.error('Admin oversight alert email error:', e));

    res.json({ success: true, decision: 'Approved with anomalies', application: app });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * 3. Reject Application
 * Records decision, updates status to 'Rejected', logs finding, dispatches formal rejection email.
 */
export async function reject(req, res) {
  try {
    const { application_id, reason, clause = 'AICTE Approval Process Handbook Regulations' } = req.body;
    const reviewerName = req.user?.full_name || 'AICTE Scrutiny Committee';

    if (!reason || !reason.trim()) {
      return res.status(400).json({ success: false, error: 'Rejection reason is required.' });
    }

    const appRes = await query(`
      UPDATE public.applications
      SET status = 'Rejected', updated_at = now()
      WHERE id = $1
      RETURNING *
    `, [application_id]);

    if (!appRes.rows.length) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }
    const app = appRes.rows[0];

    // Record rejection finding
    await query(`
      INSERT INTO public.validation_findings (
        application_id, rule_id, finding_type, clause_reference, message, explanation, reviewed_by
      )
      VALUES ($1, 'REJECTION', 'deficiency', $2, 'Application Non-Compliance & Rejection', $3, $4)
    `, [application_id, clause, reason, reviewerName]);

    // Record notification log
    const subject = `AICTE Scrutiny Decision: Application ${app.application_number} Rejected`;
    await query(`
      INSERT INTO public.notification_logs (application_id, recipient_email, subject, status)
      VALUES ($1, $2, $3, 'sent')
    `, [application_id, app.institution_email, subject]);

    sendRejectionEmail({
      to: app.institution_email,
      institutionName: app.institution_name,
      applicationNumber: app.application_number,
      category: app.category,
      reason,
      clauseReference: clause
    }).catch(e => console.error('Rejection email error:', e));

    res.json({ success: true, decision: 'Rejected', application: app });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * 4. Raise Regulatory Deficiency
 */
export async function raiseDeficiency(req, res) {
  try {
    const { application_id, document_id, rule_id, clause, reason, reviewer_name } = req.body;
    const reviewer = reviewer_name || req.user?.full_name || 'Scrutiny Committee';

    const appRes = await query(`
      UPDATE public.applications
      SET status = 'Deficiency raised', updated_at = now()
      WHERE id = $1
      RETURNING *
    `, [application_id]);

    if (!appRes.rows.length) {
      return res.status(404).json({ success: false, error: 'Application not found' });
    }
    const app = appRes.rows[0];

    await query(`
      INSERT INTO public.validation_findings (
        application_id, document_id, rule_id, finding_type,
        clause_reference, message, explanation, reviewed_by
      )
      VALUES ($1, $2, $3, 'deficiency', $4, 'Deficiency Raised by Reviewer', $5, $6)
    `, [
      application_id,
      document_id || null,
      rule_id || 'GENERAL',
      clause || 'AICTE Handbook Clause',
      reason,
      reviewer
    ]);

    const subject = `AICTE Deficiency Notice: Application ${app.application_number}`;
    await query(`
      INSERT INTO public.notification_logs (application_id, recipient_email, subject, status)
      VALUES ($1, $2, $3, 'sent')
    `, [application_id, app.institution_email, subject]);

    sendDeficiencyEmail({
      to: app.institution_email,
      institutionName: app.institution_name,
      applicationNumber: app.application_number,
      reason,
      clauseReference: clause || 'General Handbook Norms'
    }).catch(e => console.error('Deficiency email error:', e));

    res.json({ success: true, application: app });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

/**
 * 5. Override Finding
 */
export async function overrideFinding(req, res) {
  try {
    const { finding_id, override_reason, reviewer_name } = req.body;
    const reviewer = reviewer_name || req.user?.full_name || 'Authorized Official';

    const result = await query(`
      UPDATE public.validation_findings
      SET is_overridden = true,
          override_reason = $1,
          reviewed_by = $2,
          finding_type = 'passed'
      WHERE id = $3
      RETURNING *
    `, [override_reason, reviewer, finding_id]);

    res.json({ success: true, finding: result.rows[0] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
