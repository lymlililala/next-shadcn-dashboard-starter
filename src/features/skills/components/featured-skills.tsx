'use client';

import { useState, useCallback, useRef } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { featuredSitesOptions } from '../api/queries';
import type { Site, SitePlatform, SiteRegion } from '../api/types';

function prefetchExternalUrl(url: string) {
  try {
    const origin = new URL(url).origin;
    if (document.querySelector(`link[href="${origin}"][rel="preconnect"]`)) return;
    const dns = document.createElement('link');
    dns.rel = 'dns-prefetch';
    dns.href = origin;
    document.head.appendChild(dns);
    const pre = document.createElement('link');
    pre.rel = 'preconnect';
    pre.href = origin;
    pre.crossOrigin = 'anonymous';
    document.head.appendChild(pre);
  } catch {
    // ignore
  }
}

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

// 平台分区配置
const HUB_ZONES: {
  key: string;
  title: string;
  desc: string;
  platforms: SitePlatform[];
  accent: string;
  iconColor: string;
  tagline: string;
}[] = [
  {
    key: 'official',
    title: '官方生态',
    desc: '原生 · 标准',
    platforms: ['official'],
    accent: 'border-blue-500/30 bg-blue-500/5',
    iconColor: 'text-blue-600 dark:text-blue-400',
    tagline: '由各大 AI 平台官方维护，标准最完善'
  },
  {
    key: 'community',
    title: '社区开发者',
    desc: '海量 · 灵感',
    platforms: ['community', 'aggregator'],
    accent: 'border-violet-500/30 bg-violet-500/5',
    iconColor: 'text-violet-600 dark:text-violet-400',
    tagline: '社区贡献，丰富多样，创意无限'
  },
  {
    key: 'deploy',
    title: '私有化 & 工作流',
    desc: '生产力 · 工作流',
    platforms: ['tool', 'github', 'mirror'],
    accent: 'border-emerald-500/30 bg-emerald-500/5',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    tagline: '适合企业自部署，工作流深度集成'
  }
];

function FeaturedSiteCard({ site, featured }: { site: Site; featured?: boolean }) {
  const platform = PLATFORM_CONFIG[site.platform];
  const region = REGION_CONFIG[site.region];
  const PlatformIcon = platform.icon;

  const [clicking, setClicking] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = useCallback(() => {
    prefetchExternalUrl(site.url);
  }, [site.url]);

  const handleClick = useCallback(() => {
    setClicking(true);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setClicking(false), 2000);
  }, []);

  return (
    <a
      href={site.url}
      target='_blank'
      rel='noopener noreferrer'
      className={cn(
        'group relative flex flex-col gap-2.5 rounded-xl border bg-card p-4 transition-all duration-200',
        'hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30',
        featured && 'ring-1 ring-primary/20',
        clicking && 'scale-[0.99] border-primary/40 shadow-md'
      )}
      onMouseEnter={handleMouseEnter}
      onClick={handleClick}
    >
      {featured && (
        <div className='absolute -top-2 right-3'>
          <span className='inline-flex items-center gap-0.5 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground shadow-sm'>
            <Icons.sparkles className='h-2.5 w-2.5' />
            精选
          </span>
        </div>
      )}

      <div className='flex items-start gap-3'>
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
            platform.bg,
            clicking && 'opacity-70'
          )}
        >
          {clicking ? (
            <Icons.spinner className={cn('h-4 w-4 animate-spin', platform.color)} />
          ) : (
            <PlatformIcon className={cn('h-4 w-4', platform.color)} />
          )}
        </div>
        <div className='min-w-0 flex-1'>
          <h3 className='truncate text-sm font-semibold leading-tight transition-colors group-hover:text-primary'>
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

      {/* Tags */}
      {site.tags && site.tags.length > 0 && (
        <div className='flex flex-wrap gap-1'>
          {site.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className='rounded-md border bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground'
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className='flex items-center justify-between pt-0.5'>
        <div className='flex items-center gap-1.5'>
          <span className='text-xs'>{region.flag}</span>
          <Badge variant='outline' className='h-4 px-1.5 text-[9px] font-medium'>
            {platform.label}
          </Badge>
        </div>
        <span
          className={cn(
            'flex items-center gap-1 text-xs text-muted-foreground transition-opacity',
            clicking ? 'opacity-100 text-primary' : 'opacity-0 group-hover:opacity-100'
          )}
        >
          {clicking ? '打开中…' : <Icons.externalLink className='h-3 w-3' />}
        </span>
      </div>
    </a>
  );
}

export function FeaturedSkills() {
  const { data: featured } = useSuspenseQuery(featuredSitesOptions());

  return (
    <div className='space-y-5'>
      <div className='flex items-center gap-2'>
        <Icons.skillsHub className='h-4 w-4 text-blue-500' />
        <h2 className='text-sm font-semibold'>Hub 聚合平台</h2>
        <Badge variant='secondary' className='text-[10px]'>
          {featured.length}
        </Badge>
        <span className='text-xs text-muted-foreground'>— 按平台属性分区，帮你快速定位来源</span>
      </div>

      <div className='space-y-4'>
        {HUB_ZONES.map((zone) => {
          const zoneSites = featured.filter((s) => zone.platforms.includes(s.platform));
          if (zoneSites.length === 0) return null;

          return (
            <div key={zone.key} className={cn('rounded-xl border p-4', zone.accent)}>
              {/* Zone Header */}
              <div className='mb-3 flex items-center gap-2'>
                <div className='flex items-center gap-1.5'>
                  <span className={cn('text-xs font-semibold', zone.iconColor)}>{zone.title}</span>
                  <span className='rounded-full border px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground'>
                    {zone.desc}
                  </span>
                </div>
                <div className='h-px flex-1 bg-border/60' />
                <span className='text-[10px] text-muted-foreground/70'>{zone.tagline}</span>
              </div>

              {/* Zone Cards */}
              <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
                {zoneSites.map((site) => (
                  <FeaturedSiteCard key={site.id} site={site} featured={site.is_featured} />
                ))}
              </div>
            </div>
          );
        })}

        {/* 如果有不在以上分区的站点，放到兜底区 */}
        {(() => {
          const allZonePlatforms = HUB_ZONES.flatMap((z) => z.platforms);
          const others = featured.filter((s) => !allZonePlatforms.includes(s.platform));
          if (others.length === 0) return null;
          return (
            <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
              {others.map((site) => (
                <FeaturedSiteCard key={site.id} site={site} featured={site.is_featured} />
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

export function FeaturedSkillsSkeleton() {
  return (
    <div className='space-y-5'>
      <div className='flex items-center gap-2'>
        <div className='h-4 w-4 animate-pulse rounded bg-muted' />
        <div className='h-4 w-24 animate-pulse rounded bg-muted' />
        <div className='h-4 w-6 animate-pulse rounded bg-muted' />
      </div>
      <div className='space-y-4'>
        {Array.from({ length: 2 }).map((_, zi) => (
          <div key={zi} className='rounded-xl border bg-muted/5 p-4'>
            <div className='mb-3 h-4 w-32 animate-pulse rounded bg-muted' />
            <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
              {Array.from({ length: 3 }).map((_, i) => (
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
        ))}
      </div>
    </div>
  );
}
