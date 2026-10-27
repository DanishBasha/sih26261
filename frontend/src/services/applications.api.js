import { request } from './api';

export const applicationsApi = {
  list: () => request('/applications'),
  create: (data) => request('/applications', { method: 'POST', body: JSON.stringify(data) }),
  getById: (id) => request(`/applications/${id}`),
  submit: (id) => request(`/applications/${id}/submit`, { method: 'PATCH' })
};
