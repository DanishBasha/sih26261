import { request } from './api';

export const notificationsApi = {
  list: () => request('/notifications'),
  sendTestEmail: (data) => request('/notifications/test-email', { method: 'POST', body: JSON.stringify(data) })
};
