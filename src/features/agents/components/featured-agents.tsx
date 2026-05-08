'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { AgentCard, AgentCardSkeleton } from './agent-card';
import { featuredAgentsOptions } from '../api/queries';

export function FeaturedAgents() {
  const { data: featured } = useSuspenseQuery(featuredAgentsOptions());

  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-2'>
        <Icons.sparkles className='h-4 w-4 text-amber-500' />
        <h2 className='text-sm font-semibold'>精选 Agents</h2>
        <Badge variant='secondary' className='text-[10px]'>
          {featured.length}
        </Badge>
      </div>
      <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
        {featured.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>
    </div>
  );
}

export function FeaturedAgentsSkeleton() {
  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-2'>
        <div className='h-4 w-4 animate-pulse rounded bg-muted' />
        <div className='h-4 w-24 animate-pulse rounded bg-muted' />
      </div>
      <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <AgentCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
