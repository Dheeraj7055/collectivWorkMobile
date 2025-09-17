export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'hr' | 'employee';
  department?: string;
  position?: string;
  avatar?: string;
  phone?: string;
  joinDate?: string;
  isActive: boolean;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string | null;
  user?: User;
}
