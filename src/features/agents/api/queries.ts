import { queryOptions } from '@tanstack/react-query';
import { getAgents, getFeaturedAgents, getAgentStats } from './service';
import type { AgentFilters } from './types';

export const agentKeys = {
  all: ['agents'] as const,
  list: (filters: AgentFilters) => [...agentKeys.all, 'list', filters] as const,
  detail: (id: number) => [...agentKeys.all, 'detail', id] as const,
  featured: () => [...agentKeys.all, 'featured'] as const,
  stats: () => [...agentKeys.all, 'stats'] as const
};

export const agentsQueryOptions = (filters: AgentFilters) =>
  queryOptions({
    queryKey: agentKeys.list(filters),
    queryFn: () => getAgents(filters),
    staleTime: 30 * 1000
  });

export const featuredAgentsOptions = () =>
  queryOptions({
    queryKey: agentKeys.featured(),
    queryFn: () => getFeaturedAgents(),
    staleTime: 60 * 1000
  });

export const agentStatsOptions = () =>
  queryOptions({
    queryKey: agentKeys.stats(),
    queryFn: () => getAgentStats(),
    staleTime: 30 * 1000
  });
