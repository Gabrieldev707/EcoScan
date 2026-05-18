import { api } from './client';

export interface Scan {
  id: string;
  wasteType: string;
  category: string;
  points: number;
  disposalGuide: string;
  imageUrl?: string;
  createdAt: string;
}

export const scansApi = {
  create: (imageBase64: string) =>
    api.post<Scan>('/scans', { image: imageBase64 }).then(r => r.data),

  list: (page = 1, limit = 20) =>
    api.get<{ items: Scan[]; total: number }>('/scans', { params: { page, limit } }).then(r => r.data),

  getById: (id: string) =>
    api.get<Scan>(`/scans/${id}`).then(r => r.data),
};
