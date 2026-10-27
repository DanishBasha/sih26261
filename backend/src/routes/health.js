import express from 'express';
import { query } from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const dbRes = await query('SELECT count(*) FROM public.regulatory_rules');
    const ruleCount = parseInt(dbRes.rows[0].count, 10);

    return res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: { connected: true, rulesInDatabase: ruleCount },
        groq: { configured: !!process.env.GROQ_API_KEY, model: 'qwen/qwen3.8-27b' },
        email: { configured: !!process.env.EMAIL_USER, sender: process.env.EMAIL_USER }
      }
    });
  } catch (error) {
    return res.status(500).json({
      status: 'degraded',
      error: error.message
    });
  }
});

export default router;
