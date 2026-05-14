'use client';

import { parseAsString, useQueryState } from 'nuqs';
import { Suspense } from 'react';
import { SkillFilters } from './skill-filters';
import { SkillGrid, SkillGridSkeleton } from './skill-grid';
import { SkillToolFilters } from './skill-tool-filters';
import { SkillToolGrid, SkillToolGridSkeleton } from './skill-tool-grid';
import { SkillTabSwitcher } from './skill-tab-switcher';

export function SkillTabContent() {
  const [tab] = useQueryState('skill_tab', parseAsString.withDefault('sites'));

  return (
    <div className='space-y-6'>
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
