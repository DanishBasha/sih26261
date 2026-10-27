import { query } from '../config/supabase.js';
import { verifyComplianceWithGroq } from './groq.service.js';

export async function validateDocument({ documentName, extractedText, ruleId }) {
  const ruleRes = await query('SELECT * FROM public.regulatory_rules WHERE rule_id = $1', [ruleId]);
  const rule = ruleRes.rows[0] || {
    source_clause: 'General',
    annexure: 'Annexure 1',
    printed_page: null,
    requirement_text: 'Mandatory statutory document'
  };

  const aiAnalysis = await verifyComplianceWithGroq({
    documentName,
    extractedText,
    ruleRequirement: rule.requirement_text,
    ruleClause: rule.source_clause,
    annexure: rule.annexure,
    printedPage: rule.printed_page
  });

  return { rule, aiAnalysis };
}
