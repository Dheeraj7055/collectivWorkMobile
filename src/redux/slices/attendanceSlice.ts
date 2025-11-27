// src/redux/slices/attendanceSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { attendanceService } from '@/services/attendanceService';
import { encodeData } from '@/utils/cryptoHelpers';
import { RootState } from '../store';
import Toast from 'react-native-toast-message';

export interface AttendanceActivity {
  id: string | number;
  activity_type: string;
  timestamp: string; // ISO datetime
}

export interface HolidayRecord {
  id: number | string;
  holiday_name: string;
  holiday_from: string;
  holiday_to: string;
  holiday_type: string;
  holiday_image?: string;
  background_type?: string;
}

export interface AttendanceRecord {
  id: string;
  user_id: string;
  date: string;
  punch_in: string;
  punch_out?: string;
  total_time?: number;
  punch_type?: string;
  activity?: AttendanceActivity[];
  // Optional extra fields from detailed API
  shift_name?: string;
  shift_timing?: any;
  day_logs?: { punch_in: string | null; punch_out: string | null }[];
  actual_gross_hrs?: number | string;
  actual_effective_hrs?: number | string;
  actual_break_time?: number | string;
}

export interface MonthlyAttendanceRecord {
  date: string;
  isBeforeJoiningDate: boolean;
  isFuture: boolean;
  holiday: boolean;
  holidayDetails: any[];
  weekoff: boolean;
  weekendOffType: string | null;
  is_late_entries: boolean | null;
  entries: string | null;
  onDuty: boolean;
  status: string;
  first_half: boolean;
  second_half: boolean;
  punch_in: string | null;
  punch_out: string | null;
  incomplete_hours: string | null;
}

interface AttendanceState {
  record: AttendanceRecord | null;
  todayRecord: AttendanceRecord | null; // 🔹 summary of today
  selectedDayDetail: AttendanceRecord | null; // 🔹 detailed by date
  monthlyRecords: MonthlyAttendanceRecord[];
  holidayList: HolidayRecord[];
  isLoading: boolean;
  error: string | null;
  isCheckedIn: boolean;
}

const initialState: AttendanceState = {
  record: null,
  todayRecord: null,
  selectedDayDetail: null,
  monthlyRecords: [],
  holidayList: [],
  isLoading: false,
  error: null,
  isCheckedIn: false,
};

// Thunks
export const fetchAttendance = createAsyncThunk<
  AttendanceRecord,
  Record<string, any> | undefined,
  { rejectValue: string }
>('attendance/details', async (params, { rejectWithValue }) => {
  try {
    const res = await attendanceService.getDetails(params);
    return res.data as AttendanceRecord;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to fetch attendance');
  }
});

// export const punchIn = createAsyncThunk<
//   AttendanceRecord,
//   { punch_type?: string },
//   { rejectValue: string }
// >('attendance/punchIn', async ({ punch_type }, { rejectWithValue }) => {
//   try {
//     const payload = encodeData({
//       punch_in_location: 'remote',
//       punch_type: punch_type || 'remote',
//     });
//     const res = await attendanceService.punchIn({ payload });
//     return res.data as AttendanceRecord;
//   } catch (err: any) {
//     return rejectWithValue(err.message || 'Punch in failed');
//   }
// });

export const punchIn = createAsyncThunk<
  AttendanceRecord,
  { punch_type?: string },
  { rejectValue: string; state: RootState }
>('attendance/punchIn', async ({ punch_type }, { rejectWithValue, getState }) => {
  try {
    const { location } = getState();
    const { latitude, longitude, address } = location;

    const payload = encodeData({
      punch_in_location: address || 'Unknown Location',
      punch_type: punch_type || 'remote',
      userLocation: {
        latitude,
        longitude,
      },
    });

    const res = await attendanceService.punchIn({ payload });
    return res.data as AttendanceRecord;
  } catch (err: any) {
    const message =
      err?.message ||
      'Something went wrong. Please try again.';

    Toast.show({
      type: 'error',
      text1: message,
      position: 'top',      // or 'bottom'
      visibilityTime: 4000, // ms
    });
    return rejectWithValue(err.message || 'Punch in failed');
  }
});


export const punchOut = createAsyncThunk<
  AttendanceRecord,
  { punch_type?: string },
  { rejectValue: string }
>('attendance/punchOut', async ({ punch_type }, { rejectWithValue }) => {
  try {
    const payload = encodeData({
      punch_out_location: 'remote',
      punch_type: punch_type || 'remote',
    });
    const res = await attendanceService.punchOut({ payload });
    return res.data as AttendanceRecord;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Punch out failed');
  }
});

export const fetchAttendanceRange = createAsyncThunk<
  MonthlyAttendanceRecord[],
  { year: number; month: number },
  { rejectValue: string }
>('attendance/range', async ({ year, month }, { rejectWithValue }) => {
  try {
    const currentMonthStartDate = new Date(year, month, 1);
    const nextMonthStartDate = new Date(year, month + 1, 1);
    const currentMonthEndDate = new Date(nextMonthStartDate.getTime() - 1);

    const encodePayload = encodeData({
      start_date: currentMonthStartDate,
      end_date: currentMonthEndDate,
      month: month + 1,
      year,
    });

    const res = await attendanceService.getAttendanceRange(encodePayload);
    return res.data as MonthlyAttendanceRecord[];
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to fetch attendance range');
  }
});

export const fetchAttendanceByDate = createAsyncThunk<
  AttendanceRecord,
  { user_id: string; date: string },
  { rejectValue: string }
>('attendance/detailByDate', async ({ user_id, date }, { rejectWithValue }) => {
  try {
    const payload = encodeData({ user_id, date });
    const res = await attendanceService.getDetailByDate(payload);
    return res.data as AttendanceRecord;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to fetch attendance by date');
  }
});

// 🔹 Holiday List thunk
export const fetchHolidayList = createAsyncThunk<
  HolidayRecord[],
  { year: number },
  { rejectValue: string }
>('attendance/holidayList', async ({ year }, { rejectWithValue }) => {
  try {
    const payload = encodeData({ current_month: -1, requested_year: year });
    const res = await attendanceService.getHolidayList(payload);
    return res.data as HolidayRecord[];
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to fetch holiday list');
  }
});

// Slice
const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    clearAttendanceError: state => {
      state.error = null;
    },
    setTodayRecord: (state, action: PayloadAction<AttendanceRecord | null>) => {
      state.todayRecord = action.payload;
      state.isCheckedIn = action.payload
        ? action.payload.punch_out == null
        : false;
    },
    setAttendanceRecord: (
      state,
      action: PayloadAction<AttendanceRecord | null>,
    ) => {
      state.record = action.payload;
    },
  },
  extraReducers: builder => {
    // Fetch Attendance (today)
    builder
      .addCase(fetchAttendance.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAttendance.fulfilled, (state, action) => {
        state.isLoading = false;
        state.record = action.payload;
        state.todayRecord = action.payload;
        state.isCheckedIn =
          Boolean(action.payload?.punch_in) &&
          action.payload?.punch_out == null;
      })
      .addCase(fetchAttendance.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Punch In
    builder
      .addCase(punchIn.fulfilled, (state, action) => {
        state.isLoading = false;
        state.record = action.payload;
        state.todayRecord = action.payload;
        state.isCheckedIn =
          Boolean(action.payload?.punch_in) &&
          action.payload?.punch_out == null;
      })
      .addCase(punchIn.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Punch Out
    builder
      .addCase(punchOut.fulfilled, (state, action) => {
        state.isLoading = false;
        state.record = action.payload;
        state.todayRecord = action.payload;
        state.isCheckedIn = false;
      })
      .addCase(punchOut.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Attendance Range
    builder.addCase(fetchAttendanceRange.fulfilled, (state, action) => {
      state.isLoading = false;
      state.monthlyRecords = action.payload || [];
    });

    // Selected Date Detail
    builder
      .addCase(fetchAttendanceByDate.fulfilled, (state, action) => {
        state.selectedDayDetail = action.payload; // ✅ now separate
      })
      .addCase(fetchAttendanceByDate.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Holiday List
    builder
      .addCase(fetchHolidayList.pending, state => {
        state.isLoading = true;
      })
      .addCase(fetchHolidayList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.holidayList = action.payload;
      })
      .addCase(fetchHolidayList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearAttendanceError, setTodayRecord, setAttendanceRecord } =
  attendanceSlice.actions;

export default attendanceSlice.reducer;
