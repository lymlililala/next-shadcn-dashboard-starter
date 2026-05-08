import PageContainer from '@/components/layout/page-container';
import { getUseCases, getFeaturedUseCases, getUseCaseStats } from '@/features/usecases/api/service';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import type { UseCase, UseCaseIndustry } from '@/features/usecases/api/service';
import type { SearchParams } from 'nuqs/server';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const { resolvePageMeta } = await import('@/features/seo/api/service');
  const meta = await resolvePageMeta('/dashboard/usecases');
  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    alternates: { canonical: 'https://www.aiskillnav.com/usecases' },
    openGraph: meta.openGraph,
    twitter: meta.twitter
  };
}

const INDUSTRY_CONFIG: Record<
  UseCaseIndustry,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string }
> = {
  marketing: {
    label: '营销',
    icon: Icons.trendingUp,
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-500/10'
  },
  engineering: {
    label: '编程',
    icon: Icons.settings,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-500/10'
  },
  research: {
    label: '研究',
    icon: Icons.search,
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-500/10'
  },
  productivity: {
    label: '效率',
    icon: Icons.checks,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10'
  },
  industry: {
    label: '垂直行业',
    icon: Icons.briefcase,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10'
  }
};

const DIFFICULTY_CONFIG: Record<number, { stars: string; label: string; color: string }> = {
  1: {
    stars: '⭐',
    label: '简单',
    color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20'
  },
  2: { stars: '⭐⭐', label: '中等', color: 'text-amber-600 bg-amber-500/10 border-amber-500/20' },
  3: { stars: '⭐⭐⭐', label: '复杂', color: 'text-rose-600 bg-rose-500/10 border-rose-500/20' }
};

function UseCaseCard({ uc }: { uc: UseCase }) {
  const ind = INDUSTRY_CONFIG[uc.industry];
  const diff = DIFFICULTY_CONFIG[uc.difficulty];
  const IndIcon = ind.icon;
  return (
    <div className='flex flex-col rounded-xl border bg-card p-5 shadow-sm'>
      <div className='mb-3 flex items-start justify-between gap-2'>
        <div className='flex items-center gap-2'>
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${ind.bg}`}>
            <IndIcon className={`h-4 w-4 ${ind.color}`} />
          </div>
          <Badge variant='outline' className={`text-[10px] ${diff.color}`}>
            {diff.stars}
          </Badge>
        </div>
        <span className='text-[10px] text-muted-foreground shrink-0'>{uc.estimated_time}</span>
      </div>

      <h3 className='mb-2 text-sm font-semibold leading-snug'>{uc.title}</h3>
      <p className='mb-3 flex-1 text-xs leading-relaxed text-muted-foreground line-clamp-3'>
        {uc.description}
      </p>

      {uc.steps.length > 0 && (
        <div className='mb-3 rounded-lg bg-muted/30 p-3'>
          <p className='mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground'>
            实现步骤
          </p>
          <ol className='space-y-1'>
            {uc.steps.slice(0, 3).map((step, i) => (
              <li key={i} className='flex items-start gap-1.5 text-[11px] text-muted-foreground'>
                <span className='shrink-0 font-mono text-primary'>{i + 1}.</span>
                <span className='line-clamp-1'>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className='mb-3'>
        <p className='mb-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wide'>
          推荐工具
        </p>
        <div className='flex flex-wrap gap-1'>
          {uc.tools.map((t) => (
            <span
              key={t}
              className='rounded border bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium'
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className='flex flex-wrap gap-1'>
        {uc.tags.slice(0, 3).map((t) => (
          <span
            key={t}
            className='rounded border bg-muted/30 px-1.5 py-0.5 text-[10px] text-muted-foreground'
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

type PageProps = { searchParams: Promise<SearchParams> };

export default async function UseCasesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const industry = typeof params.industry === 'string' ? params.industry : 'all';
  const difficulty = typeof params.diff === 'string' ? Number(params.diff) || 0 : 0;

  const [usecases, featured, stats] = await Promise.all([
    getUseCases({
      industry: industry !== 'all' ? industry : undefined,
      difficulty: difficulty || undefined
    }),
    getFeaturedUseCases(),
    getUseCaseStats()
  ]);

  return (
    <PageContainer
      pageTitle='场景库'
      pageDescription='AI Agent 真实落地场景，从营销到编程，从研究到效率工具，附推荐工具组合和实现步骤'
    >
      <div className='space-y-8'>
        {/* Industry stats */}
        <div className='grid grid-cols-2 gap-3 sm:grid-cols-5'>
          {Object.entries(INDUSTRY_CONFIG).map(([key, cfg]) => {
            const IndIcon = cfg.icon;
            const count = stats.byIndustry[key] ?? 0;
            return (
              <div
                key={key}
                className='flex flex-col items-center gap-2 rounded-xl border bg-card px-3 py-4 text-center shadow-sm'
              >
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${cfg.bg}`}>
                  <IndIcon className={`h-4 w-4 ${cfg.color}`} />
                </div>
                <div>
                  <p className='text-lg font-bold'>{count}</p>
                  <p className='text-[11px] text-muted-foreground'>{cfg.label}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Featured */}
        {featured.length > 0 && industry === 'all' && !difficulty && (
          <section>
            <div className='mb-3 flex items-center gap-2'>
              <Icons.sparkles className='h-4 w-4 text-amber-500' />
              <h2 className='text-sm font-semibold'>精选场景</h2>
            </div>
            <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              {featured.map((u) => (
                <UseCaseCard key={u.id} uc={u} />
              ))}
            </div>
          </section>
        )}

        {/* Filters */}
        <div className='flex flex-wrap items-center gap-3'>
          <div className='flex flex-wrap gap-1.5'>
            {[
              { v: 'all', l: '全部行业' },
              ...Object.entries(INDUSTRY_CONFIG).map(([v, c]) => ({ v, l: c.label }))
            ].map((tab) => (
              <a
                key={tab.v}
                href={`/usecases?industry=${tab.v}${difficulty ? `&diff=${difficulty}` : ''}`}
              >
                <button
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${industry === tab.v ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground hover:bg-accent'}`}
                >
                  {tab.l}
                </button>
              </a>
            ))}
          </div>
          <div className='flex gap-1.5'>
            {[
              { v: 0, l: '全部难度' },
              { v: 1, l: '⭐ 简单' },
              { v: 2, l: '⭐⭐ 中等' },
              { v: 3, l: '⭐⭐⭐ 复杂' }
            ].map((tab) => (
              <a
                key={tab.v}
                href={`/usecases?diff=${tab.v}${industry !== 'all' ? `&industry=${industry}` : ''}`}
              >
                <button
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${difficulty === tab.v ? 'bg-primary text-primary-foreground border-primary' : 'bg-background text-muted-foreground hover:bg-accent'}`}
                >
                  {tab.l}
                </button>
              </a>
            ))}
          </div>
        </div>

        {/* Grid */}
        {usecases.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-16'>
            <Icons.search className='mb-3 h-10 w-10 text-muted-foreground/40' />
            <p className='text-sm text-muted-foreground'>暂无相关场景</p>
          </div>
        ) : (
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {usecases.map((u) => (
              <UseCaseCard key={u.id} uc={u} />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
