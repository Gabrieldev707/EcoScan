export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';
export const USE_MOCK_AUTH = import.meta.env.VITE_USE_MOCK_AUTH !== 'false';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  ABOUT: '/about',
} as const;

export const STORAGE_KEYS = {
  TOKEN: 'ecoscan_token',
  USER: 'ecoscan_user',
} as const;

export const MESSAGES = {
  NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
  AUTH_ERROR: 'Credenciais inválidas.',
  GENERIC_ERROR: 'Algo deu errado. Tente novamente.',
  SESSION_EXPIRED: 'Sessão expirada. Faça login novamente.',
} as const;
