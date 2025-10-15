import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, LoginRequest, LoginResponse } from '../../types/user';
import { authService } from '../../services/authService';

const initialState: AuthState = {
  user: null,
  token: null,
  refreshToken: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,
  mfaEnabled: false,
  mfaPending: false,
  mfaEmail: null,
};

// 🔑 Login
export const loginUser = createAsyncThunk<LoginResponse, LoginRequest, { rejectValue: string }>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      return await authService.login(credentials);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

// 🔐 Verify OTP
export const verifyOtp = createAsyncThunk<LoginResponse, { email: string; otp: string }, { rejectValue: string }>(
  'auth/verifyOtp',
  async (params, { rejectWithValue }) => {
    try {
      return await authService.verifyOtp(params);
    } catch (error: any) {
      return rejectWithValue(error.message || 'OTP verification failed');
    }
  }
);

// 🔒 Logout (session expired)
export const logoutExpire = createAsyncThunk('auth/logoutExpire', async () => {
  await authService.logoutLocal();
  return null;
});

// 🔒 Logout API
export const logoutUser = createAsyncThunk('auth/logoutUser', async (_, { rejectWithValue }) => {
  try {
    await authService.logout();
    return null;
  } catch (err: any) {
    return rejectWithValue(err.message || 'Logout failed');
  }
});

// 🔑 Restore session
export const restoreSessionFromStorage = createAsyncThunk<LoginResponse | null, void, { rejectValue: string }>(
  'auth/restoreSession',
  async (_, { rejectWithValue }) => {
    try {
      return await authService.checkAuthStatus();
    } catch (error: any) {
      return rejectWithValue(error.message || 'Session restore failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    resetAuth: (state) => {
      Object.assign(state, initialState);
    },
  },
  extraReducers: (builder) => {
    builder
      // 🔑 Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const res = action.payload;

        if (res.mfa_enabled) {
          state.mfaPending = true;
          state.mfaEmail = res.email || null;
          state.mfaEnabled = true;
          state.isAuthenticated = false;
        } else {
          state.token = res.token || null;
          state.refreshToken = res.refreshToken || null;
          state.user = res.user || null;
          state.isAuthenticated = !!res.token;
          state.mfaPending = false;
          state.mfaEnabled = false;
          state.mfaEmail = null;
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Login failed';
      })

      // 🔐 Verify OTP
      .addCase(verifyOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        const res = action.payload;
        state.token = res.token || null;
        state.refreshToken = res.refreshToken || null;
        state.user = res.user || null;
        state.isAuthenticated = !!res.token; // ✅ important
        state.mfaPending = false;
        state.mfaEnabled = false;
        state.mfaEmail = null;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'OTP verification failed';
      })

      // 🔒 Logout
      .addCase(logoutUser.fulfilled, (state) => {
        Object.assign(state, initialState);
      })

      // 🔑 Restore session
      .addCase(restoreSessionFromStorage.fulfilled, (state, action) => {
        state.isLoading = false;
        const res = action.payload;
        if (res?.mfa_enabled) {
          state.mfaPending = true;
          state.mfaEnabled = true;
        } else if (res?.token) {
          state.token = res.token;
          state.refreshToken = res.refreshToken || null;
          state.user = res.user || null;
          state.isAuthenticated = true;
        } else {
          state.isAuthenticated = false;
        }
      })
      .addCase(restoreSessionFromStorage.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, setLoading, resetAuth } = authSlice.actions;
export default authSlice.reducer;
