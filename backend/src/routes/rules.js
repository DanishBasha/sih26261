import express from 'express';
import { query } from '../db.js';

const router = express.Router();

/**
 * GET /api/rules/categories
 * Returns distinct application categories from the rules database
 */
router.get('/categories', async (req, res) => {
  try {
    const result = await query(`
      SELECT DISTINCT application_category
      FROM public.regulatory_rules
      ORDER BY application_category ASC
    `);
    const categories = result.rows.map(r => r.application_category);
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/rules/checklist/:category
 * Generates the dynamic required documents checklist for a selected category
 */
router.get('/checklist/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const result = await query(`
      SELECT 
        rule_id,
        annexure,
        source_clause,
        printed_page,
        requirement_type,
        requirement_text,
        applicability_condition,
        verification_status
      FROM public.regulatory_rules
      WHERE application_category ILIKE $1
        AND requirement_type = 'document'
      ORDER BY printed_page ASC, source_clause ASC
    `, [`%${category}%`]);

    res.json({
      success: true,
      category,
      count: result.rows.length,
      checklist: result.rows
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/rules
 * Search or filter the full 140 rules catalog
 */
router.get('/', async (req, res) => {
  try {
    const { category, search, annexure, limit = 50, offset = 0 } = req.query;
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

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const sql = `
      SELECT *
      FROM public.regulatory_rules
      ${whereClause}
      ORDER BY printed_page ASC, source_clause ASC
      LIMIT $${idx++} OFFSET $${idx++}
    `;
    values.push(parseInt(limit, 10), parseInt(offset, 10));

    const result = await query(sql, values);
    const countSql = `SELECT COUNT(*) FROM public.regulatory_rules ${whereClause}`;
    const countResult = await query(countSql, values.slice(0, values.length - 2));

    res.json({
      success: true,
      total: parseInt(countResult.rows[0].count, 10),
      rules: result.rows
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
