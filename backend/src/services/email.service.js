import nodemailer from 'nodemailer';
import { env } from '../config/env.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.EMAIL_USER,
    pass: env.EMAIL_PASS
  }
});

const APP_URL = env.APP_URL || 'http://localhost:5174';

export async function sendNotificationEmail({ to, subject, text, html }) {
  try {
    const info = await transporter.sendMail({
      from: `"AICTE Regulatory Scrutiny Portal" <${env.EMAIL_USER}>`,
      to,
      subject,
      text: text || '',
      html: html || text
    });
    console.log(`📧 Notification email sent to ${to}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Email send error to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * 1. Application Approved Email
 * (Per SIH26261 Email Spec Section 1.2, 1.4, 2.1: Never email passwords, send secure portal link)
 */
export async function sendApprovalEmail({ to, institutionName, applicationNumber, category, remarks }) {
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%); padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 20px; font-weight: 700; letter-spacing: 0.5px;">ALL INDIA COUNCIL FOR TECHNICAL EDUCATION</h1>
        <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">Regulatory Approval & Compliance Scrutiny Desk (SIH26261)</p>
      </div>

      <div style="padding: 24px;">
        <div style="display: inline-block; background: #ecfdf5; border: 1px solid #a7f3d0; color: #047857; font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 4px 10px; rounded-full; border-radius: 9999px; margin-bottom: 16px;">
          ✓ Official Decision: Approved
        </div>

        <h2 style="color: #0f172a; font-size: 18px; margin-top: 0;">Formal Regulatory Approval Granted</h2>
        <p style="color: #334155; font-size: 13px; line-height: 1.6;">
          Dear Authorized Representative of <strong>${institutionName || 'the Institution'}</strong>,
        </p>
        <p style="color: #334155; font-size: 13px; line-height: 1.6;">
          We are pleased to inform you that your application for AICTE Approval has successfully passed statutory scrutiny and document authentication in accordance with the <strong>AICTE Approval Process Handbook (Annexures 1 & 2)</strong>.
        </p>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <table style="width: 100%; font-size: 12px; color: #334155; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; width: 40%;">Application Number:</td>
              <td style="padding: 6px 0; font-weight: bold; font-family: monospace;">${applicationNumber}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Category:</td>
              <td style="padding: 6px 0; font-weight: bold;">${category || 'Technical Institution Approval'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Decision:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #059669;">APPROVED</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Scrutiny Remarks:</td>
              <td style="padding: 6px 0; font-style: italic;">"${remarks || 'All statutory and regulatory handbook requirements verified.'}"</td>
            </tr>
          </table>
        </div>

        <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 12px 16px; margin: 20px 0; border-radius: 4px;">
          <p style="margin: 0; font-size: 12px; color: #065f46; line-height: 1.5;">
            <strong>Secure Portal Access:</strong> In compliance with security standards, passwords are never emailed. Your authorized representative can log in to the portal using their secure credentials.
          </p>
        </div>

        <div style="text-align: center; margin: 24px 0;">
          <a href="${APP_URL}" style="background: #0284c7; color: #ffffff; text-decoration: none; padding: 12px 24px; font-size: 13px; font-weight: 700; border-radius: 8px; display: inline-block;">
            Sign In to Institution Portal & Download Letter
          </a>
        </div>

        <p style="font-size: 11px; color: #94a3b8; line-height: 1.4; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
          This is an official system-generated notification from the AICTE Scrutiny & Compliance System (SIH26261). Please do not reply directly to this automated email.
        </p>
      </div>
    </div>
  `;

  return sendNotificationEmail({
    to,
    subject: `AICTE Formal Approval Granted: Application ${applicationNumber}`,
    html
  });
}

/**
 * 2. Application Approved with Anomalies Email (To Institution)
 * (Per SIH26261 Email Spec Section 1.2, 1.5, 2.2)
 */
export async function sendApprovalWithAnomaliesEmail({ to, institutionName, applicationNumber, category, anomalies, remarks }) {
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #d97706 0%, #b45309 100%); padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 20px; font-weight: 700;">ALL INDIA COUNCIL FOR TECHNICAL EDUCATION</h1>
        <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">Scrutiny Committee Findings (SIH26261)</p>
      </div>

      <div style="padding: 24px;">
        <div style="display: inline-block; background: #fef3c7; border: 1px solid #fde68a; color: #92400e; font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 4px 10px; border-radius: 9999px; margin-bottom: 16px;">
          ⚠ Decision: Approved with Anomalies
        </div>

        <h2 style="color: #0f172a; font-size: 18px; margin-top: 0;">Conditional Approval Notice</h2>
        <p style="color: #334155; font-size: 13px; line-height: 1.6;">
          Dear Authorized Representative of <strong>${institutionName || 'the Institution'}</strong>,
        </p>
        <p style="color: #334155; font-size: 13px; line-height: 1.6;">
          Your application has been granted <strong>Conditional Approval</strong> subject to compliance with the specific anomalies and regulatory conditions identified by the Scrutiny Committee below:
        </p>

        <div style="background: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px; padding: 14px; margin: 16px 0;">
          <h4 style="margin: 0 0 6px 0; color: #92400e; font-size: 12px; text-transform: uppercase;">Identified Anomalies & Required Rectifications:</h4>
          <p style="margin: 0; color: #78350f; font-size: 13px; line-height: 1.5; font-weight: 600;">
            ${anomalies}
          </p>
        </div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <table style="width: 100%; font-size: 12px; color: #334155; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; width: 40%;">Application Number:</td>
              <td style="padding: 6px 0; font-weight: bold; font-family: monospace;">${applicationNumber}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Category:</td>
              <td style="padding: 6px 0; font-weight: bold;">${category || 'Technical Institution'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Reviewer Notes:</td>
              <td style="padding: 6px 0; font-style: italic;">"${remarks || 'Conditional approval granted. Higher-level oversight alert dispatched.'}"</td>
            </tr>
          </table>
        </div>

        <p style="color: #475569; font-size: 12px; line-height: 1.5;">
          <strong>Next Action Required:</strong> You must address the noted anomalies and submit compliance proof before the Expert Visit Committee (EVC) verification or as stipulated in AICTE Handbook Chapter II.
        </p>

        <div style="text-align: center; margin: 24px 0;">
          <a href="${APP_URL}" style="background: #d97706; color: #ffffff; text-decoration: none; padding: 12px 24px; font-size: 13px; font-weight: 700; border-radius: 8px; display: inline-block;">
            View Detailed Anomaly Dossier & Submit Compliance
          </a>
        </div>

        <p style="font-size: 11px; color: #94a3b8; line-height: 1.4; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
          Note: This decision record has been logged in the official regulatory audit register.
        </p>
      </div>
    </div>
  `;

  return sendNotificationEmail({
    to,
    subject: `Conditional Approval Granted (With Anomalies): Application ${applicationNumber}`,
    html
  });
}

/**
 * 3. Administrator Anomaly Oversight Alert (Per SIH26261 Email Spec Section 1.5, 2.2)
 * Dispatched to Higher-Level Administrators when an official approves an application with anomalies.
 */
export async function sendAdminAnomalyAlertEmail({ to, scrutinyOfficer, institutionName, institutionEmail, applicationNumber, category, anomalies, remarks }) {
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 620px; margin: 0 auto; border: 2px solid #f59e0b; border-radius: 12px; overflow: hidden; background: #ffffff;">
      <div style="background: #78350f; padding: 20px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 16px; font-weight: 800; letter-spacing: 1px; color: #fde68a;">
          🛡️ AICTE HIGHER-LEVEL OVERSIGHT AUDIT ALERT
        </h1>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #fef3c7;">
          Automated Regulatory Escalation — Application Approved with Anomalies
        </p>
      </div>

      <div style="padding: 24px;">
        <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 8px; padding: 14px; margin-bottom: 16px;">
          <strong style="color: #92400e; font-size: 12px; text-transform: uppercase;">Executive Attention Required:</strong>
          <p style="margin: 4px 0 0 0; color: #78350f; font-size: 13px; line-height: 1.5;">
            An authorized scrutiny committee officer has recorded an <strong>"Approved with Anomalies"</strong> decision. In accordance with the SIH26261 Governance Specification, this alert is dispatched for higher-level administrative oversight.
          </p>
        </div>

        <table style="width: 100%; font-size: 12px; color: #1e293b; border-collapse: collapse; margin-bottom: 16px;">
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Application ID:</td>
            <td style="padding: 8px 0; font-family: monospace; font-weight: bold; color: #0284c7;">${applicationNumber}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Institution Name:</td>
            <td style="padding: 8px 0; font-weight: bold;">${institutionName}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Institution Email:</td>
            <td style="padding: 8px 0;">${institutionEmail}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Application Category:</td>
            <td style="padding: 8px 0;">${category || 'Technical Institution'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Scrutiny Officer:</td>
            <td style="padding: 8px 0; font-weight: bold; color: #0f172a;">${scrutinyOfficer || 'Authorized Scrutiny Committee'}</td>
          </tr>
          <tr style="border-bottom: 1px solid #f1f5f9;">
            <td style="padding: 8px 0; color: #64748b; font-weight: 600;">Decision Timestamp:</td>
            <td style="padding: 8px 0;">${new Date().toUTCString()}</td>
          </tr>
        </table>

        <div style="background: #fef2f2; border: 1px solid #fee2e2; border-left: 4px solid #ef4444; border-radius: 4px; padding: 12px 16px; margin: 16px 0;">
          <span style="font-size: 11px; font-weight: 800; text-transform: uppercase; color: #991b1b; display: block; margin-bottom: 4px;">
            Permitted Anomalies / Conditional Waive Details:
          </span>
          <p style="margin: 0; font-size: 13px; color: #7f1d1d; font-family: monospace; white-space: pre-wrap;">${anomalies}</p>
        </div>

        <p style="font-size: 12px; color: #475569;">
          <strong>Officer Remarks:</strong> "${remarks || 'Approved with conditions.'}"
        </p>

        <div style="text-align: center; margin: 24px 0;">
          <a href="${APP_URL}" style="background: #0f172a; color: #ffffff; text-decoration: none; padding: 12px 24px; font-size: 13px; font-weight: 700; border-radius: 8px; display: inline-block;">
            Open Administrator Audit Console
          </a>
        </div>
      </div>
    </div>
  `;

  return sendNotificationEmail({
    to,
    subject: `[OVERSIGHT ALERT] Application Approved with Anomalies: ${applicationNumber} (${institutionName})`,
    html
  });
}

/**
 * 4. Application Rejected Email
 * (Per SIH26261 Email Spec Section 1.2, 2.3)
 */
export async function sendRejectionEmail({ to, institutionName, applicationNumber, category, reason, clauseReference }) {
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #be123c 0%, #9f1239 100%); padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 20px; font-weight: 700;">ALL INDIA COUNCIL FOR TECHNICAL EDUCATION</h1>
        <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">Regulatory Scrutiny Committee Order (SIH26261)</p>
      </div>

      <div style="padding: 24px;">
        <div style="display: inline-block; background: #ffe4e6; border: 1px solid #fecdd3; color: #9f1239; font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 4px 10px; border-radius: 9999px; margin-bottom: 16px;">
          ✕ Decision: Rejected
        </div>

        <h2 style="color: #0f172a; font-size: 18px; margin-top: 0;">Notice of Application Rejection</h2>
        <p style="color: #334155; font-size: 13px; line-height: 1.6;">
          Dear Authorized Representative of <strong>${institutionName || 'the Institution'}</strong>,
        </p>
        <p style="color: #334155; font-size: 13px; line-height: 1.6;">
          This is to communicate the formal decision of the AICTE Scrutiny Committee regarding your application. After thorough examination of submitted documents against the Approval Process Handbook statutory norms, the application has been <strong>Rejected</strong> on the grounds stated below:
        </p>

        <div style="background: #fff1f2; border: 1px solid #ffe4e6; border-left: 4px solid #e11d48; border-radius: 4px; padding: 14px; margin: 16px 0;">
          <h4 style="margin: 0 0 6px 0; color: #9f1239; font-size: 12px; text-transform: uppercase;">
            Deficiency / Ground for Rejection:
          </h4>
          <p style="margin: 0; color: #881337; font-size: 13px; line-height: 1.5; font-weight: 600;">
            ${reason}
          </p>
          <p style="margin: 8px 0 0 0; font-size: 11px; color: #be123c;">
            <strong>Handbook Clause Reference:</strong> ${clauseReference || 'AICTE Approval Process Handbook Norms'}
          </p>
        </div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <table style="width: 100%; font-size: 12px; color: #334155; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #64748b; width: 40%;">Application Number:</td>
              <td style="padding: 6px 0; font-weight: bold; font-family: monospace;">${applicationNumber}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Category:</td>
              <td style="padding: 6px 0; font-weight: bold;">${category || 'Technical Institution Approval'}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #64748b;">Status:</td>
              <td style="padding: 6px 0; font-weight: bold; color: #be123c;">REJECTED</td>
            </tr>
          </table>
        </div>

        <p style="color: #475569; font-size: 12px; line-height: 1.5;">
          <strong>Right to Appeal / Representation:</strong> If permitted under applicable AICTE Handbook procedures, the applicant institution may submit an appeal / representation within the specified regulatory window through the portal.
        </p>

        <div style="text-align: center; margin: 24px 0;">
          <a href="${APP_URL}" style="background: #be123c; color: #ffffff; text-decoration: none; padding: 12px 24px; font-size: 13px; font-weight: 700; border-radius: 8px; display: inline-block;">
            Sign In to Review Order & Appeal Details
          </a>
        </div>
      </div>
    </div>
  `;

  return sendNotificationEmail({
    to,
    subject: `AICTE Scrutiny Decision: Application ${applicationNumber} Rejected`,
    html
  });
}

/**
 * 5. Deficiency Notice Email
 */
export async function sendDeficiencyEmail({ to, institutionName, applicationNumber, reason, clauseReference }) {
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background: #ffffff;">
      <div style="background: linear-gradient(135deg, #e11d48 0%, #be123c 100%); padding: 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 20px; font-weight: 700;">ALL INDIA COUNCIL FOR TECHNICAL EDUCATION</h1>
        <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">Regulatory Scrutiny Deficiency Notice (SIH26261)</p>
      </div>

      <div style="padding: 24px;">
        <h2 style="color: #0f172a; font-size: 18px; margin-top: 0;">Regulatory Deficiency Communicated</h2>
        <p style="color: #334155; font-size: 13px; line-height: 1.6;">
          Dear Authorized Representative of <strong>${institutionName || 'the Institution'}</strong>,
        </p>
        <p style="color: #334155; font-size: 13px; line-height: 1.6;">
          During scrutiny of Application <strong>${applicationNumber}</strong>, the Scrutiny Committee observed compliance deficiencies that must be addressed:
        </p>

        <div style="background: #fff1f2; border: 1px solid #ffe4e6; border-left: 4px solid #e11d48; border-radius: 4px; padding: 14px; margin: 16px 0;">
          <h4 style="margin: 0 0 6px 0; color: #9f1239; font-size: 12px; text-transform: uppercase;">Deficiency Reason:</h4>
          <p style="margin: 0; color: #881337; font-size: 13px; line-height: 1.5; font-weight: 600;">
            ${reason}
          </p>
          <p style="margin: 8px 0 0 0; font-size: 11px; color: #be123c;">
            <strong>Clause Reference:</strong> ${clauseReference || 'AICTE Norms'}
          </p>
        </div>

        <p style="color: #475569; font-size: 12px; line-height: 1.5;">
          Please sign in to the portal to upload the corrected documents or provide statutory clarification.
        </p>

        <div style="text-align: center; margin: 24px 0;">
          <a href="${APP_URL}" style="background: #e11d48; color: #ffffff; text-decoration: none; padding: 12px 24px; font-size: 13px; font-weight: 700; border-radius: 8px; display: inline-block;">
            Respond to Deficiency in Portal
          </a>
        </div>
      </div>
    </div>
  `;

  return sendNotificationEmail({
    to,
    subject: `AICTE Deficiency Notice: Application ${applicationNumber}`,
    html
  });
}
