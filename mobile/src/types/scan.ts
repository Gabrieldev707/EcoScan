export type ScanCategory = 'Plástico' | 'Papel' | 'Metal' | 'Vidro' | 'Orgânico' | 'Rejeito';

export interface ScanImagePayload {
  base64: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
}

export interface CreateScanPayload {
  wasteType?: string;
  city: string;
  lat?: number;
  lng?: number;
  image?: ScanImagePayload;
}

export interface Scan {
  id: string;
  wasteType: string;
  identifiedItem?: string;
  material?: string;
  category: ScanCategory;
  binColor: string;
  canRecycle: boolean;
  points: number;
  disposalGuide: string;
  reason?: string;
  classificationSource: 'gemini' | 'groq' | 'fallback';
  confidence: number;
  city: string;
  lat?: number;
  lng?: number;
  imageProvided?: boolean;
  createdAt: string;
}

export interface ScansPage {
  items: Scan[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
