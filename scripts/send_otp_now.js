import { sendNotificationEmail } from '../backend/src/services/email.service.js';

async function send() {
  console.log('Sending email with OTP 692836 to danishbasha18@gmail.com...');
  const res = await sendNotificationEmail({
    to: 'danishbasha18@gmail.com',
    subject: 'Your AICTE Verification Code: 692836',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 500px;">
        <h2 style="color: #0284c7; margin-bottom: 8px;">AICTE Approval & Scrutiny Portal</h2>
        <p>Dear <strong>ARUNPRAVEEN</strong>,</p>
        <p>Your 6-digit email verification code for the AICTE Scrutiny System is:</p>
        <div style="background: #f0f9ff; border: 2px dashed #0284c7; border-radius: 8px; text-align: center; padding: 16px; margin: 16px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #0369a1;">692836</span>
        </div>
        <p style="font-size: 13px; color: #475569;">Enter this code on the registration page to activate your institution representative account.</p>
        <p style="font-size: 11px; color: #94a3b8; margin-top: 24px;">Smart India Hackathon • Problem Statement SIH26261</p>
      </div>
    `
  });
  console.log('Dispatch result:', res);
  process.exit(0);
}

send().catch(console.error);
