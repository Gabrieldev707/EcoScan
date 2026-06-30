import { api } from './client';
import type { AuthResponse, AuthUser } from '../types/auth';

const AUTH_REQUEST_TIMEOUT_MS = 20_000;

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }, { timeout: AUTH_REQUEST_TIMEOUT_MS }).then((response) => response.data),

  register: (name: string, email: string, password: string) =>
    api.post<AuthResponse>('/auth/register', { name, email, password }, { timeout: AUTH_REQUEST_TIMEOUT_MS }).then((response) => response.data),

  me: () =>
    api.get<{ user: AuthUser }>('/auth/me').then((response) => response.data.user),

  forgotPassword: (email: string) =>
    api.post<{ message: string }>('/auth/forgot-password', { email }, { timeout: AUTH_REQUEST_TIMEOUT_MS }).then((response) => response.data),

  logout: () => api.post('/auth/logout').catch(() => {}),
};
