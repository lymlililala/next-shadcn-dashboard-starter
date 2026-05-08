import { queryOptions } from '@tanstack/react-query';
import { getMcpServers, getFeaturedMcpServers, getMcpStats } from './service';

export const mcpKeys = {
  all: ['mcp'] as const,
  list: (filters: object) => [...mcpKeys.all, 'list', filters] as const,
  featured: () => [...mcpKeys.all, 'featured'] as const,
  stats: () => [...mcpKeys.all, 'stats'] as const
};

export const mcpQueryOptions = (filters: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  is_official?: boolean;
}) =>
  queryOptions({
    queryKey: mcpKeys.list(filters),
    queryFn: () => getMcpServers(filters),
    staleTime: 60 * 1000
  });

export const featuredMcpOptions = () =>
  queryOptions({
    queryKey: mcpKeys.featured(),
    queryFn: () => getFeaturedMcpServers(),
    staleTime: 60 * 1000
  });

export const mcpStatsOptions = () =>
  queryOptions({
    queryKey: mcpKeys.stats(),
    queryFn: () => getMcpStats(),
    staleTime: 60 * 1000
  });
