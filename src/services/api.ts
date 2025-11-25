import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { API_BASE_URL } from '@env';
import { RootState, store } from '@/redux/store';
import { logoutExpire } from '@/redux/slices/authSlice';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL || 'http://10.0.2.2:3000/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Request Interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // const state = store.getState();
    // const token = state.auth.token;
    const state = store.getState() as RootState;
    const token = state.auth.token;
    if (token) {
      config.headers.set('Authorization', `${token}`);
    }

    // Handle FormData vs JSON
    if (config.data instanceof FormData) {
      // Let Axios set correct `multipart/form-data` boundary
      config.headers.delete?.('Content-Type'); // remove default
      config.headers.set('Content-Type', 'multipart/form-data');

      // Debug FormData parts (React Native FormData has `_parts`)
      const parts = (config.data as any)._parts || [];
      // console.log(
      //   '[API REQUEST]',
      //   config.method?.toUpperCase(),
      //   `${config.baseURL}${config.url}`,
      //   '\nFormData:',
      //   parts.map(
      //     (p: any) =>
      //       `${p[0]}=${typeof p[1] === 'object' ? JSON.stringify(p[1]) : p[1]}`,
      //   ),
      // );
    } else {
      config.headers.set('Content-Type', 'application/json');
      // console.log(
      //   '[API REQUEST]',
      //   config.method?.toUpperCase(),
      //   `${config.baseURL}${config.url}`,
      //   config.data ? `\nPayload: ${JSON.stringify(config.data)}` : '',
      // );
    }

    return config;
  },
  error => Promise.reject(error),
);

// Response Interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // console.log(
    //   '[API RESPONSE]',
    //   response.config.url,
    //   '\nStatus:',
    //   response.status,
    //   '\nData:',
    //   JSON.stringify(response.data),
    // );
    return response;
  },
  async error => {
    // Network / request setup errors
    if (!error.response) {
      // console.error('[API NETWORK/SETUP ERROR]', error.message);
      const e = new Error('Network error. Please check your connection.');
      (e as any).isNetworkError = true;
      return Promise.reject(e);
    }

    const { status, data, config } = error.response as AxiosResponse<any>;
    const url = config?.url;

    // Prefer server-provided message keys
    const serverMessage =
      (data && (data.message || data.error || data.msg)) || '';

    // Build a clean error object
    const normalizedError = new Error(
      serverMessage ||
        (status === 401
          ? 'Unauthorized'
          : status === 409
          ? 'Conflict'
          : `Request failed (${status})`),
    ) as Error & {
      status?: number;
      data?: any;
      url?: string;
      code?: string | number;
    };

    normalizedError.status = status;
    normalizedError.data = data;
    normalizedError.url = url;
    normalizedError.code = status;

    // console.error(
    //   '[API RESPONSE ERROR]',
    //   'Status:',
    //   status,
    //   'URL:',
    //   url,
    //   'Data:',
    //   JSON.stringify(data),
    // );

    // 🔐 Auto-logout on 401 (keep your logic)
    if (status === 401) {
      try {
        // you already import store on top; no need to require again
        await store.dispatch(logoutExpire());
        const Toast = require('react-native-toast-message').default;
        Toast.show({
          type: 'error',
          text1: 'Session expired',
          text2: 'Please login again.',
        });
      } catch (e) {
        console.error('Auto logout failed:', e);
      }
    }

    return Promise.reject(normalizedError);
  },
);

export const apiClient = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    api.get(url, config).then(res => res.data),

  post: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> => api.post(url, data, config).then(res => res.data),

  put: <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> => api.put(url, data, config).then(res => res.data),

  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    api.delete(url, config).then(res => res.data),

  postForm: async <T = any>(
    url: string,
    formData: FormData,
    config?: AxiosRequestConfig,
  ): Promise<T> => {
    return apiClient.post<T>(url, formData, {
      ...(config || {}),
      headers: {
        ...(config?.headers || {}),
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default api;
