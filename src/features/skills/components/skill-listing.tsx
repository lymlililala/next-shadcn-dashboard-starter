import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getQueryClient } from '@/lib/query-client';
import { searchParamsCache } from '@/lib/searchparams';
import {
  sitesQueryOptions,
  featuredSitesOptions,
  siteStatsOptions,
  skillToolsQueryOptions,
  skillToolStatsOptions
} from '../api/queries';
import { SkillStats, SkillStatsSkeleton } from './skill-stats';
import { SkillTabContent } from './skill-tab-content';

export default function SkillListingPage() {
  // 网站导航参数
  const page = searchParamsCache.get('page') ?? 1;
  const search = searchParamsCache.get('search') ?? '';
  const region = searchParamsCache.get('region') ?? 'all';
  const platform = searchParamsCache.get('platform') ?? 'all';

  // Skill 工具参数（服务端预取用）
  const toolPage = searchParamsCache.get('skill_tool_page') ?? 1;
  const toolSearch = searchParamsCache.get('skill_tool_search') ?? '';
  const toolCat = searchParamsCache.get('skill_tool_cat') ?? 'all';

  const siteFilters = {
    page,
    limit: 12,
    status: 'published',
    ...(search && { search }),
    ...(region !== 'all' && { region }),
    ...(platform !== 'all' && { platform })
  };

  const toolFilters = {
    page: toolPage,
    limit: 24,
    status: 'published',
    ...(toolSearch && { search: toolSearch }),
    ...(toolCat !== 'all' && { category: toolCat })
  };

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(sitesQueryOptions(siteFilters));
  void queryClient.prefetchQuery(featuredSitesOptions());
  void queryClient.prefetchQuery(siteStatsOptions());
  void queryClient.prefetchQuery(skillToolsQueryOptions(toolFilters));
  void queryClient.prefetchQuery(skillToolStatsOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className='space-y-6'>
        {/* Stats Row */}
        <Suspense fallback={<SkillStatsSkeleton />}>
          <SkillStats />
        </Suspense>

        {/* Tab 切换 + 内容（紧接统计数据，客户端组件响应 nuqs shallow 状态变化）*/}
        <SkillTabContent />
      </div>
    </HydrationBoundary>
  );
}
