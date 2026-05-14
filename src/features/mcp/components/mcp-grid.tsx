'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import Link from 'next/link';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { mcpQueryOptions } from '../api/queries';
import type { McpServer, McpCategory } from '../api/service';

const PAGE_SIZE = 24;

const CATEGORY_CONFIG: Record<
  McpCategory,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string }
> = {
  utility: {
    label: '通用工具',
    icon: Icons.settings,
    color: 'text-sky-600 dark:text-sky-400',
    bg: 'bg-sky-500/10'
  },
  devtools: {
    label: '开发工具',
    icon: Icons.github,
    color: 'text-slate-600 dark:text-slate-400',
    bg: 'bg-slate-500/10'
  },
  productivity: {
    label: '效率工具',
    icon: Icons.checks,
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-500/10'
  },
  data: {
    label: '数据处理',
    icon: Icons.trendingUp,
    color: 'text-cyan-600 dark:text-cyan-400',
    bg: 'bg-cyan-500/10'
  },
  database: {
    label: '数据库',
    icon: Icons.page,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10'
  },
  cloud: {
    label: '云服务',
    icon: Icons.laptop,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-500/10'
  },
  automation: {
    label: '自动化',
    icon: Icons.sparkles,
    color: 'text-indigo-600 dark:text-indigo-400',
    bg: 'bg-indigo-500/10'
  },
  browser: {
    label: '浏览器',
    icon: Icons.laptop,
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-500/10'
  },
  monitoring: {
    label: '监控运维',
    icon: Icons.trendingUp,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-500/10'
  },
  location: {
    label: '地理位置',
    icon: Icons.search,
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-500/10'
  },
  filesystem: {
    label: '文件系统',
    icon: Icons.page,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-500/10'
  },
  search: {
    label: '搜索',
    icon: Icons.search,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10'
  },
  ai: {
    label: 'AI 模型',
    icon: Icons.sparkles,
    color: 'text-pink-600 dark:text-pink-400',
    bg: 'bg-pink-500/10'
  },
  knowledge: {
    label: '知识管理',
    icon: Icons.post,
    color: 'text-teal-600 dark:text-teal-400',
    bg: 'bg-teal-500/10'
  },
  finance: {
    label: '金融',
    icon: Icons.trendingUp,
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-500/10'
  },
  memory: {
    label: '记忆存储',
    icon: Icons.settings,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-500/10'
  },
  reasoning: {
    label: '推理',
    icon: Icons.sparkles,
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-500/10'
  }
};

const CATEGORY_FALLBACK = {
  label: '其他',
  icon: Icons.settings,
  color: 'text-muted-foreground',
  bg: 'bg-muted/30'
};

function McpCard({ server }: { server: McpServer }) {
  const cfg = CATEGORY_CONFIG[server.category] ?? CATEGORY_FALLBACK;
  const CatIcon = cfg.icon;

  return (
    <Link
      href={`/mcp/${server.slug ?? server.id}`}
      className='group relative flex flex-col rounded-xl border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md'
    >
      {server.is_featured && (
        <div className='absolute -top-2 right-3'>
          <span className='inline-flex items-center gap-0.5 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground'>
            <Icons.sparkles className='h-2.5 w-2.5' />
            推荐
          </span>
        </div>
      )}
      <div className='mb-3 flex items-center gap-2.5'>
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cfg.bg}`}>
          <CatIcon className={`h-4 w-4 ${cfg.color}`} />
        </div>
        <div className='min-w-0'>
          <div className='flex items-center gap-1.5'>
            <span className='truncate font-mono text-sm font-semibold'>{server.name}</span>
            {server.is_official && (
              <Badge
                variant='outline'
                className='shrink-0 border-blue-500/30 px-1 py-0 text-[9px] text-blue-600'
              >
                官方
              </Badge>
            )}
          </div>
          <Badge variant='outline' className={cn('mt-0.5 text-[10px] font-normal', cfg.color)}>
            {cfg.label}
          </Badge>
        </div>
      </div>
      <p className='mb-3 flex-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground'>
        {server.description}
      </p>
      {server.install_cmd && (
        <code className='mb-3 block truncate rounded-md bg-muted px-2 py-1.5 text-[10px] font-mono text-foreground/80'>
          {server.install_cmd}
        </code>
      )}
      <div className='flex items-center justify-between'>
        <div className='flex flex-wrap gap-1'>
          {server.tags.slice(0, 2).map((t) => (
            <span
              key={t}
              className='rounded border bg-muted/50 px-1.5 py-0.5 text-[10px] text-muted-foreground'
            >
              {t}
            </span>
          ))}
        </div>
        {server.stars !== undefined && server.stars > 0 && (
          <span className='flex items-center gap-1 text-[11px] text-muted-foreground'>
            <Icons.exclusive className='h-3 w-3' />
            {server.stars >= 1000 ? `${(server.stars / 1000).toFixed(1)}k` : server.stars}
          </span>
        )}
      </div>
    </Link>
  );
}

export function McpCardSkeleton() {
  return (
    <div className='flex flex-col rounded-xl border bg-card p-4 shadow-sm'>
      <div className='mb-3 flex items-center gap-2.5'>
        <div className='h-8 w-8 animate-pulse rounded-lg bg-muted' />
        <div className='flex-1 space-y-1'>
          <div className='h-4 w-3/4 animate-pulse rounded bg-muted' />
          <div className='h-3 w-1/3 animate-pulse rounded bg-muted' />
        </div>
      </div>
      <div className='mb-3 space-y-1.5'>
        <div className='h-3 w-full animate-pulse rounded bg-muted' />
        <div className='h-3 w-5/6 animate-pulse rounded bg-muted' />
      </div>
      <div className='mb-3 h-6 w-full animate-pulse rounded bg-muted' />
      <div className='flex gap-1'>
        <div className='h-4 w-12 animate-pulse rounded bg-muted' />
        <div className='h-4 w-12 animate-pulse rounded bg-muted' />
      </div>
    </div>
  );
}

export function McpGrid() {
  const [params, setParams] = useQueryStates(
    {
      mcp_page: parseAsInteger.withDefault(1),
      mcp_search: parseAsString.withDefault(''),
      mcp_cat: parseAsString.withDefault('all')
    },
    { shallow: true }
  );

  const filters = {
    page: params.mcp_page,
    limit: PAGE_SIZE,
    ...(params.mcp_search && { search: params.mcp_search }),
    ...(params.mcp_cat !== 'all' && { category: params.mcp_cat })
  };

  const { data } = useSuspenseQuery(mcpQueryOptions(filters));
  const totalPages = Math.ceil(data.total_items / PAGE_SIZE);
  const hasFilter = params.mcp_search !== '' || params.mcp_cat !== 'all';

  if (data.items.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 text-center'>
        <div className='mb-3 flex h-12 w-12 items-center justify-center rounded-xl border bg-muted/50'>
          <Icons.search className='h-5 w-5 text-muted-foreground' />
        </div>
        <p className='text-sm font-medium'>未找到相关 MCP Server</p>
        <p className='mt-1 text-xs text-muted-foreground'>尝试调整搜索词或分类筛选</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <p className='text-xs text-muted-foreground'>
        共 <span className='font-medium text-foreground'>{data.total_items}</span> 个 MCP Server
        {hasFilter && <span>（已过滤）</span>}
      </p>

      <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
        {data.items.map((server) => (
          <McpCard key={server.id} server={server} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className='flex items-center justify-center gap-1 pt-2'>
          <Button
            variant='outline'
            size='sm'
            className='h-7 w-7 p-0'
            disabled={params.mcp_page <= 1}
            onClick={() => setParams({ ...params, mcp_page: params.mcp_page - 1 })}
          >
            <Icons.chevronLeft className='h-3.5 w-3.5' />
          </Button>
          {(() => {
            const current = params.mcp_page;
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
                  onClick={() => setParams({ ...params, mcp_page: page })}
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
            disabled={params.mcp_page >= totalPages}
            onClick={() => setParams({ ...params, mcp_page: params.mcp_page + 1 })}
          >
            <Icons.chevronRight className='h-3.5 w-3.5' />
          </Button>
        </div>
      )}
    </div>
  );
}

export function McpGridSkeleton() {
  return (
    <div className='space-y-4'>
      <div className='h-4 w-24 animate-pulse rounded bg-muted' />
      <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
        {Array.from({ length: 12 }).map((_, i) => (
          <McpCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
