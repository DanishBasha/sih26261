# SIH26261 — AI-Powered Application Validation & AICTE Regulatory Scrutiny Platform

**Smart India Hackathon Problem Statement:** SIH26261  
**Project Objective:** Role-based platform assisting technical education institutions with AICTE approval filings, and supporting official scrutiny committees with automated document authentication, clause-level compliance checks, and evidence-grounded findings.

---

## 1. System Architecture & Features

- **Institution Portal:**
  - Dynamic checklist generator driven by versioned AICTE handbook rules (Annexures 1 & 2).
  - Drag-and-drop file upload with automated text extraction and Groq AI clause evaluation.
  - Deficiency response and re-submission workflows with instant email notifications.
- **Official Reviewer Portal:**
  - Scrutiny queue with side-by-side original evidence and clause reference comparisons.
  - One-click actions to raise deficiencies or record formal approval decisions.
  - Statutory override mechanism with mandatory justification logged to audit trail.
- **Admin & Oversight Portal:**
  - Real-time diagnostics for Supabase PostgreSQL, Groq AI, and Gmail SMTP services.
  - Rule register catalog manager.

---

## 2. Directory Structure

```text
SIH26261/
├── docs/           # Specifications, Handbook rules, API & Database design
├── database/       # Supabase SQL migrations and 140-rule seed files
├── backend/        # Express API, Supabase, Groq AI, and Nodemailer services
├── frontend/       # React + Vite + Tailwind CSS role-based dashboards
└── scripts/        # Verification and environment diagnostic utilities
```

---

## 3. Quick Start (Local Development)

### Prerequisites
- Node.js v18+ (tested on Node.js v24)
- npm v10+

### Installation & Run
```bash
# 1. Install dependencies
npm run install:all

# 2. Start Backend (Port 5001)
npm run dev:backend

# 3. Start Frontend (Port 5173/5174)
npm run dev:frontend
```

---

## 4. Environment Variables

Store in `backend/.env` or root `.env`:
```dotenv
DATABASE_URL=postgresql://postgres.[REF]:[PASS]@[HOST]:5432/postgres
SUPABASE_URL=https://[REF].supabase.co
GROQ_API_KEY=gsk_...
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_16_char_google_app_password
PORT=5001
```
