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
import { FeaturedSkills, FeaturedSkillsSkeleton } from './featured-skills';
import { SkillFilters } from './skill-filters';
import { SkillGrid, SkillGridSkeleton } from './skill-grid';
import { SkillToolFilters } from './skill-tool-filters';
import { SkillToolGrid, SkillToolGridSkeleton } from './skill-tool-grid';
import { SkillTabSwitcher } from './skill-tab-switcher';

export default function SkillListingPage() {
  // 网站导航参数
  const page = searchParamsCache.get('page') ?? 1;
  const search = searchParamsCache.get('search') ?? '';
  const region = searchParamsCache.get('region') ?? 'all';
  const platform = searchParamsCache.get('platform') ?? 'all';

  // Skill 工具参数
  const skillTab = searchParamsCache.get('skill_tab') ?? 'sites';
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

        {/* Featured Sites */}
        <Suspense fallback={<FeaturedSkillsSkeleton />}>
          <FeaturedSkills />
        </Suspense>

        {/* Tab Switcher */}
        <SkillTabSwitcher />

        {skillTab === 'tools' ? (
          <>
            {/* Tool Filters */}
            <SkillToolFilters />

            {/* Tools Grid */}
            <Suspense fallback={<SkillToolGridSkeleton />}>
              <SkillToolGrid />
            </Suspense>
          </>
        ) : (
          <>
            {/* Divider */}
            <div className='flex items-center gap-3'>
              <div className='h-px flex-1 bg-border' />
              <span className='text-xs font-medium text-muted-foreground'>全部收录站点</span>
              <div className='h-px flex-1 bg-border' />
            </div>

            {/* Site Filters */}
            <SkillFilters />

            {/* Sites Grid */}
            <Suspense fallback={<SkillGridSkeleton />}>
              <SkillGrid />
            </Suspense>
          </>
        )}
      </div>
    </HydrationBoundary>
  );
}
