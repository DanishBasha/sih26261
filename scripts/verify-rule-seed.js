import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getDbUrl() {
  const p1 = path.resolve(__dirname, '../.env');
  const p2 = path.resolve(__dirname, '../backend/.env');
  const file = fs.existsSync(p1) ? p1 : p2;
  const content = fs.readFileSync(file, 'utf8');
  for (const line of content.split('\n')) {
    if (line.startsWith('DATABASE_URL=')) {
      return line.slice('DATABASE_URL='.length).trim();
    }
  }
  return null;
}

async function verify() {
  const pgPath = path.resolve(__dirname, '../backend/node_modules/pg/lib/index.js');
  const { default: pg } = await import(pathToFileURL(pgPath).href);
  const dbUrl = getDbUrl();

  const pool = new pg.Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const res = await pool.query('SELECT count(*) FROM public.regulatory_rules');
    console.log(`📊 Verified regulatory_rules in Supabase: ${res.rows[0].count} rules`);
    const cats = await pool.query('SELECT DISTINCT application_category FROM public.regulatory_rules');
    console.log(`📁 Application Categories in DB:`, cats.rows.map(r => r.application_category));
  } catch (err) {
    console.error('❌ Verification failed:', err.message);
  } finally {
    await pool.end();
  }
}

verify();
