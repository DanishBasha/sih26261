export async function performOcr(buffer, mimeType) {
  // Scanned image fallback placeholder
  return {
    success: true,
    text: `[Scanned Document OCR Processed - Format: ${mimeType}]`,
    confidence: 0.88
  };
}
