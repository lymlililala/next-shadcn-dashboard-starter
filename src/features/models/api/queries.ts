import { queryOptions } from '@tanstack/react-query';
import { getModels, getBenchmarks, getModelStats } from './service';

export const modelKeys = {
  all: ['models'] as const,
  list: (filters: object) => [...modelKeys.all, 'list', filters] as const,
  benchmarks: () => [...modelKeys.all, 'benchmarks'] as const,
  stats: () => [...modelKeys.all, 'stats'] as const
};

export const modelsQueryOptions = (
  filters: {
    search?: string;
    vendor?: string;
    is_open_source?: boolean;
  } = {}
) =>
  queryOptions({
    queryKey: modelKeys.list(filters),
    queryFn: () => getModels(filters),
    staleTime: 5 * 60 * 1000
  });

export const benchmarksQueryOptions = () =>
  queryOptions({
    queryKey: modelKeys.benchmarks(),
    queryFn: () => getBenchmarks(),
    staleTime: 5 * 60 * 1000
  });

export const modelStatsOptions = () =>
  queryOptions({
    queryKey: modelKeys.stats(),
    queryFn: () => getModelStats(),
    staleTime: 5 * 60 * 1000
  });
