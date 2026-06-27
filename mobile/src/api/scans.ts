import { api } from './client';
import type { Scan, ScansPage } from '../types/scan';

export const scansApi = {
  create: (payload: { wasteType: string; city: string }) =>
    api.post<Scan>('/scans', payload).then((response) => response.data),

  list: (page = 1, limit = 20) =>
    api.get<ScansPage>('/scans', { params: { page, limit } }).then((response) => response.data),
};
