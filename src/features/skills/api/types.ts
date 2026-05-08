export type {
  Site,
  SitePlatform,
  SiteRegion,
  SiteStatus,
  CreateSitePayload,
  UpdateSitePayload
} from '@/constants/mock-api-skills';

export type SiteFilters = {
  page?: number;
  limit?: number;
  search?: string;
  platform?: string;
  region?: string;
  status?: string;
  sort?: string;
};

export type SitesResponse = {
  items: import('@/constants/mock-api-skills').Site[];
  total_items: number;
};

export type SiteStats = {
  total: number;
  featured: number;
  pending: number;
  rejected: number;
  byPlatform: Record<string, number>;
  byRegion: Record<string, number>;
};
