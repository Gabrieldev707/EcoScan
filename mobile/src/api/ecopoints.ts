import { api } from './client';

export interface EcoPoint {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  categories: string[];
  distance?: number;
}

export const ecopointsApi = {
  nearby: (lat: number, lng: number, radiusKm = 5) =>
    api.get<EcoPoint[]>('/ecopoints', { params: { lat, lng, radius: radiusKm } }).then(r => r.data),
};
