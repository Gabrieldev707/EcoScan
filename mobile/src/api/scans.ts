import { api } from './client';

export interface Scan {
  id: string;
  wasteType: string;
  category: string;
  points: number;
  disposalGuide: string;
  createdAt: string;
}

export const scansApi = {
  create: (imageBase64: string) =>
    api.post<Scan>('/scans', { image: imageBase64 }).then(r => r.data),

  list: (page = 1) =>
    api.get<{ items: Scan[]; total: number }>('/scans', { params: { page, limit: 20 } }).then(r => r.data),
};
