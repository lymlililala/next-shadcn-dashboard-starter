import PageContainer from '@/components/layout/page-container';
import SkillListingPage from '@/features/skills/components/skill-listing';
import { searchParamsCache } from '@/lib/searchparams';
import type { SearchParams } from 'nuqs/server';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const { resolvePageMeta } = await import('@/features/seo/api/service');
  const meta = await resolvePageMeta('/dashboard/skills');
  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    alternates: { canonical: 'https://www.aiskillnav.com/skills' },
    openGraph: meta.openGraph,
    twitter: meta.twitter
  };
}

type PageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function SkillsPage(props: PageProps) {
  const searchParams = await props.searchParams;
  searchParamsCache.parse(searchParams);

  return (
    <PageContainer
      pageTitle='AI Skill Navigation'
      pageDescription='汇聚 AI Skills & Agent 资源，发现、收藏并使用社区精选工具'
    >
      <SkillListingPage />
    </PageContainer>
  );
}
