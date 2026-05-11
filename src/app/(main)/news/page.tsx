import type { Metadata } from 'next';
import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';
import {
  getPublishedNews,
  getFeaturedNews,
  getAllNewsCategories,
  getTimeline
} from '@/features/news/api/service';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import type { SearchParams } from 'nuqs/server';
import type { NewsCategory } from '@/constants/mock-api-news';

export async function generateMetadata(): Promise<Metadata> {
  const { resolvePageMeta } = await import('@/features/seo/api/service');
  const meta = await resolvePageMeta('/dashboard/news');
  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    alternates: { canonical: 'https://aiskillnav.com/news' },
    openGraph: meta.openGraph,
    twitter: meta.twitter
  };
}

const CATEGORY_CONFIG: Record<NewsCategory, { color: string; bg: string }> = {
  Agent: {
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-500/10 border-violet-500/20'
  },
  框架: { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
  模型: {
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20'
  },
  工具: {
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/20'
  },
  融资: { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
  研究: { color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-500/10 border-pink-500/20' }
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

type PageProps = { searchParams: Promise<SearchParams> };

export default async function NewsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const category = typeof params.category === 'string' ? params.category : undefined;
  const page = typeof params.page === 'string' ? Number(params.page) || 1 : 1;
  const limit = 9;

  const [{ items: news, total_items }, featured, categories] = await Promise.all([
    getPublishedNews({ page, limit, category }),
    getFeaturedNews(),
    getAllNewsCategories()
  ]);

  // 时间线固定，不受分页影响，始终按时间倒序排列
  const timeline = getTimeline().toSorted(
    (a, b) => new Date(b.date + '-01').getTime() - new Date(a.date + '-01').getTime()
  );

  const totalPages = Math.ceil(total_items / limit);

  return (
    <PageContainer
      pageTitle='AI Agent News'
      pageDescription='实时追踪 AI Agent 赛道的重大事件、融资动向、模型发布和技术突破'
    >
      <div className='space-y-10'>
        {/* Hero */}
        <div className='space-y-3'>
          <div className='flex items-center gap-2'>
            <Icons.trendingUp className='h-5 w-5 text-primary' />
            <span className='text-sm font-semibold text-primary'>AI Agent 动态</span>
          </div>
          <h1 className='text-3xl font-bold tracking-tight md:text-4xl'>最新行业资讯</h1>
          <p className='max-w-2xl text-muted-foreground'>
            实时追踪 AI Agent 赛道的重大事件、融资动向、模型发布和技术突破
          </p>
        </div>

        {/* Timeline */}
        <div className='rounded-xl border bg-card p-5'>
          <div className='mb-4 flex items-center gap-2'>
            <Icons.clock className='h-4 w-4 text-muted-foreground' />
            <h2 className='text-sm font-semibold'>重大事件时间线</h2>
          </div>
          <div className='relative space-y-0 pl-4'>
            <div className='absolute left-0 top-2 bottom-2 w-px bg-border' />
            {timeline.map((event, i) => (
              <div key={i} className='relative flex gap-4 py-2.5'>
                <div className='absolute -left-1.5 top-3.5 h-3 w-3 rounded-full border-2 border-primary bg-background' />
                <div className='min-w-[60px] pt-1 text-[11px] font-medium text-muted-foreground shrink-0'>
                  {event.date}
                </div>
                <div>
                  <p className='text-sm font-medium'>{event.title}</p>
                  <p className='text-xs text-muted-foreground'>{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Featured */}
        {featured.length > 0 && !category && page === 1 && (
          <div className='space-y-3'>
            <div className='flex items-center gap-2'>
              <Icons.sparkles className='h-4 w-4 text-amber-500' />
              <h2 className='text-sm font-semibold'>重点关注</h2>
            </div>
            <div className='grid gap-4 sm:grid-cols-2'>
              {featured.slice(0, 2).map((item) => {
                const cfg =
                  CATEGORY_CONFIG[item.category as NewsCategory] ?? CATEGORY_CONFIG['Agent'];
                return (
                  <Link
                    key={item.id}
                    href={`/news/${item.slug}`}
                    className='group flex flex-col gap-3 rounded-xl border bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30 ring-1 ring-primary/10'
                  >
                    <div className='flex items-start justify-between gap-2'>
                      <Badge
                        variant='outline'
                        className={`text-[10px] font-medium ${cfg.bg} ${cfg.color}`}
                      >
                        {item.category}
                      </Badge>
                      <span className='text-[11px] text-muted-foreground'>
                        {formatDate(item.published_at)}
                      </span>
                    </div>
                    <h3 className='text-sm font-semibold leading-snug group-hover:text-primary transition-colors'>
                      {item.title}
                    </h3>
                    <p className='line-clamp-2 text-xs leading-relaxed text-muted-foreground'>
                      {item.summary}
                    </p>
                    <div className='flex items-center gap-1.5 text-[11px] text-muted-foreground'>
                      <Icons.externalLink className='h-3 w-3' />
                      <span>{item.source_name}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Category filter */}
        <div className='flex flex-wrap gap-2'>
          <Link href='/news'>
            <Badge variant={!category ? 'default' : 'outline'} className='cursor-pointer'>
              全部
            </Badge>
          </Link>
          {categories.map((cat) => (
            <Link key={cat} href={`/news?category=${encodeURIComponent(cat)}`}>
              <Badge variant={category === cat ? 'default' : 'outline'} className='cursor-pointer'>
                {cat}
              </Badge>
            </Link>
          ))}
        </div>

        {/* News grid */}
        {news.length === 0 ? (
          <div className='flex flex-col items-center justify-center py-20 text-center'>
            <Icons.trendingUp className='mb-3 h-10 w-10 text-muted-foreground/40' />
            <p className='text-sm text-muted-foreground'>暂无相关资讯</p>
          </div>
        ) : (
          <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
            {news.map((item) => {
              const cfg =
                CATEGORY_CONFIG[item.category as NewsCategory] ?? CATEGORY_CONFIG['Agent'];
              return (
                <Link
                  key={item.id}
                  href={`/news/${item.slug}`}
                  className='group flex flex-col gap-3 rounded-xl border bg-card p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30'
                >
                  <div className='flex items-center justify-between'>
                    <Badge
                      variant='outline'
                      className={`text-[10px] font-medium ${cfg.bg} ${cfg.color}`}
                    >
                      {item.category}
                    </Badge>
                    <span className='text-[11px] text-muted-foreground'>
                      {formatDate(item.published_at)}
                    </span>
                  </div>
                  <h2 className='line-clamp-2 text-sm font-semibold leading-snug group-hover:text-primary transition-colors'>
                    {item.title}
                  </h2>
                  <p className='line-clamp-3 flex-1 text-xs leading-relaxed text-muted-foreground'>
                    {item.summary}
                  </p>
                  <div className='flex items-center gap-1.5 text-[11px] text-muted-foreground'>
                    <Icons.externalLink className='h-3 w-3' />
                    <span className='truncate'>{item.source_name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className='flex items-center justify-center gap-2'>
            {page > 1 && (
              <Link
                href={`/news?page=${page - 1}${category ? `&category=${encodeURIComponent(category)}` : ''}`}
                className='flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs hover:bg-accent transition-colors'
              >
                <Icons.chevronLeft className='h-3.5 w-3.5' />
                上一页
              </Link>
            )}
            <span className='text-xs text-muted-foreground'>
              第 {page} / {totalPages} 页
            </span>
            {page < totalPages && (
              <Link
                href={`/news?page=${page + 1}${category ? `&category=${encodeURIComponent(category)}` : ''}`}
                className='flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs hover:bg-accent transition-colors'
              >
                下一页
                <Icons.chevronRight className='h-3.5 w-3.5' />
              </Link>
            )}
          </div>
        )}
      </div>
    </PageContainer>
  );
}
