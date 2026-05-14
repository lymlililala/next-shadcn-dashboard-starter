'use client';

import { parseAsString, useQueryState } from 'nuqs';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';

const TABS = [
  {
    value: 'sites',
    label: 'Skill 网站',
    icon: Icons.laptop,
    desc: '导航站、聚合平台'
  },
  {
    value: 'tools',
    label: 'AI 工具',
    icon: Icons.sparkles,
    desc: '精选 AI 工具库'
  }
];

export function SkillTabSwitcher() {
  const [tab, setTab] = useQueryState(
    'skill_tab',
    parseAsString.withDefault('sites').withOptions({ shallow: true })
  );

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
              'flex flex-1 items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition-all duration-150',
              active
                ? 'border-primary bg-primary/5 text-primary shadow-sm'
                : 'bg-card text-muted-foreground hover:bg-accent hover:text-foreground'
            )}
          >
            <Icon className='h-4 w-4' />
            <span>{t.label}</span>
            <span
              className={cn(
                'hidden text-xs sm:inline',
                active ? 'text-primary/70' : 'text-muted-foreground/60'
              )}
            >
              — {t.desc}
            </span>
          </button>
        );
      })}
    </div>
  );
}
