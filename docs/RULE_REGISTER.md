# Regulatory Rule Register Specification

## 1. Rule Lifecycle
```text
Draft extracted rule (draft_extracted_needs_human_review)
        ↓
Human verifies source clause, printed page, and requirement text
        ↓
Rule marked as 'verified'
        ↓
Rule authorized and marked 'approved_for_use'
        ↓
Effective date set -> Available to production validator
        ↓
Superseded by newer handbook circular -> 'superseded'
```

## 2. Rule Structure Fields
Each regulatory rule contains:
- `rule_id`: Unique identifier (e.g. `APH-A1-1.1-01`).
- `source_edition`: `AICTE Approval Process Handbook 2024–25 to 2026–27`.
- `source_document`: `2025031399.pdf`.
- `annexure`: `Annexure 1` or `Annexure 2`.
- `source_clause`: Handbook clause number (e.g. `1.1(i)`).
- `printed_page`: Original printed page number in the APH.
- `application_category`: Normalized application category.
- `requirement_type`: `document`, `process`, or `condition`.
- `requirement_text`: Official requirement description.
- `applicability_condition`: Mandatory vs conditional applicability.
- `verification_status`: Status constraint (`draft_extracted_needs_human_review`, `verified`, `approved_for_use`, `superseded`, `needs_review`).

## 3. Seeded Register
A total of **140 draft rules** extracted from Annexures 1 & 2 are seeded into the Supabase database.
