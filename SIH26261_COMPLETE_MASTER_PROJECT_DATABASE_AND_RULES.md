# SIH26261 — Complete Project Blueprint, Database, Rules and Implementation Manual

**Project:** AI-Powered Application Validation, Document Authentication and Regulatory Compliance Verification  
**Scope:** SIH26261 only.  
**Stack:** React + Vite; Node.js + Express; Supabase PostgreSQL + private Storage; OCR/document extraction; deterministic rule engine; RAG; Groq API; background jobs; notification centre; role-based portals.

> **Scope and completeness note:** This master manual combines the available project decisions and artifacts, and embeds the complete available 140-rule draft register. It cannot guarantee a verbatim transcript of messages not available in the recovered conversation context. All handbook-derived rules remain drafts until human-verified against the current official sources.

## Contents
1. Objective and principles
2. Portals and roles
3. Application lifecycle
4. Document intake and requirements
5. Validation engine, OCR and Groq/RAG
6. Notifications and reminders
7. Security, audit and privacy
8. Architecture and deployment
9. Database schema and data dictionary
10. Automatic migration/seed workflow
11. API plan
12. Implementation order and acceptance checks
13. AICTE handbook context and limitations
14. Complete available draft rule register
15. Original project requirement extraction

## 1. Objective and principles
Build a system to support institutions and authorized AICTE-related reviewers through category-specific checklists, secure document uploads, extraction/OCR, deterministic compliance checks, evidence-linked explanations, deficiency/resubmission workflow, status notifications, review/decision tracking and audit history.

Principles:
- Official decisions remain with authorized humans.
- AI/OCR is decision support, not proof of forgery.
- Rules are versioned, sourced, effective-dated and human-approved.
- Draft/unverified rules never silently become production rules.
- A source clause and evidence should be shown for each material finding.
- Institution account status is distinct from regulatory approval status.
- Rule edits are managed in code/migrations and review workflows, not by hand-editing production rows every time.

## 2. Portals and roles
### Institution portal
Secure access; institution profile; create application; choose New Institution/EoA/other supported category; dynamic checklist; upload/replace documents; view extraction status; see missing/unreadable/expired/inconsistent items; see source-grounded findings; respond to deficiencies; resubmit; see timeline and decisions; receive in-app/email alerts.

### Official/reviewer portal
Assigned applications; filters and queues; original document plus extracted text; evidence-linked findings and rule references; request clarification/raise deficiency; review resubmission; record actions and authorized decisions; monitor due/overdue cases and approvals nearing expiry/expired/cancelled where relevant; log override reason.

### Higher-authority/system administration portal
Manage accounts/roles; oversee case queues; review audit events and exceptional overrides; maintain versioned rule catalogue and source documents; review/approve rule changes; monitor processing failures, overdue cases and reports. Higher-authority oversight does not automatically grant decision authority.

## 3. Application lifecycle
`Draft → Submitted → Queued → Processing → Review required → Under official review → Deficiency raised → Resubmitted → Decision recorded`

Additional statuses: `Processing failed`, `Withdrawn`. Each transition should record actor, timestamp, prior/new status and reason. Processing failure must have a retry path. Processing completion is not an approval.

## 4. Document intake and requirements
- Accept supported PDF/image types; validate type, size and content.
- Store privately in Supabase Storage; persist bucket/path, checksum, version, upload actor/time and processing status.
- Extract embedded PDF text first; OCR scanned pages where needed; retain page mapping and extraction metadata.
- Flag poor OCR for manual verification.
- Generate a checklist from `document_requirements` filtered by application category, applicability conditions and approved rule version.
- New Institution examples: building plan/certificates; applicable affidavit/resolution; occupancy/completion/building licence/Form D as applicable; fire safety; bank certificate; registration/constitution documents; land/lease evidence; applicable facility/EVC evidence.
- EoA examples: applicable affidavit; payment receipt where required; occupancy/completion certificate; structural stability certificate when the stated age condition applies; fire certificate; satellite map/coordinates; previous-year audited accounts.
- Additional categories include specified changes such as site/location, programmes, intake, mergers, closure, institution name, affiliating university, organisation details, collaboration and other handbook categories.
- This list is not a substitute for the complete draft rule register. Requirements can be conditional; do not require every conditional item for every applicant.

## 5. Validation engine, OCR and Groq/RAG
Pipeline:
1. Extract text/OCR.
2. Normalize supported fields.
3. Retrieve rules approved for the relevant category/date/type.
4. Run deterministic checks for explicit requirements.
5. Run cross-document comparisons where reliable.
6. Retrieve relevant source clauses using keyword/vector/hybrid retrieval.
7. Call Groq to explain evidence against retrieved rule text and return structured advisory findings.
8. Validate model output against a JSON schema; reject malformed output.
9. Save findings with rule ID, source clause/page, evidence excerpt/page, model/provider metadata, prompt version, confidence (if returned), and human-review flag.
10. Show original document and findings to reviewer.

Never ask Groq to invent applicable law. If source coverage is missing, return `verification required`. Never auto-reject solely because AI/OCR suspects a mismatch.

## 6. Notifications and reminders
### Institution
Submitted; processing started/completed/failed; missing/unreadable documents; deficiency; clarification request; resubmission received; status/decision update; relevant checklist/rule change.

### Official
New/assigned application; resubmission; review deadline approaching/overdue; processing failure; approvals approaching expiry/expired/cancelled where applicable; anomaly/override requiring attention.

### Higher authority
Anomaly overridden and approval proceeds: require a reason, generate a prominent alert and preserve evidence/audit. Rule changes: record old/new versions, actor, timestamp, reason and effective date. Escalate overdue cases and repeated processing failures according to configurable policy.

### Notification centre
In-app bell/unread count; read/unread state; timestamp; type; linked application; safe action URL; email for important events; no passwords or sensitive file contents in email; delivery status/retries; duplicate suppression; role-scoped visibility; configurable reminder schedules and escalation thresholds; audit history.

## 7. Security, audit and privacy
Server-side RBAC; least privilege; private storage; short-lived signed URLs; upload limits and safe filenames; malware scanning where available; MFA for privileged users where supported; rate limiting and input validation; secret management; `.env` ignored by Git; audit uploads/access/rule changes/jobs/notifications/status/reviews/overrides/decisions; define retention according to policy/law. Service-role and Groq keys are backend secrets only, never Vite variables or public code.

## 8. Architecture
- Frontend: React + Vite.
- Backend: Node.js + Express.
- Database: Supabase PostgreSQL.
- Files: private Supabase Storage.
- Auth: Supabase Auth plus application roles, or a carefully implemented server-side session/JWT design.
- OCR: PDF text extraction plus Tesseract.js/PDF-to-image path as needed.
- Rules: deterministic checks.
- RAG: embeddings + pgvector/keyword hybrid retrieval over approved sources.
- LLM: Groq API via `groq-sdk`.
- Jobs: Redis + BullMQ when processing is asynchronous/long-running.
- Notifications: in-app records + email provider/SMTP.
- Observability: structured logs, job status, failure/retry and audit history.

## 9. Database schema and data dictionary
Use the accompanying `SIH26261_Full_Database_Schema.sql` and `SIH26261_Full_Database_Seed.sql`.

Tables:
1. `user_profiles`: role/profile linked to `auth.users`.
2. `institutions`: institution profile and separate portal/approval status.
3. `regulatory_sources`: source edition/URL/effective status.
4. `regulatory_rules`: rule ID, source, clause/page, category, text, applicability, verification/effective dates, reviewer and supersession.
5. `document_requirements`: checklist-facing catalogue derived from document-type rules.
6. `applications`: category, institution, state, assignment, deadline and decision fields.
7. `application_documents`: file metadata, private storage path, versions, extraction/OCR status/text and expiry metadata.
8. `application_checklist_items`: per-application rule/check result and evidence.
9. `validation_findings`: finding, severity, source/evidence, model metadata and reviewer resolution.
10. `deficiencies`: deficiency/clarification, due date and response.
11. `review_actions`: reviewer actions and status transitions.
12. `decisions`: outcome/reason/actor/time; anomaly override requires reason and can trigger higher-authority alert.
13. `notifications`: recipient, application, event, channel, schedule, delivery/read state and dedupe key.
14. `notification_preferences`: in-app/email/reminder preferences.
15. `audit_events`: actor, event, entity, summary and before/after snapshots.
16. `rule_change_requests`: proposed create/update/supersede/retire changes and approval.
17. `processing_jobs`: extraction/OCR/validation/RAG/notification queue lifecycle.

Relationships: institution → many applications; application → documents, checklist items, findings, deficiencies, review actions, decisions, notifications and jobs; rule → document requirement and many checklist items/findings. Store historical rule snapshots with checklist results so later rule edits do not rewrite history.

## 10. Automatic migration/seed workflow
You should not need to edit Supabase rows manually for each code change. Use version-controlled migrations and seed files:
1. New schema change → create a new migration SQL file.
2. Apply pending migrations with Supabase CLI `supabase db push` after linking the project.
3. Update reference rules in a controlled seed script.
4. Run seed when reference data changes.
5. For normal user submissions, the backend writes application data through APIs; do not run seed for each submission.
6. Never edit an already-applied migration to represent a new change; add a new migration.
7. Test in local/staging before production and protect CI secrets.

The assistant cannot directly create tables inside a Supabase project without project access. These SQL files define the database and can be run in the user's Supabase project. Never share service-role credentials in chat.

## 11. API plan
Existing rules starter endpoints:
- `GET /api/rules/health`
- `GET /api/rules?category=new_institution`
- `GET /api/rules?category=eoa`
- `GET /api/rules?category=eoa&includeDraft=true` for development only
- `GET /api/rules/:ruleId`

Later endpoints to implement:
- `POST /api/applications`
- `GET /api/applications`
- `GET /api/applications/:id`
- `POST /api/applications/:id/documents` (secure upload flow)
- `GET /api/applications/:id/checklist`
- `POST /api/applications/:id/submit`
- `POST /api/applications/:id/deficiencies`
- `POST /api/applications/:id/responses`
- `POST /api/applications/:id/assign`
- `POST /api/applications/:id/decision`
- `GET /api/notifications`
- `PATCH /api/notifications/:id/read`
- `POST /api/rules/change-requests`
All routes need authentication, role checks, validation, audit events and correct institution scoping.

## 12. Implementation order and acceptance checks
1. Create Supabase project.
2. Apply schema SQL.
3. Apply seed SQL.
4. Confirm 140 draft rule rows and document requirements.
5. Test API rules endpoints.
6. Build institution application form and dynamic checklist.
7. Implement secure upload and processing jobs.
8. Add extraction/OCR and deterministic validation.
9. Add source retrieval and Groq explanation service.
10. Build official reviewer portal, deficiency and resubmission flow.
11. Add notification centre/email/reminders/escalation.
12. Add higher-authority rule governance and anomaly override alerts.
13. Complete role-based RLS and audit testing.
14. Verify every production rule against current official sources.

Acceptance:
- All seeded rules remain draft.
- Default production rules API excludes drafts.
- Checklist displays only approved rules in production mode.
- Every finding can be traced to source and evidence.
- No API key is exposed to frontend.
- Institution users cannot read another institution's cases.
- Reviewer actions and decisions are audited.
- Anomaly override requires reason and creates higher-authority alert.
- Failed jobs are visible and retryable.
- Notification delivery/read state is tracked.

## 13. AICTE handbook context and limitations
Source file: `2025031399.pdf`, identified as AICTE Approval Process Handbook 2024–25 to 2026–27 (231 pages).
Areas identified: Chapter I New Institution (printed p.1 onward); Chapter II EoA existing institutions (p.11 onward); Chapter VI Standard Norms (p.53 onward); Chapter VII Penal actions (p.70 onward); Chapter VIII Do’s/Don’ts (p.75 onward); Annexure 1 new institution documents (p.77 onward); Annexure 2 existing institutions and multiple changes (p.81 onward); Annexure 3 built-up area; Annexure 8 duration/entry qualification; Annexure 11 and other annexures for course nomenclature/context-specific requirements.
Official URL recorded: https://www.aicte.gov.in/sites/default/files/APH%20Final.pdf
The handbook references other laws/regulations, notifications, circulars, corrigenda and administrative instructions. Do not assume this one edition contains every current rule.

## 14. Complete available draft rule register
The complete 140-rule human-readable register from the earlier extraction is appended below. The JSON and CSV versions are separate companion files for database loading/review. All rows require human review.



---

# APPENDIX A — FULL DRAFT RULE REGISTER (140 RECORDS)

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



---

# APPENDIX B — HANDBOOK REQUIREMENTS EXTRACTION

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


---

# APPENDIX C — DATABASE BUILD NOTES

# Database build and automatic code-to-Supabase workflow

## Can this assistant directly create tables inside your Supabase project?
Not without access to your Supabase project/credentials. This deliverable creates the complete SQL schema and seed scripts. Run them against your own project once, then use migrations and seed commands from your code repository for future changes. Do not send the service-role key in chat.

## Database files
- `SIH26261_Full_Database_Schema.sql` — tables, enums, indexes, triggers and initial RLS.
- `SIH26261_Full_Database_Seed.sql` — source record, 140 draft rules and document-requirement catalogue.
- `SIH26261_AI_CTE_Rule_Register_Annexures_1_2.json/.csv/.md` — reviewable source register.

## Included tables
1. `user_profiles` — user role/profile linked to Supabase Auth.
2. `institutions` — institution identity and separate portal/approval status.
3. `regulatory_sources` — handbook/source editions and status.
4. `regulatory_rules` — versioned rules, clause/page, applicability and verification state.
5. `document_requirements` — checklist catalogue derived from document-type rules.
6. `applications` — application category, state, assigned reviewer, deadline and decision snapshot.
7. `application_documents` — private-storage path, versions, extraction/OCR metadata, dates and status.
8. `application_checklist_items` — per-application result against a rule/requirement.
9. `validation_findings` — evidence-linked findings, severity, source clause and model metadata.
10. `deficiencies` — clarification/deficiency notice and institution response.
11. `review_actions` — reviewer status changes and notes.
12. `decisions` — authorized decision, reason, anomaly override and higher-authority alert flag.
13. `notifications` — in-app/email notification, scheduled time, read/delivery state and deduplication.
14. `notification_preferences` — user channel/reminder preferences.
15. `audit_events` — append-oriented event history.
16. `rule_change_requests` — proposed rule edits awaiting review/approval.
17. `processing_jobs` — OCR/extraction/validation/RAG/notification job lifecycle.

## Build sequence in Supabase
1. Create a Supabase project.
2. Save the schema file under a versioned project path, for example `supabase/migrations/202610270001_sih26261_schema.sql`.
3. Apply the schema once using Supabase CLI migrations or SQL Editor.
4. Run the seed file once using the same database connection.
5. Verify:
   - `select count(*) from public.regulatory_rules;`
   - `select verification_status, count(*) from public.regulatory_rules group by verification_status;`
   - `select count(*) from public.document_requirements;`
6. The rules must remain draft pending review.

## Automatic database updates from code
Recommended project layout:
```text
project-root/
  frontend/
  backend/
  supabase/
    config.toml
    migrations/
      202610270001_sih26261_schema.sql
    seed.sql
  scripts/
    db-push.ps1
    db-seed.ps1
  .env
  .gitignore
```
- A new schema change is a new migration SQL file; never silently edit an already-applied migration.
- Run `supabase db push` to apply pending migrations to the linked project (requires Supabase CLI and project linking).
- Run a seed script/command when reference data changes.
- In CI/CD, use protected secrets to run migrations after review; don't run destructive database changes on every frontend save.
- Ordinary application submissions are inserted/updated by backend APIs; they do not require running seed scripts.
- Supabase service-role credentials are backend/CI secrets only and must never be included in Vite variables such as `VITE_SUPABASE_SERVICE_ROLE_KEY`.
- Keep `.env` in `.gitignore`.
- Use local development or staging before production.

## RLS and security note
The schema enables RLS on user-facing tables and includes only narrow starter policies for users' own profiles and notifications. It intentionally does not create broad public policies for institution applications, documents, findings, rules or audit data. Before connecting the frontend directly to Supabase, add and test role-/institution-scoped policies. Prefer backend APIs for privileged operations. The service-role key bypasses RLS, so protect it rigorously.

## Groq API integration
Use Groq as the LLM provider for source-grounded explanation and structured findings. Configure on the backend:
```env
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=your_selected_supported_model
```
Install:
```powershell
npm install groq-sdk
```
- Do not expose `GROQ_API_KEY` to the browser or commit it.
- Retrieve only applicable rule rows and relevant document excerpts before calling Groq.
- Ask for structured output, but validate the returned JSON against a schema.
- Persist model name, prompt/config version, retrieved rule IDs and evidence references with findings.
- Groq output is advisory. Deterministic checks and human review govern the workflow.
- Model availability/pricing changes; choose a supported model from Groq's current console/docs at implementation time.

## Documents required at application intake
The seed turns every extracted rule whose `requirement_type` is `document` into a row in `document_requirements`. This includes the draft Annexure 1 New Institution list and Annexure 2 EoA/change-category list. The app should display only the requirements whose rule status is approved for production; a development mode may display draft items with a clear "not verified" label. Some requirements are conditional or apply only to specific application types. The checklist generator must evaluate `applicability_condition`; it must not blindly mark every conditional document as universally required.

Examples captured in the draft register include:
- New Institution: building plan/certificates, applicable affidavits/resolutions, occupancy/completion/building licence/Form D as applicable, fire safety, bank certificate, organisation registration/constitution, land/lease evidence, and applicable EVC/facility evidence.
- EoA: applicable affidavit, payment receipt where required, occupancy/completion certificate, structural stability certificate when the stated age condition applies, valid fire certificate, satellite map/coordinates, previous-year audited accounts.
- Additional conditional categories: changes to site/location, new programmes, intake, mergers, closure, institution name, affiliating university, trust/society/company details, collaborations and other categories described in the handbook.
These are examples, not a complete substitute for the full rule register below or official verification.

## Database model relationships
- One institution can have many applications.
- One application can have many uploaded document versions, checklist items, findings, deficiencies, review actions, decisions, notifications and jobs.
- A rule may map to one document requirement and many application checklist items.
- Findings may refer to a rule, document and checklist item.
- A decision may trigger a higher-authority alert when `anomaly_override=true`; `override_reason` is required by a check constraint.
- Notifications are recipient-specific, can be scheduled and deduplicated, and can be delivered in-app or email.
- Audit events retain who/what/when and before/after snapshots where available.

## Known limitations and items requiring human review
- The 140 rules are draft extraction from selected Chapter I/II clauses and Annexures 1 and 2. They are not a complete legal corpus and may require correction.
- The handbook references other regulations, notifications, circulars, corrigenda and applicable laws.
- A production checklist must consider current effective date, institution type, programme, application category and any conditional clauses.
- The starter schema does not by itself implement all application-level authorization policies, email delivery, OCR workers, Groq calls, or production deployment.
- Do not treat OCR mismatch, model confidence or anomaly as proof of fraud.
