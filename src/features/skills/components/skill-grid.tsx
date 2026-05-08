'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { Icons } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { sitesQueryOptions } from '../api/queries';
import { SkillCard, SkillCardSkeleton } from './skill-card';

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
    <div className='space-y-4'>
      {/* Results count */}
      <div className='flex items-center justify-between'>
        <p className='text-xs text-muted-foreground'>
          共 <span className='font-medium text-foreground'>{data.total_items}</span> 个站点
          {(params.region !== 'all' || params.platform !== 'all' || params.search) && (
            <span>（已过滤）</span>
          )}
        </p>
      </div>

      {/* Grid */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        {data.items.map((site) => (
          <SkillCard key={site.id} site={site} />
        ))}
      </div>

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
