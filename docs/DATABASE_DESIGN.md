# Database Design & Schema Specification

**Target Database:** Supabase PostgreSQL  
**Region:** ap-northeast-2 (Seoul, AWS) with IPv4 Connection Pooler  

## 1. Core Tables

### `public.regulatory_rules`
- Stores versioned regulatory requirements from AICTE handbook.
- Primary key: `id UUID`, Unique key: `rule_id TEXT`.
- Verification statuses: `draft_extracted_needs_human_review`, `verified`, `approved_for_use`, `superseded`, `needs_review`.

### `public.applications`
- Represents an institution's filing.
- Columns: `id UUID`, `application_number TEXT UNIQUE`, `institution_name TEXT`, `institution_email TEXT`, `category TEXT`, `status TEXT`, `academic_year TEXT`, `submitted_at TIMESTAMPTZ`, `created_at`, `updated_at`.
- Status lifecycle: `Draft`, `Submitted`, `Queued`, `Processing`, `Review required`, `Under official review`, `Deficiency raised`, `Resubmitted`, `Decision recorded`.

### `public.uploaded_documents`
- Uploaded supporting evidence files.
- Columns: `id UUID`, `application_id UUID`, `rule_id TEXT`, `document_name TEXT`, `file_size INTEGER`, `mime_type TEXT`, `extracted_text TEXT`, `ocr_status TEXT`, `validation_status TEXT`, `ai_analysis JSONB`, `uploaded_at TIMESTAMPTZ`.

### `public.validation_findings`
- Automated checks and reviewer observations.
- Columns: `id UUID`, `application_id UUID`, `document_id UUID`, `rule_id TEXT`, `finding_type TEXT` (`passed`, `deficiency`, `warning`, `needs_review`), `clause_reference TEXT`, `message TEXT`, `explanation TEXT`, `evidence_snippet TEXT`, `reviewed_by TEXT`, `is_overridden BOOLEAN`, `override_reason TEXT`.

### `public.notification_logs`
- Traceable email and in-app alerts.
- Columns: `id UUID`, `application_id UUID`, `recipient_email TEXT`, `subject TEXT`, `status TEXT`, `sent_at TIMESTAMPTZ`.
