import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform } from 'react-native';

declare const process: {
  env?: Record<string, string | undefined>;
};

export const AUTH_STORAGE_KEYS = {
  token: 'ecoscan_token',
  user: 'ecoscan_user',
} as const;

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

function normalizeApiUrl(url: string) {
  const trimmed = url.replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

function getMetroHost() {
  const sourceCode = NativeModules.SourceCode as { scriptURL?: string } | undefined;
  const match = sourceCode?.scriptURL?.match(/^https?:\/\/([^:/]+)/);
  return match?.[1];
}

function getDefaultDevApiUrl() {
  const env = process.env || {};
  const port = env.EXPO_PUBLIC_API_PORT || '3000';
  const metroHost = getMetroHost();

  if (metroHost && metroHost !== 'localhost' && metroHost !== '127.0.0.1') {
    return `http://${metroHost}:${port}/api`;
  }

  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${port}/api`;
  }

  if (Platform.OS === 'ios') {
    return `http://localhost:${port}/api`;
  }

  return `http://127.0.0.1:${port}/api`;
}

function resolveBaseURL() {
  const env = process.env || {};

  if (env.EXPO_PUBLIC_API_URL) {
    return normalizeApiUrl(env.EXPO_PUBLIC_API_URL);
  }

  if (__DEV__) {
    return getDefaultDevApiUrl();
  }

  throw new Error('EXPO_PUBLIC_API_URL is required outside development');
}

export const api = axios.create({
  baseURL: resolveBaseURL(),
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(AUTH_STORAGE_KEYS.token);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.multiRemove([AUTH_STORAGE_KEYS.token, AUTH_STORAGE_KEYS.user]);
      unauthorizedHandler?.();
    }

    const message = error.response?.data?.message ?? 'Erro de conexao.';
    const apiError = new Error(message) as Error & { status?: number; errors?: unknown[] };
    apiError.status = error.response?.status;
    apiError.errors = error.response?.data?.errors ?? [];
    return Promise.reject(apiError);
  },
);
