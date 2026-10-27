import crypto from 'crypto';
import { query } from '../config/supabase.js';
import { sendNotificationEmail } from './email.service.js';

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function registerInstitutionUser({ full_name, email, mobile_number, password, agree_terms }) {
  if (!agree_terms) {
    throw new Error('You must agree to the Terms of Use and Privacy Notice');
  }

  const normalizedEmail = email.trim().toLowerCase();

  // Check duplicate email
  const existing = await query('SELECT id FROM public.user_profiles WHERE email = $1', [normalizedEmail]);
  if (existing.rows.length > 0) {
    throw new Error('An account with this email address already exists');
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const passwordHash = hashPassword(password);

  const res = await query(`
    INSERT INTO public.user_profiles (
      email, password_hash, full_name, mobile_number, role, account_status, verification_code
    )
    VALUES ($1, $2, $3, $4, 'institution_user', 'pending_email_verification', $5)
    RETURNING id, email, full_name, role, account_status
  `, [normalizedEmail, passwordHash, full_name.trim(), mobile_number, code]);

  const user = res.rows[0];

  // Send verification code via email
  sendNotificationEmail({
    to: normalizedEmail,
    subject: 'Verify Your Email — AICTE Scrutiny Portal',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #0284c7;">AICTE Regulatory Verification</h2>
        <p>Dear <strong>${full_name}</strong>,</p>
        <p>Thank you for registering an institution representative account. Your 6-digit email verification code is:</p>
        <div style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #0f172a; padding: 12px 0;">
          ${code}
        </div>
        <p>Enter this code in your browser to verify your email address and continue institution onboarding.</p>
        <hr style="border: none; border-top: 1px solid #edf2f7; margin: 20px 0;" />
        <p style="color: #64748b; font-size: 12px;">AICTE Approval Process Handbook Portal (SIH26261)</p>
      </div>
    `
  }).catch(e => console.error('Verification email error:', e));

  return user;
}

export async function verifyEmail({ email, code }) {
  const normalizedEmail = email.trim().toLowerCase();
  const res = await query(`
    SELECT id, verification_code, account_status 
    FROM public.user_profiles 
    WHERE email = $1
  `, [normalizedEmail]);

  if (res.rows.length === 0) {
    throw new Error('Account not found');
  }

  const user = res.rows[0];
  if (user.verification_code !== code.trim()) {
    throw new Error('Invalid or expired verification code');
  }

  await query(`
    UPDATE public.user_profiles
    SET account_status = 'active', verification_code = NULL, updated_at = now()
    WHERE id = $1
  `, [user.id]);

  return { success: true, message: 'Email verified successfully. You may now complete institution onboarding.' };
}

export async function resendVerification({ email }) {
  const normalizedEmail = email.trim().toLowerCase();
  const res = await query('SELECT id, full_name, account_status FROM public.user_profiles WHERE email = $1', [normalizedEmail]);
  if (res.rows.length === 0) return { success: true }; // Prevent email enumeration

  const user = res.rows[0];
  if (user.account_status === 'active') {
    return { success: true, message: 'Account is already verified.' };
  }

  const newCode = Math.floor(100000 + Math.random() * 900000).toString();
  await query('UPDATE public.user_profiles SET verification_code = $1 WHERE id = $2', [newCode, user.id]);

  sendNotificationEmail({
    to: normalizedEmail,
    subject: 'Your New Verification Code — AICTE Scrutiny Portal',
    html: `<p>Your new verification code is: <strong>${newCode}</strong></p>`
  }).catch(console.error);

  return { success: true, message: 'New verification code dispatched.' };
}

export async function login({ email, password, portalType }) {
  const normalizedEmail = email.trim().toLowerCase();
  const hash = hashPassword(password);

  const res = await query(`
    SELECT u.id, u.email, u.full_name, u.role, u.account_status, u.institution_id,
           i.legal_name, i.verification_status, i.aicte_permanent_id
    FROM public.user_profiles u
    LEFT JOIN public.institutions i ON u.institution_id = i.id
    WHERE u.email = $1 AND u.password_hash = $2
  `, [normalizedEmail, hash]);

  if (res.rows.length === 0) {
    throw new Error('Invalid email or password');
  }

  const user = res.rows[0];

  // Status checks
  if (user.account_status === 'pending_email_verification') {
    throw new Error('Please verify your email address before signing in');
  }
  if (user.account_status === 'suspended' || user.account_status === 'disabled') {
    throw new Error('This account has been restricted by an administrator');
  }

  // Strict role boundaries according to spec:
  // Officials and Admins cannot login as institution; Institution users cannot login to official portal
  if (portalType === 'official' && user.role !== 'official') {
    throw new Error('Access denied: Account is not an authorized official');
  }
  if (portalType === 'admin' && user.role !== 'admin') {
    throw new Error('Access denied: Account is not an authorized administrator');
  }
  if (portalType === 'institution' && user.role !== 'institution_user') {
    // Spec allows officials to view official portal only
    throw new Error('Please sign in via the Official or Administrator login portal');
  }

  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
    account_status: user.account_status,
    institution: user.institution_id ? {
      id: user.institution_id,
      legal_name: user.legal_name,
      aicte_permanent_id: user.aicte_permanent_id,
      verification_status: user.verification_status
    } : null
  };
}

export async function requestPasswordReset({ email }) {
  const normalizedEmail = email.trim().toLowerCase();
  const res = await query('SELECT id, full_name FROM public.user_profiles WHERE email = $1', [normalizedEmail]);
  if (res.rows.length === 0) {
    return { success: true, message: 'If an account exists, a recovery code has been sent.' };
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  await query('UPDATE public.user_profiles SET reset_code = $1 WHERE id = $2', [code, res.rows[0].id]);

  sendNotificationEmail({
    to: normalizedEmail,
    subject: 'Password Reset Code — AICTE Scrutiny Portal',
    html: `
      <p>Dear ${res.rows[0].full_name},</p>
      <p>Use the following 6-digit code to reset your password:</p>
      <h2>${code}</h2>
      <p>This code expires in 15 minutes.</p>
    `
  }).catch(console.error);

  return { success: true, message: 'If an account exists, a recovery code has been sent.' };
}

export async function resetPassword({ email, code, new_password }) {
  const normalizedEmail = email.trim().toLowerCase();
  const res = await query('SELECT id, reset_code FROM public.user_profiles WHERE email = $1', [normalizedEmail]);
  if (res.rows.length === 0) throw new Error('Invalid request');

  const user = res.rows[0];
  if (!user.reset_code || user.reset_code !== code.trim()) {
    throw new Error('Invalid or expired password reset code');
  }

  const newHash = hashPassword(new_password);
  await query('UPDATE public.user_profiles SET password_hash = $1, reset_code = NULL WHERE id = $2', [newHash, user.id]);

  return { success: true, message: 'Password updated successfully. Please sign in.' };
}
