import { api } from './client';
import type { CommunityOverview } from '../types/community';

export const communityApi = {
  overview: (limit = 10) =>
    api.get<CommunityOverview>('/community/overview', { params: { limit } }).then((response) => response.data),
};
