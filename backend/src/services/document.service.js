import { query } from '../config/supabase.js';
import { extractTextFromPdf } from './pdfExtraction.service.js';
import { validateDocument } from './validation.service.js';

export async function processAndSaveDocument({ application_id, rule_id, document_name, file }) {
  let extractedText = '';
  if (file.mimetype === 'application/pdf') {
    const parsed = await extractTextFromPdf(file.buffer);
    extractedText = parsed.text;
  } else {
    extractedText = `[Uploaded File: ${file.originalname}, Size: ${(file.size / 1024).toFixed(1)} KB]`;
  }

  const { rule, aiAnalysis } = await validateDocument({
    documentName: document_name || file.originalname,
    extractedText,
    ruleId: rule_id
  });

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

  return {
    document: savedDoc,
    finding: findingRes.rows[0],
    aiAnalysis
  };
}
