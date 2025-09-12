// src/redux/slices/userSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "@/services/api";
import { encodeData, decodeData } from "@/utils/cryptoHelpers";

interface UserState {
  profile: any | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  isLoading: false,
  error: null,
};

export const fetchUserData = createAsyncThunk(
  "user/fetchUserData",
  async (token: string, { rejectWithValue }) => {
    try {
      const payload = {
        user_id: decodeData(token)?.user_id,
      };

      const response = await apiClient.get("/api/users/userData", {
        params: { payload: encodeData(payload) },
      });

      if (response?.success && response?.data) {
        const decodedProfile = decodeData(response.data);
        return decodedProfile;
      } else {
        return rejectWithValue(response?.message || "Failed to fetch user data");
      }
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUser: (state) => {
      state.profile = null;
      state.error = null;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearUser } = userSlice.actions;
export default userSlice.reducer;
