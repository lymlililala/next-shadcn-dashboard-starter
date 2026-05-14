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
 * 最后一张卡的 col-span 静态映射（key = `${total%2}_${total%3}`）
 * 让最后一行不留空白：余0铺满无需处理，余1孤儿撑满整行，余2(lg)最后一张占2列
 */
const LAST_CARD_SPAN: Record<string, string> = {
  '0_0': '', // sm余0 lg余0：两个断点都铺满
  '0_1': 'lg:col-span-3', // sm铺满，lg孤儿
  '0_2': 'lg:col-span-2', // sm铺满，lg最后行差1格
  '1_0': 'sm:col-span-2', // sm孤儿，lg铺满
  '1_1': 'sm:col-span-2 lg:col-span-3', // sm孤儿 + lg孤儿（如1张）
  '1_2': 'sm:col-span-2 lg:col-span-2' // sm孤儿 + lg最后行差1格（如5张）
};

function lastCardClass(total: number): string {
  return LAST_CARD_SPAN[`${total % 2}_${total % 3}`] ?? '';
}

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

  // 各分组真实总数（来自后端全量统计，不受分页影响）
  const groupCounts = data.group_counts;

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
              {groupCounts?.app ?? appAgents.length}
            </span>
            <div className='h-px flex-1 bg-border' />
          </div>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {appAgents.map((agent, i) => {
              const isLast = i === appAgents.length - 1;
              const spanClass = isLast ? lastCardClass(appAgents.length) : '';
              return (
                <div key={agent.id} className={spanClass}>
                  <AgentCard agent={agent} />
                </div>
              );
            })}
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
              {groupCounts?.github ?? githubAgents.length}
            </span>
            <div className='h-px flex-1 bg-border' />
          </div>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {githubAgents.map((agent, i) => {
              const isLast = i === githubAgents.length - 1;
              const spanClass = isLast ? lastCardClass(githubAgents.length) : '';
              return (
                <div key={agent.id} className={spanClass}>
                  <AgentCard agent={agent} />
                </div>
              );
            })}
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
              {groupCounts?.inner ?? innerAgents.length}
            </span>
            <div className='h-px flex-1 bg-border' />
          </div>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {innerAgents.map((agent, i) => {
              const isLast = i === innerAgents.length - 1;
              const spanClass = isLast ? lastCardClass(innerAgents.length) : '';
              return (
                <div key={agent.id} className={spanClass}>
                  <AgentCard agent={agent} />
                </div>
              );
            })}
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
          {(() => {
            const current = params.agent_page;
            // 计算需要显示的页码集合：第1页、最后1页、当前页及其前后1页
            const visible = new Set(
              [1, totalPages, current, current - 1, current + 1].filter(
                (p) => p >= 1 && p <= totalPages
              )
            );
            const pages = Array.from(visible).sort((a, b) => a - b);
            const items: React.ReactNode[] = [];
            for (let i = 0; i < pages.length; i++) {
              // 如果与上一个不连续，插入省略号
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
