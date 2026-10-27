# Test Plan & Verification Procedures

## 1. Automated Testing Suite
Located in `backend/tests/`:
- `health.test.js`: Validates `/api/health`, verifying Supabase DB, Groq, and Gmail SMTP connections.
- `rules.test.js`: Validates `/api/rules`, `/api/rules/categories`, and `/api/rules/checklist/:category`.
- `application.test.js`: Tests application creation, retrieval, and status transitions.
- `validation.test.js`: Tests PDF text extraction and Groq compliance analysis.

## 2. End-to-End User Acceptance Test (Manual)
1. **Initiation:** Open Institution Portal, select category, enter details, verify initiation email.
2. **Checklist:** Verify that 60 rules load for "New Technical Institution".
3. **Upload & AI Audit:** Upload document, check that Groq AI outputs a grounded finding and cites the clause.
4. **Submit:** Submit application and verify status changes to `Review required`.
5. **Reviewer Portal:** Open Reviewer Portal, inspect application, test Raising a Deficiency (confirm email received), and test Approving.
