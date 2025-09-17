import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { API_BASE_URL } from '@env';
import { store } from '@/redux/store';

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Request Interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const state = store.getState();
    const token = state.auth?.token;

    if (token) {
      config.headers.set('Authorization', `${token}`);
    }
    config.headers.set('Content-Type', 'application/json');

    console.log(
      '[API REQUEST]',
      config.method?.toUpperCase(),
      `${config.baseURL}${config.url}`,
      config.data ? `\nPayload: ${JSON.stringify(config.data)}` : ''
    );

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(
      '[API RESPONSE]',
      response.config.url,
      '\nStatus:', response.status,
      '\nData:', JSON.stringify(response.data)
    );
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(
        '[API RESPONSE ERROR]',
        'Status:', error.response.status,
        'URL:', error.config?.url,
        'Data:', JSON.stringify(error.response.data)
      );
    } else {
      console.error('[API NETWORK ERROR]', error.message);
    }
    return Promise.reject(error);
  }
);

export const apiClient = {
  get: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    api.get(url, config).then((res) => res.data),

  post: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    api.post(url, data, config).then((res) => res.data),

  put: <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> =>
    api.put(url, data, config).then((res) => res.data),

  delete: <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    api.delete(url, config).then((res) => res.data),
};

export default api;
