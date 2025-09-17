import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { loginUser, logoutUser, clearError, restoreSessionFromStorage } from '../redux/slices/authSlice';
import { LoginRequest } from '../types/user';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error } = useAppSelector((state) => state.auth);

  const login = async (credentials: LoginRequest) => {
    try {
      await dispatch(loginUser(credentials)).unwrap();
    } catch (err) {
      throw err;
    }
  };

  const logout = async () => {
    await dispatch(logoutUser()).unwrap();
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  useEffect(() => {
    dispatch(restoreSessionFromStorage());
  }, [dispatch]);

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
