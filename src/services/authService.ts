import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './api';
import { encodeData } from '../utils/cryptoHelpers';
import { LoginRequest, LoginResponse } from '../types/user';

export const authService = {
  // 🔑 Login
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    try {
      const encodedPayload = encodeData(credentials);
      const response = await apiClient.post<any>('/api/users/login', {
        payload: encodedPayload,
      });

      const { data, mfa_enabled } = response;

      // MFA Required: Don't store token yet
      if (mfa_enabled) {
        const email = credentials.email;
        await AsyncStorage.setItem('mfa_pending', 'true');
        await AsyncStorage.setItem('mfa_email', email);

        return { mfa_enabled: true, email } as LoginResponse;
      }

      // Normal login
      const token = data?.token || '';
      const refreshToken = data?.refreshToken || '';

      if (token) {
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('refreshToken', refreshToken || '');
        await AsyncStorage.multiRemove(['mfa_pending', 'mfa_email']);
      }

      return {
        token,
        refreshToken,
        user: data?.user,
        mfa_enabled: false,
        email: credentials.email,
      } as LoginResponse;
    } catch (err: any) {
      // NEW PART ONLY: extract backend message for Toast
      const backendMessage =
        err?.response?.data?.message || "Invalid credentials"
        err?.response?.data?.error || // fallback key
        err?.message || // axios default text
        'Login failed';

      throw new Error(backendMessage);
    }
  },

  // 🔐 Verify OTP
  verifyOtp: async (params: {
    email: string;
    otp: string;
  }): Promise<LoginResponse> => {
    // Encode payload
    const encodedPayload = encodeData(params);

    // Correct endpoint as per your note
    const response = await apiClient.post<any>('/api/users/verify/otp', {
      payload: encodedPayload,
    });

    const { data } = response;
    const token = data?.token || '';
    const refreshToken = data?.refreshToken || '';
    const user = data?.user || null;

    // Save token when successful
    if (token) {
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('refreshToken', refreshToken || '');
      await AsyncStorage.multiRemove(['mfa_pending', 'mfa_email']);
    }

    return {
      token,
      refreshToken,
      user,
      mfa_enabled: false,
      email: params.email, // include for state consistency
    };
  },

  // 🔒 Logout session expired
  logoutLocal: async (): Promise<void> => {
    await AsyncStorage.multiRemove([
      'token',
      'refreshToken',
      'mfa_pending',
      'mfa_email',
    ]);
  },

  // 🔒 Logout API call
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/api/users/logout');
      await AsyncStorage.multiRemove([
        'token',
        'refreshToken',
        'mfa_pending',
        'mfa_email',
      ]);
    } catch (error) {
      console.error('Logout API failed:', error);
      throw error;
    }
  },

  // 🔑 Restore session
  checkAuthStatus: async (): Promise<LoginResponse | null> => {
    const token = await AsyncStorage.getItem('token');
    const refreshToken = (await AsyncStorage.getItem('refreshToken')) || '';
    const mfaPending = (await AsyncStorage.getItem('mfa_pending')) === 'true';
    const mfaEmail = await AsyncStorage.getItem('mfa_email');

    if (mfaPending && mfaEmail) {
      return { mfa_enabled: true, email: mfaEmail };
    }

    if (!token) return null;

    return {
      token,
      refreshToken,
      user: undefined,
      mfa_enabled: false,
    };
  },
};
