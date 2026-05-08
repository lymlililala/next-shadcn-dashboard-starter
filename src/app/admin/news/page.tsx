import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getNews, getNewsStats } from '@/features/news/api/service';
import type { NewsItem } from '@/features/news/api/types';

export const metadata = {
  title: 'News 管理 | AI Skill Navigation 管理后台'
};

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

const STATUS_CONFIG = {
  published: { label: '已发布', color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' },
  draft: { label: '草稿', color: 'text-amber-600 bg-amber-500/10 border-amber-500/20' },
  archived: { label: '已归档', color: 'text-slate-600 bg-slate-500/10 border-slate-500/20' }
};

const CATEGORY_COLOR: Record<string, string> = {
  Agent: 'text-violet-600 bg-violet-500/10 border-violet-500/20',
  框架: 'text-blue-600 bg-blue-500/10 border-blue-500/20',
  模型: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20',
  工具: 'text-orange-600 bg-orange-500/10 border-orange-500/20',
  融资: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
  研究: 'text-pink-600 bg-pink-500/10 border-pink-500/20'
};

function NewsRow({ item }: { item: NewsItem }) {
  const stCfg = STATUS_CONFIG[item.status];
  const catColor = CATEGORY_COLOR[item.category] ?? '';
  return (
    <div className='flex items-center gap-4 rounded-lg border bg-card px-4 py-3 shadow-sm'>
      <div className='min-w-0 flex-1'>
        <div className='flex items-center gap-2'>
          <span className='truncate text-sm font-medium'>{item.title}</span>
          {item.is_featured && <Icons.sparkles className='h-3.5 w-3.5 shrink-0 text-amber-500' />}
        </div>
        <div className='mt-1 flex flex-wrap items-center gap-2'>
          <Badge variant='outline' className={`text-[10px] ${catColor}`}>
            {item.category}
          </Badge>
          <span className='text-[11px] text-muted-foreground'>{item.source_name}</span>
          <span className='text-[11px] text-muted-foreground'>{formatDate(item.published_at)}</span>
        </div>
      </div>
      <div className='flex shrink-0 items-center gap-2'>
        <Badge variant='outline' className={`text-[10px] ${stCfg.color}`}>
          {stCfg.label}
        </Badge>
        <Link
          href={`/news/${item.slug}`}
          target='_blank'
          className='p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors'
        >
          <Icons.externalLink className='h-3.5 w-3.5' />
        </Link>
      </div>
    </div>
  );
}

export default async function AdminNewsPage() {
  const [{ items }, stats] = await Promise.all([getNews({ limit: 50 }), getNewsStats()]);

  return (
    <PageContainer
      pageTitle='News 管理'
      pageDescription='管理 AI Agent 行业资讯，发布后在 /news 公开展示'
      pageHeaderAction={
        <div className='flex gap-2'>
          <Button variant='outline' size='sm' asChild>
            <Link href='/news' target='_blank'>
              <Icons.externalLink className='mr-1.5 h-3.5 w-3.5' />
              查看前台
            </Link>
          </Button>
          <Button size='sm'>
            <Icons.add className='mr-1.5 h-4 w-4' />
            添加资讯
          </Button>
        </div>
      }
    >
      <div className='space-y-6'>
        {/* Stats */}
        <div className='grid grid-cols-3 gap-3'>
          {[
            {
              label: '已发布',
              value: stats.published,
              icon: Icons.checks,
              color: 'text-emerald-600',
              bg: 'bg-emerald-500/10'
            },
            {
              label: '草稿',
              value: stats.draft,
              icon: Icons.edit,
              color: 'text-amber-600',
              bg: 'bg-amber-500/10'
            },
            {
              label: '精选',
              value: stats.featured,
              icon: Icons.sparkles,
              color: 'text-violet-600',
              bg: 'bg-violet-500/10'
            }
          ].map((s) => (
            <div
              key={s.label}
              className='flex items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm'
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${s.bg}`}
              >
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <div>
                <p className='text-xl font-bold'>{s.value}</p>
                <p className='text-xs text-muted-foreground'>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Category breakdown */}
        <div className='rounded-xl border bg-card p-4'>
          <p className='mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
            分类分布
          </p>
          <div className='flex flex-wrap gap-2'>
            {Object.entries(stats.byCategory).map(([cat, count]) => (
              <div
                key={cat}
                className='flex items-center gap-1.5 rounded-lg border bg-muted/30 px-3 py-1.5'
              >
                <span className='text-xs font-medium'>{cat}</span>
                <span className='text-xs text-muted-foreground'>{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* News list */}
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <p className='text-sm font-medium'>全部资讯 ({items.length})</p>
          </div>
          <div className='space-y-2'>
            {items.map((item) => (
              <NewsRow key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
