import { Suspense } from 'react';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import PageContainer from '@/components/layout/page-container';
import { getQueryClient } from '@/lib/query-client';
import { skillStatsOptions } from '@/features/skills/api/queries';
import { agentStatsOptions } from '@/features/agents/api/queries';
import {
  SkillAnalytics,
  SkillAnalyticsSkeleton
} from '@/features/skills/components/admin/skill-analytics';
import {
  AgentAnalytics,
  AgentAnalyticsSkeleton
} from '@/features/agents/components/admin/agent-analytics';

export const metadata = {
  title: '数据统计 | AI Skill Navigation 管理后台'
};

export default async function AdminAnalyticsPage() {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(skillStatsOptions());
  void queryClient.prefetchQuery(agentStatsOptions());

  return (
    <PageContainer
      pageTitle='数据统计'
      pageDescription='AI Skill Navigation + Agent Hub 整体数据概览：发布量、分类分布、审核状态'
    >
      <HydrationBoundary state={dehydrate(queryClient)}>
        <div className='space-y-10'>
          {/* Skills 统计 */}
          <section>
            <div className='mb-4 flex items-center gap-2'>
              <div className='h-1 w-4 rounded-full bg-blue-500' />
              <h2 className='text-sm font-semibold text-muted-foreground tracking-wide uppercase'>
                Skills 资源站统计
              </h2>
            </div>
            <Suspense fallback={<SkillAnalyticsSkeleton />}>
              <SkillAnalytics />
            </Suspense>
          </section>

          <div className='border-t' />

          {/* Agent 统计 */}
          <section>
            <div className='mb-4 flex items-center gap-2'>
              <div className='h-1 w-4 rounded-full bg-violet-500' />
              <h2 className='text-sm font-semibold text-muted-foreground tracking-wide uppercase'>
                Agent Hub 统计
              </h2>
            </div>
            <Suspense fallback={<AgentAnalyticsSkeleton />}>
              <AgentAnalytics />
            </Suspense>
          </section>
        </div>
      </HydrationBoundary>
    </PageContainer>
  );
}
