export interface CommunitySummary {
  totalMembers: number;
  totalScans: number;
  recyclableScans: number;
  totalPoints: number;
  currentUserRank: number;
}

export interface RankingUser {
  id: string;
  rank: number;
  name: string;
  points: number;
  level: number;
  scans: number;
  recyclableScans: number;
  isCurrentUser: boolean;
}

export interface CommunityFeedItem {
  id: string;
  user: {
    id: string;
    name: string;
    level: number;
  };
  wasteType: string;
  category: string;
  canRecycle: boolean;
  points: number;
  city: string;
  classificationSource: 'gemini' | 'groq' | 'fallback';
  createdAt: string;
}

export interface CommunityOverview {
  summary: CommunitySummary;
  ranking: RankingUser[];
  feed: CommunityFeedItem[];
}
