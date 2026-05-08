'use client';

import Link from 'next/link';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Icons } from '@/components/icons';
import { siteStatsOptions } from '../../api/queries';

const PLATFORM_LABELS: Record<string, string> = {
  official: '官方',
  mirror: '镜像',
  github: 'GitHub',
  aggregator: '聚合',
  community: '社区',
  tool: '工具'
};

const PLATFORM_COLORS: Record<string, string> = {
  official: 'bg-blue-500',
  mirror: 'bg-orange-500',
  github: 'bg-slate-500',
  aggregator: 'bg-violet-500',
  community: 'bg-emerald-500',
  tool: 'bg-amber-500'
};

export function SkillAnalytics() {
  const { data: stats } = useSuspenseQuery(siteStatsOptions());

  const totalByPlatform = Object.values(stats.byPlatform).reduce((a, b) => a + b, 0);

  const sortedPlatforms = Object.entries(stats.byPlatform).toSorted(([, a], [, b]) => b - a);

  const overviewCards = [
    {
      label: '已收录站点',
      value: stats.total,
      icon: Icons.skillsHub,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-500/10',
      sub: '已发布公开展示'
    },
    {
      label: '精选站点',
      value: stats.featured,
      icon: Icons.sparkles,
      color: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-500/10',
      sub: '首页精选展示'
    },
    {
      label: '国际站点',
      value: stats.byRegion['global'] ?? 0,
      icon: Icons.externalLink,
      color: 'text-sky-600 dark:text-sky-400',
      bg: 'bg-sky-500/10',
      sub: '面向全球用户'
    },
    {
      label: '中文站点',
      value: stats.byRegion['cn'] ?? 0,
      icon: Icons.info,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10',
      sub: '面向中文用户'
    },
    {
      label: '待审核',
      value: stats.pending,
      icon: Icons.clock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-500/10',
      sub: '等待人工审核'
    },
    {
      label: '已拒绝',
      value: stats.rejected,
      icon: Icons.circleX,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-500/10',
      sub: '审核未通过'
    }
  ];

  return (
    <div className='space-y-6'>
      {/* Overview Cards */}
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6'>
        {overviewCards.map((card) => (
          <div
            key={card.label}
            className='flex flex-col gap-2 rounded-xl border bg-card px-4 py-4 shadow-sm'
          >
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.bg}`}>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </div>
            <div>
              <p className='text-2xl font-bold leading-tight'>{card.value}</p>
              <p className='text-xs font-medium text-foreground'>{card.label}</p>
              <p className='mt-0.5 text-[11px] text-muted-foreground'>{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Platform Distribution */}
      <div className='rounded-xl border bg-card p-5 shadow-sm'>
        <div className='mb-4 flex items-center gap-2'>
          <Icons.skillsHub className='h-4 w-4 text-muted-foreground' />
          <h3 className='text-sm font-semibold'>平台类型分布</h3>
        </div>
        {totalByPlatform === 0 ? (
          <p className='text-xs text-muted-foreground'>暂无数据</p>
        ) : (
          <div className='space-y-3'>
            {sortedPlatforms.map(([platform, count]) => {
              const pct = Math.round((count / totalByPlatform) * 100);
              return (
                <div key={platform} className='flex items-center gap-3'>
                  <div className='w-14 shrink-0 text-right text-xs text-muted-foreground'>
                    {PLATFORM_LABELS[platform] ?? platform}
                  </div>
                  <div className='flex-1 overflow-hidden rounded-full bg-muted/50 h-2'>
                    <div
                      className={`h-full rounded-full ${PLATFORM_COLORS[platform] ?? 'bg-gray-500'} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className='w-14 shrink-0 flex items-center gap-1'>
                    <span className='text-xs font-medium'>{count}</span>
                    <span className='text-[10px] text-muted-foreground'>({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Review Status + Quick Actions */}
      <div className='grid gap-4 sm:grid-cols-2'>
        <div className='rounded-xl border bg-card p-5 shadow-sm'>
          <div className='mb-3 flex items-center gap-2'>
            <Icons.checks className='h-4 w-4 text-muted-foreground' />
            <h3 className='text-sm font-semibold'>收录状态概览</h3>
          </div>
          <div className='space-y-3'>
            {[
              {
                label: '已发布',
                value: stats.total,
                total: stats.total + stats.pending + stats.rejected,
                color: 'bg-emerald-500',
                textColor: 'text-emerald-600'
              },
              {
                label: '待审核',
                value: stats.pending,
                total: stats.total + stats.pending + stats.rejected,
                color: 'bg-amber-500',
                textColor: 'text-amber-600'
              },
              {
                label: '已拒绝',
                value: stats.rejected,
                total: stats.total + stats.pending + stats.rejected,
                color: 'bg-rose-500',
                textColor: 'text-rose-600'
              }
            ].map((item) => {
              const pct = item.total > 0 ? Math.round((item.value / item.total) * 100) : 0;
              return (
                <div key={item.label} className='flex items-center gap-3'>
                  <span className='w-14 text-right text-xs text-muted-foreground'>
                    {item.label}
                  </span>
                  <div className='flex-1 overflow-hidden rounded-full bg-muted/50 h-2'>
                    <div
                      className={`h-full rounded-full ${item.color} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className={`w-10 text-right text-xs font-semibold ${item.textColor}`}>
                    {item.value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className='rounded-xl border bg-card p-5 shadow-sm'>
          <div className='mb-3 flex items-center gap-2'>
            <Icons.trendingUp className='h-4 w-4 text-muted-foreground' />
            <h3 className='text-sm font-semibold'>快速操作</h3>
          </div>
          <div className='space-y-2'>
            <Link
              href='/admin/skills'
              className='flex items-center justify-between rounded-lg border px-3 py-2.5 hover:bg-muted/50 transition-colors'
            >
              <span className='text-sm font-medium'>管理所有站点</span>
              <Icons.chevronRight className='h-4 w-4 text-muted-foreground' />
            </Link>
            <Link
              href='/admin/review'
              className='flex items-center justify-between rounded-lg border px-3 py-2.5 hover:bg-muted/50 transition-colors'
            >
              <div className='flex items-center gap-2'>
                <span className='text-sm font-medium'>审核中心</span>
                {stats.pending > 0 && (
                  <span className='rounded-full bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600'>
                    {stats.pending} 待处理
                  </span>
                )}
              </div>
              <Icons.chevronRight className='h-4 w-4 text-muted-foreground' />
            </Link>
            <Link
              href='/skills'
              className='flex items-center justify-between rounded-lg border px-3 py-2.5 hover:bg-muted/50 transition-colors'
            >
              <span className='text-sm font-medium'>查看前台展示</span>
              <Icons.externalLink className='h-4 w-4 text-muted-foreground' />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SkillAnalyticsSkeleton() {
  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6'>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className='flex flex-col gap-2 rounded-xl border bg-card px-4 py-4'>
            <div className='h-8 w-8 animate-pulse rounded-lg bg-muted' />
            <div className='space-y-1'>
              <div className='h-7 w-12 animate-pulse rounded bg-muted' />
              <div className='h-3 w-16 animate-pulse rounded bg-muted' />
            </div>
          </div>
        ))}
      </div>
      <div className='rounded-xl border bg-card p-5'>
        <div className='mb-4 h-4 w-20 animate-pulse rounded bg-muted' />
        <div className='space-y-3'>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className='flex items-center gap-3'>
              <div className='h-3 w-14 animate-pulse rounded bg-muted' />
              <div className='flex-1 h-2 animate-pulse rounded-full bg-muted' />
              <div className='h-3 w-12 animate-pulse rounded bg-muted' />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
