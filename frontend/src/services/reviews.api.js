import { request } from './api';

export const reviewsApi = {
  approve: (data) => request('/reviews/approve', { method: 'POST', body: JSON.stringify(data) }),
  approveWithAnomalies: (data) => request('/reviews/approve-with-anomalies', { method: 'POST', body: JSON.stringify(data) }),
  reject: (data) => request('/reviews/reject', { method: 'POST', body: JSON.stringify(data) }),
  raiseDeficiency: (data) => request('/reviews/deficiency', { method: 'POST', body: JSON.stringify(data) }),
  override: (data) => request('/reviews/override', { method: 'POST', body: JSON.stringify(data) })
};
