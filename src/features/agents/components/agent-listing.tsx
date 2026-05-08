import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getQueryClient } from '@/lib/query-client';
import { searchParamsCache } from '@/lib/searchparams';
import { agentsQueryOptions, featuredAgentsOptions, agentStatsOptions } from '../api/queries';
import { AgentStats, AgentStatsSkeleton } from './agent-stats';
import { FeaturedAgents, FeaturedAgentsSkeleton } from './featured-agents';
import { AgentFilters } from './agent-filters';
import { AgentGrid, AgentGridSkeleton } from './agent-grid';

export default function AgentListingPage() {
  const page = searchParamsCache.get('agent_page') ?? 1;
  const search = searchParamsCache.get('agent_search') ?? '';
  const agentType = searchParamsCache.get('agent_type') ?? 'all';
  const openSource = searchParamsCache.get('agent_open_source') ?? 'all';

  const filters = {
    page,
    limit: 12,
    status: 'published',
    ...(search && { search }),
    ...(agentType !== 'all' && { agent_type: agentType }),
    ...(openSource !== 'all' && { open_source: openSource })
  };

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(agentsQueryOptions(filters));
  void queryClient.prefetchQuery(featuredAgentsOptions());
  void queryClient.prefetchQuery(agentStatsOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className='space-y-6'>
        <Suspense fallback={<AgentStatsSkeleton />}>
          <AgentStats />
        </Suspense>

        <Suspense fallback={<FeaturedAgentsSkeleton />}>
          <FeaturedAgents />
        </Suspense>

        <div className='flex items-center gap-3'>
          <div className='h-px flex-1 bg-border' />
          <span className='text-xs font-medium text-muted-foreground'>全部收录 Agent</span>
          <div className='h-px flex-1 bg-border' />
        </div>

        <AgentFilters />

        <Suspense fallback={<AgentGridSkeleton />}>
          <AgentGrid />
        </Suspense>
      </div>
    </HydrationBoundary>
  );
}
