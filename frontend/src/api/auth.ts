import { api } from './client';

export interface AuthPayload {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    level: number;
    points: number;
    avatarUrl?: string;
  };
}

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthPayload>('/auth/login', { email, password }).then(r => r.data),

  register: (name: string, email: string, password: string) =>
    api.post<AuthPayload>('/auth/register', { name, email, password }).then(r => r.data),

  logout: () => api.post('/auth/logout'),

  me: () => api.get<AuthPayload['user']>('/auth/me').then(r => r.data),
};
