// src/services/notificationService.ts
import { apiClient } from './api';
import { API_ROUTES } from '@/constants/apiRoutes';

export const notificationService = {
  // GET notifications
  getList: async (params?: Record<string, any>) => {
    let url = API_ROUTES.USER_NOTIFICATION_LIST; // 'users/notification/list'
    if (params) {
      const q = new URLSearchParams(params).toString();
      url = `${url}?${q}`;
    }
    return await apiClient.get(url);
  },

  // GET unread count
  getCount: async () => {
    return await apiClient.get(API_ROUTES.USER_NOTIFICATION_COUNT); // 'users/notification/count'
  },

  // POST: mark viewed (when panel/screen opens)
  markViewed: async () => {
    return await apiClient.post(API_ROUTES.USER_NOTIFICATION_VIEW); // 'users/notification/view'
  },

  // POST: mark read (single or all)
  markRead: async (params: Record<string, any>) => {
    return await apiClient.post(API_ROUTES.USER_NOTIFICATION_READ, params); // 'users/notification/read'
  },
};
