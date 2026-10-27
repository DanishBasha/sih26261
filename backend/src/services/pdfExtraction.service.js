import pdfParse from 'pdf-parse';

export async function extractTextFromPdf(buffer) {
  try {
    const data = await pdfParse(buffer);
    return {
      success: true,
      text: data.text ? data.text.trim() : '',
      pageCount: data.numpages || 1
    };
  } catch (error) {
    console.error('PDF parsing error:', error.message);
    return {
      success: false,
      text: '',
      pageCount: 0,
      error: error.message
    };
  }
}
