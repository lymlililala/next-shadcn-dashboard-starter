'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { Icons } from '@/components/icons';
import { siteStatsOptions } from '../api/queries';

export function SkillStats() {
  const { data: stats } = useSuspenseQuery(siteStatsOptions());

  const statItems = [
    {
      label: '收录站点',
      value: stats.total,
      icon: Icons.skillsHub,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-500/10'
    },
    {
      label: '精选推荐',
      value: stats.featured,
      icon: Icons.sparkles,
      color: 'text-violet-600 dark:text-violet-400',
      bg: 'bg-violet-500/10'
    },
    {
      label: '国际站点',
      value: stats.byRegion['global'] ?? 0,
      icon: Icons.externalLink,
      color: 'text-sky-600 dark:text-sky-400',
      bg: 'bg-sky-500/10'
    },
    {
      label: '中文站点',
      value: stats.byRegion['cn'] ?? 0,
      icon: Icons.info,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-500/10'
    }
  ];

  return (
    <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
      {statItems.map((item) => (
        <div
          key={item.label}
          className='flex items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm'
        >
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${item.bg}`}
          >
            <item.icon className={`h-4 w-4 ${item.color}`} />
          </div>
          <div>
            <p className='text-xl font-bold leading-tight'>{item.value}</p>
            <p className='text-xs text-muted-foreground'>{item.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function SkillStatsSkeleton() {
  return (
    <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className='flex items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm'
        >
          <div className='h-9 w-9 animate-pulse rounded-lg bg-muted' />
          <div className='space-y-1'>
            <div className='h-6 w-10 animate-pulse rounded bg-muted' />
            <div className='h-3 w-14 animate-pulse rounded bg-muted' />
          </div>
        </div>
      ))}
    </div>
  );
}
