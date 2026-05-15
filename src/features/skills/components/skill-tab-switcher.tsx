'use client';

import { parseAsString, useQueryState } from 'nuqs';
import { useSuspenseQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';
import { siteStatsOptions, skillToolStatsOptions } from '../api/queries';

export function SkillTabSwitcher() {
  const [tab, setTab] = useQueryState(
    'skill_tab',
    parseAsString.withDefault('sites').withOptions({ shallow: true })
  );

  const { data: siteStats } = useSuspenseQuery(siteStatsOptions());
  const { data: toolStats } = useSuspenseQuery(skillToolStatsOptions());

  const TABS = [
    {
      value: 'sites',
      label: 'Hub 导航站',
      icon: Icons.skillsHub,
      count: siteStats.total,
      desc: '聚合平台 · 发现优质来源',
      color: 'text-blue-600 dark:text-blue-400',
      activeBg: 'bg-blue-500/8 border-blue-500/30'
    },
    {
      value: 'tools',
      label: 'OpenClaw Skills',
      icon: Icons.sparkles,
      count: toolStats.total,
      desc: 'clawhub.ai · 原子化能力库',
      color: 'text-violet-600 dark:text-violet-400',
      activeBg: 'bg-violet-500/8 border-violet-500/30'
    }
  ];

  return (
    <div className='flex gap-2'>
      {TABS.map((t) => {
        const Icon = t.icon;
        const active = tab === t.value;
        return (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={cn(
              'group flex flex-1 items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-150',
              active
                ? cn('shadow-sm', t.activeBg)
                : 'bg-card text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            <div
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors',
                active ? cn(t.color, 'bg-current/10') : 'bg-muted/50'
              )}
            >
              <Icon
                className={cn(
                  'h-4 w-4 transition-colors',
                  active ? t.color : 'text-muted-foreground group-hover:text-foreground'
                )}
              />
            </div>
            <div className='min-w-0 flex-1'>
              <div className='flex items-center gap-2'>
                <span
                  className={cn(
                    'text-sm font-semibold transition-colors',
                    active ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                  )}
                >
                  {t.label}
                </span>
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
                    active
                      ? cn(
                          'text-white',
                          t.color
                            .replace('text-', 'bg-')
                            .replace(' dark:text-', ' dark:bg-')
                            .split(' ')[0]
                        )
                      : 'bg-muted text-muted-foreground'
                  )}
                >
                  {t.count}
                </span>
              </div>
              <p
                className={cn(
                  'truncate text-[11px] transition-colors',
                  active ? 'text-muted-foreground' : 'text-muted-foreground/60'
                )}
              >
                {t.desc}
              </p>
            </div>
            {active && <Icons.chevronRight className={cn('h-4 w-4 shrink-0', t.color)} />}
          </button>
        );
      })}
    </div>
  );
}
