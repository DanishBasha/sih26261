import express from 'express';
import { query } from '../config/supabase.js';
import { env } from '../config/env.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const dbRes = await query('SELECT count(*) FROM public.regulatory_rules');
    const ruleCount = parseInt(dbRes.rows[0].count, 10);

    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: { connected: true, rulesInDatabase: ruleCount },
        groq: { configured: !!env.GROQ_API_KEY, model: env.GROQ_MODEL },
        email: { configured: !!env.EMAIL_USER, sender: env.EMAIL_USER }
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'degraded', error: error.message });
  }
});

export default router;
