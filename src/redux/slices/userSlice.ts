// src/redux/slices/userSlice.ts
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "@/services/api";
import { encodeData, decodeData } from "@/utils/cryptoHelpers";

interface UserState {
  profile: any | null;
  names: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  profile: null,
  names: [],
  isLoading: false,
  error: null,
};

// Fetch User Profile
export const fetchUserData = createAsyncThunk(
  "user/fetchUserData",
  async (_, { rejectWithValue, getState }) => {
    try {
      const state: any = getState();
      const token = state.auth.token;

      if (!token) {
        return rejectWithValue("No token found in store");
      }

      const payload = { user_id: decodeData(token)?.user_id };

      const response = await apiClient.get("/api/users/profile", {
        params: { payload: encodeData(payload) },
      });

      if (response?.success && response?.data) {
        return response.data;
      } else {
        return rejectWithValue(response?.message || "Failed to fetch user data");
      }
    } catch (err: any) {
      
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchUserNamesList = createAsyncThunk(
  "user/fetchUserNamesList",
  async (payload: object = {}, { rejectWithValue }) => {
    try {
      const encodedPayload = encodeData(payload || {});

      const response = await apiClient.get("/api/users/names", {
        params: { payload: encodedPayload },
      });

      if (response?.data && response.data.success && response.data.data) {
        return response.data.data;
      } else {
        return rejectWithValue(
          response?.message || "Failed to fetch user names"
        );
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
      state.names = [];
      state.error = null;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchUserData
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
      })

      // fetchUserNamesList
      .addCase(fetchUserNamesList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserNamesList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.names = action.payload;
      })
      .addCase(fetchUserNamesList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearUser } = userSlice.actions;
export default userSlice.reducer;
