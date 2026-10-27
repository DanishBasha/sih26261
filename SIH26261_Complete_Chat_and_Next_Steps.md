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
