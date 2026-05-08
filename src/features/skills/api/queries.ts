import { queryOptions } from '@tanstack/react-query';
import { getSites, getSiteById, getFeaturedSites, getSiteStats } from './service';
import type { Site, SiteFilters } from './types';

export type { Site };

export const siteKeys = {
  all: ['sites'] as const,
  list: (filters: SiteFilters) => [...siteKeys.all, 'list', filters] as const,
  detail: (id: number) => [...siteKeys.all, 'detail', id] as const,
  featured: () => [...siteKeys.all, 'featured'] as const,
  stats: () => [...siteKeys.all, 'stats'] as const
};

// keep legacy names as aliases so existing imports don't break
export const skillKeys = siteKeys;

export const sitesQueryOptions = (filters: SiteFilters) =>
  queryOptions({
    queryKey: siteKeys.list(filters),
    queryFn: () => getSites(filters),
    staleTime: 30 * 1000
  });

// alias
export const skillsQueryOptions = sitesQueryOptions;

export const siteByIdOptions = (id: number) =>
  queryOptions({
    queryKey: siteKeys.detail(id),
    queryFn: () => getSiteById(id),
    staleTime: 60 * 1000
  });

export const featuredSitesOptions = () =>
  queryOptions({
    queryKey: siteKeys.featured(),
    queryFn: () => getFeaturedSites(),
    staleTime: 60 * 1000
  });

// alias
export const featuredSkillsOptions = featuredSitesOptions;

export const siteStatsOptions = () =>
  queryOptions({
    queryKey: siteKeys.stats(),
    queryFn: () => getSiteStats(),
    staleTime: 30 * 1000
  });

// alias
export const skillStatsOptions = siteStatsOptions;
