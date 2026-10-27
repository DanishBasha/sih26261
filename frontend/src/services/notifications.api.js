import { request } from './api';

export const notificationsApi = {
  list: () => request('/notifications')
};
