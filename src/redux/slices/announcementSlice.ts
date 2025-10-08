// // src/redux/slices/announcementSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { announcementService } from '@/services/announcementService';
import { encodeData } from '@/utils/cryptoHelpers';
import { MediaItem } from '@/types/announcement';
import Toast from 'react-native-toast-message';

export interface Announcement {
  id: string | number;
  subject: string;
  repost_thought: string;
  description: string;
  created_at: string;
  reposted_by?: number | string | null;
  createdByUser?: {
    id: string | number;
    first_name: string;
    last_name: string;
    image_url?: string | null;
    profile_color?: string;
    email?: string;
    cover_image_url?: string | null;
    employeeID?: string;
  };
  document_urls?: MediaItem[];
  total_likes?: number;
  total_comments?: number;
  isLiked?: boolean;
  status?: string;
  type?: string;
}

export interface PinnedUser {
  id: number;
  pin_user_id: number;
  pinned_by: number;
  pinUser: {
    first_name: string;
    last_name: string;
    profile_color?: string;
    image_url?: string | null;
    user_id: number;
  };
}
interface AnnouncementState {
  records: Announcement[];
  pinnedUsers: PinnedUser[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AnnouncementState = {
  records: [],
  pinnedUsers: [],
  isLoading: false,
  error: null,
};

// 🔹 Fetch announcements (all, posts, praise, liked, repost)
export const fetchAnnouncements = createAsyncThunk<
  Announcement[],
  Record<string, any> | undefined,
  { rejectValue: string }
>('announcements/fetch', async (payload, { rejectWithValue }) => {
  try {
    const encodedPayload = payload ? encodeData(payload) : null;
    const response = await announcementService.getAll(
      encodedPayload ? { payload: encodedPayload } : {},
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to load announcements');
  }
});

// 🔹 Fetch bookmarked announcements
export const fetchBookmarks = createAsyncThunk<
  Announcement[],
  void,
  { rejectValue: string }
>('announcements/fetchBookmarks', async (_, { rejectWithValue }) => {
  try {
    const response = await announcementService.getBookmarks();
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.message || 'Failed to load bookmarks');
  }
});

//  Get all pinned users
export const fetchPinnedUsers = createAsyncThunk<
  PinnedUser[],
  void,
  { rejectValue: string }
>('announcements/fetchPinnedUsers', async (_, { rejectWithValue }) => {
  try {
    const res = await announcementService.getPinned();
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to load pinned users');
  }
});

export const togglePinUser = createAsyncThunk<
  void,
  { userId: number; isPinned: boolean },
  { rejectValue: string }
>(
  'announcements/togglePinUser',
  async ({ userId, isPinned }, { rejectWithValue, dispatch }) => {
    try {
      const payload = encodeData({ user_id: userId });
      const endpoint = isPinned
        ? '/api/announcement/remove/pin/user'
        : '/api/announcement/pin/user';

      const res = await announcementService.togglePin(endpoint, { payload });

      if (res?.success) {
        Toast.show({
          type: 'success',
          text1: isPinned
            ? 'User unpinned successfully'
            : 'User pinned successfully',
        });
        // ✅ Refresh pinned announcement list
        dispatch(fetchPinnedUsers());
      } else {
        return rejectWithValue(res?.message || 'Failed to update pinned user');
      }
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to update pinned user');
    }
  },
);

// 🔹 Edit comments
export const updatePostComment = createAsyncThunk<
  any,
  { comment_id: number | string; comment: string },
  { rejectValue: string }
>(
  'announcements/updateComment',
  async ({ comment_id, comment }, { rejectWithValue }) => {
    try {
      const payload = encodeData({
        comment_id,
        comment,
        is_edited: true,
      });

      const res = await announcementService.updateComment({ payload });

      if (res?.success) {
        Toast.show({ type: 'success', text1: 'Comment updated successfully' });
        return res.data;
      } else {
        return rejectWithValue(
          res?.data?.message || 'Failed to update comment',
        );
      }
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to update comment');
    }
  },
);

// delete comment
export const deletePostComment = createAsyncThunk<
  any,
  { comment_id: number | string },
  { rejectValue: string }
>(
  'announcements/deleteComment',
  async ({ comment_id }, { rejectWithValue }) => {
    try {
      const payload = encodeData({ comment_id });
      const res = await announcementService.deleteComment({ payload });

      if (res?.success) {
        Toast.show({
          type: 'success',
          text1: res.message || 'Comment deleted successfully',
        });
        return res.data;
      } else {
        return rejectWithValue(res?.message || 'Failed to delete comment');
      }
    } catch (err: any) {
      return rejectWithValue(err.message || 'Failed to delete comment');
    }
  },
);

const announcementSlice = createSlice({
  name: 'announcements',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null;
    },
  },
  extraReducers: builder => {
    // Generic announcements
    builder
      .addCase(fetchAnnouncements.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchAnnouncements.fulfilled,
        (state, action: PayloadAction<Announcement[]>) => {
          state.isLoading = false;
          state.records = action.payload;
        },
      )
      .addCase(fetchAnnouncements.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to load announcements';
      });

    // Bookmarks
    builder
      .addCase(fetchBookmarks.pending, state => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(
        fetchBookmarks.fulfilled,
        (state, action: PayloadAction<Announcement[]>) => {
          state.isLoading = false;
          state.records = action.payload;
        },
      )
      .addCase(fetchBookmarks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to load bookmarks';
      });

    // Pinned Announcements
    builder
      .addCase(fetchPinnedUsers.pending, state => {
        state.isLoading = true;
      })
      .addCase(fetchPinnedUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pinnedUsers = action.payload || [];
      })
      .addCase(fetchPinnedUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to load pinned users';
      });
  },
});

export const { clearError } = announcementSlice.actions;
export default announcementSlice.reducer;
