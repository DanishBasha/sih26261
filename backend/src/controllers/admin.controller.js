import { query } from '../config/supabase.js';
import * as instService from '../services/institution.service.js';

export async function getStats(req, res) {
  const rules = await query('SELECT count(*) FROM public.regulatory_rules');
  const apps = await query('SELECT count(*) FROM public.applications');
  const findings = await query('SELECT count(*) FROM public.validation_findings');
  const institutions = await query('SELECT count(*) FROM public.institutions');
  const users = await query('SELECT count(*) FROM public.user_profiles');

  res.json({
    success: true,
    stats: {
      rules: parseInt(rules.rows[0].count, 10),
      applications: parseInt(apps.rows[0].count, 10),
      findings: parseInt(findings.rows[0].count, 10),
      institutions: parseInt(institutions.rows[0].count, 10),
      users: parseInt(users.rows[0].count, 10)
    }
  });
}

export async function listInstitutionVerifications(req, res) {
  try {
    const list = await instService.listPendingVerifications();
    res.json({ success: true, verifications: list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function reviewInstitutionVerification(req, res) {
  try {
    const { id } = req.params;
    const { decision, remarks } = req.body;
    const institution = await instService.reviewVerification({
      institution_id: id,
      decision,
      remarks,
      reviewer_name: req.user?.full_name || 'AICTE Scrutiny Officer'
    });
    res.json({ success: true, institution });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}
