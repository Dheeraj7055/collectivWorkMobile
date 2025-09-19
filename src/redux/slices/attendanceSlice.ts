// src/redux/slices/attendanceSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { attendanceService } from "@/services/attendanceService";

export interface AttendanceRecord {
  id: string;
  user_id: string;
  date: string;
  punch_in: string;
  punch_out?: string;
  total_time?: number;
}

interface AttendanceState {
  record: AttendanceRecord | null;   // 🔹 single object instead of array
  todayRecord: AttendanceRecord | null;
  isLoading: boolean;
  error: string | null;
  isCheckedIn: boolean;
}

const initialState: AttendanceState = {
  record: null,
  todayRecord: null,
  isLoading: false,
  error: null,
  isCheckedIn: false,
};

// 🔹 Fetch attendance (returns single object)
export const fetchAttendance = createAsyncThunk<
  AttendanceRecord,
  Record<string, any> | undefined,
  { rejectValue: string }
>("attendance/details", async (params, { rejectWithValue }) => {
  try {
    const res = await attendanceService.getDetails(params);
    return res.data as AttendanceRecord;
  } catch (err: any) {
    return rejectWithValue(err.message || "Failed to fetch attendance");
  }
});

// 🔹 Punch In / Punch Out
export const punchAttendance = createAsyncThunk<
  AttendanceRecord,
  { action: "in" | "out" },
  { rejectValue: string }
>("attendance/create", async (payload, { rejectWithValue }) => {
  try {
    const res = await attendanceService.punch(payload);
    return res.data as AttendanceRecord;
  } catch (err: any) {
    return rejectWithValue(err.message || "Punch failed");
  }
});

const attendanceSlice = createSlice({
  name: "attendance",
  initialState,
  reducers: {
    clearAttendanceError: (state) => {
      state.error = null;
    },
    setTodayRecord: (state, action: PayloadAction<AttendanceRecord | null>) => {
      state.todayRecord = action.payload;
      state.isCheckedIn = action.payload ? !action.payload.punch_out : false;
    },
    setAttendanceRecord: (state, action: PayloadAction<AttendanceRecord | null>) => {
      state.record = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch Attendance
    builder
      .addCase(fetchAttendance.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAttendance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.record = action.payload;
        // Set today’s record
        if (action.payload) {
          state.todayRecord = action.payload;
          state.isCheckedIn = !action.payload.punch_out;
        } else {
          state.todayRecord = null;
          state.isCheckedIn = false;
        }
      })
      .addCase(fetchAttendance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Punch Attendance
    builder
      .addCase(punchAttendance.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(punchAttendance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.record = action.payload;
        state.todayRecord = action.payload;
        state.isCheckedIn = !action.payload.punch_out;
      })
      .addCase(punchAttendance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearAttendanceError,
  setTodayRecord,
  setAttendanceRecord,
} = attendanceSlice.actions;

export default attendanceSlice.reducer;
