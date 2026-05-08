import { Suspense } from 'react';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import PageContainer from '@/components/layout/page-container';
import { getQueryClient } from '@/lib/query-client';
import { searchParamsCache } from '@/lib/searchparams';
import { skillsQueryOptions } from '@/features/skills/api/queries';
import { SkillAdminTable } from '@/features/skills/components/admin/skill-admin-table';
import { SearchParams } from 'nuqs/server';

export const metadata = {
  title: 'Skill 管理 | AI Skill Navigation 管理后台'
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function AdminSkillsPage(props: PageProps) {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  const page = searchParamsCache.get('page') ?? 1;
  const perPage = searchParamsCache.get('perPage') ?? 10;
  const name = searchParamsCache.get('name');
  const category = searchParamsCache.get('category');
  const sort = searchParamsCache.get('sort');

  const filters = {
    page,
    limit: perPage,
    ...(name && { search: name }),
    ...(category && { category }),
    ...(sort && { sort })
  };

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(skillsQueryOptions(filters));

  return (
    <PageContainer
      pageTitle='Skill 管理'
      pageDescription='管理所有 Skills：新建、编辑、删除、修改状态'
    >
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<div className='h-64 animate-pulse rounded-xl bg-muted' />}>
          <SkillAdminTable />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
