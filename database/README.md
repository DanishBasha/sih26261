# Database Migrations & Seeds

## Structure
- `migrations/001_initial_schema.sql`: Creates `public.regulatory_rules` and application workflow tables.
- `seed/001_regulatory_rules.sql`: Populates the 140 regulatory rules extracted from Annexures 1 and 2 of the AICTE Approval Process Handbook (2024–25 to 2026–27).

## How to Execute
You can run these scripts in your Supabase SQL Editor, or use the automated seed script:
```bash
npm --prefix backend run db:seed
```
