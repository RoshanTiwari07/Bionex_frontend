import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiError } from './types';

// ─── Config ──────────────────────────────────────────────────────────────────
export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'https://api.bionex.health/v1';

export const USE_MOCK_DATA = true; // Toggle to false when real backend is ready

// ─── Axios instance ───────────────────────────────────────────────────────────
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await AsyncStorage.getItem('@bionex_access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Token refresh on 401
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await AsyncStorage.getItem('@bionex_refresh_token');
        if (refreshToken) {
          const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });
          await AsyncStorage.setItem('@bionex_access_token', data.accessToken);
          if (originalRequest.headers) {
            (originalRequest.headers as Record<string, string>).Authorization =
              `Bearer ${data.accessToken}`;
          }
          return apiClient(originalRequest);
        }
      } catch {
        await AsyncStorage.multiRemove([
          '@bionex_access_token',
          '@bionex_refresh_token',
        ]);
      }
    }

    // Parse error into standardised shape
    const apiError: ApiError = {
      code: error.response?.data?.code ?? 'UNKNOWN_ERROR',
      message:
        error.response?.data?.message ??
        error.message ??
        'An unexpected error occurred',
      statusCode: error.response?.status ?? 0,
      details: error.response?.data?.details,
    };

    return Promise.reject(apiError);
  }
);

export default apiClient;
