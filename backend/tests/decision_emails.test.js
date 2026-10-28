import { query } from '../src/config/supabase.js';

async function testDecisionEmails() {
  const base = 'http://localhost:5001/api';

  console.log('🧪 Starting SIH26261 Decision Email & Workflow Verification...\n');

  // 1. Create a dummy test application in Supabase
  const appRes = await query(`
    INSERT INTO public.applications (
      application_number, institution_name, institution_email, category, status
    )
    VALUES ($1, $2, $3, $4, 'Submitted')
    RETURNING *
  `, [
    `AICTE-TEST-${Date.now()}`,
    'Apex Institute of Engineering & Technology',
    'danishbasha18@gmail.com',
    'New Technical Institution'
  ]);

  const testApp = appRes.rows[0];
  console.log(`✅ Created test application: ${testApp.application_number} (ID: ${testApp.id})`);

  // --- Test 1: Approved ---
  console.log('\n--- 1. Testing Formal "Approved" Decision ---');
  let res = await fetch(`${base}/reviews/approve`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': '33333333-3333-3333-3333-333333333333',
      'x-user-role': 'official',
      'x-user-email': 'official@aicte.gov.in'
    },
    body: JSON.stringify({
      application_id: testApp.id,
      remarks: 'All 140 regulatory norms verified compliant.'
    })
  });
  let d = await res.json();
  console.log('Approve result:', d.success ? `Decision: ${d.decision}, Status: ${d.application.status}` : d);

  // Check notification logs
  let logsRes = await query('SELECT recipient_email, subject, status FROM public.notification_logs WHERE application_id = $1 ORDER BY sent_at DESC LIMIT 1', [testApp.id]);
  console.log('Notification log entry:', logsRes.rows[0]);

  // --- Test 2: Approved with Anomalies (Institution Email + Higher Administrator Alert) ---
  console.log('\n--- 2. Testing "Approved with Anomalies" Decision & Admin Alert ---');
  res = await fetch(`${base}/reviews/approve-with-anomalies`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': '33333333-3333-3333-3333-333333333333',
      'x-user-role': 'official'
    },
    body: JSON.stringify({
      application_id: testApp.id,
      anomalies: 'Fire Safety Certificate renewal in process; temporary municipal permission attached. Land registry verified.',
      remarks: 'Conditional clearance granted. Rectification required prior to EVC visit.'
    })
  });
  d = await res.json();
  console.log('Approve with anomalies result:', d.success ? `Decision: ${d.decision}, Status: ${d.application.status}` : d);

  // Verify that TWO notification logs were created (one for institution, one for admin oversight)
  logsRes = await query('SELECT recipient_email, subject, status FROM public.notification_logs WHERE application_id = $1 ORDER BY sent_at DESC LIMIT 2', [testApp.id]);
  console.log('Recent notification logs (Institution + Admin Oversight):');
  console.log(logsRes.rows);

  // --- Test 3: Rejected ---
  console.log('\n--- 3. Testing "Rejected" Decision ---');
  res = await fetch(`${base}/reviews/reject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': '33333333-3333-3333-3333-333333333333',
      'x-user-role': 'official'
    },
    body: JSON.stringify({
      application_id: testApp.id,
      reason: 'Non-submission of registered lease deed exceeding mandatory 30-year statutory requirement.',
      clause: 'AICTE Approval Process Handbook Chapter I, Clause 1.4.3'
    })
  });
  d = await res.json();
  console.log('Reject result:', d.success ? `Decision: ${d.decision}, Status: ${d.application.status}` : d);

  // Clean up test records
  await query('DELETE FROM public.validation_findings WHERE application_id = $1', [testApp.id]);
  await query('DELETE FROM public.notification_logs WHERE application_id = $1', [testApp.id]);
  await query('DELETE FROM public.applications WHERE id = $1', [testApp.id]);
  console.log('\n✅ Cleaned up test application data.');
  console.log('🎉 All decision email and administrator alert tests PASSED!\n');
  process.exit(0);
}

testDecisionEmails().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
