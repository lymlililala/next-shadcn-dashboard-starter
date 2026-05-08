import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { Suspense } from 'react';
import { getQueryClient } from '@/lib/query-client';
import { searchParamsCache } from '@/lib/searchparams';
import { sitesQueryOptions, featuredSitesOptions, siteStatsOptions } from '../api/queries';
import { SkillStats, SkillStatsSkeleton } from './skill-stats';
import { FeaturedSkills, FeaturedSkillsSkeleton } from './featured-skills';
import { SkillFilters } from './skill-filters';
import { SkillGrid, SkillGridSkeleton } from './skill-grid';

export default function SkillListingPage() {
  const page = searchParamsCache.get('page') ?? 1;
  const search = searchParamsCache.get('search') ?? '';
  const region = searchParamsCache.get('region') ?? 'all';
  const platform = searchParamsCache.get('platform') ?? 'all';

  const filters = {
    page,
    limit: 12,
    status: 'published',
    ...(search && { search }),
    ...(region !== 'all' && { region }),
    ...(platform !== 'all' && { platform })
  };

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(sitesQueryOptions(filters));
  void queryClient.prefetchQuery(featuredSitesOptions());
  void queryClient.prefetchQuery(siteStatsOptions());

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

        {/* Divider */}
        <div className='flex items-center gap-3'>
          <div className='h-px flex-1 bg-border' />
          <span className='text-xs font-medium text-muted-foreground'>全部收录站点</span>
          <div className='h-px flex-1 bg-border' />
        </div>

        {/* Filters */}
        <SkillFilters />

        {/* Sites Grid */}
        <Suspense fallback={<SkillGridSkeleton />}>
          <SkillGrid />
        </Suspense>
      </div>
    </HydrationBoundary>
  );
}
