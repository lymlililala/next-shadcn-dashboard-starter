import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getUseCases, getUseCaseStats } from '@/features/usecases/api/service';
import type { UseCase } from '@/features/usecases/api/service';

export const metadata = {
  title: '场景库管理 | AI Skill Navigation 管理后台'
};

const INDUSTRY_CONFIG: Record<string, { label: string; color: string }> = {
  marketing: { label: '营销', color: 'text-pink-600 bg-pink-500/10 border-pink-500/20' },
  engineering: { label: '工程研发', color: 'text-blue-600 bg-blue-500/10 border-blue-500/20' },
  research: { label: '研究分析', color: 'text-violet-600 bg-violet-500/10 border-violet-500/20' },
  productivity: {
    label: '个人效率',
    color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20'
  },
  industry: { label: '垂直行业', color: 'text-orange-600 bg-orange-500/10 border-orange-500/20' }
};

const DIFFICULTY_CONFIG = {
  1: { label: '⭐ 简单', color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' },
  2: { label: '⭐⭐ 中等', color: 'text-amber-600 bg-amber-500/10 border-amber-500/20' },
  3: { label: '⭐⭐⭐ 高级', color: 'text-red-600 bg-red-500/10 border-red-500/20' }
} as const;

function UseCaseRow({ item }: { item: UseCase }) {
  const indCfg = INDUSTRY_CONFIG[item.industry] ?? { label: item.industry, color: '' };
  const diffCfg = DIFFICULTY_CONFIG[item.difficulty];

  return (
    <div className='flex items-start gap-4 rounded-lg border bg-card px-4 py-3 shadow-sm'>
      <div className='min-w-0 flex-1'>
        <div className='flex items-center gap-2'>
          <span className='text-sm font-medium'>{item.title}</span>
          {item.is_featured && <Icons.sparkles className='h-3.5 w-3.5 shrink-0 text-amber-500' />}
        </div>
        <p className='mt-0.5 text-xs text-muted-foreground line-clamp-2'>{item.description}</p>
        <div className='mt-1.5 flex flex-wrap gap-1'>
          {item.tools.slice(0, 5).map((tool) => (
            <span
              key={tool}
              className='rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground'
            >
              {tool}
            </span>
          ))}
          {item.tools.length > 5 && (
            <span className='rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground'>
              +{item.tools.length - 5}
            </span>
          )}
        </div>
      </div>
      <div className='flex shrink-0 flex-col items-end gap-1.5'>
        <div className='flex items-center gap-1.5'>
          <Badge variant='outline' className={`text-[10px] ${indCfg.color}`}>
            {indCfg.label}
          </Badge>
          <Badge variant='outline' className={`text-[10px] ${diffCfg.color}`}>
            {diffCfg.label}
          </Badge>
        </div>
        <div className='flex items-center gap-1 text-[11px] text-muted-foreground'>
          <Icons.info className='h-3 w-3' />
          <span>{item.estimated_time}</span>
        </div>
        <span className='text-[11px] text-muted-foreground'>{item.steps.length} 个步骤</span>
      </div>
    </div>
  );
}

export default async function AdminUseCasesPage() {
  const [items, stats] = await Promise.all([getUseCases(), getUseCaseStats()]);

  const byIndustry = stats.byIndustry as Record<string, number>;

  return (
    <PageContainer
      pageTitle='场景库管理'
      pageDescription='管理 AI Agent 应用场景库，展示各行业实战案例'
      pageHeaderAction={
        <div className='flex gap-2'>
          <Button variant='outline' size='sm' asChild>
            <Link href='/usecases' target='_blank'>
              <Icons.externalLink className='mr-1.5 h-3.5 w-3.5' />
              查看前台
            </Link>
          </Button>
          <Button size='sm'>
            <Icons.add className='mr-1.5 h-4 w-4' />
            新建场景
          </Button>
        </div>
      }
    >
      <div className='space-y-6'>
        {/* 统计卡片 */}
        <div className='grid grid-cols-3 gap-3'>
          {[
            {
              label: '全部场景',
              value: stats.total,
              icon: Icons.kanban,
              color: 'text-blue-600',
              bg: 'bg-blue-500/10'
            },
            {
              label: '精选场景',
              value: stats.featured,
              icon: Icons.sparkles,
              color: 'text-amber-600',
              bg: 'bg-amber-500/10'
            },
            {
              label: '行业覆盖',
              value: Object.keys(byIndustry).length,
              icon: Icons.teams,
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

        {/* 行业分布 */}
        <div className='rounded-xl border bg-card p-4'>
          <p className='mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
            行业分布
          </p>
          <div className='flex flex-wrap gap-2'>
            {Object.entries(byIndustry).map(([ind, count]) => {
              const cfg = INDUSTRY_CONFIG[ind] ?? { label: ind, color: '' };
              return (
                <div
                  key={ind}
                  className='flex items-center gap-1.5 rounded-lg border bg-muted/30 px-3 py-1.5'
                >
                  <Badge variant='outline' className={`text-[10px] ${cfg.color}`}>
                    {cfg.label}
                  </Badge>
                  <span className='text-xs font-medium'>{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 按行业分组展示 */}
        {Object.entries(INDUSTRY_CONFIG).map(([ind, cfg]) => {
          const indItems = items.filter((u) => u.industry === ind);
          if (indItems.length === 0) return null;
          return (
            <div key={ind} className='space-y-2'>
              <div className='flex items-center gap-2'>
                <Badge variant='outline' className={`text-[10px] ${cfg.color}`}>
                  {cfg.label}
                </Badge>
                <span className='text-xs text-muted-foreground'>{indItems.length} 个场景</span>
              </div>
              <div className='space-y-2'>
                {indItems.map((item) => (
                  <UseCaseRow key={item.id} item={item} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </PageContainer>
  );
}
