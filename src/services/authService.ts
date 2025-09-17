import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from './api';
import { encodeData } from '../utils/cryptoHelpers';
import { LoginRequest, LoginResponse } from '../types/user';

export const authService = {
  // 🔑 Login
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const encodedPayload = encodeData(credentials);
    const response = await apiClient.post<any>('/api/users/login', { payload: encodedPayload });
    const token = response.data.token || '';
    const refreshToken = response.data.refreshToken || '';

    if (token) {
      await AsyncStorage.setItem('token', token);
    } else {
      await AsyncStorage.removeItem('token');
    }

    if (refreshToken) {
      await AsyncStorage.setItem('refreshToken', refreshToken);
    } else {
      await AsyncStorage.removeItem('refreshToken');
    }

    return {
      token,
      refreshToken,
      user: response.user,
    };
  },

  // 🔑 Logout
  logout: async (): Promise<void> => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('refreshToken');
  },

  // 🔑 Restore session
  checkAuthStatus: async (): Promise<LoginResponse | null> => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return null;

    const refreshToken = (await AsyncStorage.getItem('refreshToken')) || '';

    return {
      token,
      refreshToken,
      user: undefined, // no user API, keep it null
    };
  },
};
