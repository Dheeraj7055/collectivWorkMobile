import { apiClient } from './api';
import { encodeData } from '../utils/cryptoHelpers';
import { LoginRequest, LoginResponse } from '../types/user';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const encodedPayload = encodeData(credentials);
    const response = await apiClient.post<any>('/api/users/login', { payload: encodedPayload });

    const token = response.token;
    const refreshToken = response.refreshToken;

    await AsyncStorage.setItem('token', token);
    if (refreshToken) {
      await AsyncStorage.setItem('refreshToken', refreshToken);
    }

    return {
      token,
      refreshToken,
      user: response.user || null,
    };
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('refreshToken');
  },

  checkAuthStatus: async (): Promise<LoginResponse | null> => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return null;

      // Optionally call backend to verify token
      return {
        token,
        refreshToken: (await AsyncStorage.getItem('refreshToken')) || null,
      };
    } catch {
      return null;
    }
  },
};
