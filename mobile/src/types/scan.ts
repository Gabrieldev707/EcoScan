export type ScanCategory = 'Plástico' | 'Papel' | 'Metal' | 'Vidro' | 'Orgânico' | 'Rejeito';

export interface Scan {
  id: string;
  wasteType: string;
  category: ScanCategory;
  binColor: string;
  canRecycle: boolean;
  points: number;
  disposalGuide: string;
  classificationSource: 'gemini' | 'fallback';
  confidence: number;
  city: string;
  createdAt: string;
}

export interface ScansPage {
  items: Scan[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
