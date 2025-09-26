// src/redux/slices/leaveSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { encodeData } from '@/utils/cryptoHelpers';
import { leaveService } from '@/services/leaveService';

export interface LeaveRequest {
  id: string | number;
  subject: string;
  leave_type: string;
  short_code?: string;
  request_type: string;
  start_date: string;
  end_date: string;
  no_of_days: number;
  status: 'Pending' | 'Approved' | 'Rejected' | string;
  updated_at?: string;
  description?: string;
  userRequest?: {
    first_name: string;
    last_name: string;
    image_url?: string | null;
    profile_color?: string;
  };
  statusUpdatedBy?: {
    first_name: string;
    last_name: string;
    image_url?: string | null;
    profile_color?: string;
  };
  user?: {
    first_name: string;
    last_name: string;
    image_url?: string | null;
    profile_color?: string;
  };
  file_document?: {
    id: string;
    name: string;
    url: string;
  };
}

interface LeaveComment {
  id: string | number;
  comment: string;
  created_at: string;
  leaveCommentCreatedBy: {
    id: string | number;
    first_name: string;
    last_name: string;
    image_url?: string | null;
    profile_color?: string;
  };
}

interface LeaveState {
  records: LeaveRequest[];
  userLeaveQuotaList: any | null;
  isLoading: boolean;
  error: string | null;

  leaveUser: LeaveRequest | null;
  isDetailLoading: boolean;

  leaveComments: LeaveComment[];
  isCommentsLoading: boolean;
}

const initialState: LeaveState = {
  records: [],
  userLeaveQuotaList: null,
  isLoading: false,
  error: null,

  leaveUser: null,
  isDetailLoading: false,

  leaveComments: [],
  isCommentsLoading: false,
};

// ✅ Thunk: fetch leave requests (already there)
export const fetchLeaves = createAsyncThunk<
  LeaveRequest[],
  Record<string, any> | undefined,
  { rejectValue: string }
>('leaves/fetch', async (payload, { rejectWithValue }) => {
  try {
    const encodedPayload = payload ? encodeData(payload) : null;
    const response = await leaveService.getAll(
      encodedPayload ? { payload: encodedPayload } : {},
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to load leaves');
  }
});

// ✅ Thunk: fetch user leave quota list (already there)
export const fetchUserLeaveQuotaList = createAsyncThunk<
  any,
  { user_id: string },
  { rejectValue: string }
>('leaves/fetchUserLeaveQuotaList', async (payload, { rejectWithValue }) => {
  try {
    const encodedPayload = encodeData(payload);
    const response = await leaveService.getUserLeaveQuotaList({
      payload: encodedPayload,
    });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to fetch leave quota');
  }
});

// ✅ NEW Thunk: fetch leave request details
export const getLeaveUser = createAsyncThunk<
  LeaveRequest,
  { leave_id: number | string },
  { rejectValue: string }
>('leaves/getLeaveUser', async ({ leave_id }, { rejectWithValue }) => {
  try {
    const encodedPayload = encodeData({ leave_id });
    const response = await leaveService.getLeaveUser({
      payload: encodedPayload,
    });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to fetch leave details');
  }
});

export const fetchLeaveComments = createAsyncThunk<
  LeaveComment[],
  { leave_id: number | string },
  { rejectValue: string }
>('leaves/fetchLeaveComments', async ({ leave_id }, { rejectWithValue }) => {
  try {
    const encodedPayload = encodeData({ leave_id });
    const response = await leaveService.getLeaveCommentsList({
      payload: encodedPayload,
    });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to fetch leave comments');
  }
});

// ✅ Create comment
export const createLeaveComment = createAsyncThunk<
  any,
  { leave_id: number | string; comment: string },
  { rejectValue: string }
>('leaves/createLeaveComment', async (payload, { rejectWithValue }) => {
  try {
    const encodedPayload = encodeData(payload);
    const response = await leaveService.createLeaveComment({
      payload: encodedPayload,
    });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to create comment');
  }
});

// ✅ Update comment
export const updateLeaveComment = createAsyncThunk<
  any,
  {
    leave_id: number | string;
    leave_comment_id: string | number;
    comment: string;
  },
  { rejectValue: string }
>('leaves/updateLeaveComment', async (payload, { rejectWithValue }) => {
  try {
    const encodedPayload = encodeData(payload);
    const response = await leaveService.updateLeaveComment({
      payload: encodedPayload,
    });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to update comment');
  }
});

// ✅ delete leave comment
export const deleteLeaveComment = createAsyncThunk<
  { success: boolean; leave_comment_id: string | number },
  { leave_comment_id: string | number },
  { rejectValue: string }
>(
  'leaves/deleteLeaveComment',
  async ({ leave_comment_id }, { rejectWithValue }) => {
    try {
      const encodedPayload = encodeData({ leave_comment_id });
      const response = await leaveService.deleteLeaveComment({
        payload: encodedPayload,
      });

      return { success: response.data.success, leave_comment_id };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to delete comment');
    }
  },
);

// ✅ leave request
export const createLeave = createAsyncThunk<
  any,
  { payload: any; files: any[] },
  { rejectValue: string }
>('leaves/createLeave', async ({ payload, files }, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append('payload', encodeData(payload));

    files.forEach(file => {
      formData.append('file', {
        uri: file.uri,
        type: file.type || 'application/octet-stream',
        name: file.fileName || `upload-${Date.now()}`,
      } as any);
    });

    const response = await leaveService.createLeave(formData);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to create leave');
  }
});

export const withdrawLeave = createAsyncThunk<
  { success: boolean; leave_request_id: string | number },
  { leave_request_id: string | number },
  { rejectValue: string }
>('leaves/withdrawLeave', async ({ leave_request_id }, { rejectWithValue }) => {
  try {
    const encodedPayload = encodeData({ leave_request_id });
    const response = await leaveService.withdrawLeave({
      payload: encodedPayload,
    });

    // Normalize to always return { success, leave_request_id }
    return { success: !!response.data?.success, leave_request_id };
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to withdraw leave');
  }
});

export const updateLeave = createAsyncThunk<
  any,
  { payload: any; files?: any[] },
  { rejectValue: string }
>('leaves/updateLeave', async ({ payload, files = [] }, { rejectWithValue }) => {
  try {
    const formData = new FormData();
    formData.append('payload', encodeData(payload));

    files.forEach(file => {
      formData.append('file', {
        uri: file.uri,
        type: file.type || 'application/octet-stream',
        name: file.fileName || `upload-${Date.now()}`,
      } as any);
    });

    const response = await leaveService.updateLeave(formData);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to update leave');
  }
});

const leaveSlice = createSlice({
  name: 'leaves',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
    clearLeaveUser: state => {
      state.leaveUser = null;
    },
  },
  extraReducers: builder => {
    // ✅ leave list
    builder
      .addCase(fetchLeaves.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchLeaves.fulfilled,
        (state, action: PayloadAction<LeaveRequest[]>) => {
          state.isLoading = false;
          state.records = action.payload;
        },
      )
      .addCase(fetchLeaves.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to load leaves';
      });

    // ✅ leave quota list
    builder
      .addCase(fetchUserLeaveQuotaList.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserLeaveQuotaList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userLeaveQuotaList = action.payload;
      })
      .addCase(fetchUserLeaveQuotaList.rejected, (state, action) => {
        state.isLoading = false;
        state.userLeaveQuotaList = null;
        state.error = action.payload || 'Failed to fetch leave quota';
      });

    // ✅ leave detail
    builder
      .addCase(getLeaveUser.pending, state => {
        state.isDetailLoading = true;
        state.leaveUser = null;
        state.error = null;
      })
      .addCase(
        getLeaveUser.fulfilled,
        (state, action: PayloadAction<LeaveRequest>) => {
          state.isDetailLoading = false;
          state.leaveUser = action.payload;
        },
      )
      .addCase(getLeaveUser.rejected, (state, action) => {
        state.isDetailLoading = false;
        state.leaveUser = null;
        state.error = action.payload || 'Failed to fetch leave details';
      });

    // ✅ leave comments
    builder
      .addCase(fetchLeaveComments.pending, state => {
        state.isCommentsLoading = true;
        state.leaveComments = [];
        state.error = null;
      })
      .addCase(
        fetchLeaveComments.fulfilled,
        (state, action: PayloadAction<LeaveComment[]>) => {
          state.isCommentsLoading = false;
          state.leaveComments = action.payload;
        },
      )
      .addCase(fetchLeaveComments.rejected, (state, action) => {
        state.isCommentsLoading = false;
        state.leaveComments = [];
        state.error = action.payload || 'Failed to fetch leave comments';
      });

    builder
      .addCase(deleteLeaveComment.pending, state => {
        state.isDetailLoading = true;
      })
      .addCase(deleteLeaveComment.fulfilled, (state, action) => {
        state.isDetailLoading = false;

        if (action.payload.success && state.leaveUser?.id) {
          // Remove deleted comment from local state if you are caching them
          if ((state as any).leaveComments) {
            (state as any).leaveComments = (state as any).leaveComments.filter(
              (c: any) => c.id !== action.payload.leave_comment_id,
            );
          }
        }
      })
      .addCase(deleteLeaveComment.rejected, (state, action) => {
        state.isDetailLoading = false;
        state.error = action.payload || 'Failed to delete comment';
      });

    builder
      .addCase(withdrawLeave.pending, state => {
        state.isDetailLoading = true;
      })
      .addCase(withdrawLeave.fulfilled, (state, action) => {
        state.isDetailLoading = false;

        const payload = action.payload as {
          success?: boolean;
          leave_request_id?: string;
        };
        if (payload?.success && payload.leave_request_id) {
          state.records = state.records.filter(
            req => req.id !== payload.leave_request_id,
          );
        }
      })
      .addCase(withdrawLeave.rejected, (state, action) => {
        state.isDetailLoading = false;
        state.error = action.payload || 'Failed to withdraw leave';
      });
  },
});

export const { clearError, clearLeaveUser } = leaveSlice.actions;
export default leaveSlice.reducer;
