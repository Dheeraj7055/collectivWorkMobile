// src/services/leaveService.ts
import { apiClient } from './api';
import { API_ROUTES } from '@/constants/apiRoutes';

export const leaveService = {
  // 🔹 Get all leave requests (with optional params)
  getAll: async (params?: Record<string, any>) => {
    let url = API_ROUTES.USER_LEAVE_LIST;

    if (params) {
      const query = new URLSearchParams(params).toString();
      url = `${url}?${query}`;
    }

    return await apiClient.get(url);
  },

  // 🔹 Get user leave quota list (leave types)
  getUserLeaveQuotaList: async (params?: Record<string, any>) => {
    let url = API_ROUTES.USER_LEAVE_QUOTA_LIST;

    if (params) {
      const query = new URLSearchParams(params).toString();
      url = `${url}?${query}`;
    }

    return await apiClient.get(url);
  },

  // 🔹 Get leave request details by ID
  getLeaveUser: async (params?: Record<string, any>) => {
    let url = API_ROUTES.USER_LEAVE_DETAILS;
    if (params) {
      const query = new URLSearchParams(params).toString();
      url = `${url}?${query}`;
    }
    return await apiClient.get(url);
  },

  // 🔹 Get leave comments list by leave_id
  getLeaveCommentsList: async (params?: Record<string, any>) => {
    let url = API_ROUTES.USER_LEAVE_COMMENTS_LIST;
    if (params) {
      const query = new URLSearchParams(params).toString();
      url = `${url}?${query}`;
    }
    return await apiClient.get(url);
  },

  // 🔹 Create new comment
  createLeaveComment: async (params: Record<string, any>) => {
    return await apiClient.post(API_ROUTES.CREATE_LEAVE_COMMENT, params);
  },

  // 🔹 Update existing comment
  updateLeaveComment: async (params: Record<string, any>) => {
    return await apiClient.post(API_ROUTES.UPDATE_LEAVE_COMMENT, params);
  },

  // ✅ Delete leave comment
  deleteLeaveComment: async (params: Record<string, any>) => {
    return await apiClient.delete(API_ROUTES.DELETE_LEAVE_COMMENT, {
      data: params,
    });
  },

  // ✅ leave request
  createLeave: async (formData: FormData) => {
    return await apiClient.post(API_ROUTES.CREATE_LEAVE, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
