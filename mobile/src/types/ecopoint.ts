export interface EcoPoint {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  categories: string[];
  distance?: number;
}
