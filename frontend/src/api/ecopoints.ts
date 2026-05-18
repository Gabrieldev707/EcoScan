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

export interface Route {
  origin: { lat: number; lng: number };
  destination: EcoPoint;
  distanceKm: number;
  durationMin: number;
  steps: string[];
}

export const ecopointsApi = {
  nearby: (lat: number, lng: number, radiusKm = 5) =>
    api.get<EcoPoint[]>('/ecopoints', { params: { lat, lng, radius: radiusKm } }).then(r => r.data),

  getById: (id: string) =>
    api.get<EcoPoint>(`/ecopoints/${id}`).then(r => r.data),

  getRoute: (originLat: number, originLng: number, destinationId: string) =>
    api.get<Route>(`/ecopoints/${destinationId}/route`, {
      params: { lat: originLat, lng: originLng },
    }).then(r => r.data),
};
