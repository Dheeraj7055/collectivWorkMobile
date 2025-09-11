// src/redux/slices/attendanceSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  checkIn: string;
  checkOut?: string;
  totalHours?: number;
  status: 'present' | 'absent' | 'late' | 'half-day';
}

interface AttendanceState {
  records: AttendanceRecord[];
  todayRecord: AttendanceRecord | null;
  isLoading: boolean;
  error: string | null;
  isCheckedIn: boolean;
}

const initialState: AttendanceState = {
  records: [],
  todayRecord: null,
  isLoading: false,
  error: null,
  isCheckedIn: false,
};

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    clearAttendanceError: (state) => {
      state.error = null;
    },
    setTodayRecord: (state, action: PayloadAction<AttendanceRecord | null>) => {
      state.todayRecord = action.payload;
      state.isCheckedIn = action.payload ? !action.payload.checkOut : false;
    },
    setAttendanceRecords: (state, action: PayloadAction<AttendanceRecord[]>) => {
      state.records = action.payload;
    },
  },
});

export const { clearAttendanceError, setTodayRecord, setAttendanceRecords } = attendanceSlice.actions;
export default attendanceSlice.reducer;