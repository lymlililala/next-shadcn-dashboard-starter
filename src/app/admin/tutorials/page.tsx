import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getTutorials, getTutorialStats } from '@/features/tutorials/api/service';
import type { Tutorial } from '@/features/tutorials/api/service';

export const metadata = {
  title: '教程中心管理 | AI Skill Navigation 管理后台'
};

const LEVEL_CONFIG = {
  beginner: { label: '入门', color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' },
  intermediate: { label: '进阶', color: 'text-amber-600 bg-amber-500/10 border-amber-500/20' },
  advanced: { label: '高级', color: 'text-red-600 bg-red-500/10 border-red-500/20' }
};

const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  concept: { label: '概念', color: 'text-blue-600 bg-blue-500/10 border-blue-500/20' },
  'hands-on': { label: '实战', color: 'text-violet-600 bg-violet-500/10 border-violet-500/20' },
  mcp: { label: 'MCP', color: 'text-sky-600 bg-sky-500/10 border-sky-500/20' },
  agent: { label: 'Agent', color: 'text-orange-600 bg-orange-500/10 border-orange-500/20' },
  workflow: { label: '工作流', color: 'text-pink-600 bg-pink-500/10 border-pink-500/20' }
};

function formatDate(s: string) {
  return new Date(s).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function TutorialRow({ item }: { item: Tutorial }) {
  const levelCfg = LEVEL_CONFIG[item.level];
  const catCfg = CATEGORY_CONFIG[item.category] ?? { label: item.category, color: '' };

  return (
    <div className='flex items-center gap-4 rounded-lg border bg-card px-4 py-3 shadow-sm'>
      <div className='min-w-0 flex-1'>
        <div className='flex items-center gap-2'>
          <span className='text-sm font-medium'>{item.title}</span>
          {item.is_featured && <Icons.sparkles className='h-3.5 w-3.5 shrink-0 text-amber-500' />}
        </div>
        <p className='mt-0.5 text-xs text-muted-foreground line-clamp-1'>{item.subtitle}</p>
        <div className='mt-1.5 flex flex-wrap gap-1.5'>
          {item.tags.slice(0, 4).map((tag) => (
            <span
              key={tag}
              className='rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground'
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      <div className='flex shrink-0 flex-col items-end gap-1.5'>
        <div className='flex items-center gap-1.5'>
          <Badge variant='outline' className={`text-[10px] ${levelCfg.color}`}>
            {levelCfg.label}
          </Badge>
          <Badge variant='outline' className={`text-[10px] ${catCfg.color}`}>
            {catCfg.label}
          </Badge>
        </div>
        <div className='flex items-center gap-2 text-[11px] text-muted-foreground'>
          <span className='flex items-center gap-0.5'>
            <Icons.info className='h-3 w-3' />
            {item.estimated_minutes} 分钟
          </span>
          <span>{formatDate(item.published_at)}</span>
        </div>
        <Link
          href={`/dashboard/tutorials/${item.slug}`}
          target='_blank'
          className='rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
        >
          <Icons.externalLink className='h-3.5 w-3.5' />
        </Link>
      </div>
    </div>
  );
}

export default async function AdminTutorialsPage() {
  const [items, stats] = await Promise.all([getTutorials(), getTutorialStats()]);

  return (
    <PageContainer
      pageTitle='教程中心管理'
      pageDescription='管理 AI Agent 系列教程，发布后在教程中心公开展示'
      pageHeaderAction={
        <div className='flex gap-2'>
          <Button variant='outline' size='sm' asChild>
            <Link href='/dashboard/tutorials' target='_blank'>
              <Icons.externalLink className='mr-1.5 h-3.5 w-3.5' />
              查看前台
            </Link>
          </Button>
          <Button size='sm'>
            <Icons.add className='mr-1.5 h-4 w-4' />
            新建教程
          </Button>
        </div>
      }
    >
      <div className='space-y-6'>
        {/* 统计卡片 */}
        <div className='grid grid-cols-3 gap-3'>
          {[
            {
              label: '全部教程',
              value: stats.total,
              icon: Icons.post,
              color: 'text-blue-600',
              bg: 'bg-blue-500/10'
            },
            {
              label: '精选教程',
              value: stats.featured,
              icon: Icons.sparkles,
              color: 'text-amber-600',
              bg: 'bg-amber-500/10'
            },
            {
              label: '难度分布',
              value: Object.keys(stats.byLevel).length,
              icon: Icons.adjustments,
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

        {/* 分类 & 难度分布 */}
        <div className='grid grid-cols-2 gap-4'>
          <div className='rounded-xl border bg-card p-4'>
            <p className='mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
              难度分布
            </p>
            <div className='space-y-1.5'>
              {Object.entries(stats.byLevel).map(([level, count]) => {
                const cfg = LEVEL_CONFIG[level as keyof typeof LEVEL_CONFIG];
                return (
                  <div key={level} className='flex items-center justify-between'>
                    <Badge variant='outline' className={`text-[10px] ${cfg?.color ?? ''}`}>
                      {cfg?.label ?? level}
                    </Badge>
                    <span className='text-sm font-medium'>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className='rounded-xl border bg-card p-4'>
            <p className='mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
              类型分布
            </p>
            <div className='space-y-1.5'>
              {Object.entries(stats.byCategory).map(([cat, count]) => {
                const cfg = CATEGORY_CONFIG[cat] ?? { label: cat, color: '' };
                return (
                  <div key={cat} className='flex items-center justify-between'>
                    <Badge variant='outline' className={`text-[10px] ${cfg.color}`}>
                      {cfg.label}
                    </Badge>
                    <span className='text-sm font-medium'>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 教程列表 */}
        <div className='space-y-2'>
          <p className='text-sm font-medium'>全部教程 ({items.length})</p>
          <div className='space-y-2'>
            {items.map((item) => (
              <TutorialRow key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
