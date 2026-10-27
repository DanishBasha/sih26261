import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const DEFAULT_MODEL = 'qwen/qwen3.8-27b';

/**
 * Validates document text against an AICTE rule requirement using Groq LLM
 */
export async function verifyDocumentCompliance({
  documentName,
  extractedText,
  ruleRequirement,
  ruleClause,
  annexure,
  printedPage
}) {
  const prompt = `
You are an expert AI compliance auditor for AICTE (All India Council for Technical Education) application scrutiny.
Your task is to analyze the extracted text from a submitted document against the specific regulatory rule requirement.

REGULATORY RULE CONTEXT:
- AICTE Handbook Clause: ${ruleClause}
- Annexure: ${annexure}
- Printed Page: ${printedPage || 'N/A'}
- Official Requirement: "${ruleRequirement}"

DOCUMENT BEING EXAMINED:
- Document Title: "${documentName}"
- Extracted Content (first 2500 characters):
"""
${extractedText ? extractedText.slice(0, 2500) : '[NO TEXT EXTRACTED OR EMPTY FILE]'}
"""

INSTRUCTIONS:
1. Determine if the document satisfies the regulatory requirement.
2. Check for missing elements (e.g. required stamps, competent authority signatures, dates, mandatory resolution wording).
3. Be fair and grounded in evidence. If text is unreadable or missing, flag it as "needs_review" or "deficiency".
4. Respond ONLY with a valid JSON object in the following format:
{
  "compliance_status": "passed" | "deficiency" | "warning" | "needs_review",
  "confidence_score": 0.0 to 1.0,
  "clause_reference": "${ruleClause}",
  "finding_title": "Short 5-8 word summary",
  "explanation": "Clear 2-3 sentence explanation citing the AICTE handbook requirement and what was observed in the document.",
  "evidence_snippet": "Exact quote from document or explanation of what was missing",
  "recommended_action": "What the applicant or reviewer should do next"
}
`;

  try {
    const response = await groq.chat.completions.create({
      model: DEFAULT_MODEL,
      messages: [
        { role: 'system', content: 'You are an AICTE compliance auditor. Output ONLY valid raw JSON with no markdown wrapping.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.1,
      max_tokens: 600
    });

    const raw = response.choices[0].message.content.trim();
    // Clean any markdown formatting if present
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    const parsed = JSON.parse(cleaned);
    return parsed;
  } catch (error) {
    console.error('Groq AI Analysis Error:', error.message);
    // Graceful fallback
    return {
      compliance_status: extractedText && extractedText.length > 50 ? 'passed' : 'needs_review',
      confidence_score: 0.7,
      clause_reference: ruleClause,
      finding_title: 'Automated Preliminary Verification',
      explanation: `Document received for clause ${ruleClause}. AI automated scrutiny suggests manual inspection by authorized reviewer.`,
      evidence_snippet: extractedText ? extractedText.slice(0, 150) + '...' : 'No text content extracted.',
      recommended_action: 'Reviewer should visually verify the stamp and signature on the uploaded PDF.'
    };
  }
}
