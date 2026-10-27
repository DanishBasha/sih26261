const ALLOWED_MIME_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function validateUploadedFile(file) {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return { valid: false, error: 'Only PDF, JPEG, and PNG files are accepted' };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File size exceeds maximum limit of 10MB' };
  }
  return { valid: true };
}
