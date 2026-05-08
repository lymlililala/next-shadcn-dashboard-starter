import PageContainer from '@/components/layout/page-container';
import AgentListingPage from '@/features/agents/components/agent-listing';
import { searchParamsCache } from '@/lib/searchparams';
import type { SearchParams } from 'nuqs/server';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const { resolvePageMeta } = await import('@/features/seo/api/service');
  const meta = await resolvePageMeta('/dashboard/agents');
  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    alternates: { canonical: 'https://www.aiskillnav.com/agents' },
    openGraph: meta.openGraph,
    twitter: meta.twitter
  };
}

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function AgentsPage(props: PageProps) {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  return (
    <PageContainer
      pageTitle='Agent Hub'
      pageDescription='汇聚全球优秀 AI Agent — 通用自主、深度研究、构建平台、电脑操控、垂直创意、主动感知'
    >
      <AgentListingPage />
    </PageContainer>
  );
}
