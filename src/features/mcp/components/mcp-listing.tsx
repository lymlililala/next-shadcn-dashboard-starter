import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import Link from 'next/link';
import { getQueryClient } from '@/lib/query-client';
import { searchParamsCache } from '@/lib/searchparams';
import { Icons } from '@/components/icons';
import { mcpQueryOptions, mcpStatsOptions } from '../api/queries';
import { McpStats, McpStatsSkeleton } from './mcp-stats';
import { McpFilters } from './mcp-filters';
import { McpGrid, McpGridSkeleton } from './mcp-grid';

export default function McpListingPage() {
  const page = searchParamsCache.get('mcp_page') ?? 1;
  const search = searchParamsCache.get('mcp_search') ?? '';
  const category = searchParamsCache.get('mcp_cat') ?? 'all';

  const filters = {
    page,
    limit: 24,
    ...(search && { search }),
    ...(category !== 'all' && { category })
  };

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(mcpQueryOptions(filters));
  void queryClient.prefetchQuery(mcpStatsOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className='space-y-6'>
        <Suspense fallback={<McpStatsSkeleton />}>
          <McpStats />
        </Suspense>

        {/* What is MCP */}
        <div className='rounded-xl border bg-gradient-to-r from-primary/5 to-transparent p-5'>
          <div className='flex items-start gap-3'>
            <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10'>
              <Icons.info className='h-4 w-4 text-primary' />
            </div>
            <div>
              <h2 className='text-sm font-semibold'>什么是 MCP？</h2>
              <p className='mt-1 text-xs leading-relaxed text-muted-foreground'>
                MCP（Model Context Protocol）是 Anthropic 发布的开放协议，让 AI
                模型能安全、标准化地连接外部工具。
                <br />
                <strong className='text-foreground'>类比：MCP 是 AI Agent 的 USB 接口</strong> —
                一次实现，到处可用。
              </p>
              <Link
                href='/tutorials/what-is-mcp'
                className='mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline'
              >
                了解更多 <Icons.chevronRight className='h-3 w-3' />
              </Link>
            </div>
          </div>
        </div>

        <div className='flex items-center gap-3'>
          <div className='h-px flex-1 bg-border' />
          <span className='text-xs font-medium text-muted-foreground'>全部收录 MCP Server</span>
          <div className='h-px flex-1 bg-border' />
        </div>

        <McpFilters />

        <Suspense fallback={<McpGridSkeleton />}>
          <McpGrid />
        </Suspense>
      </div>
    </HydrationBoundary>
  );
}
