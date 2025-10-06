import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { profileService } from '@/services/profileService';

interface ProfileScreenState {
  isLoading: boolean;
  error: string | null;
  success: string | null;
}

const initialState: ProfileScreenState = {
  isLoading: false,
  error: null,
  success: null,
};

/* -------------------------------------------------------------------------- */
/*                               🔹 THUNKS                                   */
/* -------------------------------------------------------------------------- */

// Upload Cover Image
export const uploadCoverImage = createAsyncThunk<
  any,
  { uri: string; user_id: number },
  { rejectValue: string }
>('profile/uploadCoverImage', async ({ uri, user_id }, { rejectWithValue }) => {
  try {
    const res = await profileService.uploadCoverImage(uri, user_id);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to upload cover image');
  }
});

// Remove Cover Image
export const removeCoverImage = createAsyncThunk<
  any,
  { user_id: number },
  { rejectValue: string }
>('profile/removeCoverImage', async ({ user_id }, { rejectWithValue }) => {
  try {
    const res = await profileService.removeCoverImage(user_id);
    return res;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to remove cover image');
  }
});

// Upload Profile Image
export const uploadProfileImage = createAsyncThunk<
  any,
  { uri: string; user_id: number },
  { rejectValue: string }
>('profile/uploadProfileImage', async ({ uri, user_id }, { rejectWithValue }) => {
  try {
    const res = await profileService.uploadProfileImage(uri, user_id);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to upload profile image');
  }
});

// Remove Profile Image
export const removeProfileImage = createAsyncThunk<
  any,
  { user_id: number },
  { rejectValue: string }
>('profile/removeProfileImage', async ({ user_id }, { rejectWithValue }) => {
  try {
    const res = await profileService.removeProfileImage(user_id);
    return res;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Failed to remove profile image');
  }
});

/* -------------------------------------------------------------------------- */
/*                               🔹 SLICE                                    */
/* -------------------------------------------------------------------------- */
const profileScreenSlice = createSlice({
  name: 'profileScreen',
  initialState,
  reducers: {
    clearProfileStatus: state => {
      state.error = null;
      state.success = null;
    },
  },
  extraReducers: builder => {
    const handlePending = (state: ProfileScreenState) => {
      state.isLoading = true;
      state.error = null;
      state.success = null;
    };

    const handleFulfilled = (
      state: ProfileScreenState,
      action: PayloadAction<any>,
    ) => {
      state.isLoading = false;
      state.success = action.payload?.message || 'Operation successful';
    };

    const handleRejected = (
      state: ProfileScreenState,
      action: PayloadAction<any>,
    ) => {
      state.isLoading = false;
      state.error = action.payload || 'Operation failed';
    };

    builder
      // Cover Image
      .addCase(uploadCoverImage.pending, handlePending)
      .addCase(uploadCoverImage.fulfilled, handleFulfilled)
      .addCase(uploadCoverImage.rejected, handleRejected)
      .addCase(removeCoverImage.pending, handlePending)
      .addCase(removeCoverImage.fulfilled, handleFulfilled)
      .addCase(removeCoverImage.rejected, handleRejected)

      // Profile Image
      .addCase(uploadProfileImage.pending, handlePending)
      .addCase(uploadProfileImage.fulfilled, handleFulfilled)
      .addCase(uploadProfileImage.rejected, handleRejected)
      .addCase(removeProfileImage.pending, handlePending)
      .addCase(removeProfileImage.fulfilled, handleFulfilled)
      .addCase(removeProfileImage.rejected, handleRejected);
  },
});

export const { clearProfileStatus } = profileScreenSlice.actions;
export default profileScreenSlice.reducer;
