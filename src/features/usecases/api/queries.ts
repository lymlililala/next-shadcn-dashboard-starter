import { queryOptions } from '@tanstack/react-query';
import { getUseCases, getFeaturedUseCases, getUseCaseStats } from './service';

export const usecaseKeys = {
  all: ['usecases'] as const,
  list: (filters: object) => [...usecaseKeys.all, 'list', filters] as const,
  featured: () => [...usecaseKeys.all, 'featured'] as const,
  stats: () => [...usecaseKeys.all, 'stats'] as const
};

export const usecasesQueryOptions = (
  filters: {
    industry?: string;
    difficulty?: number;
    search?: string;
  } = {}
) =>
  queryOptions({
    queryKey: usecaseKeys.list(filters),
    queryFn: () => getUseCases(filters),
    staleTime: 5 * 60 * 1000
  });

export const featuredUsecasesOptions = () =>
  queryOptions({
    queryKey: usecaseKeys.featured(),
    queryFn: () => getFeaturedUseCases(),
    staleTime: 5 * 60 * 1000
  });

export const usecaseStatsOptions = () =>
  queryOptions({
    queryKey: usecaseKeys.stats(),
    queryFn: () => getUseCaseStats(),
    staleTime: 5 * 60 * 1000
  });
