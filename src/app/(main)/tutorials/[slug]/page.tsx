import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTutorialBySlug, getTutorials } from '@/features/tutorials/api/service';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import PageContainer from '@/components/layout/page-container';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const t = await getTutorialBySlug(slug);
  if (!t) return { title: '教程不存在' };
  return {
    title: `${t.title} | 教程中心`,
    description: t.summary,
    alternates: { canonical: `https://www.aiskillnav.com/tutorials/${slug}` }
  };
}

export async function generateStaticParams() {
  try {
    const tutorials = await getTutorials();
    return tutorials.map((t) => ({ slug: t.slug }));
  } catch {
    return [];
  }
}

const LEVEL_CONFIG: Record<string, { label: string; color: string }> = {
  beginner: { label: '入门', color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' },
  intermediate: { label: '进阶', color: 'text-blue-600 bg-blue-500/10 border-blue-500/20' },
  advanced: { label: '高级', color: 'text-violet-600 bg-violet-500/10 border-violet-500/20' }
};

function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3 class="text-base font-semibold mt-6 mb-2">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-lg font-bold mt-8 mb-3">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-xl font-bold mt-8 mb-4">$1</h1>')
    .replace(
      /^> (.+)$/gm,
      '<blockquote class="border-l-2 pl-4 text-muted-foreground italic my-4">$1</blockquote>'
    )
    .replace(
      /```([\s\S]*?)```/gm,
      '<pre class="rounded-lg bg-muted px-4 py-3 text-sm font-mono overflow-x-auto my-4"><code>$1</code></pre>'
    )
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold">$1</strong>')
    .replace(/`(.+?)`/g, '<code class="rounded bg-muted px-1 py-0.5 text-sm font-mono">$1</code>')
    .replace(
      /\[(.+?)\]\((.+?)\)/g,
      '<a href="$2" class="text-primary underline underline-offset-4 hover:no-underline" target="_blank">$1</a>'
    )
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc my-0.5">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal my-0.5">$1</li>')
    .replace(/^\|(.+)\|$/gm, (match) => {
      if (match.includes('---')) return '';
      const cells = match
        .split('|')
        .filter(Boolean)
        .map((c) => c.trim());
      return `<tr>${cells.map((c) => `<td class="border px-3 py-1.5 text-sm">${c}</td>`).join('')}</tr>`;
    })
    .replace(/^---$/gm, '<hr class="my-6 border-border" />')
    .replace(/\n{2,}/g, '</p><p class="leading-relaxed text-foreground/90 my-3">')
    .replace(/^/, '<p class="leading-relaxed text-foreground/90 my-3">')
    .replace(/$/, '</p>');
}

export default async function TutorialDetailPage({ params }: Props) {
  const { slug } = await params;
  const tutorial = await getTutorialBySlug(slug);
  if (!tutorial) notFound();

  const level = LEVEL_CONFIG[tutorial.level];
  const html = renderMarkdown(tutorial.content);

  return (
    <PageContainer pageTitle={tutorial.title} pageDescription={tutorial.subtitle}>
      <div className='mx-auto max-w-3xl space-y-8'>
        <Link
          href='/tutorials'
          className='inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors'
        >
          <Icons.chevronLeft className='h-4 w-4' />
          返回教程列表
        </Link>

        <header className='space-y-4'>
          <div className='flex flex-wrap items-center gap-2'>
            <Badge variant='outline' className={`text-xs ${level.color}`}>
              {level.label}
            </Badge>
            <span className='flex items-center gap-1 text-xs text-muted-foreground'>
              <Icons.clock className='h-3.5 w-3.5' />约 {tutorial.estimated_minutes} 分钟
            </span>
          </div>
          <h1 className='text-2xl font-bold leading-tight md:text-3xl'>{tutorial.title}</h1>
          <p className='text-base text-muted-foreground'>{tutorial.subtitle}</p>
          <p className='text-sm leading-relaxed text-muted-foreground'>{tutorial.summary}</p>
          <div className='flex flex-wrap gap-1.5'>
            {tutorial.tags.map((tag) => (
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

        <div className='prose-sm max-w-none text-sm' dangerouslySetInnerHTML={{ __html: html }} />

        {tutorial.related_tools.length > 0 && (
          <div className='rounded-xl border bg-muted/30 p-5'>
            <p className='mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
              相关工具
            </p>
            <div className='flex flex-wrap gap-2'>
              {tutorial.related_tools.map((tool) => (
                <span
                  key={tool}
                  className='rounded-lg border bg-card px-3 py-1.5 text-xs font-medium'
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className='rounded-xl border bg-muted/30 p-5 space-y-2'>
          <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wide'>
            继续探索
          </p>
          <Link
            href='/tutorials'
            className='flex items-center justify-between rounded-lg border bg-card px-4 py-3 text-sm hover:border-primary/30 hover:bg-accent transition-colors'
          >
            <span className='font-medium'>查看更多教程</span>
            <Icons.chevronRight className='h-4 w-4 text-muted-foreground' />
          </Link>
          <Link
            href='/mcp'
            className='flex items-center justify-between rounded-lg border bg-card px-4 py-3 text-sm hover:border-primary/30 hover:bg-accent transition-colors'
          >
            <span className='font-medium'>浏览 MCP 专区</span>
            <Icons.chevronRight className='h-4 w-4 text-muted-foreground' />
          </Link>
          <Link
            href='/agents'
            className='flex items-center justify-between rounded-lg border bg-card px-4 py-3 text-sm hover:border-primary/30 hover:bg-accent transition-colors'
          >
            <span className='font-medium'>浏览 Agent Hub</span>
            <Icons.externalLink className='h-4 w-4 text-muted-foreground' />
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
