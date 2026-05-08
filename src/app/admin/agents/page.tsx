import { Suspense } from 'react';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import PageContainer from '@/components/layout/page-container';
import { getQueryClient } from '@/lib/query-client';
import { agentsQueryOptions } from '@/features/agents/api/queries';
import { AgentAdminTable } from '@/features/agents/components/admin/agent-admin-table';
import { DataTableSkeleton } from '@/components/ui/table/data-table-skeleton';
import type { SearchParams } from 'nuqs/server';
import { searchParamsCache } from '@/lib/searchparams';

export const metadata = {
  title: 'Agent 管理 | AI Skill Navigation 管理后台'
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function AdminAgentsPage(props: PageProps) {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(agentsQueryOptions({ page: 1, limit: 10 }));

  return (
    <PageContainer
      pageTitle='Agent 管理'
      pageDescription='管理 AI Agent Hub 收录的所有 Agent 条目，支持增删改查和审核'
    >
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<DataTableSkeleton columnCount={7} rowCount={10} />}>
          <AgentAdminTable />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
