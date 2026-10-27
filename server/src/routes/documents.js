import express from 'express';
import multer from 'multer';
import { query } from '../db.js';
import { extractTextFromPdf } from '../services/pdfService.js';
import { verifyDocumentCompliance } from '../services/groqService.js';

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

/**
 * POST /api/documents/upload
 * Uploads a document, extracts text, performs AI compliance check against the specified rule
 */
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const { application_id, rule_id, document_name } = req.body;
    const file = req.file;

    if (!application_id || !rule_id || !file) {
      return res.status(400).json({ success: false, error: 'application_id, rule_id, and file are required' });
    }

    // 1. Fetch the rule requirement from database
    const ruleRes = await query('SELECT * FROM public.regulatory_rules WHERE rule_id = $1', [rule_id]);
    const rule = ruleRes.rows[0] || {
      source_clause: 'General',
      annexure: 'Annexure 1',
      printed_page: null,
      requirement_text: 'Mandatory statutory compliance document'
    };

    // 2. Extract text if PDF, or use placeholder for images
    let extractedText = '';
    let pageCount = 1;

    if (file.mimetype === 'application/pdf') {
      const parsed = await extractTextFromPdf(file.buffer);
      extractedText = parsed.text;
      pageCount = parsed.pageCount;
    } else {
      // For images or test files, fallback text
      extractedText = `[Uploaded File: ${file.originalname}, Size: ${(file.size / 1024).toFixed(1)} KB]`;
    }

    // 3. Perform AI compliance check using Groq Llama/Qwen
    console.log(`🤖 Auditing document "${file.originalname}" against Rule ${rule_id} via Groq...`);
    const aiAnalysis = await verifyDocumentCompliance({
      documentName: document_name || file.originalname,
      extractedText,
      ruleRequirement: rule.requirement_text,
      ruleClause: rule.source_clause,
      annexure: rule.annexure,
      printedPage: rule.printed_page
    });

    // 4. Save uploaded document record
    const docRes = await query(`
      INSERT INTO public.uploaded_documents (
        application_id, rule_id, document_name, file_size, mime_type,
        extracted_text, ocr_status, validation_status, ai_analysis
      )
      VALUES ($1, $2, $3, $4, $5, $6, 'completed', $7, $8)
      RETURNING *
    `, [
      application_id,
      rule_id,
      document_name || file.originalname,
      file.size,
      file.mimetype,
      extractedText,
      aiAnalysis.compliance_status || 'passed',
      JSON.stringify(aiAnalysis)
    ]);
    const savedDoc = docRes.rows[0];

    // 5. Insert validation finding
    const findingRes = await query(`
      INSERT INTO public.validation_findings (
        application_id, document_id, rule_id, finding_type,
        clause_reference, message, explanation, evidence_snippet
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [
      application_id,
      savedDoc.id,
      rule_id,
      aiAnalysis.compliance_status || 'passed',
      rule.source_clause,
      aiAnalysis.finding_title || 'Document compliance evaluated',
      aiAnalysis.explanation,
      aiAnalysis.evidence_snippet
    ]);

    // 6. Update application status if it was in draft
    await query(`
      UPDATE public.applications 
      SET updated_at = now() 
      WHERE id = $1
    `, [application_id]);

    res.status(201).json({
      success: true,
      document: savedDoc,
      finding: findingRes.rows[0],
      aiAnalysis
    });
  } catch (error) {
    console.error('Upload & validate error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
