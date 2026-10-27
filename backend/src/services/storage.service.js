export async function uploadToStorage(buffer, filename, mimeType) {
  return { path: `uploads/${filename}`, url: `/storage/${filename}` };
}
