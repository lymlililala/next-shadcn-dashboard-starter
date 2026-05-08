import { Suspense } from 'react';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import PageContainer from '@/components/layout/page-container';
import { getQueryClient } from '@/lib/query-client';
import { skillsQueryOptions } from '@/features/skills/api/queries';
import {
  SkillReviewList,
  SkillReviewSkeleton
} from '@/features/skills/components/admin/skill-review-list';

export const metadata = {
  title: '审核中心 | AI Skill Navigation 管理后台'
};

export default async function AdminReviewPage() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(skillsQueryOptions({ status: 'pending', limit: 50 }));
  void queryClient.prefetchQuery(skillsQueryOptions({ status: 'rejected', limit: 50 }));

  return (
    <PageContainer
      pageTitle='审核中心'
      pageDescription='审核用户提交的 Skill 链接，通过或拒绝并填写原因'
    >
      <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<SkillReviewSkeleton />}>
          <SkillReviewList />
        </Suspense>
      </HydrationBoundary>
    </PageContainer>
  );
}
