import { query } from '../src/config/supabase.js';

async function testFullAuthFlow() {
  const base = 'http://localhost:5001/api';
  const testEmail = `evaluator.test${Date.now()}@apex.edu`;

  console.log(`--- 1. Testing Registration for ${testEmail} ---`);
  let regRes = await fetch(`${base}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      full_name: 'Dr. Test Principal',
      email: testEmail,
      mobile_number: '+919876543210',
      password: 'Password@123',
      agree_terms: true
    })
  });
  let regData = await regRes.json();
  console.log('Register response:', regData.success ? `User Created: ${regData.user.id}` : regData);
  const userId = regData.user.id;

  // Retrieve OTP code from database
  const userRow = await query('SELECT verification_code FROM public.user_profiles WHERE id = $1', [userId]);
  const otp = userRow.rows[0].verification_code;
  console.log(`--- 2. Retrieved OTP Code from DB: ${otp} ---`);

  // Verify Email
  let verifyRes = await fetch(`${base}/auth/verify-email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, code: otp })
  });
  let verifyData = await verifyRes.json();
  console.log('Email verification:', verifyData.success ? 'VERIFIED' : verifyData);

  // Submit Institution Details
  console.log('--- 3. Submitting Institution Details ---');
  let instRes = await fetch(`${base}/institution/details`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-id': userId },
    body: JSON.stringify({
      legal_name: 'Government Engineering College Test',
      institution_type: 'Government',
      aicte_permanent_id: 'AICTE-1-4455667788',
      state: 'Karnataka',
      district: 'Bengaluru',
      official_email: testEmail,
      contact_number: '+919876543210'
    })
  });
  let instData = await instRes.json();
  console.log('Institution saved:', instData.success ? `ID: ${instData.institution.id}` : instData);
  const instId = instData.institution.id;

  // Submit for official verification
  console.log('--- 4. Submitting for Verification ---');
  let submitRes = await fetch(`${base}/institution/submit-verification`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-id': userId }
  });
  let submitData = await submitRes.json();
  console.log('Submitted status:', submitData.institution.verification_status);

  // Official approves institution
  console.log('--- 5. AICTE Official reviews and approves institution ---');
  let reviewRes = await fetch(`${base}/admin/institution-verifications/${instId}/review`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': '33333333-3333-3333-3333-333333333333',
      'x-user-role': 'official'
    },
    body: JSON.stringify({
      decision: 'verified',
      remarks: 'All accreditation codes and society registrations verified by AICTE Scrutiny Officer.'
    })
  });
  let reviewData = await reviewRes.json();
  console.log('Review result:', reviewData.success ? 'APPROVED & VERIFIED' : reviewData);

  // Clean up test records
  await query('DELETE FROM public.user_profiles WHERE id = $1', [userId]);
  await query('DELETE FROM public.institutions WHERE id = $1', [instId]);
  console.log('--- Test Completed & Cleaned Up Successfully! ---');
  process.exit(0);
}

testFullAuthFlow().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
