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

const PAGE_SIZE = 24;

/**
 * agent_source → 后端 url_group 过滤
 * 'app'    → url_group=1（应用产品，非 GitHub 非内测）
 * 'github' → url_group=2（开源项目，GitHub）
 * 'all'    → 不过滤
 */
function sourceToUrlGroup(source: string): string | undefined {
  if (source === 'app') return '1';
  if (source === 'github') return '2';
  return undefined;
}

export function AgentGrid() {
  const [params, setParams] = useQueryStates(
    {
      agent_page: parseAsInteger.withDefault(1),
      agent_search: parseAsString.withDefault(''),
      agent_type: parseAsString.withDefault('all'),
      agent_source: parseAsString.withDefault('all')
    },
    { shallow: true }
  );

  const filters = {
    page: params.agent_page,
    limit: PAGE_SIZE,
    status: 'published',
    ...(params.agent_search && { search: params.agent_search }),
    ...(params.agent_type !== 'all' && { agent_type: params.agent_type }),
    ...(params.agent_source !== 'all' && { url_group: sourceToUrlGroup(params.agent_source) })
  };

  const { data } = useSuspenseQuery(agentsQueryOptions(filters));
  const totalPages = Math.ceil(data.total_items / PAGE_SIZE);

  // 数据加载后批量预热当前页所有外链域名
  useEffect(() => {
    batchPrefetch(data.items.map((a) => a.url));
  }, [data.items]);

  const visibleItems = data.items;

  const hasFilter =
    params.agent_type !== 'all' || params.agent_source !== 'all' || params.agent_search !== '';

  if (visibleItems.length === 0) {
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
        {hasFilter && <span>（已过滤）</span>}
      </p>

      {/* 混合展示，所有卡片在同一个 grid 连续排列，无分组截断 */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {visibleItems.map((agent) => (
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
          {(() => {
            const current = params.agent_page;
            const visible = new Set(
              [1, totalPages, current, current - 1, current + 1].filter(
                (p) => p >= 1 && p <= totalPages
              )
            );
            const pages = Array.from(visible).sort((a, b) => a - b);
            const items: React.ReactNode[] = [];
            for (let i = 0; i < pages.length; i++) {
              if (i > 0 && pages[i] - pages[i - 1] > 1) {
                items.push(
                  <span key={`ellipsis-${i}`} className='px-1 text-xs text-muted-foreground'>
                    …
                  </span>
                );
              }
              const page = pages[i];
              items.push(
                <Button
                  key={page}
                  variant={current === page ? 'default' : 'outline'}
                  size='sm'
                  className='h-7 w-7 p-0 text-xs'
                  onClick={() => setParams({ ...params, agent_page: page })}
                >
                  {page}
                </Button>
              );
            }
            return items;
          })()}
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
