import { apiClient } from "./api";
import { API_ROUTES } from "@/constants/apiRoutes";

export const attendanceService = {
  // Fetch attendance details for a given date
  getDetails: async (params?: Record<string, any>) => {
    let url = API_ROUTES.ATTENDANCEDETAILS;
    debugger
    if (params) {
      const query = new URLSearchParams(params).toString();
      url = `${url}?${query}`;
    }

    return await apiClient.get(url);
  },

  // Punch In/Out
  punch: async (payload: { action: "in" | "out" }) => {
    return await apiClient.post(API_ROUTES.CREATEATTENDANCE, payload);
  },
};
