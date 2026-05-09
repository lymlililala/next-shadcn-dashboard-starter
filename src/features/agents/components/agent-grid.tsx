'use client';

import { useEffect } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { agentsQueryOptions } from '../api/queries';
import { AgentCard, AgentCardSkeleton } from './agent-card';

/** 批量 DNS prefetch 一组 URL 的域名 */
function batchPrefetch(urls: string[]) {
  const seen = new Set<string>();
  for (const url of urls) {
    if (url === '#') continue;
    try {
      const origin = new URL(url).origin;
      if (seen.has(origin)) continue;
      seen.add(origin);
      if (document.querySelector(`link[href="${origin}"][rel="preconnect"]`)) continue;
      const dns = document.createElement('link');
      dns.rel = 'dns-prefetch';
      dns.href = origin;
      document.head.appendChild(dns);
    } catch {
      // ignore
    }
  }
}

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

  // 数据加载后批量预热当前页所有外链域名
  useEffect(() => {
    batchPrefetch(data.items.map((a) => a.url));
  }, [data.items]);

  const appAgents = data.items.filter((a) => !a.url.includes('github.com') && a.url !== '#');
  const githubAgents = data.items.filter((a) => a.url.includes('github.com'));
  const innerAgents = data.items.filter((a) => a.url === '#');

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
    <div className='space-y-6'>
      <p className='text-xs text-muted-foreground'>
        共 <span className='font-medium text-foreground'>{data.total_items}</span> 个 Agent
        {(params.agent_type !== 'all' ||
          params.agent_open_source !== 'all' ||
          params.agent_search) && <span>（已过滤）</span>}
      </p>

      {/* 应用 */}
      {appAgents.length > 0 && (
        <div className='space-y-3'>
          <div className='flex items-center gap-2'>
            <Icons.trendingUp className='h-3.5 w-3.5 text-primary' />
            <span className='text-xs font-semibold text-foreground'>应用产品</span>
            <span className='rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary'>
              {appAgents.length}
            </span>
            <div className='h-px flex-1 bg-border' />
          </div>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {appAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>
      )}

      {/* GitHub 开源 */}
      {githubAgents.length > 0 && (
        <div className='space-y-3'>
          <div className='flex items-center gap-2'>
            <Icons.github className='h-3.5 w-3.5 text-muted-foreground' />
            <span className='text-xs font-semibold text-foreground'>开源项目</span>
            <span className='rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground'>
              {githubAgents.length}
            </span>
            <div className='h-px flex-1 bg-border' />
          </div>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {githubAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>
      )}

      {/* 内测中 */}
      {innerAgents.length > 0 && (
        <div className='space-y-3'>
          <div className='flex items-center gap-2'>
            <Icons.info className='h-3.5 w-3.5 text-muted-foreground/60' />
            <span className='text-xs font-semibold text-muted-foreground'>内测中</span>
            <span className='rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground'>
              {innerAgents.length}
            </span>
            <div className='h-px flex-1 bg-border' />
          </div>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {innerAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </div>
      )}

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
