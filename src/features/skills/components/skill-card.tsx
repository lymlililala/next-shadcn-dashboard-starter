'use client';

import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { Site, SitePlatform, SiteRegion } from '../api/types';

export const PLATFORM_CONFIG: Record<
  SitePlatform,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bg: string;
    border: string;
  }
> = {
  official: {
    label: '官方',
    icon: Icons.badgeCheck,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20'
  },
  mirror: {
    label: '镜像',
    icon: Icons.arrowRight,
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20'
  },
  github: {
    label: 'GitHub',
    icon: Icons.github,
    color: 'text-slate-600 dark:text-slate-300',
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/20'
  },
  aggregator: {
    label: '聚合',
    icon: Icons.skillsHub,
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20'
  },
  community: {
    label: '社区',
    icon: Icons.chat,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20'
  },
  tool: {
    label: '工具',
    icon: Icons.settings,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20'
  }
};

export const REGION_CONFIG: Record<SiteRegion, { label: string; flag: string }> = {
  global: { label: '国际', flag: '🌐' },
  cn: { label: '中文', flag: '🇨🇳' }
};

interface SiteCardProps {
  site: Site;
}

export function SkillCard({ site }: SiteCardProps) {
  const platform = PLATFORM_CONFIG[site.platform];
  const region = REGION_CONFIG[site.region];
  const PlatformIcon = platform.icon;

  return (
    <a
      href={site.url}
      target='_blank'
      rel='noopener noreferrer'
      className={cn(
        'group relative flex flex-col rounded-xl border bg-card p-5 shadow-sm transition-all duration-200',
        'hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5',
        site.is_featured && 'ring-1 ring-primary/20'
      )}
    >
      {/* Featured badge */}
      {site.is_featured && (
        <div className='absolute -top-2.5 right-4'>
          <span className='inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold text-primary-foreground shadow-sm'>
            <Icons.sparkles className='h-2.5 w-2.5' />
            精选
          </span>
        </div>
      )}

      {/* Header */}
      <div className='mb-3 flex items-start gap-3'>
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
            platform.bg
          )}
        >
          <PlatformIcon className={cn('h-4 w-4', platform.color)} />
        </div>
        <div className='min-w-0 flex-1'>
          <h3 className='truncate text-sm font-semibold leading-tight text-foreground group-hover:text-primary transition-colors'>
            {site.name}
          </h3>
          <p className='mt-0.5 truncate text-[11px] text-muted-foreground'>
            {site.url.replace(/^https?:\/\//, '')}
          </p>
        </div>
        <Badge
          variant='outline'
          className={cn(
            'shrink-0 text-[10px] font-medium px-1.5 py-0.5',
            platform.color,
            platform.border
          )}
        >
          {platform.label}
        </Badge>
      </div>

      {/* Description */}
      <p className='mb-4 line-clamp-2 flex-1 text-xs leading-relaxed text-muted-foreground'>
        {site.description}
      </p>

      {/* Tags */}
      {site.tags.length > 0 && (
        <div className='mb-4 flex flex-wrap gap-1'>
          {site.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className='rounded-md border bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground'
            >
              {tag}
            </span>
          ))}
          {site.tags.length > 3 && (
            <span className='rounded-md border bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground'>
              +{site.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className='flex items-center justify-between'>
        <span className='flex items-center gap-1 text-xs text-muted-foreground'>
          <span>{region.flag}</span>
          {region.label}
        </span>
        <span className='flex items-center gap-1 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity'>
          访问
          <Icons.externalLink className='h-3 w-3' />
        </span>
      </div>
    </a>
  );
}

export function SkillCardSkeleton() {
  return (
    <div className='flex flex-col rounded-xl border bg-card p-5 shadow-sm'>
      <div className='mb-3 flex items-start gap-3'>
        <div className='h-9 w-9 animate-pulse rounded-lg bg-muted' />
        <div className='flex-1 space-y-1.5'>
          <div className='h-4 w-3/4 animate-pulse rounded bg-muted' />
          <div className='h-3 w-1/2 animate-pulse rounded bg-muted' />
        </div>
        <div className='h-5 w-10 animate-pulse rounded bg-muted' />
      </div>
      <div className='mb-4 space-y-1.5'>
        <div className='h-3 w-full animate-pulse rounded bg-muted' />
        <div className='h-3 w-5/6 animate-pulse rounded bg-muted' />
      </div>
      <div className='mb-4 flex gap-1'>
        <div className='h-4 w-12 animate-pulse rounded bg-muted' />
        <div className='h-4 w-12 animate-pulse rounded bg-muted' />
      </div>
      <div className='flex items-center justify-between'>
        <div className='h-3 w-10 animate-pulse rounded bg-muted' />
      </div>
    </div>
  );
}
