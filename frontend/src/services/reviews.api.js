import { request } from './api';

export const reviewsApi = {
  raiseDeficiency: (data) => request('/reviews/deficiency', { method: 'POST', body: JSON.stringify(data) }),
  approve: (data) => request('/reviews/approve', { method: 'POST', body: JSON.stringify(data) }),
  override: (data) => request('/reviews/override', { method: 'POST', body: JSON.stringify(data) })
};
