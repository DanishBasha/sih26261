import { query } from '../config/supabase.js';

export async function getStats(req, res) {
  const rules = await query('SELECT count(*) FROM public.regulatory_rules');
  const apps = await query('SELECT count(*) FROM public.applications');
  const findings = await query('SELECT count(*) FROM public.validation_findings');
  res.json({
    success: true,
    stats: {
      rules: parseInt(rules.rows[0].count, 10),
      applications: parseInt(apps.rows[0].count, 10),
      findings: parseInt(findings.rows[0].count, 10)
    }
  });
}
