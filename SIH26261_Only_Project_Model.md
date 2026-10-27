# SIH26261 — AI-Powered Application Validation, Document Authentication and Regulatory Compliance Verification

**Scope:** This document covers SIH26261 only. It excludes all other problem statements.

## 1. Project objective

Build a role-based AICTE application-validation platform that helps institutions submit approval-related applications and documents, checks submissions against applicable versioned requirements, identifies missing or inconsistent evidence, and helps authorized officials review cases. AI supports the review; it does not make the final regulatory decision.

## 2. Portals and roles

### A. Institution Portal
- Secure sign-in and institution profile.
- Start and submit an application (for example, New Institution or Extension of Approval/EoA).
- See a checklist generated for the selected application type and applicable rule version.
- Upload and replace supporting documents.
- View document-processing status and validation findings.
- See missing, unreadable, expired, inconsistent or clarification-needed items.
- Respond to deficiencies and resubmit documents.
- View application timeline, decisions and notifications.
- Institution account status is separate from regulatory approval status.

### B. Official / Reviewer Portal
- View and filter submitted applications and assigned cases.
- Review original documents alongside extracted text and validation results.
- See each finding with the relevant rule, clause/page reference and evidence.
- Request clarification, raise deficiencies, return cases for correction, and record decisions where authorized.
- View cases pending review and approvals approaching expiry or recorded as expired/cancelled.
- Record reasons for overrides and preserve reviewer action history.

### C. Higher-Authority / System Administration Portal
- Manage staff accounts, roles and permissions.
- Maintain institution/application records and monitor workflow.
- Manage regulatory rules and checklist versions, including source clauses, effective dates, review status and change history.
- Review audit records, exceptions, overrides and escalations.
- Monitor processing failures and operational alerts.
- Rule updates must be reviewed and approved by an authorized person before being used for live validation.

## 3. Core application workflow

1. Institution signs in and creates an application.
2. Institution selects the relevant application category.
3. System loads the checklist for that category and applicable approved rule version.
4. Institution uploads documents.
5. System queues processing and extracts text; OCR is used where necessary for scanned files.
6. Deterministic checks evaluate required documents and supported structured fields.
7. AI/RAG retrieves relevant clauses to explain findings and provide source-grounded assistance.
8. System produces a checklist and evidence-linked findings.
9. Authorized official reviews the original documents and findings.
10. Official raises deficiencies, requests clarification, or records an authorized decision.
11. Institution receives a status notification and can respond when required.
12. Every important event is recorded in the audit trail.

Possible statuses: `Draft`, `Submitted`, `Queued`, `Processing`, `Processing failed`, `Review required`, `Under official review`, `Deficiency raised`, `Resubmitted`, and `Decision recorded`.

## 4. Regulatory rules and document validation

- Rules must be stored in a database, not hard-coded into the frontend.
- Each rule should include a unique ID, application category, requirement text, applicability condition, source document, clause, printed page, source URL, effective dates, review status and version history.
- Checklist requirements can be mandatory or conditional depending on the application category and applicability.
- Check for missing documents, unreadable files, relevant expiry dates, mismatched information and possible anomalies where technically supported.
- Keep old rule versions so a historical case can be understood using the rules that applied at the relevant time.
- The current draft rule extraction contains 140 records from selected Chapter I/II content and Annexures 1 and 2. They are **drafts requiring human verification**, not production-approved regulatory requirements.
- Do not hard-code a universal land requirement, built-up area, faculty ratio or intake limit; requirements can depend on programme, institution type, application type and applicable rule version.
- OCR errors, AI suspicions or document anomalies must not be treated automatically as proof of fraud or as an automatic rejection.

## 5. Notifications, reminders and alerts

### Institution notifications
- Application successfully submitted.
- Processing started, completed or failed.
- Missing or unreadable document identified.
- Deficiency raised or clarification requested.
- Application status changed or an authorized decision recorded.
- Relevant regulatory/checklist change affects a future or active application.

### Official notifications
- New application submitted or assigned.
- Case awaiting review.
- Institution resubmitted a deficient application.
- Processing failure needs attention.
- Approval is approaching expiry or has expired/cancelled status, where applicable.
- A case is overdue according to configured review deadlines.

### Higher-authority alerts
- An official overrides an anomaly and proceeds with approval: require a reason, raise a prominent alert for the appropriate higher authority, and preserve the full audit trail.
- Regulatory rules changed: record who changed them, when, why, the old/new version and effective date; notify affected users where relevant.
- Repeated processing failures or overdue cases require escalation according to configured policy.

### Notification-centre behaviour
- In-app notification bell with unread count.
- Each notification has a timestamp, type, linked application, message and relevant action.
- Read/unread state and safe navigation to the authorized record.
- Email for important events; do not email passwords or sensitive document contents.
- Record delivery attempts and failures, prevent duplicate-alert spam, and retry safely.
- Enforce permissions so each user sees only notifications for records they may access.
- Reminder timing, deadlines and escalation thresholds should be configurable by authorized administrators.

## 6. Security, accountability and audit history

- Server-side role-based access control.
- Private document storage and time-limited access links where appropriate.
- Keep service credentials on the backend only.
- Validate upload type and size; use safe file handling and malware scanning where available.
- Audit uploads, access, processing, rule changes, notifications, status transitions, overrides and decisions.
- Use least privilege and MFA for privileged accounts where supported.
- Define retention and deletion policies according to applicable requirements.
- Final regulatory decisions remain with authorized officials.

## 7. Recommended implementation order

1. Set up the Supabase `regulatory_rules` table and load the draft rules.
2. Build the Node.js/Express read-only rules API.
3. Test category filters for New Institution and EoA.
4. Build the institution application form and dynamic checklist.
5. Add secure document uploads and processing status.
6. Add document extraction/OCR and deterministic checks.
7. Build the official reviewer dashboard and evidence-linked findings.
8. Implement notification centre, email events, reminders and escalation.
9. Add rule-version approval workflow, audit history and stronger access controls.
10. Verify every regulatory rule against current official AICTE sources before production use.

## 8. Source and limitations

The project work referenced the uploaded AICTE Approval Process Handbook 2024–25 to 2026–27 (`2025031399.pdf`) and extracted selected requirements from Chapter I, Chapter II, Annexure 1 and Annexure 2. The handbook also refers to other regulations, notifications, circulars, corrigenda and applicable laws. The draft extraction is not guaranteed exhaustive or current. Validate rules against official sources and obtain qualified human review before using them in a real regulatory workflow.

Official handbook URL recorded during the project:
https://www.aicte.gov.in/sites/default/files/APH%20Final.pdf
