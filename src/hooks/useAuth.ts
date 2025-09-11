// src/hooks/useAuth.ts
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { loginUser, logoutUser, clearError } from '../redux/slices/authSlice';
import { LoginRequest } from '../types/user';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

  const login = async (credentials: LoginRequest) => {
    try {
      await dispatch(loginUser(credentials)).unwrap();
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  useEffect(() => {
    // Check auth status on mount
    // You can add auto-login logic here
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    clearError: clearAuthError,
  };
};