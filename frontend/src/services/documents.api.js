import { request } from './api';

export const documentsApi = {
  upload: (formData) => request('/documents/upload', { method: 'POST', body: formData })
};
