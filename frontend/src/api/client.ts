import axios from 'axios';
import { API_URL, STORAGE_KEYS, MESSAGES } from '@/utils/constants';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
      window.dispatchEvent(new Event('ecoscan:session-expired'));
    }
    const message =
      error.response?.data?.message ??
      (error.code === 'ERR_NETWORK' ? MESSAGES.NETWORK_ERROR : MESSAGES.GENERIC_ERROR);
    return Promise.reject(new Error(message));
  }
);
