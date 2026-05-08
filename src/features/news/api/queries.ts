import { queryOptions } from '@tanstack/react-query';
import { getNews, getPublishedNews, getFeaturedNews, getNewsStats } from './service';
import type { NewsFilters } from './types';

export const newsKeys = {
  all: ['news'] as const,
  list: (filters: NewsFilters) => [...newsKeys.all, 'list', filters] as const,
  featured: () => [...newsKeys.all, 'featured'] as const,
  stats: () => [...newsKeys.all, 'stats'] as const
};

export const newsQueryOptions = (filters: NewsFilters) =>
  queryOptions({
    queryKey: newsKeys.list(filters),
    queryFn: () => getNews(filters),
    staleTime: 30 * 1000
  });

export const publishedNewsOptions = (filters: Omit<NewsFilters, 'status'>) =>
  queryOptions({
    queryKey: newsKeys.list({ ...filters, status: 'published' }),
    queryFn: () => getPublishedNews(filters),
    staleTime: 30 * 1000
  });

export const featuredNewsOptions = () =>
  queryOptions({
    queryKey: newsKeys.featured(),
    queryFn: () => getFeaturedNews(),
    staleTime: 60 * 1000
  });

export const newsStatsOptions = () =>
  queryOptions({
    queryKey: newsKeys.stats(),
    queryFn: () => getNewsStats(),
    staleTime: 30 * 1000
  });
