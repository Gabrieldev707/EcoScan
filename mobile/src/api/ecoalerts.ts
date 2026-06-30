import { api } from './client';
import type { CreateEcoAlertPayload, EcoAlert, EcoAlertsPage } from '../types/ecoalert';

const ECO_ALERT_REQUEST_TIMEOUT_MS = 70_000;

export const ecoAlertsApi = {
  create: (payload: CreateEcoAlertPayload) =>
    api.post<EcoAlert>('/ecoalerts', payload, { timeout: ECO_ALERT_REQUEST_TIMEOUT_MS }).then((response) => response.data),

  list: (page = 1, limit = 20) =>
    api.get<EcoAlertsPage>('/ecoalerts', { params: { page, limit } }).then((response) => response.data),
};
