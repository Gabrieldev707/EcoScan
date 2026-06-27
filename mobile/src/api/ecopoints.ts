import { api } from './client';
import type { EcoPoint } from '../types/ecopoint';

export const ecopointsApi = {
  nearby: (lat: number, lng: number, radiusKm = 5) =>
    api.get<EcoPoint[]>('/ecopoints', { params: { lat, lng, radius: radiusKm } }).then((response) => response.data),
};
