import { query } from '../config/supabase.js';

export async function getDistinctCategories() {
  const result = await query(`
    SELECT DISTINCT application_category
    FROM public.regulatory_rules
    ORDER BY application_category ASC
  `);
  return result.rows.map(r => r.application_category);
}

export async function getChecklistByCategory(category) {
  const result = await query(`
    SELECT 
      rule_id, annexure, source_clause, printed_page, requirement_type,
      requirement_text, applicability_condition, verification_status
    FROM public.regulatory_rules
    WHERE application_category ILIKE $1
      AND requirement_type = 'document'
    ORDER BY printed_page ASC, source_clause ASC
  `, [`%${category}%`]);
  return result.rows;
}

export async function listRules({ category, annexure, search, limit = 50, offset = 0 }) {
  let conditions = [];
  let values = [];
  let idx = 1;

  if (category) {
    conditions.push(`application_category ILIKE $${idx++}`);
    values.push(`%${category}%`);
  }
  if (annexure) {
    conditions.push(`annexure ILIKE $${idx++}`);
    values.push(`%${annexure}%`);
  }
  if (search) {
    conditions.push(`(requirement_text ILIKE $${idx} OR rule_id ILIKE $${idx} OR source_clause ILIKE $${idx})`);
    values.push(`%${search}%`);
    idx++;
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const sql = `
    SELECT * FROM public.regulatory_rules
    ${where}
    ORDER BY printed_page ASC, source_clause ASC
    LIMIT $${idx++} OFFSET $${idx++}
  `;
  values.push(parseInt(limit, 10), parseInt(offset, 10));

  const rulesRes = await query(sql, values);
  const countRes = await query(`SELECT COUNT(*) FROM public.regulatory_rules ${where}`, values.slice(0, values.length - 2));

  return {
    total: parseInt(countRes.rows[0].count, 10),
    rules: rulesRes.rows
  };
}
