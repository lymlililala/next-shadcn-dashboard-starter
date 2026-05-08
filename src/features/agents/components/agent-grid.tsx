'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { agentsQueryOptions } from '../api/queries';
import { AgentCard, AgentCardSkeleton } from './agent-card';

const PAGE_SIZE = 12;

export function AgentGrid() {
  const [params, setParams] = useQueryStates(
    {
      agent_page: parseAsInteger.withDefault(1),
      agent_search: parseAsString.withDefault(''),
      agent_type: parseAsString.withDefault('all'),
      agent_open_source: parseAsString.withDefault('all')
    },
    { shallow: true }
  );

  const filters = {
    page: params.agent_page,
    limit: PAGE_SIZE,
    status: 'published',
    ...(params.agent_search && { search: params.agent_search }),
    ...(params.agent_type !== 'all' && { agent_type: params.agent_type }),
    ...(params.agent_open_source !== 'all' && { open_source: params.agent_open_source })
  };

  const { data } = useSuspenseQuery(agentsQueryOptions(filters));
  const totalPages = Math.ceil(data.total_items / PAGE_SIZE);

  if (data.items.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 text-center'>
        <div className='mb-3 flex h-12 w-12 items-center justify-center rounded-xl border bg-muted/50'>
          <Icons.search className='h-5 w-5 text-muted-foreground' />
        </div>
        <p className='text-sm font-medium'>未找到相关 Agent</p>
        <p className='mt-1 text-xs text-muted-foreground'>尝试调整搜索词或分类筛选</p>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <p className='text-xs text-muted-foreground'>
        共 <span className='font-medium text-foreground'>{data.total_items}</span> 个 Agent
        {(params.agent_type !== 'all' ||
          params.agent_open_source !== 'all' ||
          params.agent_search) && <span>（已过滤）</span>}
      </p>

      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {data.items.map((agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className='flex items-center justify-center gap-1 pt-2'>
          <Button
            variant='outline'
            size='sm'
            className='h-7 w-7 p-0'
            disabled={params.agent_page <= 1}
            onClick={() => setParams({ ...params, agent_page: params.agent_page - 1 })}
          >
            <Icons.chevronLeft className='h-3.5 w-3.5' />
          </Button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const page = i + 1;
            return (
              <Button
                key={page}
                variant={params.agent_page === page ? 'default' : 'outline'}
                size='sm'
                className='h-7 w-7 p-0 text-xs'
                onClick={() => setParams({ ...params, agent_page: page })}
              >
                {page}
              </Button>
            );
          })}
          {totalPages > 5 && <span className='px-1 text-xs text-muted-foreground'>...</span>}
          <Button
            variant='outline'
            size='sm'
            className='h-7 w-7 p-0'
            disabled={params.agent_page >= totalPages}
            onClick={() => setParams({ ...params, agent_page: params.agent_page + 1 })}
          >
            <Icons.chevronRight className='h-3.5 w-3.5' />
          </Button>
        </div>
      )}
    </div>
  );
}

export function AgentGridSkeleton() {
  return (
    <div className='space-y-4'>
      <div className='h-4 w-24 animate-pulse rounded bg-muted' />
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {Array.from({ length: 12 }).map((_, i) => (
          <AgentCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
