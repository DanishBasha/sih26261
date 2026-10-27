import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from root
const envPath = path.resolve(__dirname, '../../.env');
dotenv.config({ path: envPath });

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ DATABASE_URL is not set in .env');
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false }, // Required for Supabase cloud connection
});

async function runSeed() {
  const client = await pool.connect();
  try {
    console.log('🔗 Connected to Supabase PostgreSQL database...');

    // 1. Read and execute Schema
    const schemaFile = path.resolve(__dirname, '../../SIH26261_Supabase_Rules_Schema.sql');
    if (fs.existsSync(schemaFile)) {
      console.log('📜 Applying database schema...');
      const schemaSql = fs.readFileSync(schemaFile, 'utf8');
      await client.query(schemaSql);
      console.log('✅ regulatory_rules table created/verified.');
    }

    // 2. Check current rules count
    const countRes = await client.query('SELECT COUNT(*) FROM public.regulatory_rules');
    const existingCount = parseInt(countRes.rows[0].count, 10);
    console.log(`📊 Current rules in database: ${existingCount}`);

    if (existingCount > 0) {
      console.log('ℹ️ Rules already seeded. Skipping re-seed (or truncating if fresh seed requested).');
    } else {
      // 3. Read and execute Seed
      const seedFile = path.resolve(__dirname, '../../SIH26261_Supabase_Rules_Seed.sql');
      if (fs.existsSync(seedFile)) {
        console.log('🌱 Seeding 140 AICTE handbook rules...');
        let seedSql = fs.readFileSync(seedFile, 'utf8');
        // Add ON CONFLICT to avoid duplicate key errors if re-run
        if (!seedSql.includes('on conflict')) {
          seedSql = seedSql.trim().replace(/;?\s*$/, ' ON CONFLICT (rule_id) DO NOTHING;');
        }
        await client.query(seedSql);
        const newCountRes = await client.query('SELECT COUNT(*) FROM public.regulatory_rules');
        console.log(`✅ Successfully seeded rules. Total rules in database: ${newCountRes.rows[0].count}`);
      }
    }

    // Create additional application and document tables if not exists
    console.log('📑 Creating core application and findings tables...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.applications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        application_number TEXT UNIQUE NOT NULL,
        institution_name TEXT NOT NULL,
        institution_email TEXT NOT NULL,
        category TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Draft',
        academic_year TEXT DEFAULT '2025-26',
        submitted_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS public.uploaded_documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
        rule_id TEXT,
        document_name TEXT NOT NULL,
        file_path TEXT,
        file_size INTEGER,
        mime_type TEXT,
        extracted_text TEXT,
        ocr_status TEXT DEFAULT 'pending',
        validation_status TEXT DEFAULT 'pending',
        ai_analysis JSONB,
        uploaded_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS public.validation_findings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
        document_id UUID REFERENCES public.uploaded_documents(id) ON DELETE CASCADE,
        rule_id TEXT NOT NULL,
        finding_type TEXT NOT NULL, -- 'passed', 'deficiency', 'warning', 'needs_review'
        clause_reference TEXT,
        message TEXT NOT NULL,
        explanation TEXT,
        evidence_snippet TEXT,
        reviewed_by TEXT,
        is_overridden BOOLEAN DEFAULT false,
        override_reason TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS public.notification_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL,
        recipient_email TEXT NOT NULL,
        subject TEXT NOT NULL,
        status TEXT NOT NULL,
        error_message TEXT,
        sent_at TIMESTAMPTZ DEFAULT now()
      );
    `);
    console.log('✅ Application, documents, findings, and notifications tables verified.');

  } catch (err) {
    console.error('❌ Error seeding database:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runSeed();
