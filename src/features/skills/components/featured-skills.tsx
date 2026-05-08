'use client';

import Link from 'next/link';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { featuredSitesOptions } from '../api/queries';
import type { SitePlatform, SiteRegion } from '../api/types';

const PLATFORM_CONFIG: Record<
  SitePlatform,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string }
> = {
  official: { label: '官方', icon: Icons.badgeCheck, color: 'text-blue-600', bg: 'bg-blue-500/10' },
  mirror: {
    label: '镜像',
    icon: Icons.arrowRight,
    color: 'text-orange-600',
    bg: 'bg-orange-500/10'
  },
  github: { label: 'GitHub', icon: Icons.github, color: 'text-slate-600', bg: 'bg-slate-500/10' },
  aggregator: {
    label: '聚合',
    icon: Icons.skillsHub,
    color: 'text-violet-600',
    bg: 'bg-violet-500/10'
  },
  community: {
    label: '社区',
    icon: Icons.chat,
    color: 'text-emerald-600',
    bg: 'bg-emerald-500/10'
  },
  tool: { label: '工具', icon: Icons.settings, color: 'text-amber-600', bg: 'bg-amber-500/10' }
};

const REGION_CONFIG: Record<SiteRegion, { label: string; flag: string }> = {
  global: { label: '国际', flag: '🌐' },
  cn: { label: '中文', flag: '🇨🇳' }
};

export function FeaturedSkills() {
  const { data: featured } = useSuspenseQuery(featuredSitesOptions());

  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-2'>
        <Icons.sparkles className='h-4 w-4 text-amber-500' />
        <h2 className='text-sm font-semibold'>精选站点</h2>
        <Badge variant='secondary' className='text-[10px]'>
          {featured.length}
        </Badge>
      </div>
      <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
        {featured.map((site) => {
          const platform = PLATFORM_CONFIG[site.platform];
          const region = REGION_CONFIG[site.region];
          const PlatformIcon = platform.icon;
          return (
            <Link
              key={site.id}
              href={site.url}
              target='_blank'
              rel='noopener noreferrer'
              className='group relative flex flex-col gap-2.5 rounded-xl border bg-card p-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30'
            >
              <div className='flex items-start gap-3'>
                <div
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                    platform.bg
                  )}
                >
                  <PlatformIcon className={cn('h-4 w-4', platform.color)} />
                </div>
                <div className='min-w-0 flex-1'>
                  <h3 className='truncate text-sm font-semibold leading-tight group-hover:text-primary transition-colors'>
                    {site.name}
                  </h3>
                  <p className='mt-0.5 truncate text-[11px] text-muted-foreground'>
                    {site.url.replace(/^https?:\/\//, '')}
                  </p>
                </div>
              </div>
              <p className='line-clamp-2 text-xs leading-relaxed text-muted-foreground'>
                {site.description}
              </p>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-1.5'>
                  <span className='text-xs'>{region.flag}</span>
                  <Badge variant='outline' className='h-4 px-1.5 text-[9px] font-medium'>
                    {platform.label}
                  </Badge>
                </div>
                <Icons.externalLink className='h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity' />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function FeaturedSkillsSkeleton() {
  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-2'>
        <div className='h-4 w-4 animate-pulse rounded bg-muted' />
        <div className='h-4 w-20 animate-pulse rounded bg-muted' />
      </div>
      <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className='flex flex-col gap-2.5 rounded-xl border p-4'>
            <div className='flex items-start gap-3'>
              <div className='h-9 w-9 animate-pulse rounded-lg bg-muted' />
              <div className='flex-1 space-y-1'>
                <div className='h-4 w-3/4 animate-pulse rounded bg-muted' />
                <div className='h-3 w-1/2 animate-pulse rounded bg-muted' />
              </div>
            </div>
            <div className='space-y-1'>
              <div className='h-3 w-full animate-pulse rounded bg-muted' />
              <div className='h-3 w-4/5 animate-pulse rounded bg-muted' />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
