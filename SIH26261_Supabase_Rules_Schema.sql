-- SIH26261 draft regulatory rules table for Supabase/PostgreSQL
-- Review the handbook-derived rows before marking any rule approved_for_use.
create extension if not exists pgcrypto;

create table if not exists public.regulatory_rules (
  id uuid primary key default gen_random_uuid(),
  rule_id text not null unique,
  source_edition text not null,
  source_document text not null,
  annexure text not null,
  source_clause text not null,
  printed_page integer,
  application_category text not null,
  requirement_type text not null,
  requirement_text text not null,
  applicability_condition text not null,
  verification_status text not null default 'draft_extracted_needs_human_review'
    check (verification_status in (
      'draft_extracted_needs_human_review',
      'verified',
      'approved_for_use',
      'superseded',
      'needs_review'
    )),
  effective_from date,
  effective_to date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  reviewed_by uuid,
  reviewed_at timestamptz,
  supersedes_rule_id text,
  source_url text,
  retrieval_date date
);

create index if not exists idx_regulatory_rules_category
  on public.regulatory_rules (application_category);

create index if not exists idx_regulatory_rules_status
  on public.regulatory_rules (verification_status);

create index if not exists idx_regulatory_rules_source
  on public.regulatory_rules (source_edition, annexure, source_clause);

-- Keep unreviewed rules out of production validation by querying only
-- verification_status = 'approved_for_use'.
