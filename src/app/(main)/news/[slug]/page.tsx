import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageContainer from '@/components/layout/page-container';
import { getNewsBySlug, getPublishedNews } from '@/features/news/api/service';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = await getNewsBySlug(slug);
  if (!item) return { title: '资讯不存在' };
  return {
    title: item.title,
    description: item.summary,
    alternates: { canonical: `https://aiskillnav.com/news/${slug}` },
    openGraph: {
      title: item.title,
      description: item.summary,
      type: 'article',
      publishedTime: item.published_at
    }
  };
}

export async function generateStaticParams() {
  try {
    const { items } = await getPublishedNews({ limit: 100 });
    return items.map((n) => ({ slug: n.slug }));
  } catch {
    return [];
  }
}

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

const CATEGORY_COLOR: Record<string, string> = {
  Agent: 'text-violet-600 bg-violet-500/10 border-violet-500/20',
  框架: 'text-blue-600 bg-blue-500/10 border-blue-500/20',
  模型: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20',
  工具: 'text-orange-600 bg-orange-500/10 border-orange-500/20',
  融资: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
  研究: 'text-pink-600 bg-pink-500/10 border-pink-500/20'
};

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const item = await getNewsBySlug(slug);
  if (!item) notFound();

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: item.title,
    description: item.summary,
    datePublished: item.published_at,
    keywords: item.tags.join(', ')
  };

  const catColor = CATEGORY_COLOR[item.category] ?? CATEGORY_COLOR['Agent'];

  return (
    <PageContainer>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article className='mx-auto max-w-3xl space-y-8'>
        <Link
          href='/news'
          className='inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors'
        >
          <Icons.chevronLeft className='h-4 w-4' />
          返回资讯列表
        </Link>

        <header className='space-y-4'>
          <div className='flex flex-wrap items-center gap-2'>
            <Badge variant='outline' className={`text-xs ${catColor}`}>
              {item.category}
            </Badge>
            {item.is_featured && (
              <Badge
                variant='outline'
                className='text-xs bg-amber-500/10 text-amber-600 border-amber-500/20'
              >
                <Icons.sparkles className='mr-1 h-3 w-3' />
                重点
              </Badge>
            )}
          </div>

          <h1 className='text-2xl font-bold leading-tight tracking-tight md:text-3xl'>
            {item.title}
          </h1>

          <p className='text-base leading-relaxed text-muted-foreground'>{item.summary}</p>

          <div className='flex flex-wrap items-center gap-4 text-xs text-muted-foreground'>
            <span className='flex items-center gap-1'>
              <Icons.clock className='h-3.5 w-3.5' />
              {formatDate(item.published_at)}
            </span>
            <span className='flex items-center gap-1'>
              <Icons.externalLink className='h-3.5 w-3.5' />
              来源：{item.source_name}
            </span>
          </div>

          <div className='flex flex-wrap gap-1.5'>
            {item.tags.map((tag) => (
              <span
                key={tag}
                className='rounded-md bg-muted/50 border px-2 py-0.5 text-xs text-muted-foreground'
              >
                {tag}
              </span>
            ))}
          </div>
          <div className='border-b' />
        </header>

        {/* CTA - link to original source */}
        <div className='rounded-xl border bg-muted/30 p-5 space-y-3'>
          <p className='text-sm font-medium'>阅读原文</p>
          <p className='text-xs text-muted-foreground'>
            本条资讯来源于 <strong>{item.source_name}</strong>，点击查看完整报道。
          </p>
          <Link
            href={item.source_url}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors'
          >
            前往 {item.source_name}
            <Icons.externalLink className='h-3.5 w-3.5' />
          </Link>
        </div>

        {/* Related */}
        <div className='rounded-xl border bg-muted/30 p-5 space-y-2'>
          <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wide'>
            相关资源
          </p>
          <Link
            href='/agents'
            className='flex items-center justify-between rounded-lg border bg-card px-4 py-3 text-sm hover:border-primary/30 hover:bg-accent transition-colors'
          >
            <span className='font-medium'>浏览 Agent Hub</span>
            <Icons.externalLink className='h-4 w-4 text-muted-foreground' />
          </Link>
          <Link
            href='/mcp'
            className='flex items-center justify-between rounded-lg border bg-card px-4 py-3 text-sm hover:border-primary/30 hover:bg-accent transition-colors'
          >
            <span className='font-medium'>探索 MCP 专区</span>
            <Icons.chevronRight className='h-4 w-4 text-muted-foreground' />
          </Link>
          <Link
            href='/news'
            className='flex items-center justify-between rounded-lg border bg-card px-4 py-3 text-sm hover:border-primary/30 hover:bg-accent transition-colors'
          >
            <span className='font-medium'>查看更多资讯</span>
            <Icons.chevronRight className='h-4 w-4 text-muted-foreground' />
          </Link>
        </div>
      </article>
    </PageContainer>
  );
}
