// src/redux/slices/notificationSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { notificationService } from '@/services/notificationService';
import { encodeData } from '@/utils/cryptoHelpers';

export interface NotificationItem {
  id: string | number;
  title: string;
  message: string;
  created_at: string;
  is_read: boolean;
  read: boolean; // derived from is_read for RN
  sentByNotifications?: {
    id: string | number;
    first_name: string;
    last_name: string;
    image_url?: string | null;
    profile_color?: string;
  };
}

interface NotificationState {
  records: NotificationItem[];
  unreadCount: number;

  isListLoading: boolean;
  isCountLoading: boolean;
  isMutating: boolean;

  // 👇 new
  page: number;
  totalPages: number;
  totalCount: number;
  isLoadingMore: boolean;

  error: string | null;
}

const initialState: NotificationState = {
  records: [],
  unreadCount: 0,

  isListLoading: false,
  isCountLoading: false,
  isMutating: false,

  page: 1,
  totalPages: 1,
  totalCount: 0,
  isLoadingMore: false,

  error: null,
};

export const fetchNotificationList = createAsyncThunk<
  {
    items: NotificationItem[];
    page: number;
    totalPages: number;
    totalCount: number;
    append?: boolean;
  },
  | {
      page?: number;
      pageSize?: number;
      searchTerm?: string;
      isPagination?: boolean;
      module_name?: string;
      append?: boolean; // when true we append, else replace
    }
  | undefined,
  { rejectValue: string }
>('notifications/fetchList', async (payload, { rejectWithValue }) => {
  try {
    const p = {
      limit: payload?.pageSize ?? 10,
      page: payload?.page ?? 1,
      searchTerm: payload?.searchTerm ?? '',
      isPagination: payload?.isPagination ?? true,
      module_name: payload?.module_name ?? 'HRMS',
    };

    const encoded = encodeData(p);
    const res = await notificationService.getList({ payload: encoded });
    const d = res;

    if (!d?.success)
      return rejectWithValue(d?.message || 'Failed to load notifications');

    const items: NotificationItem[] = (d.paginationData || []).map(
      (n: any) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        created_at: n.created_at,
        read: !!n.is_read,
        is_read: n.is_read,
        sentByNotifications: n.sentByNotifications,
      }),
    );

    return {
      items,
      page: d.currentPage ?? p.page,
      totalPages: d.totalPages ?? 1,
      totalCount: d.totalCount ?? items.length,
      append: !!payload?.append,
    };
  } catch (err: any) {
    return rejectWithValue(err?.message || 'Failed to load notifications');
  }
});

// 🔹 GET count
export const fetchNotificationCount = createAsyncThunk<
  number,
  void,
  { rejectValue: string }
>('notifications/fetchCount', async (_, { rejectWithValue }) => {
  try {
    const res = await notificationService.getCount();
    const d = res;

    if (!d?.success)
      return rejectWithValue(d?.message || 'Failed to load count');

    // Accept both shapes: {data: number} OR {count: number}
    const count: number = typeof d?.data === 'number' ? d.data : d?.count ?? 0;
    return count;
  } catch (err: any) {
    return rejectWithValue(err?.message || 'Failed to load count');
  }
});

// 🔹 POST: mark viewed (on open)
export const markAllViewed = createAsyncThunk<
  boolean,
  void,
  { rejectValue: string }
>('notifications/markAllViewed', async (_, { rejectWithValue }) => {
  try {
    const res = await notificationService.markViewed();
    const d = res?.data;
    if (!d?.success)
      return rejectWithValue(d?.message || 'Failed to mark viewed');
    return true;
  } catch (err: any) {
    return rejectWithValue(err?.message || 'Failed to mark viewed');
  }
});

// 🔹 POST: mark read (All / single)
export const markNotificationsRead = createAsyncThunk<
  { request_type?: 'All'; notification_id?: string | number },
  { all?: boolean; id?: string | number },
  { rejectValue: string }
>('notifications/markRead', async ({ all, id }, { rejectWithValue }) => {
  try {
    const payload = all
      ? { payload: encodeData({ request_type: 'All' as const }) }
      : { payload: encodeData({ notification_id: id }) };

    const res = await notificationService.markRead(payload);
    const d = res?.data;
    if (!d?.success)
      return rejectWithValue(d?.message || 'Failed to mark read');

    return all ? { request_type: 'All' as const } : { notification_id: id };
  } catch (err: any) {
    return rejectWithValue(err?.message || 'Failed to mark read');
  }
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    // optional optimistic update for single-read
    locallySetRead(state, action: PayloadAction<{ id: string | number }>) {
      const idx = state.records.findIndex(n => n.id === action.payload.id);
      if (idx >= 0 && !state.records[idx].read) {
        state.records[idx].read = true;
        if (state.unreadCount > 0) state.unreadCount -= 1;
      }
    },
    clearNotificationError(state) {
      state.error = null;
    },
    clearNotifications(state) {
      state.records = [];
      state.unreadCount = 0;
      state.error = null;
    },
  },
  extraReducers: builder => {
    builder
      // list
      .addCase(fetchNotificationList.pending, (state, action) => {
        const append = action.meta?.arg?.append;
        if (append) state.isLoadingMore = true;
        else state.isListLoading = true;
        state.error = null;
      })
      .addCase(fetchNotificationList.fulfilled, (state, action) => {
        const { items, page, totalPages, totalCount, append } = action.payload;
        if (append) {
          // append for next pages
          // avoid duplicates by id
          const existing = new Set(state.records.map(r => String(r.id)));
          const merged = items.filter(it => !existing.has(String(it.id)));
          state.records = state.records.concat(merged);
          state.isLoadingMore = false;
        } else {
          // replace on first load / refresh
          state.records = items;
          state.isListLoading = false;
        }
        state.page = page;
        state.totalPages = totalPages;
        state.totalCount = totalCount;
      })
      .addCase(fetchNotificationList.rejected, (state, action) => {
        state.isListLoading = false;
        state.isLoadingMore = false;
        state.error = (action.payload as string) || 'Failed to load notifications';
      })

      // count
      .addCase(fetchNotificationCount.pending, state => {
        state.isCountLoading = true;
      })
      .addCase(fetchNotificationCount.fulfilled, (state, action) => {
        state.isCountLoading = false;
        state.unreadCount = action.payload;
      })
      .addCase(fetchNotificationCount.rejected, state => {
        state.isCountLoading = false;
      })

      // viewed
      .addCase(markAllViewed.pending, state => {
        state.isMutating = true;
      })
      .addCase(markAllViewed.fulfilled, state => {
        state.isMutating = false;
      })
      .addCase(markAllViewed.rejected, (state, action) => {
        state.isMutating = false;
        state.error = (action.payload as string) || 'Failed to mark viewed';
      })

      // read
      .addCase(markNotificationsRead.pending, state => {
        state.isMutating = true;
      })
      .addCase(markNotificationsRead.fulfilled, (state, action) => {
        state.isMutating = false;
        const payload = action.payload as any;

        if (payload?.request_type === 'All') {
          state.records = state.records.map(n => ({ ...n, read: true }));
          state.unreadCount = 0;
        } else if (payload?.notification_id != null) {
          const idx = state.records.findIndex(
            n => n.id === payload.notification_id,
          );
          if (idx >= 0 && !state.records[idx].read) {
            state.records[idx].read = true;
            if (state.unreadCount > 0) state.unreadCount -= 1;
          }
        }
      })
      .addCase(markNotificationsRead.rejected, (state, action) => {
        state.isMutating = false;
        state.error = (action.payload as string) || 'Failed to mark read';
      });
  },
});

export const { locallySetRead, clearNotificationError, clearNotifications } =
  notificationSlice.actions;

export default notificationSlice.reducer;
