import { query } from '../config/supabase.js';
import { 
  sendApprovalEmail, 
  sendApprovalWithAnomaliesEmail, 
  sendAdminAnomalyAlertEmail, 
  sendRejectionEmail, 
  sendDeficiencyEmail 
} from '../services/email.service.js';

export async function list(req, res) {
  try {
    const result = await query('SELECT * FROM public.notification_logs ORDER BY sent_at DESC LIMIT 50');
    res.json({ success: true, notifications: result.rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function sendTestEmail(req, res) {
  try {
    const { type = 'approved', recipient_email } = req.body;
    const targetEmail = recipient_email || req.user?.email || 'danishbasha18@gmail.com';
    const appNum = `AICTE-2025-${Math.floor(100000 + Math.random() * 900000)}`;
    const instName = 'Apex Institute of Technology';

    let result;
    if (type === 'approved') {
      result = await sendApprovalEmail({
        to: targetEmail,
        institutionName: instName,
        applicationNumber: appNum,
        category: 'New Technical Institution',
        remarks: 'All 140 regulatory norms verified compliant under AICTE Handbook 2024-25.'
      });
      await query(`
        INSERT INTO public.notification_logs (recipient_email, subject, status)
        VALUES ($1, $2, 'sent')
      `, [targetEmail, `AICTE Formal Approval Granted: Application ${appNum}`]);
    } else if (type === 'approved_with_anomalies') {
      // Sends institution email + admin oversight alert
      result = await sendApprovalWithAnomaliesEmail({
        to: targetEmail,
        institutionName: instName,
        applicationNumber: appNum,
        category: 'New Technical Institution',
        anomalies: 'Fire Safety NOC renewal under processing; temporary municipal certificate attached.',
        remarks: 'Conditional clearance granted. Rectification required before EVC visit.'
      });
      await query(`
        INSERT INTO public.notification_logs (recipient_email, subject, status)
        VALUES ($1, $2, 'sent')
      `, [targetEmail, `Conditional Approval Granted (With Anomalies): Application ${appNum}`]);

      // Admin oversight alert
      await sendAdminAnomalyAlertEmail({
        to: 'admin@aicte.gov.in',
        scrutinyOfficer: 'AICTE Scrutiny Committee',
        institutionName: instName,
        institutionEmail: targetEmail,
        applicationNumber: appNum,
        category: 'New Technical Institution',
        anomalies: 'Fire Safety NOC renewal under processing.',
        remarks: 'Conditional approval recorded.'
      });
      await query(`
        INSERT INTO public.notification_logs (recipient_email, subject, status)
        VALUES ($1, $2, 'sent')
      `, ['admin@aicte.gov.in', `[OVERSIGHT ALERT] Application Approved with Anomalies: ${appNum} (${instName})`]);
    } else if (type === 'rejected') {
      result = await sendRejectionEmail({
        to: targetEmail,
        institutionName: instName,
        applicationNumber: appNum,
        category: 'New Technical Institution',
        reason: 'Failure to provide registered 30-year lease deed in accordance with statutory requirements.',
        clauseReference: 'AICTE Approval Process Handbook Chapter I, Clause 1.4.3'
      });
      await query(`
        INSERT INTO public.notification_logs (recipient_email, subject, status)
        VALUES ($1, $2, 'sent')
      `, [targetEmail, `AICTE Scrutiny Decision: Application ${appNum} Rejected`]);
    } else {
      result = await sendDeficiencyEmail({
        to: targetEmail,
        institutionName: instName,
        applicationNumber: appNum,
        reason: 'Bank Guarantee / Financial Certificate 3 needs official seal of Bank Branch Manager.',
        clauseReference: 'AICTE Approval Process Handbook Annexure 1, Clause 1.1(vi)'
      });
      await query(`
        INSERT INTO public.notification_logs (recipient_email, subject, status)
        VALUES ($1, $2, 'sent')
      `, [targetEmail, `AICTE Deficiency Notice: Application ${appNum}`]);
    }

    res.json({ success: true, message: `Test ${type} email dispatched to ${targetEmail}`, result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}
