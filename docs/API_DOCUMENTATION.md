# API Documentation

Base URL: `/api`

## 1. System Health
- **`GET /api/health`**
  - Returns connection status of Supabase PostgreSQL, Groq AI, and Gmail SMTP.

## 2. Regulatory Rules
- **`GET /api/rules`**
  - Query params: `category`, `annexure`, `search`, `limit`, `offset`.
- **`GET /api/rules/categories`**
  - Returns distinct application categories.
- **`GET /api/rules/checklist/:category`**
  - Returns required document checklist for a selected category.

## 3. Applications
- **`GET /api/applications`**
  - Lists applications with document count and deficiency counts.
- **`POST /api/applications`**
  - Creates a new application in `Draft` status. Dispatches confirmation email.
- **`GET /api/applications/:id`**
  - Retrieves application details, uploaded documents, and validation findings.
- **`PATCH /api/applications/:id/submit`**
  - Moves application to `Review required`. Dispatches submission acknowledgement email.

## 4. Documents & Validation
- **`POST /api/documents/upload`**
  - Multipart form (`file`, `application_id`, `rule_id`, `document_name`).
  - Extracts text from PDF, triggers Groq AI clause evaluation, saves document and finding.

## 5. Reviewer Workflow
- **`POST /api/reviews/deficiency`**
  - Raises a deficiency, changes status to `Deficiency raised`, dispatches deficiency email notice.
- **`POST /api/reviews/approve`**
  - Formally approves application, updates status to `Decision recorded`, dispatches approval email.
- **`POST /api/reviews/override`**
  - Overrides an AI finding, records mandatory statutory justification into audit trail.
