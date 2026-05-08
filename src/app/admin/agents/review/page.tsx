import { Suspense } from 'react';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import PageContainer from '@/components/layout/page-container';
import { getQueryClient } from '@/lib/query-client';
import { agentsQueryOptions } from '@/features/agents/api/queries';
import {
  AgentReviewList,
  AgentReviewSkeleton
} from '@/features/agents/components/admin/agent-review-list';

export const metadata = {
  title: 'Agent 审核 | AI Skill Navigation 管理后台'
};

export default async function AdminAgentsReviewPage() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(agentsQueryOptions({ status: 'pending', limit: 50 }));
  void queryClient.prefetchQuery(agentsQueryOptions({ status: 'rejected', limit: 50 }));

  return (
    <PageContainer
      pageTitle='Agent 审核'
      pageDescription='审核用户提交的 AI Agent，通过后将在 Agent Hub 公开展示'
    >
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<AgentReviewSkeleton />}>
          <AgentReviewList />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
