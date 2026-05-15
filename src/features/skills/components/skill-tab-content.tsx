'use client';

import { parseAsString, useQueryState } from 'nuqs';
import { Suspense } from 'react';
import { SkillFilters } from './skill-filters';
import { SkillGrid, SkillGridSkeleton } from './skill-grid';
import { SkillToolFilters } from './skill-tool-filters';
import { SkillToolGrid, SkillToolGridSkeleton } from './skill-tool-grid';
import { SkillTabSwitcher } from './skill-tab-switcher';
import { FeaturedSkills, FeaturedSkillsSkeleton } from './featured-skills';

export function SkillTabContent() {
  const [tab] = useQueryState('skill_tab', parseAsString.withDefault('sites'));

  return (
    <div className='space-y-6'>
      {/* Tab 切换器 — 紧接统计数据 */}
      <SkillTabSwitcher />

      {tab === 'tools' ? (
        <>
          <SkillToolFilters />
          <Suspense fallback={<SkillToolGridSkeleton />}>
            <SkillToolGrid />
          </Suspense>
        </>
      ) : (
        <>
          {/* 精选 Hub 站点分区 — 仅在 Hub 导航站 Tab 显示 */}
          <Suspense fallback={<FeaturedSkillsSkeleton />}>
            <FeaturedSkills />
          </Suspense>

          <div className='flex items-center gap-3'>
            <div className='h-px flex-1 bg-border' />
            <span className='text-xs font-medium text-muted-foreground'>全部收录站点</span>
            <div className='h-px flex-1 bg-border' />
          </div>
          <SkillFilters />
          <Suspense fallback={<SkillGridSkeleton />}>
            <SkillGrid />
          </Suspense>
        </>
      )}
    </div>
  );
}
