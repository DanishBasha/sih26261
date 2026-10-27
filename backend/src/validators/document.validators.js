export function validateDocumentInput(body, file) {
  if (!body.application_id) return 'Application ID is required';
  if (!body.rule_id) return 'Rule ID is required';
  if (!file) return 'File attachment is required';
  return null;
}
