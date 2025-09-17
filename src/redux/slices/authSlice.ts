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
};

// 🔑 Login
export const loginUser = createAsyncThunk<
  LoginResponse,
  LoginRequest,
  { rejectValue: string }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    return await authService.login(credentials);
  } catch (error: any) {
    return rejectWithValue(error.message || 'Login failed');
  }
});

// 🔑 Logout
export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await authService.logout();
  return null;
});

// 🔑 Restore session from AsyncStorage
export const restoreSessionFromStorage = createAsyncThunk<
  LoginResponse | null,
  void,
  { rejectValue: string }
>('auth/restoreSession', async (_, { rejectWithValue }) => {
  try {
    return await authService.checkAuthStatus();
  } catch (error: any) {
    return rejectWithValue(error.message || 'Session restore failed');
  }
});

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
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken || null;
        state.user = action.payload.user || null;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Login failed';
        state.isAuthenticated = false;
      })

      // Logout
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      })

      // Restore session
      .addCase(restoreSessionFromStorage.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(restoreSessionFromStorage.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload) {
          state.token = action.payload.token;
          state.refreshToken = action.payload.refreshToken || null;
          state.user = action.payload.user || null;
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
