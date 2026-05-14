'use client';

import { useState, useCallback, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { Agent, AgentType, AgentOpenSource } from '../api/types';

/** hover 时预连接外部域名，加速后续跳转 */
function prefetchExternalUrl(url: string) {
  try {
    const origin = new URL(url).origin;
    // 避免重复插入
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
    // ignore invalid url
  }
}

export const AGENT_TYPE_CONFIG: Record<
  AgentType,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bg: string;
    border: string;
    gradient: string;
  }
> = {
  general: {
    label: '通用自主',
    icon: Icons.sparkles,
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    gradient: 'from-violet-500/10 to-transparent'
  },
  research: {
    label: '深度研究',
    icon: Icons.search,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    gradient: 'from-blue-500/10 to-transparent'
  },
  builder: {
    label: '构建平台',
    icon: Icons.settings,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    gradient: 'from-emerald-500/10 to-transparent'
  },
  computer: {
    label: '电脑操控',
    icon: Icons.laptop,
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/20',
    gradient: 'from-orange-500/10 to-transparent'
  },
  creative: {
    label: '垂直创意',
    icon: Icons.palette,
    color: 'text-pink-600 dark:text-pink-400',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/20',
    gradient: 'from-pink-500/10 to-transparent'
  },
  proactive: {
    label: '主动感知',
    icon: Icons.trendingUp,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
    gradient: 'from-amber-500/10 to-transparent'
  }
};

export const OPEN_SOURCE_CONFIG: Record<AgentOpenSource, { label: string; color: string }> = {
  open: {
    label: '开源',
    color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
  },
  closed: { label: '闭源', color: 'text-slate-500 bg-slate-500/10 border-slate-500/20' },
  partial: {
    label: '部分开源',
    color: 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20'
  }
};

const AGENT_TYPE_FALLBACK: (typeof AGENT_TYPE_CONFIG)[AgentType] = {
  label: '其他',
  icon: Icons.sparkles,
  color: 'text-muted-foreground',
  bg: 'bg-muted/30',
  border: 'border-border',
  gradient: 'from-muted/20 to-transparent'
};

const OPEN_SOURCE_FALLBACK: (typeof OPEN_SOURCE_CONFIG)[AgentOpenSource] = {
  label: '未知',
  color: 'text-muted-foreground bg-muted/30 border-border'
};

export function AgentCard({ agent }: { agent: Agent }) {
  const type = AGENT_TYPE_CONFIG[agent.agent_type] ?? AGENT_TYPE_FALLBACK;
  const oss = OPEN_SOURCE_CONFIG[agent.open_source] ?? OPEN_SOURCE_FALLBACK;
  const TypeIcon = type.icon;
  const isExternal = agent.url !== '#';
  const isGithub = agent.url.includes('github.com');

  const [clicking, setClicking] = useState(false);
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = useCallback(() => {
    if (isExternal) prefetchExternalUrl(agent.url);
  }, [isExternal, agent.url]);

  const handleClick = useCallback(() => {
    if (!isExternal) return;
    setClicking(true);
    // 新标签页打开后 2s 重置状态（窗口不失焦时也能还原）
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setClicking(false), 2000);
  }, [isExternal]);

  const cardContent = (
    <>
      {/* Featured badge */}
      {agent.is_featured && (
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
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors',
            isGithub ? 'bg-slate-500/10' : type.bg,
            clicking && 'opacity-70'
          )}
        >
          {clicking ? (
            <Icons.spinner
              className={cn('h-4 w-4 animate-spin', isGithub ? 'text-slate-500' : type.color)}
            />
          ) : isGithub ? (
            <Icons.github className='h-4 w-4 text-slate-600 dark:text-slate-300' />
          ) : (
            <TypeIcon className={cn('h-4 w-4', type.color)} />
          )}
        </div>
        <div className='min-w-0 flex-1'>
          <h3 className='truncate text-sm font-semibold leading-tight text-foreground transition-colors group-hover:text-primary'>
            {agent.name}
          </h3>
          <p className='mt-0.5 truncate text-[11px] text-muted-foreground'>
            {isExternal ? agent.url.replace(/^https?:\/\//, '') : '内测中'}
          </p>
        </div>
        <Badge
          variant='outline'
          className={cn(
            'shrink-0 px-1.5 py-0.5 text-[10px] font-medium',
            isGithub ? 'border-slate-500/20 text-slate-500' : cn(type.color, type.border)
          )}
        >
          {isGithub ? 'GitHub' : type.label}
        </Badge>
      </div>

      {/* Description */}
      <p className='mb-4 line-clamp-2 flex-1 text-xs leading-relaxed text-muted-foreground'>
        {agent.description}
      </p>

      {/* Tags */}
      {agent.tags.length > 0 && (
        <div className='mb-4 flex flex-wrap gap-1'>
          {agent.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className='rounded-md border bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground'
            >
              {tag}
            </span>
          ))}
          {agent.tags.length > 3 && (
            <span className='rounded-md border bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground'>
              +{agent.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className='flex items-center justify-between'>
        <Badge variant='outline' className={cn('text-[10px]', oss.color)}>
          {oss.label}
        </Badge>
        {isExternal && (
          <span
            className={cn(
              'flex items-center gap-1 text-xs text-muted-foreground transition-opacity',
              clicking ? 'opacity-100 text-primary' : 'opacity-0 group-hover:opacity-100'
            )}
          >
            {clicking ? '打开中…' : '访问'} <Icons.externalLink className='h-3 w-3' />
          </span>
        )}
        {!isExternal && <span className='text-[10px] text-muted-foreground/60'>内测中</span>}
      </div>
    </>
  );

  const cardClass = cn(
    'group relative flex h-full flex-col rounded-xl border bg-card p-5 shadow-sm transition-all duration-200',
    'hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30',
    agent.is_featured && 'ring-1 ring-primary/20',
    clicking && 'scale-[0.99] border-primary/40 shadow-md'
  );

  if (isExternal) {
    return (
      <a
        href={agent.url}
        target='_blank'
        rel='noopener noreferrer'
        className={cardClass}
        onMouseEnter={handleMouseEnter}
        onClick={handleClick}
      >
        {cardContent}
      </a>
    );
  }

  return <div className={cardClass}>{cardContent}</div>;
}

export function AgentCardSkeleton() {
  return (
    <div className='flex flex-col rounded-xl border bg-card p-5 shadow-sm'>
      <div className='mb-3 flex items-start gap-3'>
        <div className='h-9 w-9 animate-pulse rounded-lg bg-muted' />
        <div className='flex-1 space-y-1.5'>
          <div className='h-4 w-3/4 animate-pulse rounded bg-muted' />
          <div className='h-3 w-1/2 animate-pulse rounded bg-muted' />
        </div>
        <div className='h-5 w-14 animate-pulse rounded bg-muted' />
      </div>
      <div className='mb-4 space-y-1.5'>
        <div className='h-3 w-full animate-pulse rounded bg-muted' />
        <div className='h-3 w-5/6 animate-pulse rounded bg-muted' />
      </div>
      <div className='mb-4 flex gap-1'>
        <div className='h-4 w-12 animate-pulse rounded bg-muted' />
        <div className='h-4 w-12 animate-pulse rounded bg-muted' />
        <div className='h-4 w-12 animate-pulse rounded bg-muted' />
      </div>
      <div className='h-4 w-10 animate-pulse rounded bg-muted' />
    </div>
  );
}
