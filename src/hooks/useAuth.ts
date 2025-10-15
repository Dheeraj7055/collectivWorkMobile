import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../redux/hooks';
import { loginUser, logoutUser, clearError, restoreSessionFromStorage } from '../redux/slices/authSlice';
import { LoginRequest, LoginResponse } from '../types/user';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error, mfaPending, mfaEmail } = useAppSelector(
    (state) => state.auth
  );

  const login = async (credentials: LoginRequest): Promise<LoginResponse> => {
    return await dispatch(loginUser(credentials)).unwrap();
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
    mfaPending,
    mfaEmail,
    login,
    logout,
    clearError: clearAuthError,
  };
};
