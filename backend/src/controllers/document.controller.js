import * as docService from '../services/document.service.js';
import { validateUploadedFile } from '../utils/fileValidation.js';

export async function upload(req, res) {
  const file = req.file;
  const fileCheck = validateUploadedFile(file);
  if (!fileCheck.valid) return res.status(400).json({ success: false, error: fileCheck.error });

  const result = await docService.processAndSaveDocument({
    application_id: req.body.application_id,
    rule_id: req.body.rule_id,
    document_name: req.body.document_name,
    file
  });

  res.status(201).json({ success: true, ...result });
}
