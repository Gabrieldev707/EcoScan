import { api } from './client';

export interface UserStats {
  kgDisposed: number;
  co2Avoided: number;
  waterSaved: number;
  points: number;
  totalScans: number;
  level: number;
  levelName: string;
  nextLevelPoints: number;
}

export interface Medal {
  id: string;
  title: string;
  icon: string;
  earned: boolean;
  earnedAt?: string;
}

export const userApi = {
  getProfile: () => api.get<{ name: string; email: string; level: number; avatarUrl?: string }>('/users/me').then(r => r.data),

  getStats: () => api.get<UserStats>('/users/me/stats').then(r => r.data),

  getMedals: () => api.get<Medal[]>('/users/me/medals').then(r => r.data),

  updateProfile: (data: { name?: string; avatarUrl?: string }) =>
    api.patch('/users/me', data).then(r => r.data),
};
