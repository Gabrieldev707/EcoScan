import { api } from './client';
import type { CreateScanPayload, Scan, ScansPage } from '../types/scan';

const SCAN_REQUEST_TIMEOUT_MS = 70_000;

export const scansApi = {
  create: (payload: CreateScanPayload) =>
    api.post<Scan>('/scans', payload, { timeout: SCAN_REQUEST_TIMEOUT_MS }).then((response) => response.data),

  list: (page = 1, limit = 20) =>
    api.get<ScansPage>('/scans', { params: { page, limit } }).then((response) => response.data),
};
