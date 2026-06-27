import { api } from './client';
import type { AuthResponse, AuthUser } from '../types/auth';

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }).then((response) => response.data),

  register: (name: string, email: string, password: string) =>
    api.post<AuthResponse>('/auth/register', { name, email, password }).then((response) => response.data),

  me: () =>
    api.get<{ user: AuthUser }>('/auth/me').then((response) => response.data.user),

  logout: () => api.post('/auth/logout').catch(() => {}),
};
