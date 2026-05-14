import PageContainer from '@/components/layout/page-container';
import { searchParamsCache } from '@/lib/searchparams';
import McpListingPage from '@/features/mcp/components/mcp-listing';
import type { SearchParams } from 'nuqs/server';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const { resolvePageMeta } = await import('@/features/seo/api/service');
  const meta = await resolvePageMeta('/dashboard/mcp');
  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    alternates: { canonical: 'https://aiskillnav.com/mcp' },
    openGraph: meta.openGraph,
    twitter: meta.twitter
  };
}

type PageProps = { searchParams: Promise<SearchParams> };

export default async function McpPage({ searchParams }: PageProps) {
  await searchParamsCache.parse(searchParams);

  return (
    <PageContainer
      pageTitle='MCP 专区'
      pageDescription='Model Context Protocol — AI Agent 的标准化工具接口，收录最实用的 MCP Server'
    >
      <McpListingPage />
    </PageContainer>
  );
}
