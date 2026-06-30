export type EcoAlertType =
  | 'illegal_dumping'
  | 'overflowing_bin'
  | 'street_litter'
  | 'hazardous_waste'
  | 'blocked_drain'
  | 'other';

export type EcoAlertSeverity = 'low' | 'medium' | 'high';
export type EcoAlertStatus = 'received' | 'under_review' | 'forwarded' | 'resolved' | 'rejected';

export interface EcoAlertImagePayload {
  base64: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp';
}

export interface CreateEcoAlertPayload {
  city: string;
  lat: number;
  lng: number;
  note?: string;
  image: EcoAlertImagePayload;
}

export interface EcoAlert {
  id: string;
  alertCode: string;
  type: EcoAlertType;
  severity: EcoAlertSeverity;
  status: EcoAlertStatus;
  summary: string;
  detectedItems: string[];
  risks: string[];
  recommendedAction: string;
  confidence: number;
  city: string;
  lat: number;
  lng: number;
  note?: string;
  imageProvided: boolean;
  analysisSource: 'gemini' | 'fallback';
  createdAt: string;
  updatedAt: string;
}

export interface EcoAlertsPage {
  items: EcoAlert[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
