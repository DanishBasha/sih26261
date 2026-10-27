import { request } from './api';

export const authApi = {
  getSession: () => request('/auth/session')
};
