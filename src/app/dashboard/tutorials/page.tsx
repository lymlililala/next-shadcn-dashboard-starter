import PageContainer from '@/components/layout/page-container';
import { getTutorials, getFeaturedTutorials } from '@/features/tutorials/api/service';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import type { Tutorial, TutorialLevel, TutorialCategory } from '@/features/tutorials/api/service';
import type { SearchParams } from 'nuqs/server';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const { resolvePageMeta } = await import('@/features/seo/api/service');
  const meta = await resolvePageMeta('/dashboard/tutorials');
  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    alternates: { canonical: meta.canonical },
    openGraph: meta.openGraph,
    twitter: meta.twitter
  };
}

const LEVEL_CONFIG: Record<TutorialLevel, { label: string; color: string }> = {
  beginner: { label: '入门', color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' },
  intermediate: { label: '进阶', color: 'text-blue-600 bg-blue-500/10 border-blue-500/20' },
  advanced: { label: '高级', color: 'text-violet-600 bg-violet-500/10 border-violet-500/20' }
};

const CATEGORY_CONFIG: Record<TutorialCategory, { label: string }> = {
  concept: { label: '概念理解' },
  'hands-on': { label: '实操教程' },
  mcp: { label: 'MCP' },
  agent: { label: 'Agent' },
  workflow: { label: '工作流' }
};

function TutorialCard({ tutorial }: { tutorial: Tutorial }) {
  const level = LEVEL_CONFIG[tutorial.level];
  const cat = CATEGORY_CONFIG[tutorial.category];
  return (
    <Link
      href={`/dashboard/tutorials/${tutorial.slug}`}
      className='group flex flex-col gap-3 rounded-xl border bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30'
    >
      <div className='flex items-center justify-between gap-2'>
        <Badge variant='outline' className={`text-[10px] ${level.color}`}>
          {level.label}
        </Badge>
        <span className='text-[10px] text-muted-foreground'>{cat.label}</span>
      </div>
      <div>
        <h3 className='text-sm font-semibold group-hover:text-primary transition-colors leading-snug'>
          {tutorial.title}
        </h3>
        <p className='mt-0.5 text-xs text-muted-foreground'>{tutorial.subtitle}</p>
      </div>
      <p className='flex-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground'>
        {tutorial.summary}
      </p>
      <div className='flex items-center justify-between'>
        <div className='flex flex-wrap gap-1'>
          {tutorial.tags.slice(0, 2).map((t) => (
            <span
              key={t}
              className='rounded border bg-muted/50 px-1.5 py-0.5 text-[10px] text-muted-foreground'
            >
              {t}
            </span>
          ))}
        </div>
        <span className='flex items-center gap-1 text-[11px] text-muted-foreground'>
          <Icons.clock className='h-3 w-3' />
          {tutorial.estimated_minutes}分钟
        </span>
      </div>
    </Link>
  );
}

type PageProps = { searchParams: Promise<SearchParams> };

export default async function TutorialsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const level = typeof params.level === 'string' ? params.level : 'all';
  const category = typeof params.tut_cat === 'string' ? params.tut_cat : 'all';

  const [all, featured] = await Promise.all([
    getTutorials({
      level: level !== 'all' ? level : undefined,
      category: category !== 'all' ? category : undefined
    }),
    getFeaturedTutorials()
  ]);

  return (
    <PageContainer
      pageTitle='教程中心'
      pageDescription='AI Agent 从入门到实战：概念理解、MCP 使用、平台实操、工作流自动化'
    >
      <div className='space-y-8'>
        {/* Quick stats */}
        <div className='grid grid-cols-3 gap-3'>
          {[
            { label: '教程总数', value: all.length, icon: Icons.post },
            {
              label: '入门教程',
              value: all.filter((t) => t.level === 'beginner').length,
              icon: Icons.info
            },
            {
              label: '实操教程',
              value: all.filter((t) => t.category === 'hands-on').length,
              icon: Icons.settings
            }
          ].map((s) => (
            <div
              key={s.label}
              className='flex items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm'
            >
              <s.icon className='h-5 w-5 text-muted-foreground' />
              <div>
                <p className='text-xl font-bold'>{s.value}</p>
                <p className='text-xs text-muted-foreground'>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Featured */}
        {featured.length > 0 && level === 'all' && category === 'all' && (
          <section>
            <div className='mb-3 flex items-center gap-2'>
              <Icons.sparkles className='h-4 w-4 text-amber-500' />
              <h2 className='text-sm font-semibold'>推荐阅读</h2>
            </div>
            <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
              {featured.map((t) => (
                <TutorialCard key={t.id} tutorial={t} />
              ))}
            </div>
          </section>
        )}

        {/* Filters */}
        <div className='flex flex-wrap items-center gap-3'>
          <div className='flex gap-1.5'>
            {[
              { v: 'all', l: '全部级别' },
              { v: 'beginner', l: '入门' },
              { v: 'intermediate', l: '进阶' },
              { v: 'advanced', l: '高级' }
            ].map((tab) => (
              <Link
                key={tab.v}
                href={`/dashboard/tutorials?level=${tab.v}${category !== 'all' ? `&tut_cat=${category}` : ''}`}
              >
                <button
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${level === tab.v ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground hover:bg-accent'}`}
                >
                  {tab.l}
                </button>
              </Link>
            ))}
          </div>
          <div className='flex gap-1.5'>
            {[
              { v: 'all', l: '全部类型' },
              ...Object.entries(CATEGORY_CONFIG).map(([v, c]) => ({ v, l: c.label }))
            ].map((tab) => (
              <Link
                key={tab.v}
                href={`/dashboard/tutorials?tut_cat=${tab.v}${level !== 'all' ? `&level=${level}` : ''}`}
              >
                <button
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${category === tab.v ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground hover:bg-accent'}`}
                >
                  {tab.l}
                </button>
              </Link>
            ))}
          </div>
        </div>

        {/* Full list */}
        {all.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-16 text-center'>
            <Icons.post className='mb-3 h-10 w-10 text-muted-foreground/40' />
            <p className='text-sm text-muted-foreground'>暂无相关教程</p>
          </div>
        ) : (
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {all.map((t) => (
              <TutorialCard key={t.id} tutorial={t} />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
