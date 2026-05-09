'use client';

import { useEffect } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { sitesQueryOptions } from '../api/queries';
import { SkillCard, SkillCardSkeleton } from './skill-card';

function batchPrefetch(urls: string[]) {
  const seen = new Set<string>();
  for (const url of urls) {
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

export function SkillGrid() {
  const [params, setParams] = useQueryStates(
    {
      page: parseAsInteger.withDefault(1),
      search: parseAsString.withDefault(''),
      region: parseAsString.withDefault('all'),
      platform: parseAsString.withDefault('all')
    },
    { shallow: true }
  );

  const filters = {
    page: params.page,
    limit: PAGE_SIZE,
    status: 'published',
    ...(params.search && { search: params.search }),
    ...(params.region !== 'all' && { region: params.region }),
    ...(params.platform !== 'all' && { platform: params.platform })
  };

  const { data } = useSuspenseQuery(sitesQueryOptions(filters));

  const totalPages = Math.ceil(data.total_items / PAGE_SIZE);

  // 数据加载后批量预热当前页所有外链域名
  useEffect(() => {
    batchPrefetch(data.items.map((s) => s.url));
  }, [data.items]);

  const siteItems = data.items.filter((s) => s.platform !== 'github');
  const githubItems = data.items.filter((s) => s.platform === 'github');

  if (data.items.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 text-center'>
        <div className='mb-3 flex h-12 w-12 items-center justify-center rounded-xl border bg-muted/50'>
          <Icons.search className='h-5 w-5 text-muted-foreground' />
        </div>
        <p className='text-sm font-medium'>未找到相关站点</p>
        <p className='mt-1 text-xs text-muted-foreground'>尝试调整搜索词或筛选条件</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Results count */}
      <p className='text-xs text-muted-foreground'>
        共 <span className='font-medium text-foreground'>{data.total_items}</span> 个站点
        {(params.region !== 'all' || params.platform !== 'all' || params.search) && (
          <span>（已过滤）</span>
        )}
      </p>

      {/* 在线站点 */}
      {siteItems.length > 0 && (
        <div className='space-y-3'>
          <div className='flex items-center gap-2'>
            <Icons.trendingUp className='h-3.5 w-3.5 text-primary' />
            <span className='text-xs font-semibold text-foreground'>在线站点</span>
            <span className='rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary'>
              {siteItems.length}
            </span>
            <div className='h-px flex-1 bg-border' />
          </div>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {siteItems.map((site) => (
              <SkillCard key={site.id} site={site} />
            ))}
          </div>
        </div>
      )}

      {/* GitHub 开源 */}
      {githubItems.length > 0 && (
        <div className='space-y-3'>
          <div className='flex items-center gap-2'>
            <Icons.github className='h-3.5 w-3.5 text-muted-foreground' />
            <span className='text-xs font-semibold text-foreground'>开源项目</span>
            <span className='rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground'>
              {githubItems.length}
            </span>
            <div className='h-px flex-1 bg-border' />
          </div>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {githubItems.map((site) => (
              <SkillCard key={site.id} site={site} />
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex items-center justify-center gap-1 pt-2'>
          <Button
            variant='outline'
            size='sm'
            className='h-7 w-7 p-0'
            disabled={params.page <= 1}
            onClick={() => setParams({ ...params, page: params.page - 1 })}
          >
            <Icons.chevronLeft className='h-3.5 w-3.5' />
          </Button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
            const page = i + 1;
            return (
              <Button
                key={page}
                variant={params.page === page ? 'default' : 'outline'}
                size='sm'
                className='h-7 w-7 p-0 text-xs'
                onClick={() => setParams({ ...params, page })}
              >
                {page}
              </Button>
            );
          })}
          {totalPages > 5 && <span className='text-xs text-muted-foreground px-1'>...</span>}
          <Button
            variant='outline'
            size='sm'
            className='h-7 w-7 p-0'
            disabled={params.page >= totalPages}
            onClick={() => setParams({ ...params, page: params.page + 1 })}
          >
            <Icons.chevronRight className='h-3.5 w-3.5' />
          </Button>
        </div>
      )}
    </div>
  );
}

export function SkillGridSkeleton() {
  return (
    <div className='space-y-4'>
      <div className='h-4 w-24 animate-pulse rounded bg-muted' />
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {Array.from({ length: 12 }).map((_, i) => (
          <SkillCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
