import { request } from './api';

export const rulesApi = {
  getCategories: () => request('/rules/categories'),
  getChecklist: (category) => request(`/rules/checklist/${encodeURIComponent(category)}`),
  list: (params = '') => request(`/rules?${params}`)
};
