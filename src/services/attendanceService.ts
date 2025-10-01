import { apiClient } from './api';
import { API_ROUTES } from '@/constants/apiRoutes';

export const attendanceService = {
  // Fetch attendance details for a given date
  getDetails: async (params?: Record<string, any>) => {
    let url = API_ROUTES.ATTENDANCEDETAILS;
    if (params) {
      const query = new URLSearchParams(params).toString();
      url = `${url}?${query}`;
    }

    return await apiClient.get(url);
  },

  // Punch In
  punchIn: async (payload: { payload: string }) => {
    return await apiClient.post(API_ROUTES.PUNCHIN, payload);
  },

  // Punch Out
  punchOut: async (payload: { payload: string }) => {
    return await apiClient.post(API_ROUTES.PUNCHOUT, payload);
  },

  // Attendance Range
  getAttendanceRange: async (payload: string) => {
    return await apiClient.get(
      `${API_ROUTES.ATTENDANCERANGE}?payload=${payload}`,
    );
  },

  // Fetch attendance detail by date
  getDetailByDate: async (payload: string) => {
    return await apiClient.get(
      `${API_ROUTES.USER_ATTENDANCE_DETAIL}?payload=${payload}`,
    );
  },

  // Holiday List
  getHolidayList: async (payload: string) => {
    return await apiClient.get(`${API_ROUTES.HOLIDAYLIST}?payload=${payload}`);
  },

  // regularize attendance
  raiseAttendanceRequest: async (payload: { payload: string }) => {
    return await apiClient.post(API_ROUTES.RAISE_ATTENDANCE_REQUEST, payload);
  },
};
