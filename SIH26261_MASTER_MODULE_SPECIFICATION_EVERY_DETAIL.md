# SIH26261 — MASTER MODULE SPECIFICATION (COMPREHENSIVE)

**Project title:** AI-Powered Application Validation, Document Authentication and Regulatory Compliance Verification  
**Scope boundary:** SIH26261 only. No other SIH problem statement is included as a project scope.  
**Purpose of this file:** Consolidate the recoverable project decisions, portals, workflows, notification/reminder requirements, handbook extraction, draft rules-register information, database/backend direction, implementation plan and known limitations into one Markdown master document.

## How to read this specification

- **Confirmed project direction from prior work:** React + Vite frontend; Node.js + Express backend; Supabase PostgreSQL and private file storage; OCR/document extraction; deterministic rules; RAG for source-grounded explanations; background processing; role-based dashboards; human-authorized decisions.
- **Draft regulatory content:** The extracted rule register has 140 draft records based on selected Chapter I/II content and Annexures 1 and 2. These are not legally verified or production-approved.
- **Important completeness limitation:** This file consolidates the prior artifacts available in the current workspace and the recoverable project context. It cannot honestly guarantee that it reproduces literally every message ever exchanged if some earlier chat messages or files are not available in the current context. It preserves known requirements and appends the available detailed rule register instead of inventing missing discussion.
- **Source fidelity:** Handbook-specific content is attributed to the uploaded AICTE Approval Process Handbook 2024–25 to 2026–27 (`2025031399.pdf`). The handbook refers to additional regulations and later notices/circulars, so current official sources and applicability must be checked before production use.
- **Human review:** AI/OCR flags support official review; they do not prove fraud and must not automatically make a final approval/rejection decision.

## Master contents

1. Project objective and system boundary
2. Roles and portals
3. Application workflow and status lifecycle
4. Requirements/checklist/rule management
5. Document upload, extraction and validation
6. RAG and evidence-linked explanations
7. Notifications, reminders, alerts and escalation
8. Human review, deficiencies, overrides and decisions
9. Audit, security, privacy and reliability
10. Data model and API direction
11. Implementation sequence and acceptance checks
12. Handbook extraction and source limitations
13. Draft rules register for Annexures 1 and 2 (full available register appended below)
14. Previously prepared artifact inventory

---

## 1. Project objective and boundary

Build a system that helps authorized reviewers assess institutional applications by selecting the correct application category; showing category-specific checklists; accepting uploads; extracting text/data; checking required documents, fields, dates, signatures and consistency where technically possible; comparing declarations with evidence; checking structured data against reviewed, versioned rules; explaining findings with source clauses/evidence; routing uncertain or suspicious cases to human reviewers; tracking deficiencies/resubmissions/decisions/notifications; and preserving an audit trail.

The platform is a decision-support and workflow system. It does not replace AICTE, regulations, the competent authority, or authorized officials.

## 2. Portals and roles

### 2.1 Institution portal
1. Secure sign-in and institution profile.
2. Start an application and choose the application category (initial examples: New Institution and EoA).
3. Load the checklist based on category, applicability and approved rule version.
4. Upload supporting documents and replace/resubmit files where the workflow permits.
5. See upload and processing status.
6. See missing, unreadable, expired, inconsistent or clarification-needed items.
7. See each finding with a plain-language explanation and rule/handbook source reference where available.
8. Respond to deficiencies and resubmit documents.
9. Track status timeline and decisions.
10. Receive in-app and, for important events, email notifications.
11. Institution portal account state is separate from regulatory approval state.
12. Where an institution has a cancellation status, the earlier discussed requirement is to retain portal access and show cancellation status prominently rather than automatically logging the user out.

### 2.2 Official/reviewer portal
1. View/filter submitted and assigned applications.
2. Open original documents alongside extracted text and validation results.
3. See evidence-linked findings, rule IDs, source clauses/pages, applicability conditions and rule versions.
4. Request clarification, raise deficiencies, return cases for correction, or record an authorized decision.
5. Review resubmissions and previous action history.
6. View pending-review cases and configured overdue cases.
7. View approvals approaching expiry, expired approvals and cancelled approvals in dedicated lists where relevant.
8. Record the reason for any override or exception.
9. Review OCR/AI confidence and route uncertain findings for manual review.
10. Preserve reviewer actions in the audit trail.

### 2.3 Higher-authority/system-administration portal
1. Manage staff accounts, roles and permissions.
2. Oversee application queues and exceptional cases.
3. Maintain versioned rules/checklists, source documents, clause/page references, effective dates and review state.
4. Review rule-change history and approve changes before live use.
5. View audit history, overrides, escalations and notification events.
6. Monitor processing failures and operational alerts.
7. Review reports and case status metrics according to access permissions.
8. Governance/oversight access does not automatically grant authority to make an approval decision.

## 3. Application workflow and status lifecycle

### 3.1 Proposed end-to-end flow
1. Institution signs in.
2. Institution creates an application.
3. Institution selects a category.
4. System loads the relevant approved checklist and applicable rules.
5. Institution fills in structured application fields and uploads supporting documents.
6. Backend validates upload metadata and stores files privately.
7. Application is submitted and receives an identifier/timestamp.
8. Processing job is queued.
9. Text extraction runs; OCR runs for scanned pages when needed.
10. Deterministic checks run against approved/versioned rules.
11. Cross-document checks compare key fields such as institution name, address, land details, dates and other supported fields.
12. RAG retrieves applicable source clauses for explanation and context.
13. Findings are generated with evidence, source references and confidence/uncertainty labels.
14. Uncertain or suspicious findings are routed to official review.
15. Official reviews original documents and evidence.
16. Official raises deficiency, asks for clarification, returns the case, or records a decision within their authority.
17. Institution is notified and may respond/resubmit when permitted.
18. Every material event is written to the audit history.

### 3.2 Suggested statuses
- `Draft`
- `Submitted`
- `Queued`
- `Processing`
- `Processing failed`
- `Review required`
- `Under official review`
- `Deficiency raised`
- `Resubmitted`
- `Decision recorded`

Transitions must be controlled and logged. Failed jobs need a safe retry path. Do not present processing completion as approval.

## 4. Regulatory rules and checklist management

1. Store rules in a database; do not hard-code requirements into frontend components.
2. Each rule should include unique ID, source edition, source document, annexure/chapter, source clause, printed page, application category, requirement type/text, applicability condition, verification status, effective dates, notes, source URL and retrieval date.
3. Track who reviewed/approved the rule and when.
4. Keep supersession relationships and history; do not overwrite old rules in a way that destroys historical traceability.
5. Distinguish `draft_extracted_needs_human_review`, `verified`, `approved_for_use`, `superseded`, and `needs_review`.
6. Only rules approved for use should be used for production validation by default.
7. Development/testing may expose draft rules only through an explicit controlled option.
8. Notify relevant users when a rule change affects them, where appropriate.
9. Store who changed a rule, why, the previous/new version and effective date.
10. AI may suggest rule updates, but an authorized human must verify and approve before the rule becomes active.
11. Requirements may depend on institution type, programme, level, category, application path, effective date and other conditions.
12. Do not hard-code universal faculty ratios, built-up area, land requirements or intake limits.
13. Preserve source clause and evidence so a reviewer can independently verify a finding.

## 5. Document upload, extraction and validation

### 5.1 Upload controls
- Private storage; do not expose uploaded files publicly by default.
- Check allowed file type and file size.
- Use safe filenames and safe storage paths.
- Validate file contents where possible, not only the extension.
- Use malware scanning where available.
- Use short-lived signed URLs or equivalent authorized access.
- Keep access logs and retention policy.

### 5.2 Extraction pipeline
1. Identify PDF/image type.
2. Extract embedded PDF text first where available.
3. Detect scanned/image-only pages.
4. Convert pages to images as required and run OCR.
5. Preserve page numbers and extracted text.
6. Record extraction engine, processing status and errors.
7. Flag low-quality OCR for manual verification.
8. Do not claim digital signature cryptographic validation unless the system actually verifies the signature and certificate chain.

### 5.3 Check types
- Required document present/absent.
- Document readable/unreadable.
- Correct document type for selected category.
- Issuer/competent authority details present where required.
- Validity/expiry date present and current where applicable.
- Institution name/address consistency.
- Land/building details consistency where relevant.
- Date and numeric field consistency.
- Signature presence or digital-signature verification status.
- Cross-document discrepancies.
- Category-specific conditional requirements.
- Possible anomaly requiring human review.

Use clear outcomes such as `present`, `missing`, `unreadable`, `inconsistent`, `expired_or_validity_concern`, `not_applicable`, and `needs_official_review`. Keep the exact final enum aligned with implementation.

## 6. Deterministic checks, RAG and AI explanation

1. Deterministic rules handle explicit checks that can be encoded reliably.
2. RAG retrieves relevant approved handbook clauses and related source material.
3. AI may explain why a rule applies and summarize evidence, but should cite source clause/page.
4. Keep source text and document evidence visible to the official.
5. If no reliable source is available, show `source missing` or `verification required` rather than inventing a rule.
6. AI must not create regulatory requirements from general knowledge.
7. A mismatch or suspicious document is a flag, not proof of forgery.
8. No automatic final rejection based only on OCR or AI suspicion.
9. Preserve model/version, prompt/configuration version where appropriate, retrieved sources and output for auditability, subject to privacy policy.
10. Use confidence/uncertainty carefully; do not treat a confidence score as a legal conclusion.

## 7. Notifications, reminders, alerts and escalation

### 7.1 Institution events
- Application submitted successfully.
- Processing started/completed/failed.
- Missing or unreadable document found.
- Deficiency raised.
- Clarification requested.
- Resubmission received.
- Application status changed.
- Authorized decision recorded.
- Relevant checklist/rule change affects an application.
- Any event-specific next action and due date.

### 7.2 Official events
- New application received.
- Application assigned or reassigned.
- Application awaiting review.
- Institution resubmitted.
- Review deadline approaching or overdue.
- Processing failed and needs attention.
- Approval nearing expiry, expired, or cancellation recorded where applicable.
- Exceptional override or suspicious case requires attention.

### 7.3 Higher-authority alerts
- If an official overrides an anomaly and approves anyway, require a reason, create a prominent higher-authority alert, and retain the event and supporting evidence in the audit trail.
- Clean approvals do not need that exceptional alert.
- Rule changes should record actor, timestamp, reason, old/new version and effective date.
- Escalate overdue cases and repeated processing failures according to configurable policy.

### 7.4 Notification-centre behaviour
1. In-app notification bell.
2. Unread count.
3. Read/unread state.
4. Timestamp and event type.
5. Linked application/case.
6. Clear message and safe next action.
7. Role-based visibility.
8. Email for important events, without sending passwords or sensitive document contents.
9. Delivery status and retry on safe failures.
10. Duplicate alert suppression.
11. Configurable reminder schedules, deadlines and escalation thresholds.
12. Audit log for creation, delivery attempts, reads and related status/rule events.

## 8. Human review, deficiencies, exceptions and decisions

- Authorized officials remain responsible for regulatory decisions.
- A finding should include the rule, source, relevant extracted field/document/page, issue explanation and uncertainty state.
- Reviewers must be able to inspect the original source document.
- Deficiency notices should list exactly what is missing or needs correction and, where appropriate, the relevant source requirement.
- Resubmissions must be linked to the original application and preserve prior versions.
- Overrides require a reason and must be logged.
- Exceptional approvals after anomaly overrides must trigger higher-authority alerting as described above.
- Do not allow a model to silently alter rule status or make final decisions.
- Decision records should include actor, timestamp, outcome, reason and evidence references.

## 9. Audit, security, privacy and reliability

- Server-side role-based access control; frontend hiding alone is not security.
- Least privilege for database and storage access.
- Service-role credentials stay on the backend and must never be exposed to React/Vite.
- Keep `.env` out of Git.
- Use MFA for privileged roles where supported.
- Log uploads, file access, rule changes, processing runs, notifications, status transitions, reviewer actions, overrides and decisions.
- Use private storage and time-limited access links.
- Define retention and deletion policies consistent with applicable requirements.
- Avoid sensitive document content in emails/logs.
- Background jobs should support retry, failure status and operational monitoring.
- Use rate limits, request validation and safe error messages before production.
- Separate institution account status from approval status.
- Cancellation status should not automatically destroy portal access where the project requirement says access remains available.

## 10. Technology and data model direction

### 10.1 Stack
- Frontend: React + Vite; CSS/Tailwind.
- Backend: Node.js + Express.
- Database: Supabase PostgreSQL.
- Storage: private Supabase Storage bucket.
- Authentication: Supabase Auth or a well-designed server-side session/JWT implementation.
- OCR: Tesseract.js or equivalent; PDF-to-image conversion for scanned pages.
- RAG: embeddings plus retrieval; pgvector and keyword/hybrid search are candidate options.
- Queue: Redis + BullMQ for long-running processing and retries.
- Notifications: in-app database records and email provider/SMTP.

### 10.2 `regulatory_rules` table
The prepared schema includes fields such as:
`rule_id`, `source_edition`, `source_document`, `annexure`, `source_clause`, `printed_page`, `application_category`, `requirement_type`, `requirement_text`, `applicability_condition`, `verification_status`, `effective_from`, `effective_to`, `notes`, `reviewed_by`, `reviewed_at`, `supersedes_rule_id`, `source_url`, `retrieval_date`, and timestamps.

### 10.3 Suggested additional tables for later phases
These are design recommendations, not a claim that all are already implemented:
- `institutions`
- `institution_users` or role mapping
- `applications`
- `application_documents`
- `document_extraction_runs`
- `validation_findings`
- `application_rule_results`
- `deficiencies`
- `application_status_history`
- `review_assignments`
- `review_actions`
- `decisions`
- `notifications`
- `notification_deliveries`
- `audit_events`
- `regulatory_sources`
- `rule_change_requests`
- `processing_jobs`

Use foreign keys, timestamps, constraints and access policies appropriate to each table. Keep sensitive fields and file paths protected.

## 11. API direction already prepared

The starter API uses Node.js + Express and Supabase server-side client:
- `GET /api/rules/health`
- `GET /api/rules?category=new_institution`
- `GET /api/rules?category=eoa`
- `GET /api/rules?category=eoa&includeDraft=true` (development/testing only)
- `GET /api/rules/:ruleId`

Default endpoint behaviour excludes draft/unreviewed rules. Current seeded records are draft-only, so the default response may be empty until rules are reviewed. `SUPABASE_SERVICE_ROLE_KEY` must remain in backend `.env` only.

## 12. Implementation sequence

1. Create Supabase project and configure environment safely.
2. Run `SIH26261_Supabase_Rules_Schema.sql`.
3. Run `SIH26261_Supabase_Rules_Seed.sql`.
4. Verify seeded records and draft status in Table Editor.
5. Add the provided rules router to existing Express backend without overwriting existing server code.
6. Test health and category endpoints.
7. Build institution application form and dynamic checklist.
8. Add private document upload.
9. Add extraction/OCR jobs and processing status.
10. Add deterministic validation results.
11. Add evidence-linked RAG explanations.
12. Build official reviewer portal.
13. Add deficiency/resubmission workflow.
14. Add notification bell, email events, reminders and escalation.
15. Add higher-authority portal for rule governance, audit and exceptional alerts.
16. Add RBAC, logging, upload controls, rate limiting, retention and production hardening.
17. Review all rules against current official sources before production.

## 13. Acceptance checks

- Supabase table exists.
- Draft seed rows are present and still marked draft.
- Express server starts without errors.
- `/api/rules/health` returns success.
- New Institution and EoA categories return expected rules when explicitly including drafts.
- Default endpoint excludes draft rules.
- Service-role key is never in frontend code or Git.
- Rule results include source references and applicability.
- Failed processing jobs show failure state and support safe retry.
- Findings are reviewable against original documents.
- Deficiency/resubmission and status history are auditable.
- Notifications respect role permissions and are logged.
- Exceptional approval after anomaly override creates a higher-authority alert.
- No automatic final decision is made solely from AI/OCR suspicion.

## 14. Source register and limitations

Primary uploaded source: `2025031399.pdf`, identified as the AICTE Approval Process Handbook 2024–25 to 2026–27, 231 pages.

Sections identified:
- Chapter I: New Institution, printed p. 1 onward.
- Chapter II: EoA for existing institutions, printed p. 11 onward.
- Chapter VI: Standard Norms and Requirements, printed p. 53 onward.
- Chapter VII: Penal Actions, printed p. 70 onward.
- Chapter VIII: Do’s and Don’ts, printed p. 75 onward.
- Annexure 1: New-institution documents, printed p. 77 onward.
- Annexure 2: Existing-institution and change-category documents, printed p. 81 onward.
- Annexure 3: built-up area.
- Annexure 8: duration/entry qualifications and other related information.
- Annexure 11 and other referenced annexures: course nomenclature and context-specific requirements.

Official URL recorded:
https://www.aicte.gov.in/sites/default/files/APH%20Final.pdf

The handbook refers to other regulations, later AICTE/UGC regulations and notifications, circulars, corrigenda, administrative instructions, and applicable Central/State/local laws. The handbook alone is not proof that all requirements are current. The source register/RAG must support versions, effective dates, citations, and a visible `source missing` / `verification required` state when appropriate.

## 15. Existing artifacts associated with this specification

- `SIH26261_AI_CTE_Handbook_Requirements_Extraction.md`
- `SIH26261_AI_CTE_Rule_Register_Annexures_1_2.md`
- `SIH26261_AI_CTE_Rule_Register_Annexures_1_2.json`
- `SIH26261_AI_CTE_Rule_Register_Annexures_1_2.csv`
- `SIH26261_Supabase_Rules_Schema.sql`
- `SIH26261_Supabase_Rules_Seed.sql`
- `SIH26261_Rules_Backend_Starter.zip`
- `SIH26261_Complete_Chat_and_Next_Steps.md`
- `SIH26261_Only_Project_Model.md`

The detailed rule register is appended next so this master file can serve as a single consolidated reference.

---



# APPENDIX: PROJECT CONTEXT AND HANDBOOK EXTRACTION

# SIH26261 --- AI-Powered Application Validation, Document Authentication and Regulatory Compliance Verification

## Handbook extraction for the project

**Primary source:** Uploaded *AICTE Approval Process Handbook 2024--25
to 2026--27* (`2025031399.pdf`, 231 pages).\
**Purpose:** Convert relevant handbook requirements into a practical
project specification.\
**Important limitation:** This is a project-oriented extraction, not a
complete reproduction of the handbook. The handbook refers to other
regulations and later AICTE notices/circulars. Verify the applicable
official sources before claiming full, current regulatory coverage.

## 1. Project goal

Build a system that helps authorised reviewers assess institutional
applications by: 1. Selecting the correct application category. 2.
Showing a category-specific document checklist. 3. Accepting uploads and
extracting text/data from PDFs and images. 4. Checking required
documents, fields, dates, signatures and consistency where technically
possible. 5. Comparing applicant declarations with uploaded evidence. 6.
Checking structured data against reviewed, versioned rules. 7.
Explaining each finding with the source clause and evidence. 8. Routing
uncertain or potentially suspicious cases to an authorised human
reviewer. 9. Tracking deficiencies, resubmissions, decisions and
notifications. 10. Keeping an audit trail of submissions, reviews,
overrides and decisions.

**The system supports scrutiny; it does not replace AICTE or an
authorised official. An AI flag is not proof of forgery and must not
automatically decide approval.**

## 2. Handbook source map

  -----------------------------------------------------------------------------
  Handbook section                    Project use
  ----------------------------------- -----------------------------------------
  Chapter I --- Grant of Approval for New institution eligibility, application
  New Institution (printed p. 1       submission, timelines, land/building
  onwards)                            requirements

  Chapter II --- Extension of         EoA, annual applications, scrutiny,
  Approval for Existing Institutions  deficiency handling and extension
  (printed p. 11 onwards)             conditions

  Chapter VI --- Standard Norms and   Common norms, programme duration/entry
  Requirements (printed p. 53         qualifications, faculty and
  onwards)                            infrastructure references

  Chapter VII --- Penal Actions on    Consequences of non-compliance
  Violation of Norms (printed p. 70   
  onwards)                            

  Chapter VIII --- Do's and Don'ts    Operational reminders and where AICTE
  (printed p. 75 onwards)             says
                                      notices/circulars/corrigenda/guidelines
                                      are published

  Annexure 1 (printed p. 77 onwards)  Documents for setting up a new technical
                                      institution

  Annexure 2 (printed p. 81 onwards)  Documents for existing institutions and
                                      multiple application/change categories

  Annexure 3                          Built-up-area requirements; extract exact
                                      applicable tables before coding numerical
                                      checks

  Annexure 8                          Programme duration, entry-level
                                      qualifications and statutory reservations

  Annexures 11, 13, 14, 17 and other  Course nomenclature,
  referenced annexures                faculty-specialisation guidance,
                                      building-plan certificates, Board of
                                      Governors and other context-specific
                                      requirements
  -----------------------------------------------------------------------------

Printed page numbers may differ from PDF viewer page numbers. Store both
when possible.

## 3. New technical institution --- requirements

### Rules stated in Chapter I

-   A new technical institution must provide infrastructure and other
    requirements specified in the handbook.
-   Covered technical programmes must not be offered without prior
    Council approval.
-   Applicable Central, State and local laws and other regulatory-body
    norms must also be followed.
-   The described process requires online application through the AICTE
    web portal via the National Single Window System (NSWS); offline
    applications are not accepted under the handbook's stated process.
-   AICTE publishes deadlines through public notices and its website. Do
    not hard-code a universal annual deadline.
-   Applicant data can be edited until final submission; the handbook
    says it cannot be edited during processing after final submission.
-   Application documents must be digitally signed using a Digital
    Signature Certificate (DSC), as specified in the handbook.
-   A copy of the submitted application must be sent to the State
    Government/UT and affiliating University/Board, with receipt
    obtained as described in the handbook.
-   AICTE approval does not remove the institution's responsibility to
    obtain State Government/UT and affiliating University/Board
    permissions where applicable.
-   The promoter Trust/Society/Company must have lawful possession and
    clear title to the required land and built-up area by the
    application date.
-   The building plan for the programme duration must be prepared by a
    registered architect/licensed surveyor and approved by the competent
    authority. First-year infrastructure requirements must be complete.
-   The Principal/Director must meet applicable AICTE qualifications.

### Annexure 1 --- new institution document checklist (initial items)

1.  Building plan prepared by a Council of Architecture-registered
    architect/licensed surveyor and approved by the competent State/UT
    authority; the handbook mentions two copies.
2.  Affidavit 2, on the specified non-judicial/e-stamp paper and sworn
    before the authority described in the handbook.
3.  Applicant organisation resolution in Format 3.
4.  Occupancy Certificate / Completion Certificate / Building Licence /
    Form D, as applicable. The handbook describes an affidavit route for
    certain cases where a building is not complete; use only after
    checking the exact clause and applicability.
5.  Valid Fire Safety Certificate from the competent authority.
6.  Certificate 3 from the Bank Manager regarding the applicant's
    financial status.
7.  Hard copy of the complete application as uploaded to the AICTE
    portal (verify whether this remains current operational practice).
8.  Registration document of the Trust/Society/Company/PPP/BOT,
    including members and objectives, plus Memorandum of Association and
    Rules, certified as described.
9.  For standalone PGDM institutions, recommended Board of Governors
    composition details under Annexure 17.
10. For a Section 8 company, MoA and Rules containing the stated
    non-profit purpose and use of surplus for technical-institution
    development.
11. For PPP/BOT proposals, applicant organisation resolution regarding
    establishment and allocation of land/building/funds in Format 3.
12. Land/building ownership or lease evidence as specified by the
    handbook, including listed deed types and lease conditions.
13. The handbook describes a joint affidavit in certain irrevocable
    lease cases.
14. Where land documents are in a vernacular language, the handbook
    describes a notarised English translation requirement.

**Completeness warning:** Annexure 1 continues beyond these initial
items and contains further requirements/conditions. Before release,
extract the entire Annexure 1 and preserve all notes and applicability
conditions. The list above is not exhaustive.

### Suggested checks

-   Required document present and readable?
-   Document type matches the selected category?
-   Issuer/competent authority identified?
-   Expiry/validity date present and current where applicable?
-   Applicant/institution name matches the application?
-   Address, land identifiers and other fields consistent across
    documents?
-   Building-plan approval details present?
-   Fire certificate details and validity present?
-   Required affidavit and organisation resolution present?
-   Digital signature verification actually performed, or clearly marked
    for manual verification?
-   Is a document conditional on institution type or application path?

Do not claim cryptographic DSC verification unless the system actually
verifies the signature and certificate chain.

## 4. Existing institution --- Extension of Approval (EoA)

### Rules and process described in Chapter II

-   The handbook describes annual EoA applications for institutions
    offering covered technical programmes/courses.
-   Institutions must not admit students to covered technical programmes
    without prior approval.
-   Applications are submitted online using institutional login
    credentials; a unique application ID is described for tracking.
-   Application deadlines are published through notices/website and vary
    by cycle.
-   Documents are digitally signed/uploaded as specified in the relevant
    clauses and Annexure 2.
-   The handbook describes Affidavit 2 and warns that false information
    can trigger civil/criminal provisions under applicable regulations.
-   Applications may be processed by Scrutiny/Re-scrutiny Committees
    and, where applicable, an Expert Visit Committee (EVC).
-   Institutions may be given an opportunity to submit compliance for
    deficiencies, as applicable.
-   Random EVC inspection may check fulfilment of handbook norms.
-   The handbook says fraudulent documents may result in criminal action
    against specified institutional officeholders.
-   EoA is based on self-disclosure of facilities/infrastructure, but
    the Council may monitor compliance and initiate penal action for
    non-fulfilment.
-   Increase in intake/additional courses must align with
    infrastructure, faculty and other applicable requirements; EVC may
    assess infrastructure/faculty.
-   Certain institutions may qualify for three-year EoA under specified
    conditions; annual information/data submission is still described.
    Do not assume all institutions qualify.

### Annexure 2 --- EoA / break in academic years / restoration of intake checklist

1.  Affidavit 2 with the required digital signature/authentication.
2.  AICTE portal payment receipt for the relevant EoA academic year, if
    any.
3.  Valid Occupancy Certificate / Completion Certificate / Building
    Licence / Form D.
4.  If the building is more than 30 years from the issue of its
    Completion Certificate, a valid Structural Stability Certificate
    from a registered Structural Engineer stating the building is fit
    for human habitation.
5.  Valid Fire Safety Certificate from the competent authority.
6.  Satellite map showing the land location, with latitude/longitude at
    the entrance of the main building.
7.  Audited statement of accounts of the Trust/Society/Company for the
    previous year.

Annexure 2 also has category-specific sections for changes of
site/location, conversion between institution types/levels, starting
programmes/levels, mergers, special seats, increase in intake and other
changes. Requirements differ by category.

### Suggested EoA checks

-   Correct application category and checklist.
-   Affidavit and required supporting documents present.
-   Occupancy/completion/building document valid.
-   Structural stability certificate required when the age condition
    applies.
-   Fire safety certificate valid.
-   Location coordinates supplied and consistent with the institution
    address; discrepancies should be reviewed by a human.
-   Audited account statement present for the applicable category.
-   Payment/application receipt present where applicable.
-   Existing approved courses/intake compared with requested changes.
-   Faculty/infrastructure requirements checked for the programme and
    intake.
-   Deficiencies, due dates, responses and resubmission history tracked.

## 5. Programme and institution norms

Chapter VI states, among other things: - New-institution documents
follow Annexure 1; existing-institution EoA documents follow Annexure
2. - Institutions must follow the AICTE academic calendar as notified
from time to time. - Programme duration and entry-level qualifications
are in Annexure 8. - Course nomenclature is in Annexure 11. A course
name not listed there may require prior concurrence and submission of
detailed syllabus/curriculum with the prescribed endorsements. - Maximum
intake for a new institution is linked to Table 1.3 in Chapter I. -
Regular faculty must meet applicable faculty-student and cadre ratios;
the handbook references AICTE faculty regulations and subsequent
amendments/new regulations. - Built-up area requirements are in Annexure
3; land/title/lease requirements are described in the relevant clause. -
Other requirements include faculty qualifications, grievance mechanisms,
biometric attendance and additional institutional obligations.

**Do not hard-code one faculty ratio, built-up-area threshold, land
requirement or intake limit for every institution.** Values may depend
on programme, level, approved intake, institution type and rule version.
Extract exact tables, conditions and units before implementing numerical
checks.

Annexure 8 contains a table of academic levels, entry qualifications,
exit qualifications and NCrF levels. Store the rows as structured data
and apply only to the relevant programme/level.

## 6. Deficiencies, inspection and enforcement

The handbook describes: - Scrutiny/re-scrutiny that can identify
deficiencies. - An opportunity to submit deficiency compliance where
applicable. - EVC/inspection to assess fulfilment of norms. - Possible
penalties for violations, including fines, no-admission orders,
reduction in approved intake, withdrawal of programme/course/institution
approval and other actions. - Potential legal action for false affidavit
information or fraudulent documents. - Other applicable laws and
regulatory-body requirements.

Use neutral finding labels such as: - `missing_document` -
`unreadable_document` - `field_missing` - `data_mismatch` -
`expired_or_invalid_date` - `rule_not_satisfied` -
`signature_check_failed` - `possible_tampering_or_fraud_indicator` -
`external_verification_required` - `manual_review_required`

These are proposed software labels, not AICTE legal findings. A mismatch
or possible alteration is a flag requiring investigation, not proof of
fraud.

## 7. Recommended AI/OCR/RAG workflow

1.  Submit application and assign a unique case ID.
2.  Validate allowed file types/sizes and store originals securely.
3.  Scan for malware if supported.
4.  Extract searchable PDF text or OCR scanned pages/images.
5.  Store extracted text with page numbers and confidence.
6.  Classify document type; allow authorised correction.
7.  Extract fields such as names, addresses, dates, registration IDs,
    issuer, programme and intake.
8.  Run deterministic checks first: missing files, required fields, date
    conditions, category applicability and straightforward comparisons.
9.  Retrieve relevant reviewed handbook clauses with keyword + vector
    search (RAG).
10. Generate explanations only from retrieved approved source material.
11. Link every finding to the exact rule and document/page/field
    evidence.
12. Route uncertainty to authorised reviewers.
13. Record reviewer actions, corrections and overrides with reasons.
14. Notify institutions through approved channels.
15. Keep final decisions under authorised human control.

### RAG source policy

-   Index the handbook by chapter, section, annexure, clause and page.
-   Preserve source title, edition, printed page and PDF page.
-   Register later official notifications/circulars/corrigenda as
    separate sources.
-   Never silently merge conflicting versions.
-   If a current source is missing, show "rule source needs
    verification."
-   Cite retrieved clauses in AI explanations.
-   Store the exact rule-set version used for every validation run.

## 8. Suggested rule registry fields

-   `rule_id`, `rule_title`
-   `application_category`, `institution_type`, `programme_level`
-   `requirement_type` (document, field, threshold, process, deadline,
    cross-document check)
-   `rule_text`, `conditions`, `exceptions`, `required_evidence`
-   `source_document`, `source_edition`, `source_chapter`,
    `source_clause`, `source_annexure`
-   `printed_page`, `pdf_page`
-   `effective_from`, `effective_to` (only when established by a source)
-   `status` (`draft`, `verified`, `approved_for_use`, `superseded`,
    `needs_review`)
-   `reviewed_by`, `reviewed_at`, `notes`, `external_source_links`

AI may help extract rules, but a human should verify and approve rules
before activation.

## 9. Suggested prototype database entities

-   `users` --- account, role, institution association
-   `institutions` --- identity, type, address, recognised IDs
-   `applications` --- category, academic year, status, submitted time,
    application number
-   `application_fields` --- structured applicant data
-   `documents` --- original file metadata, storage path, checksum,
    type, uploader, upload time
-   `document_extractions` --- OCR text, page text, extracted fields and
    confidence
-   `rules` / `rule_sources` --- versioned reviewed rules and source
    metadata
-   `validation_runs` --- rule-set version, start/end time, processing
    status
-   `findings` --- type, severity, explanation, rule source, evidence
    reference, confidence
-   `deficiencies` --- issue sent to institution, due date if
    applicable, response and status
-   `reviews` --- official notes and actions
-   `decisions` --- authorised decision, officer, timestamp, reason and
    evidence
-   `notifications` --- in-app/email delivery status
-   `audit_logs` --- actor, action, timestamp, object and change summary
-   `processing_jobs` --- queue state, retry count, errors and
    timestamps

Enforce role-based access server-side. Institutions must only see their
own applications; reviewers and governance users should have only
explicitly granted permissions.

## 10. Suggested application statuses

These are proposed product statuses, not quoted AICTE status names:
`draft`, `submitted`, `queued`, `processing`, `processing_failed`,
`validation_complete`, `review_required`, `under_official_review`,
`deficiency_raised`, `awaiting_institution_response`, `resubmitted`,
`decision_recorded`, `closed`.

Map these to official status names if the current AICTE workflow defines
them.

## 11. MVP build order

### MVP 1 --- Checklist and upload

-   Institution account and application form.
-   Select `New Technical Institution` or `Existing Institution — EoA`.
-   Render the relevant checklist.
-   Upload files to private storage.
-   Track completeness.

### MVP 2 --- OCR and extraction

-   Extract searchable PDF text and OCR scanned files.
-   Show extracted text and confidence.
-   Allow authorised correction.

### MVP 3 --- Deterministic validation

-   Missing-document and required-field checks.
-   Date/expiry checks where the source defines a rule.
-   Cross-document name/address/date/ID comparisons.
-   Category applicability and clause references.

### MVP 4 --- RAG explanations

-   Search approved handbook corpus.
-   Explain why a finding was raised.
-   Show clause, page and evidence.
-   Abstain when no supporting source is found.

### MVP 5 --- Official review workflow

-   Reviewer dashboard.
-   Finding review/override with mandatory reason.
-   Deficiency requests and responses.
-   Decision record and audit trail.

### MVP 6 --- Rule governance

-   Register official circulars/amendments.
-   Version and compare rules.
-   Require human approval before activating updates.
-   Show which version was applied to each application.

## 12. Additional official-source verification needed

The handbook says notifications, circulars, announcements, public
notices, corrigenda and guidelines issued from time to time are
available on the AICTE website. It also points readers to the AICTE
website for annexures, affidavits, certificates and formats.

Before claiming comprehensive validation, verify: 1. Whether a newer
handbook or amendment applies to the target academic year. 2. Current
application deadlines and academic calendar. 3. Later AICTE notices,
circulars, public notices and corrigenda. 4. Amendments to referenced
AICTE regulations. 5. Applicable UGC, State/UT, affiliating
University/Board and other regulatory requirements. 6. Official
verification channels for certificates, registrations, signatures,
fire/building approvals and other evidence. 7. Current application
categories and portal requirements.

Use official sources where possible; retain source URL, retrieval date
and version. A web search result alone is not proof that a document is
authentic.

## 13. Prototype test cases

1.  New institution with all required files: checklist complete;
    applicable checks run.
2.  New institution missing fire certificate: missing-document finding.
3.  EoA with an expired fire certificate: flag for review under the
    applicable rule.
4.  Building older than 30 years with no structural stability
    certificate: flag only when Annexure 2 condition applies.
5.  Institution name differs between application and certificate:
    cross-document mismatch.
6.  Low OCR confidence: manual review, not automatic rejection.
7.  Suspected alteration: potential integrity concern; request official
    verification.
8.  Unclear/outdated rule source: `needs_review`; do not invent a
    current requirement.
9.  Applicant attempts to view another institution's file: server-side
    access denied.
10. Reviewer overrides a finding: require reason and create audit event.
11. Rule changes after validation: retain the rule-set version
    originally used.
12. AI explanation cites a clause not retrieved: test fails; explanation
    must be source-grounded.

## 14. What is source-derived vs proposed

### Directly supported by the uploaded handbook

-   New institutions and existing EoA use separate document annexures.
-   The handbook describes online submission, digital signatures,
    public-notice timelines, scrutiny/re-scrutiny, possible EVC
    inspections, deficiency compliance and penalties.
-   It lists documents including building plans, affidavits,
    organisation resolutions, occupancy/completion documents, fire
    safety certificates, financial records, land/lease evidence,
    conditional structural stability certificates, location evidence and
    audited accounts.
-   It refers to external laws/regulatory bodies and later AICTE
    notices/circulars/guidelines.

### Proposed engineering design (not AICTE rules)

-   React/Vite frontend, Node.js/Express backend, Supabase
    database/storage.
-   OCR, RAG, embeddings, vector search and deterministic validation.
-   Database schema, finding labels, statuses, roles, queues and
    audit-log design.
-   Human verification/approval of extracted rules before production
    use.

### Not established by this extraction alone

-   One universal approval duration for every institution.
-   One universal faculty ratio, built-up-area threshold or intake
    limit.
-   A complete current checklist for every possible application
    category.
-   The current deadline for a specific academic year.
-   That every document can be authenticated automatically by OCR/AI.

## 15. Immediate next task

Before implementing the full validation engine, extract and verify the
*entire* Annexure 1, *entire* Annexure 2, relevant Chapter I/II clauses,
Chapter VI tables, Chapter VII and referenced annexures. For each rule,
record the exact clause, condition, application category, evidence, page
number and verification status. Then implement the first two paths---new
institution and EoA---as the MVP.



# APPENDIX: PORTALS, WORKFLOWS, NOTIFICATIONS AND REMINDERS

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



# APPENDIX: DATABASE, BACKEND AND IMPLEMENTATION NOTES

# SIH26261 — Complete Chat Summary and Next Implementation Steps

**Project:** AI-Powered Application Validation, Document Authentication and Regulatory Compliance Verification  
**Problem context:** AICTE approval-related application scrutiny  
**Problem statement ID:** SIH26261  
**Current stage:** Rules extraction completed as a draft; next step is to expose versioned regulatory rules through a Node.js/Express API.  
**Environment:** Windows + VS Code  
**Stack direction:** React + Vite, Node.js + Express, Supabase PostgreSQL/Storage, OCR/document processing, rule-based checks, retrieval-augmented generation (RAG), queue workers, and role-based dashboards.

> **Important status note:** The extracted rules are draft records for implementation/testing, not legally approved production rules. Human review against the current official AICTE handbook, regulations, circulars, corrigenda and applicable laws is required before they are used to make real approval decisions.

---

## 1. What the project is intended to do

The system will help authorized officials process institution applications and supporting documents more consistently. It should:

1. Accept an application and supporting documents.
2. Identify the application category, such as **New Institution** or **Extension of Approval (EoA)**.
3. Extract text from PDFs and scanned documents using OCR where needed.
4. Check required documents and structured fields against versioned regulatory rules.
5. Identify missing documents, unreadable content, mismatches, expiry concerns and possible anomalies.
6. Retrieve relevant handbook clauses and provide evidence-linked explanations.
7. Show findings to an authorized human reviewer, who makes the official decision.
8. Keep an audit trail of uploads, processing, rule versions, findings, reviewer actions and decisions.
9. Notify users about status changes and deficiencies.

**AI is decision support, not the authority.** A suspicious document or an AI-generated finding must not automatically be treated as proof of forgery. Official decisions remain with authorized personnel.

## 2. Suggested architecture

- **Frontend:** React + Vite; CSS or Tailwind.
- **Backend:** Node.js + Express.
- **Database:** Supabase PostgreSQL.
- **File storage:** Supabase Storage, with private buckets and access policies.
- **Authentication and authorization:** Supabase Auth or a carefully implemented server-side session/JWT strategy; enforce roles on the server.
- **OCR/document extraction:** PDF text extraction first; OCR for scanned pages (for example, Tesseract.js plus PDF-to-image conversion as needed).
- **Rules:** deterministic checks over versioned regulatory rules.
- **RAG:** retrieval of relevant clauses to explain findings and ground AI assistance. RAG does not replace deterministic checks.
- **Background jobs:** Redis + BullMQ for larger OCR and document-processing jobs, retries and status updates.
- **Notifications:** in-app and email. Never email passwords; use expiring one-time activation/reset links.
- **Audit:** record who did what, when, and which rule/version supported a finding.

## 3. Roles and portal behaviour

### Institution user
- Sign in to an institution account.
- Start an application and choose an application category.
- Upload required documents.
- View processing status, deficiencies and requests for clarification.
- Resubmit corrected or missing documents.

### Official/reviewer
- View assigned applications.
- Review uploaded originals and extracted information.
- See missing-document checks, rule references and evidence-linked findings.
- Raise deficiencies, request clarification, and record an authorized decision.

### Governance/oversight
- View permitted dashboards, aggregate status and audit information.
- Does not automatically receive authority to make approval decisions.

An institution account is **not** the same thing as an institution being approved. Registration and approval status must be separate concepts.

## 4. Application status lifecycle

A possible workflow is:

`Draft → Submitted → Queued → Processing → Review required → Under official review → Deficiency raised → Resubmitted → Decision recorded`

Also support `Processing failed` with a retry path. Use only the states that fit the final workflow, and keep status transitions auditable.

## 5. Handbook source and limitations

A PDF was provided: `2025031399.pdf`, identified in the project work as the **AICTE Approval Process Handbook 2024–25 to 2026–27** (231 pages).

Important areas identified:
- Chapter I — New Institution (printed page 1 onward).
- Chapter II — EoA for existing institutions (printed page 11 onward).
- Chapter VI — Standard Norms.
- Chapter VII — Penal actions.
- Chapter VIII — Do’s and Don’ts.
- Annexure 1 — documents for new institutions.
- Annexure 2 — documents for existing institutions and multiple changes.
- Other annexures cover items such as built-up area, duration/entry qualification and course nomenclature.

The handbook itself points to other regulations, notifications, circulars, corrigenda and applicable laws. Therefore, this edition alone may not cover every applicable requirement. Verify the latest official source before treating a rule as current.

Official handbook URL recorded during the work:
https://www.aicte.gov.in/sites/default/files/APH%20Final.pdf

### Annexure 1 — examples of New Institution requirements extracted
The draft extraction includes examples such as:
- Building plan and applicable affidavits/resolutions.
- Occupancy/completion certificate, building licence or conditional affidavit where the handbook permits it.
- Fire safety certificate.
- Bank certificate.
- Trust/company registration documents.
- Board of Governors documentation for relevant standalone PGDM cases.
- Section 8 company MoA/Rules where applicable.
- Land ownership/lease documents and special evidence for certain private-lease cases.
- EVC-related evidence such as faculty recruitment advertisement, internet bandwidth, library books/invoices, journals, electrical load sanction, architect certificate and a video of facilities.
- Post-LoA faculty/staff recruitment and staff data where applicable.

### Annexure 2 — examples of EoA requirements extracted
The draft extraction includes examples such as:
- Digitally signed Affidavit 2.
- Application/payment receipt where applicable.
- Valid occupancy/completion certificate.
- Structural stability certificate where the building is over 30 years old from its Completion Certificate.
- Valid fire certificate.
- Satellite map with coordinates.
- Previous-year audited accounts.
- Additional category-specific documents for changes such as intake, programmes, location, mergers, closure, institution name, affiliating university name, bank details, trust/society/company changes and other specified cases.

These are examples from the extraction, not a substitute for checking the exact applicable clause and conditions.

**Do not hard-code a universal faculty ratio, built-up area, land requirement or intake limit.** Requirements may vary by programme, institution type, level, application category and applicable handbook/version.

## 6. Draft rules database already prepared

The work produced a first-pass extraction of **140 draft rules** from selected Chapter I/II material and Annexures 1 and 2. This is not guaranteed to be exhaustive or perfectly transcribed. Every rule remains marked for human review.

Files previously created:
- `SIH26261_AI_CTE_Rule_Register_Annexures_1_2.json`
- `SIH26261_AI_CTE_Rule_Register_Annexures_1_2.csv`
- `SIH26261_AI_CTE_Rule_Register_Annexures_1_2.md`
- `SIH26261_Supabase_Rules_Schema.sql`
- `SIH26261_Supabase_Rules_Seed.sql`
- `SIH26261_AI_CTE_Handbook_Requirements_Extraction.md`

The database table is `public.regulatory_rules`. Fields include:
- `rule_id`
- `source_edition`, `source_document`, `annexure`, `source_clause`, `printed_page`
- `application_category`, `requirement_type`, `requirement_text`, `applicability_condition`
- `verification_status`
- `effective_from`, `effective_to`, `notes`
- `reviewed_by`, `reviewed_at`, `supersedes_rule_id`
- `source_url`, `retrieval_date`, timestamps

Expected statuses include:
- `draft_extracted_needs_human_review`
- `verified`
- `approved_for_use`
- `superseded`
- `needs_review`

Run the schema SQL first, then the seed SQL, in the Supabase SQL Editor. Check the `regulatory_rules` table in Table Editor afterwards. Do not change draft records to `approved_for_use` just to make the API return them; review the rules first.

## 7. Next step completed in this companion starter: Node.js API for rules

The companion starter package contains:
- `routes/rules.js` — API routes to list and retrieve applicable rules.
- `middleware/errorHandler.js` — basic Express error handler.
- `server.example.js` — example Express server wiring.
- `.env.example` — environment variable names.
- `package.json` — dependencies and scripts.
- `README.md` — Windows/VS Code setup instructions and test calls.

The API is intentionally read-only and returns draft rules only when explicitly requested with `includeDraft=true`. By default, it returns rules marked `verified` or `approved_for_use`. That default is safer for a real approval workflow, but because the current extracted seed data is draft-only, the default result may be an empty list until rules have been reviewed.

### Endpoints in the starter
- `GET /api/rules/health` — checks that the rules API route is mounted.
- `GET /api/rules?category=new_institution` — rules for New Institution.
- `GET /api/rules?category=eoa` — rules for EoA.
- `GET /api/rules?category=eoa&includeDraft=true` — includes draft rules for development/testing only.
- `GET /api/rules/:ruleId` — retrieve one rule by ID.

The API uses a Supabase service-role key on the server. **Never put `SUPABASE_SERVICE_ROLE_KEY` in React/Vite frontend environment variables or expose it to the browser.** Keep `.env` out of Git.

## 8. How the initial API filtering works

The endpoint supports:
- Category filter.
- Default approved/verified-only filtering.
- Optional draft inclusion for local development.
- Search by words in requirement text or clause.
- Limit and offset pagination.
- One-rule lookup by `rule_id`.

The starter is deliberately not a full validation engine. It only retrieves rule records. The next stage after confirming the endpoint works is to:
1. Connect the application form to a selected category.
2. Display the checklist from the API.
3. Add document-upload records and map uploaded files to checklist items.
4. Mark each requirement as `present`, `missing`, `unreadable`, or `needs_official_review`.
5. Add deterministic checks for supported structured fields.
6. Add clause retrieval and AI explanations with source evidence.
7. Add queue processing and reviewer workflow.
8. Add authentication, role checks, rate limits, validation and audit logging before deployment.

## 9. Windows + VS Code setup for the starter

1. Download and extract `SIH26261_Rules_Backend_Starter.zip`.
2. Copy its `routes` and `middleware` folders into the existing Node/Express backend. If the project already has a `server.js`, do not overwrite it; merge the route wiring shown in `server.example.js`.
3. In the backend folder, install dependencies:
   `npm install`
4. Copy `.env.example` to `.env`.
5. Add your Supabase project URL and **service-role key** to the backend `.env` file only.
6. Make sure the Supabase schema and seed SQL have been run.
7. Start the server using the project’s existing start command, or use the example script after adapting it to your folder structure.
8. Test:
   - `http://localhost:3000/api/rules/health`
   - `http://localhost:3000/api/rules?category=new_institution&includeDraft=true`
   - `http://localhost:3000/api/rules?category=eoa&includeDraft=true`

If the route returns no records, check the table name, environment variables, SQL seed execution, category values, and server logs. Never paste your service-role key into chat or commit it to Git.

## 10. Security and reliability requirements

- Private document storage; short-lived signed URLs where needed.
- Server-side role-based access control.
- Least-privilege database policies and secrets management.
- File type/size checks, malware scanning where available, safe filenames and upload limits.
- Audit log for uploads, access, rule changes, status transitions and decisions.
- Versioned rules with effective dates and source clause/page.
- Human approval for rule updates.
- No automatic final rejection based only on OCR/AI suspicion.
- Retryable processing jobs and visible failure states.
- Protect personally identifiable information and retain data only as required by policy/law.
- Privileged users should use MFA where supported.

## 11. Acceptance checks for this stage

- [ ] Supabase `regulatory_rules` table exists.
- [ ] Seed rows are visible and still marked as draft pending review.
- [ ] Express server starts without errors.
- [ ] `/api/rules/health` returns success.
- [ ] New Institution and EoA categories return the expected draft rules when `includeDraft=true`.
- [ ] Default endpoint does not expose unreviewed draft rules.
- [ ] Service-role key is only in backend `.env`, never in frontend code or Git.

## 12. Immediate next action

First, get the read-only rules API running and verify it against the seeded Supabase table. After that, build the React checklist screen that calls `/api/rules?category=...`, then add uploads and requirement-by-requirement validation. Keep the current rule data in draft until a qualified reviewer confirms each source clause and its current applicability.



# APPENDIX: COMPLETE DRAFT RULE REGISTER — ANNEXURES 1 AND 2

# SIH26261 — Draft Rule Register

**Source:** AICTE Approval Process Handbook 2024–25 to 2026–27 (`2025031399.pdf`).  
**Rules extracted:** 140.  
**Status:** Draft extraction; human review required before any rule is activated. This is not a complete or current legal determination.

## How to use this register

- JSON is suitable for programmatic loading into a seed script or database.
- CSV is suitable for spreadsheet review.
- Each record contains source clause, page, application category, requirement, applicability, type and verification status.
- `effective_from` and `effective_to` remain null unless supported by an official source.
- The system should not automatically conclude that a document is forged; flags require human review.

## Rules

### APH-A1-1.1-01 — 1.1(i)

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** All new technical institution applicants
- **Requirement:** Building plan (Certificate 2), prepared by a Council of Architecture-registered architect/licensed surveyor (Certificate 1) and approved by the competent State/UT authority; two copies are specified.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 77
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.1-02 — 1.1(ii)

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** All new technical institution applicants
- **Requirement:** Affidavit 2 on non-judicial/e-stamp paper of Rs. 100, sworn before a First Class Judicial Magistrate, Notary or Oath Commissioner.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 77
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.1-03 — 1.1(iii)

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** All new technical institution applicants
- **Requirement:** Applicant organisation resolution in Format 3.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 77
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.1-04 — 1.1(iv)

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** Certificate required as applicable; affidavit route is conditional and must be checked against the complete clause
- **Requirement:** Occupancy Certificate / Completion Certificate / Building Licence / Form D, as applicable, from the competent authority; where the described building-completion exception applies, the handbook describes an affidavit undertaking to produce the document on completion.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 77
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.1-05 — 1.1(v)

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** All new technical institution applicants
- **Requirement:** Valid Fire Safety Certificate issued by the competent authority.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 77
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.1-06 — 1.1(vi)

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** All new technical institution applicants
- **Requirement:** Certificate 3 issued by the Bank Manager regarding financial status of the applicant.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 77
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.1-07 — 1.1(vii)

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** As stated in this handbook edition; verify current portal practice before enforcing
- **Requirement:** Hard copy of the complete application as uploaded to the AICTE web portal.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 77
- **Status:** draft_extracted_needs_human_review
- **Notes:** Handbook editions/processes may change.

### APH-A1-1.1-08 — 1.1(viii)

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** All new technical institution applicants; exact organisational form determines evidence
- **Requirement:** Registration document of the Trust/Society/Company/PPP/BOT indicating members and objectives, with Memorandum of Association and Rules, duly attested/certified by the concerned competent authority.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 77
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.1-09 — 1.1(ix)

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** Standalone PGDM institutions only
- **Requirement:** Recommended composition details of the institution's Board of Governors as per Annexure 17.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 77
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.1-10 — 1.1(x)

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** Section 8 company applicants only
- **Requirement:** For a Section 8 company, MoA and Rules must state that the objective is non-profit and surplus is used exclusively for development of the technical institution.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 77
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.1-11 — 1.1(xi)

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** PPP/BOT proposals only
- **Requirement:** For a PPP/BOT proposal, applicant organisation resolution for starting the technical institution and allocation of land/building/funds in Format 3.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 77
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.1-12 — 1.1(xii)

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** Land/building evidence applicable to the applicant; check exact tenure and course-duration conditions
- **Requirement:** Land/building ownership evidence in applicant's name, such as registered settlement deed, registered sale deed, registered irrevocable gift deed, or registered irrevocable Government/private lease deed; handbook specifies a minimum 30-year lease and live-lease conditions.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 77
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.1-13 — 1.1 continuation

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** Applicable to the described irrevocable lease cases
- **Requirement:** Joint Affidavit 7 by the parties stating that the land lease is irrevocable for 30 years, on the specified stamp/e-stamp paper and sworn before the stated authority.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 78
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.1-14 — 1.1 continuation

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** Where land documents are in a vernacular language
- **Requirement:** Notarised English translation of land documents written in a vernacular language.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 78
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.1-PL-01 — 1.1 Private Lease of Land (1)

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** Private lease of land only
- **Requirement:** Original private land lease registered between lessor and lessee with the competent authority under the Registration Act; handbook states validity of 30 years as of the Council notification date.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 78
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.1-PL-02 — 1.1 Private Lease of Land (2)

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** Private lease of land only
- **Requirement:** Land Conversion Certificate issued by the competent authority.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 78
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.1-PL-03 — 1.1 Private Lease of Land (3)

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** Private lease of land only
- **Requirement:** Title documents showing the lessor acquired leasehold rights through a lawful transaction.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 78
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.1-PL-04 — 1.1 Private Lease of Land (4)

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** Private lease of land only
- **Requirement:** Encumbrance Certificate for the property dated no later than the Council notification date.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 78
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.1-PL-05 — 1.1 Private Lease of Land (5)

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** Private lease of land only
- **Requirement:** Resolution of the Trust/Society/Company, if the lessor is one of these entities.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 78
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.1-PL-06 — 1.1 Private Lease of Land (6)

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** Private lease of land only
- **Requirement:** For a sub-lease, registered evidence that the lessor (then lessee) has the right to assign the leasehold right.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 78
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.1-PL-07 — 1.1 Private Lease of Land (7)

- **Application category:** New Technical Institution
- **Type:** condition
- **Applicability:** Private lease of land only
- **Requirement:** Mortgage of land is not permissible under the stated private-land-lease requirements.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 78
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.1-PB-01 — 1.1 Private Lease of Building (1)

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** Private lease of building only; item 13 is limited to the stated Government/eligible institution and building-age conditions
- **Requirement:** Complete building plan approved by the competent authority; for a multi-storey building where only certain floors are leased, floor plans must clearly identify the leased floors along with the complete approved building plan.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 78
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.1-PB-02 — 1.1 Private Lease of Building (2)

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** Private lease of building only; item 13 is limited to the stated Government/eligible institution and building-age conditions
- **Requirement:** Occupancy/Completion Certificate for the property/floors issued by the competent authority.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 78
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.1-PB-03 — 1.1 Private Lease of Building (3)

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** Private lease of building only; item 13 is limited to the stated Government/eligible institution and building-age conditions
- **Requirement:** Title documents for the land showing acquisition/leasehold rights over the property.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 78
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.1-PB-04 — 1.1 Private Lease of Building (4)

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** Private lease of building only; item 13 is limited to the stated Government/eligible institution and building-age conditions
- **Requirement:** Lease deed registered by the competent authority under the Registration Act.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 78
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.1-PB-05 — 1.1 Private Lease of Building (5)

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** Private lease of building only; item 13 is limited to the stated Government/eligible institution and building-age conditions
- **Requirement:** Valid Fire Safety Certificate issued by the competent authority.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 78
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.1-PB-06 — 1.1 Private Lease of Building (6)

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** Private lease of building only; item 13 is limited to the stated Government/eligible institution and building-age conditions
- **Requirement:** Land Use Certificate permitting educational use, together with topo sketch/village map showing land survey numbers and a road map locating the proposed institution.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 78
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.1-PB-07 — 1.1 Private Lease of Building (7)

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** Private lease of building only; item 13 is limited to the stated Government/eligible institution and building-age conditions
- **Requirement:** Architect-certified floor plans, sections and elevations for proposed/existing buildings exclusively intended for the institution, with room names and carpet areas in m²; architect certification also covers safety/hygiene precautions during partial occupation, if any.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 78
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.1-PB-08 — 1.1 Private Lease of Building (8)

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** Private lease of building only; item 13 is limited to the stated Government/eligible institution and building-age conditions
- **Requirement:** Proof of working capital in the form described by the handbook (fixed deposits or latest bank statement from a Nationalised/Scheduled Commercial Bank recognised by RBI, plus branch manager certificate).
- **Source:** 2025031399.pdf, Annexure 1, printed p. 78
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.1-PB-09 — 1.1 Private Lease of Building (9)

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** Private lease of building only; item 13 is limited to the stated Government/eligible institution and building-age conditions
- **Requirement:** Audited statements of accounts of the applicant organisation for the last three years, as applicable.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 79
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.1-PB-10 — 1.1 Private Lease of Building (10)

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** Private lease of building only; item 13 is limited to the stated Government/eligible institution and building-age conditions
- **Requirement:** Certificate regarding Minority Status, if applicable at application time.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 79
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.1-PB-11 — 1.1 Private Lease of Building (11)

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** Private lease of building only; item 13 is limited to the stated Government/eligible institution and building-age conditions
- **Requirement:** Detailed Project Report (DPR).
- **Source:** 2025031399.pdf, Annexure 1, printed p. 79
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.1-PB-12 — 1.1 Private Lease of Building (12)

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** Private lease of building only; item 13 is limited to the stated Government/eligible institution and building-age conditions
- **Requirement:** Undertaking that no high-tension line passes through campus including hostel; if one does, certificate from the competent Electricity Board authority that it will not affect safety of buildings/students/faculty/staff.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 79
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.1-PB-13 — 1.1 Private Lease of Building (13)

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** Private lease of building only; item 13 is limited to the stated Government/eligible institution and building-age conditions
- **Requirement:** For the specified older Government-built buildings where original documents cannot be submitted, a competent-authority letter stating AICTE building norms are fulfilled.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 79
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.2-01 — 1.2(1)

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** Documents presented at Expert Visit Committee (EVC) stage
- **Requirement:** Copy of advertisement in at least one National Daily for recruitment of Principal/Director and faculty members.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 79
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.2-02 — 1.2(2)

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** Documents presented at Expert Visit Committee (EVC) stage
- **Requirement:** Proof of provision of Internet bandwidth in Mbps.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 79
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.2-03 — 1.2(3)

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** Documents presented at Expert Visit Committee (EVC) stage
- **Requirement:** List of titles of library books and volumes purchased for each title.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 79
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.2-04 — 1.2(4)

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** Documents presented at Expert Visit Committee (EVC) stage
- **Requirement:** Invoice/cash memo copies for equipment and library books.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 79
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.2-05 — 1.2(5)

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** Documents presented at Expert Visit Committee (EVC) stage
- **Requirement:** Details of journal subscriptions as per Annexure 4.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 79
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.2-06 — 1.2(6)

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** Documents presented at Expert Visit Committee (EVC) stage
- **Requirement:** Sanction of electrical load by the electricity supply provider.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 79
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.2-07 — 1.2(7)

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** Documents presented at Expert Visit Committee (EVC) stage
- **Requirement:** Architect certificate giving details of sewage disposal, barrier-free environment, toilets for physically challenged persons and all-weather motorable approach roads.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 79
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.2-08 — 1.2(8)

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** Documents presented at Expert Visit Committee (EVC) stage
- **Requirement:** Details of all other educational institutions run by the same Trust/Society/Company.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 79
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.2-09 — 1.2(9)

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** Documents presented at Expert Visit Committee (EVC) stage
- **Requirement:** Approximately 30-minute video recording showing the institution and specified facilities/rooms; upload to YouTube and provide URL in AICTE portal for advance EVC viewing, as described in the handbook.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 79
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.3-01 — 1.3.1

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** Post-Letter of Approval (LoA) stage
- **Requirement:** Appoint faculty and Principal/Director according to handbook policies on minimum qualifications, pay scales and norms.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 79
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.3-02 — 1.3.2

- **Application category:** New Technical Institution
- **Type:** process
- **Applicability:** Post-Letter of Approval (LoA) stage
- **Requirement:** For existing institutions applying for new programmes/courses or increase in intake/division, show infrastructure and faculty availability to EVC as per norms.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 79
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.3-03 — 1.3.3

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** Post-Letter of Approval (LoA) stage
- **Requirement:** Appoint Principal/Director/teaching staff under Council norms and technical-support/administrative staff under applicable State/UT procedures, especially selection procedures and committees.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 79
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.3-04 — 1.3.4

- **Application category:** New Technical Institution
- **Type:** process
- **Applicability:** Post-Letter of Approval (LoA) stage
- **Requirement:** Upload staff appointment information in the prescribed format to the AICTE portal.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 79
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.3-05 — 1.3.5

- **Application category:** New Technical Institution
- **Type:** process
- **Applicability:** Post-Letter of Approval (LoA) stage
- **Requirement:** Do not start approved technical courses until all faculty members and other staff appointments are in place.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 79
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.3-06 — 1.3.6

- **Application category:** New Technical Institution
- **Type:** process
- **Applicability:** Post-Letter of Approval (LoA) stage
- **Requirement:** Enter faculty and non-teaching staff data in the prescribed format.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 79
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.4-01 — 1.4.1

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** Scrutiny Committee: closure and new institution in same premises in same year / related listed changes as applicable
- **Requirement:** No Objection Certificate from affiliating University/Board in Format 2.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 80
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.4-02 — 1.4.2

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** Scrutiny Committee: closure and new institution in same premises in same year / related listed changes as applicable
- **Requirement:** Trust/Society/Company resolution in Format 3 for closure of existing institution and starting a new institution in the same premises in the same year, or other listed changes as applicable.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 80
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.4-03 — 1.4.3

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** Scrutiny Committee: closure and new institution in same premises in same year / related listed changes as applicable
- **Requirement:** Latest salary sheet with pay scale, gross pay, PF deduction and TDS for all faculty/non-teaching staff, plus faculty-student ratio.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 80
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.4-04 — 1.4.4

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** Scrutiny Committee: closure and new institution in same premises in same year / related listed changes as applicable
- **Requirement:** Details of RPGF/Joint FDR made with AICTE.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 80
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.4-05 — 1.4.5

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** Scrutiny Committee: closure and new institution in same premises in same year / related listed changes as applicable
- **Requirement:** Status of existing students studying at the institution.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 80
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.4-06 — 1.4.6

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** Scrutiny Committee: closure and new institution in same premises in same year / related listed changes as applicable
- **Requirement:** Status of existing faculty/staff and liabilities.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 80
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.5-01 — 1.5.1

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** Scrutiny Committee for an institution set up by a Section 8 company; item 10 conditional as stated
- **Requirement:** Certificate of registration of companies.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 80
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.5-02 — 1.5.2

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** Scrutiny Committee for an institution set up by a Section 8 company; item 10 conditional as stated
- **Requirement:** Memorandum of Association and Articles of Association.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 80
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.5-03 — 1.5.3

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** Scrutiny Committee for an institution set up by a Section 8 company; item 10 conditional as stated
- **Requirement:** Certificate of Incorporation.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 80
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.5-04 — 1.5.4

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** Scrutiny Committee for an institution set up by a Section 8 company; item 10 conditional as stated
- **Requirement:** Evidence of availability of the company's registered office.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 80
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.5-05 — 1.5.5

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** Scrutiny Committee for an institution set up by a Section 8 company; item 10 conditional as stated
- **Requirement:** Particulars of directors, managers or secretaries.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 80
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.5-06 — 1.5.6

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** Scrutiny Committee for an institution set up by a Section 8 company; item 10 conditional as stated
- **Requirement:** PAN number.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 80
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.5-07 — 1.5.7

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** Scrutiny Committee for an institution set up by a Section 8 company; item 10 conditional as stated
- **Requirement:** TAN number.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 80
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.5-08 — 1.5.8

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** Scrutiny Committee for an institution set up by a Section 8 company; item 10 conditional as stated
- **Requirement:** Companies General Rules and Forms.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 80
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.5-09 — 1.5.9

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** Scrutiny Committee for an institution set up by a Section 8 company; item 10 conditional as stated
- **Requirement:** No Objection Certificate from directors or promoters.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 80
- **Status:** draft_extracted_needs_human_review

### APH-A1-1.5-10 — 1.5.10

- **Application category:** New Technical Institution
- **Type:** document
- **Applicability:** Scrutiny Committee for an institution set up by a Section 8 company; item 10 conditional as stated
- **Requirement:** Audited statement for the last three years clearly indicating turnover through operations, if applicable.
- **Source:** 2025031399.pdf, Annexure 1, printed p. 80
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.1-01 — 2.1(1)

- **Application category:** EoA / break in preceding academic years / restoration of intake
- **Type:** document
- **Applicability:** Main EoA checklist; supporting documents authenticated by authorised representative as specified
- **Requirement:** Affidavit 2 on Rs. 100 non-judicial/e-stamp paper, sworn before the specified authority and digitally signed by the Trust/Society/Company Chairperson/Secretary as described.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 81
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.1-02 — 2.1(2)

- **Application category:** EoA / break in preceding academic years / restoration of intake
- **Type:** document
- **Applicability:** Main EoA checklist; supporting documents authenticated by authorised representative as specified
- **Requirement:** AICTE portal payment receipt for EoA for the relevant academic year, if any.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 81
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.1-03 — 2.1(3)

- **Application category:** EoA / break in preceding academic years / restoration of intake
- **Type:** document
- **Applicability:** Main EoA checklist; supporting documents authenticated by authorised representative as specified
- **Requirement:** Valid Occupancy Certificate / Completion Certificate / Building Licence / Form D from the competent authority, as referenced in Clause 7.17.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 81
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.1-04 — 2.1(4)

- **Application category:** EoA / break in preceding academic years / restoration of intake
- **Type:** document
- **Applicability:** Main EoA checklist; supporting documents authenticated by authorised representative as specified
- **Requirement:** If the building is more than 30 years from the issue of the Completion Certificate, valid Structural Stability Certificate from a registered Structural Engineer stating the building is fit for human habitation.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 81
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.1-05 — 2.1(5)

- **Application category:** EoA / break in preceding academic years / restoration of intake
- **Type:** document
- **Applicability:** Main EoA checklist; supporting documents authenticated by authorised representative as specified
- **Requirement:** Valid Fire Safety Certificate from the competent authority.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 81
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.1-06 — 2.1(6)

- **Application category:** EoA / break in preceding academic years / restoration of intake
- **Type:** document
- **Applicability:** Main EoA checklist; supporting documents authenticated by authorised representative as specified
- **Requirement:** Satellite map showing the land location with latitude/longitude at the entrance of the main building.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 81
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.1-07 — 2.1(7)

- **Application category:** EoA / break in preceding academic years / restoration of intake
- **Type:** document
- **Applicability:** Main EoA checklist; supporting documents authenticated by authorised representative as specified
- **Requirement:** Audited statement of accounts of the Trust/Society/Company for the previous year.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 81
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.2-01 — 2.2

- **Application category:** Introduction of NRI seats
- **Type:** document
- **Applicability:** NRI seats application
- **Requirement:** Trust/Society/Company resolution approving introduction of seats for children of Non-Resident Indians, signed by Chairperson/Secretary in Format 3.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 81
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.3-01 — 2.3(1)

- **Application category:** Change of site/location; conversion of women’s to co-ed or vice versa; diploma/degree conversion; start new programme/level
- **Type:** document
- **Applicability:** Use the relevant clause and application type; item 1 applies only to change of site/location
- **Requirement:** For change of site/location, submit all documents specified in Annexure 1.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 81
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.3-02 — 2.3(2)

- **Application category:** Change of site/location; conversion of women’s to co-ed or vice versa; diploma/degree conversion; start new programme/level
- **Type:** document
- **Applicability:** Use the relevant clause and application type; item 1 applies only to change of site/location
- **Requirement:** No Objection Certificate from affiliating University/Board in Format 2.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 81
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.3-03 — 2.3(3)

- **Application category:** Change of site/location; conversion of women’s to co-ed or vice versa; diploma/degree conversion; start new programme/level
- **Type:** document
- **Applicability:** Use the relevant clause and application type; item 1 applies only to change of site/location
- **Requirement:** Trust/Society/Company resolution in Format 3 approving the relevant change/start/closure/conversion as applicable, signed by Chairperson/Secretary.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 81
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.3-NOTE-01 — 2.3 Note 1

- **Application category:** Conversion of co-ed institution to women’s institution
- **Type:** condition
- **Applicability:** Only conversion of co-ed institution to women’s institution
- **Requirement:** No refund of additional FDR/security deposit is allowed in the described conversion.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 82
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.3-NOTE-02 — 2.3 Note 2

- **Application category:** Change/start applications
- **Type:** condition
- **Applicability:** Where State Government NoC applies
- **Requirement:** Institution/promoters are responsible for obtaining State Government NoC, if applicable, before the academic session starts.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 82
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.4-01 — 2.4(1)

- **Application category:** Merger of institutions in same campus
- **Type:** document
- **Applicability:** Merger application; item 1 has a stated exception
- **Requirement:** All Annexure 2 documents, except for institutions meeting the cited Clause 2.10.2(b) condition.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 82
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.4-02 — 2.4(2)

- **Application category:** Merger of institutions in same campus
- **Type:** document
- **Applicability:** Merger application; item 1 has a stated exception
- **Requirement:** No Objection Certificate from affiliating University/Board in Format 2.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 82
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.4-03 — 2.4(3)

- **Application category:** Merger of institutions in same campus
- **Type:** document
- **Applicability:** Merger application; item 1 has a stated exception
- **Requirement:** Trust/Society/Company resolution in Format 3 approving merger of institutions in the same campus, signed by Chairperson/Secretary as applicable.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 82
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.4-04 — 2.4(4)

- **Application category:** Merger of institutions in same campus
- **Type:** document
- **Applicability:** Merger application; item 1 has a stated exception
- **Requirement:** Documents legally applicable for merger of institutions under different Trusts/Societies/Companies under prevailing Government norms/rules.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 82
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.5-01 — 2.5(1)

- **Application category:** Supernumerary seats for OCI/Foreign Nationals/children of Indian workers in Gulf countries
- **Type:** document
- **Applicability:** EVC stage for the specified supernumerary-seat application
- **Requirement:** Details of hostel facilities and hostel administration.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 82
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.5-02 — 2.5(2)

- **Application category:** Supernumerary seats for OCI/Foreign Nationals/children of Indian workers in Gulf countries
- **Type:** document
- **Applicability:** EVC stage for the specified supernumerary-seat application
- **Requirement:** Office of International Affairs (OIA) to assist in matters related to OCI/Foreign Nationals/children of Indian workers in Gulf countries.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 82
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.5-03 — 2.5(3)

- **Application category:** Supernumerary seats for OCI/Foreign Nationals/children of Indian workers in Gulf countries
- **Type:** document
- **Applicability:** EVC stage for the specified supernumerary-seat application
- **Requirement:** Trust/Society/Company resolution approving introduction of supernumerary seats for OCI/Foreign Nationals/children of Indian workers in Gulf countries, signed by Chairperson/Secretary in Format 3.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 82
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.6-01 — 2.6(1)

- **Application category:** Increase in intake / additional courses / Indian-language courses / integrated or dual degree / Fellow Programme in Management
- **Type:** document
- **Applicability:** As applicable to the specific proposal; item 1 not applicable for Extended EoA
- **Requirement:** Affidavit 8 on Rs. 100 non-judicial/e-stamp paper, sworn before the specified authority; not applicable for Extended EoA.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 82
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.6-02 — 2.6(2)

- **Application category:** Increase in intake / additional courses / Indian-language courses / integrated or dual degree / Fellow Programme in Management
- **Type:** document
- **Applicability:** As applicable to the specific proposal; item 1 not applicable for Extended EoA
- **Requirement:** Proof of faculty with Ph.D./Fellow qualification in the number required for the seats, for introduction of Fellow Programme in Management.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 82
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.6-03 — 2.6(3)

- **Application category:** Increase in intake / additional courses / Indian-language courses / integrated or dual degree / Fellow Programme in Management
- **Type:** document
- **Applicability:** As applicable to the specific proposal; item 1 not applicable for Extended EoA
- **Requirement:** Trust/Society/Company resolution approving additional courses/divisions and allocation of land/building/funds, signed by Chairperson/Secretary in Format 3.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 82
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.7-01 — 2.7(1)

- **Application category:** Progressive closure / complete closure of institution
- **Type:** document
- **Applicability:** Scrutiny Committee stage for closure application
- **Requirement:** No Objection Certificate from affiliating University/Board in Format 2, clearly describing provisions/alternative arrangements for existing students.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 82
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.7-02 — 2.7(2)

- **Application category:** Progressive closure / complete closure of institution
- **Type:** document
- **Applicability:** Scrutiny Committee stage for closure application
- **Requirement:** Latest salary sheet with pay scale, gross pay, PF deduction and TDS for faculty/non-teaching staff, plus faculty-student ratio.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 82
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.7-03 — 2.7(3)

- **Application category:** Progressive closure / complete closure of institution
- **Type:** document
- **Applicability:** Scrutiny Committee stage for closure application
- **Requirement:** Details of RPGF/Joint FDR made with AICTE.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 83
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.7-04 — 2.7(4)

- **Application category:** Progressive closure / complete closure of institution
- **Type:** document
- **Applicability:** Scrutiny Committee stage for closure application
- **Requirement:** Status of existing students.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 83
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.7-05 — 2.7(5)

- **Application category:** Progressive closure / complete closure of institution
- **Type:** document
- **Applicability:** Scrutiny Committee stage for closure application
- **Requirement:** Status of existing faculty/staff and liabilities.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 83
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.7-06 — 2.7(6)

- **Application category:** Progressive closure / complete closure of institution
- **Type:** document
- **Applicability:** Scrutiny Committee stage for closure application
- **Requirement:** Affidavit 4 stating applicant has no liabilities relating to faculty, staff, students, etc., on the specified stamp/e-stamp paper and sworn before the specified authority.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 83
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.7-07 — 2.7(7)

- **Application category:** Progressive closure / complete closure of institution
- **Type:** document
- **Applicability:** Scrutiny Committee stage for closure application
- **Requirement:** Details of pending court cases, serious charges, violations of norms and pending ragging cases against the institution.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 83
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.7-08 — 2.7(8)

- **Application category:** Progressive closure / complete closure of institution
- **Type:** document
- **Applicability:** Scrutiny Committee stage for closure application
- **Requirement:** Trust/Society/Company resolution approving closure, signed by Chairperson/Secretary in Format 3.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 83
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.8-01 — 2.8(1)

- **Application category:** Change of type of institution / institution converted into a university
- **Type:** document
- **Applicability:** Check stated exception for Affidavit 2
- **Requirement:** Affidavit 2 on the specified stamp/e-stamp paper and sworn before the specified authority; handbook marks it not applicable to change of type of institution.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 83
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.8-02 — 2.8(2)

- **Application category:** Change of type of institution / institution converted into a university
- **Type:** document
- **Applicability:** Check stated exception for Affidavit 2
- **Requirement:** No Objection Certificate from affiliating University/Board in Format 2.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 83
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.8-03 — 2.8(3)

- **Application category:** Change of type of institution / institution converted into a university
- **Type:** document
- **Applicability:** Check stated exception for Affidavit 2
- **Requirement:** Trust/Society/Company resolution in Format 3 approving change of institution type (institution converted into a university) / conversion of courses into allied vocational courses, as applicable.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 83
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.9-01 — 2.9(1)

- **Application category:** Change course name / merger of courses / reduce intake / close programme or course
- **Type:** document
- **Applicability:** Item 1 applies to programme/course closure as stated
- **Requirement:** For closure of programmes/courses, No Objection Certificate from affiliating University/Board in the prescribed Format 2, clearly describing arrangements for existing students.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 83
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.9-02 — 2.9(2)

- **Application category:** Change course name / merger of courses / reduce intake / close programme or course
- **Type:** document
- **Applicability:** Item 1 applies to programme/course closure as stated
- **Requirement:** Trust/Society/Company resolution in Format 3 approving course-name change, course merger, intake reduction or programme/course closure.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 83
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.9-NOTE-01 — 2.9 Note

- **Application category:** Course/programme changes
- **Type:** condition
- **Applicability:** Where State Government NoC applies
- **Requirement:** Institution/promoters must obtain State Government NoC, if applicable, before the academic session begins.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 83
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.10-01 — 2.10(1)

- **Application category:** Change in name of institution
- **Type:** document
- **Applicability:** Institution name change application
- **Requirement:** No Objection Certificate from affiliating University/Board in Format 2, or receipt bearing official seal as proof that documents were submitted.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 83
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.10-02 — 2.10(2)

- **Application category:** Change in name of institution
- **Type:** document
- **Applicability:** Institution name change application
- **Requirement:** Trust/Society/Company resolution in Format 3 approving change of institution name, signed by Chairperson/Secretary.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 83
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.11-01 — 2.11(1)

- **Application category:** Change in name of affiliating University/Board
- **Type:** document
- **Applicability:** Affiliating University/Board name change application
- **Requirement:** No Objection Certificate from affiliating University/Board in Format 2, or officially sealed receipt proving submission of documents.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 84
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.11-02 — 2.11(2)

- **Application category:** Change in name of affiliating University/Board
- **Type:** document
- **Applicability:** Affiliating University/Board name change application
- **Requirement:** Trust/Society/Company resolution in Format 3 approving change in name of affiliating University/Board, signed by Chairperson/Secretary.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 84
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.12-01 — 2.12(1)

- **Application category:** Change in bank details
- **Type:** document
- **Applicability:** Third item applies only where bank merger is the reason/context
- **Requirement:** Notarised Affidavit 9 of Trust/Society/Company Chairperson/Secretary stating reasons for change in bank details.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 84
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.12-02 — 2.12(2)

- **Application category:** Change in bank details
- **Type:** document
- **Applicability:** Third item applies only where bank merger is the reason/context
- **Requirement:** Trust/Society/Company resolution in Format 3 approving change in bank details, signed by Chairperson/Secretary.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 84
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.12-03 — 2.12(3)

- **Application category:** Change in bank details
- **Type:** document
- **Applicability:** Third item applies only where bank merger is the reason/context
- **Requirement:** In case of bank merger, NOC/certificate from the bank stating two or more banks have merged, subject to Government notification.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 84
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.13-01 — 2.13(1)

- **Application category:** Change in name/address of Trust/Society/Company or merger, subject to existing law
- **Type:** document
- **Applicability:** Apply relevant items based on change/merger and entity type
- **Requirement:** Approval from Charity Commissioner / Registrar of Societies / Registrar of Companies for change of Trust/Society/Company name/address or merger, subject to existing law.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 84
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.13-02 — 2.13(2)

- **Application category:** Change in name/address of Trust/Society/Company or merger, subject to existing law
- **Type:** document
- **Applicability:** Apply relevant items based on change/merger and entity type
- **Requirement:** Notarised Affidavit 10 of Chairperson/Secretary stating there is no commercial/business angle for the change.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 84
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.13-03 — 2.13(3)

- **Application category:** Change in name/address of Trust/Society/Company or merger, subject to existing law
- **Type:** document
- **Applicability:** Apply relevant items based on change/merger and entity type
- **Requirement:** Certified registration document of Trust/Society/Company showing members, objectives, MoA and Rules.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 84
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.13-04 — 2.13(4)

- **Application category:** Change in name/address of Trust/Society/Company or merger, subject to existing law
- **Type:** document
- **Applicability:** Apply relevant items based on change/merger and entity type
- **Requirement:** Recommended Board of Governors details as per Annexure 17.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 84
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.13-05 — 2.13(5)

- **Application category:** Change in name/address of Trust/Society/Company or merger, subject to existing law
- **Type:** document
- **Applicability:** Apply relevant items based on change/merger and entity type
- **Requirement:** For a Section 8 company, MoA and Rules must state non-profit objective and use of surplus exclusively for technical-institution development.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 84
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.13-06 — 2.13(6)

- **Application category:** Change in name/address of Trust/Society/Company or merger, subject to existing law
- **Type:** document
- **Applicability:** Apply relevant items based on change/merger and entity type
- **Requirement:** Land documents/lease deeds showing ownership in the name of the new Trust/Society/Company.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 84
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.13-07 — 2.13(7)

- **Application category:** Change in name/address of Trust/Society/Company or merger, subject to existing law
- **Type:** document
- **Applicability:** Apply relevant items based on change/merger and entity type
- **Requirement:** For merger, transferor entity must transfer land, assets and infrastructure by registered transfer/conveyance deed to the transferee entity.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 84
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.13-08 — 2.13(8)

- **Application category:** Change in name/address of Trust/Society/Company or merger, subject to existing law
- **Type:** document
- **Applicability:** Apply relevant items based on change/merger and entity type
- **Requirement:** Proof of working capital in the form described in Clause 1.5.3: fixed deposits or latest bank statement in the new entity's name from a Nationalised/Scheduled Commercial Bank recognised by RBI, with branch manager certificate.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 84
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.13-09 — 2.13(9)

- **Application category:** Change in name/address of Trust/Society/Company or merger, subject to existing law
- **Type:** document
- **Applicability:** Apply relevant items based on change/merger and entity type
- **Requirement:** Approval from the relevant Registrar/Charity Commissioner for changes in trustee/member names, where applicable.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 84
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.13-10 — 2.13(10)

- **Application category:** Change in name/address of Trust/Society/Company or merger, subject to existing law
- **Type:** document
- **Applicability:** Apply relevant items based on change/merger and entity type
- **Requirement:** Trust/Society/Company resolution in Format 3 approving change of entity name and stating reasons, signed by Chairperson/Secretary.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 84
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.14-01 — 2.14(1)

- **Application category:** Collaboration and Twinning Programme
- **Type:** document
- **Applicability:** Collaboration/twinning application
- **Requirement:** Authorised signatory letter from foreign university/institution declaring Indian-awarded Diploma/Degree/Post Diploma Certificate is recognised and treated as equivalent in the parent country.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 85
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.14-02 — 2.14(2)

- **Application category:** Collaboration and Twinning Programme
- **Type:** document
- **Applicability:** Collaboration/twinning application
- **Requirement:** Trustee letter stating fee and intake for each course under the collaboration/twinning programme.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 85
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.14-03 — 2.14(3)

- **Application category:** Collaboration and Twinning Programme
- **Type:** document
- **Applicability:** Collaboration/twinning application
- **Requirement:** Trustee and foreign university/institution letter setting out admission rules, entry qualifications, all fees, examination/evaluation and confirming no major deviation from parent-country procedures.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 85
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.14-04 — 2.14(4)

- **Application category:** Collaboration and Twinning Programme
- **Type:** document
- **Applicability:** Collaboration/twinning application
- **Requirement:** Trustee letter detailing semesters conducted in India and foreign country under Clause 3.2.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 85
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.14-05 — 2.14(5)

- **Application category:** Collaboration and Twinning Programme
- **Type:** document
- **Applicability:** Collaboration/twinning application
- **Requirement:** Bipartite agreement/MoU between foreign university/institution and Indian partner institution.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 85
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.14-06 — 2.14(6)

- **Application category:** Collaboration and Twinning Programme
- **Type:** document
- **Applicability:** Collaboration/twinning application
- **Requirement:** Bipartite agreement/MoU between Indian institution and affiliating University/Board.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 85
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.14-07 — 2.14(7)

- **Application category:** Collaboration and Twinning Programme
- **Type:** document
- **Applicability:** Collaboration/twinning application
- **Requirement:** Affidavit 11 addressing, among other provisions, arrangements for students who fail to obtain visas and registration by the University/Board in a similar programme.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 85
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.14-08 — 2.14(8)

- **Application category:** Collaboration and Twinning Programme
- **Type:** document
- **Applicability:** Collaboration/twinning application
- **Requirement:** Attested proof from foreign university/institution that a similar degree/diploma is offered in the parent country.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 85
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.14-09 — 2.14(9)

- **Application category:** Collaboration and Twinning Programme
- **Type:** document
- **Applicability:** Collaboration/twinning application
- **Requirement:** Letter from participating foreign university that the degree will be awarded only in its parent country.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 85
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.14-10 — 2.14(10)

- **Application category:** Collaboration and Twinning Programme
- **Type:** document
- **Applicability:** Collaboration/twinning application
- **Requirement:** Valid NBA certificate / NIRF ranking within top 200 by universities/institutes for the course(s) to be offered under collaboration/twinning.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 85
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.14-11 — 2.14(11)

- **Application category:** Collaboration and Twinning Programme
- **Type:** document
- **Applicability:** Collaboration/twinning application
- **Requirement:** Trust/Society/Company resolution approving collaboration/twinning programme, signed by Chairperson/Secretary in Format 3.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 85
- **Status:** draft_extracted_needs_human_review

### APH-A2-2.15-01 — 2.15

- **Application category:** MBA/PGDM (IEV) course
- **Type:** external_reference
- **Applicability:** MBA/PGDM (IEV) application; handbook does not enumerate the format here
- **Requirement:** Documents/information are to be provided according to the format available on the AICTE website.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 85
- **Status:** draft_extracted_needs_human_review
- **Notes:** Retrieve and verify the current official format.

### APH-A2-2.16-01 — 2.16

- **Application category:** Off-Campus
- **Type:** cross_reference
- **Applicability:** Off-Campus application
- **Requirement:** Documents/information are as per Annexure 1.
- **Source:** 2025031399.pdf, Annexure 2, printed p. 85
- **Status:** draft_extracted_needs_human_review
- **Notes:** Use the complete Annexure 1 checklist and verify any additional current instructions.

### APH-CH1-1.3.1 — 1.3.1

- **Application category:** New Technical Institution
- **Type:** process
- **Applicability:** New technical institution application
- **Requirement:** Online application through AICTE web portal via NSWS is mandatory; offline application is not accepted under the handbook's stated process.
- **Source:** 2025031399.pdf, Chapter I, printed p. 1
- **Status:** draft_extracted_needs_human_review

### APH-CH1-1.4.3 — 1.4.3

- **Application category:** New Technical Institution
- **Type:** process
- **Applicability:** New technical institution application
- **Requirement:** Applicant data must be correct; editing is available until final submission; documents must be digitally signed using DSC and submitted by the notified deadline.
- **Source:** 2025031399.pdf, Chapter I, printed p. 3
- **Status:** draft_extracted_needs_human_review

### APH-CH1-1.4.5 — 1.4.5

- **Application category:** New Technical Institution
- **Type:** process
- **Applicability:** New technical institution application
- **Requirement:** Submit a copy of the application to State Government/UT and affiliating University/Board and obtain an officially sealed receipt as described.
- **Source:** 2025031399.pdf, Chapter I, printed p. 3
- **Status:** draft_extracted_needs_human_review

### APH-CH1-1.4.7 — 1.4.7

- **Application category:** New Technical Institution
- **Type:** condition
- **Applicability:** New technical institution application
- **Requirement:** AICTE approval does not remove the institution's responsibility to obtain State Government/affiliating University/Board permissions where applicable.
- **Source:** 2025031399.pdf, Chapter I, printed p. 3
- **Status:** draft_extracted_needs_human_review

### APH-CH2-2.2 — 2.2

- **Application category:** Existing Institution — EoA
- **Type:** process
- **Applicability:** EoA and relevant approval applications
- **Requirement:** Application deadlines are set by AICTE public notice/website and are binding; online application is mandatory under the described process.
- **Source:** 2025031399.pdf, Chapter II, printed p. 12
- **Status:** draft_extracted_needs_human_review

### APH-CH2-2.3.4 — 2.3.4(a)-(e)

- **Application category:** Existing Institution — EoA
- **Type:** process
- **Applicability:** Existing institution applications; specific subclauses vary by category
- **Requirement:** Documents are uploaded digitally signed as specified; applications may be processed by scrutiny/re-scrutiny/EVC where applicable; applicable external laws must be followed.
- **Source:** 2025031399.pdf, Chapter II, printed p. 15
- **Status:** draft_extracted_needs_human_review

### APH-CH2-2.4 — 2.4

- **Application category:** Existing Institution — EoA
- **Type:** process
- **Applicability:** Applications with deficiencies
- **Requirement:** Institution may be given an opportunity to submit compliance for deficiencies, as applicable.
- **Source:** 2025031399.pdf, Chapter II, printed p. 15
- **Status:** draft_extracted_needs_human_review

### APH-CH2-2.5 — 2.5

- **Application category:** Existing Institution — EoA
- **Type:** process
- **Applicability:** EoA based on self-disclosure
- **Requirement:** EoA may be granted based on self-disclosure of facilities/infrastructure; Council may monitor compliance and initiate penal action for non-fulfilment.
- **Source:** 2025031399.pdf, Chapter II, printed p. 15
- **Status:** draft_extracted_needs_human_review


