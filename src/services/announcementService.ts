// src/services/announcementService.ts
import { apiClient } from "./api";
import { API_ROUTES } from "@/constants/apiRoutes";

export const announcementService = {
  getAll: async (params?: Record<string, any>) => {
    let url = API_ROUTES.ANNOUNCEMENTS;

    if (params) {
      const query = new URLSearchParams(params).toString();
      url = `${url}?${query}`;
    }

    return await apiClient.get(url);
  },
};
