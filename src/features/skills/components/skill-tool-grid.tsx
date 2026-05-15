'use client';

import { useSuspenseQuery } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import Link from 'next/link';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { skillToolsQueryOptions } from '../api/queries';
import type { SkillTool } from '../api/types';

const PAGE_SIZE = 24;

// OpenClaw Skills 分类颜色映射
const CATEGORY_STYLE: Record<string, { color: string; bg: string; icon: string }> = {
  开发工具: {
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10',
    icon: '🛠️'
  },
  效率与协作: { color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-500/10', icon: '📋' },
  中文平台: { color: 'text-red-600 dark:text-red-400', bg: 'bg-red-500/10', icon: '🇨🇳' },
  内容生成: { color: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-500/10', icon: '🎨' },
  'AI Agent': { color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-500/10', icon: '🤖' },
  网页与浏览器: { color: 'text-sky-600 dark:text-sky-400', bg: 'bg-sky-500/10', icon: '🌐' },
  邮件与通信: { color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-500/10', icon: '📧' },
  安全与审计: { color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-500/10', icon: '🔒' },
  工具与运维: { color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-500/10', icon: '🔧' }
};

const DEFAULT_STYLE = { color: 'text-muted-foreground', bg: 'bg-muted/30', icon: '📦' };

function getStyle(category: string) {
  return CATEGORY_STYLE[category] ?? DEFAULT_STYLE;
}

// 从 tags 推导 Capability Tags（能力标签）
function getCapabilityTags(tool: SkillTool): string[] {
  const tagMap: Record<string, string> = {
    github: '代码管理',
    code: '代码',
    scraping: '数据抓取',
    image: '图像生成',
    video: '视频生成',
    music: '音乐创作',
    email: '邮件',
    memory: '记忆持久化',
    agent: 'Agent 能力',
    automation: '自动化',
    search: '搜索',
    database: '数据库',
    translation: '多语言翻译',
    security: '安全审计',
    research: '学术研究',
    prd: '需求文档',
    presentation: '演示文稿',
    api: 'API 调用',
    monitoring: '监控',
    chinese: '中文优化',
    'multi-agent': '多 Agent',
    'prompt-injection': '安全防护',
    workflow: '工作流',
    free: '免费'
  };

  const caps: string[] = [];
  for (const tag of tool.tags ?? []) {
    if (tagMap[tag]) caps.push(tagMap[tag]);
  }
  return [...new Set(caps)].slice(0, 3);
}

function SkillToolCard({ tool }: { tool: SkillTool }) {
  const style = getStyle(tool.category);
  const capabilities = getCapabilityTags(tool);
  const isClawhub = tool.url.includes('clawhub.ai');
  const slug = tool.url.split('/').pop() ?? '';

  return (
    <Link
      href={tool.url}
      target='_blank'
      rel='noopener noreferrer'
      className='group relative flex flex-col rounded-xl border bg-card p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md'
    >
      {/* 推荐标记 */}
      {tool.is_featured && (
        <div className='absolute -top-2 right-3'>
          <span className='inline-flex items-center gap-0.5 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground'>
            <Icons.sparkles className='h-2.5 w-2.5' />
            推荐
          </span>
        </div>
      )}

      {/* Header */}
      <div className='mb-3 flex items-start gap-2.5'>
        <div
          className={cn(
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base',
            style.bg
          )}
        >
          {style.icon}
        </div>
        <div className='min-w-0 flex-1'>
          <div className='flex items-center gap-1.5'>
            <span className='truncate text-sm font-semibold'>{tool.name}</span>
            <Icons.externalLink className='h-3 w-3 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100' />
          </div>
          <Badge variant='outline' className={cn('mt-0.5 text-[10px] font-normal', style.color)}>
            {tool.category}
          </Badge>
        </div>
      </div>

      {/* Description */}
      <p className='mb-3 flex-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground'>
        {tool.description}
      </p>

      {/* Capability Tags */}
      {capabilities.length > 0 && (
        <div className='mb-3 flex flex-wrap gap-1'>
          {capabilities.map((cap) => (
            <span
              key={cap}
              className='rounded-md bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground'
            >
              {cap}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className='flex items-center justify-between'>
        {/* 来源 + 活跃标识 */}
        <div className='flex items-center gap-1.5'>
          {isClawhub && (
            <span className='flex items-center gap-0.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.5 text-[9px] font-medium text-emerald-600 dark:text-emerald-400'>
              <span className='h-1.5 w-1.5 rounded-full bg-emerald-500' />
              已验证
            </span>
          )}
        </div>

        {/* 安装命令提示 */}
        {isClawhub && slug && (
          <span className='hidden truncate rounded bg-muted/50 px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground/70 group-hover:inline-block'>
            install {slug}
          </span>
        )}
      </div>
    </Link>
  );
}

export function SkillToolCardSkeleton() {
  return (
    <div className='flex flex-col rounded-xl border bg-card p-4 shadow-sm'>
      <div className='mb-3 flex items-start gap-2.5'>
        <div className='h-9 w-9 animate-pulse rounded-lg bg-muted' />
        <div className='flex-1 space-y-1.5'>
          <div className='h-4 w-3/4 animate-pulse rounded bg-muted' />
          <div className='h-3 w-1/3 animate-pulse rounded bg-muted' />
        </div>
      </div>
      <div className='mb-3 space-y-1.5'>
        <div className='h-3 w-full animate-pulse rounded bg-muted' />
        <div className='h-3 w-5/6 animate-pulse rounded bg-muted' />
      </div>
      <div className='mb-3 flex gap-1'>
        <div className='h-4 w-14 animate-pulse rounded bg-muted' />
        <div className='h-4 w-14 animate-pulse rounded bg-muted' />
      </div>
      <div className='h-3 w-1/2 animate-pulse rounded bg-muted' />
    </div>
  );
}

export function SkillToolGrid() {
  const [params, setParams] = useQueryStates(
    {
      skill_tool_page: parseAsInteger.withDefault(1),
      skill_tool_search: parseAsString.withDefault(''),
      skill_tool_cat: parseAsString.withDefault('all')
    },
    { shallow: true }
  );

  const filters = {
    page: params.skill_tool_page,
    limit: PAGE_SIZE,
    status: 'published',
    ...(params.skill_tool_search && { search: params.skill_tool_search }),
    ...(params.skill_tool_cat !== 'all' && { category: params.skill_tool_cat })
  };

  const { data } = useSuspenseQuery(skillToolsQueryOptions(filters));
  const totalPages = Math.ceil(data.total_items / PAGE_SIZE);
  const hasFilter = params.skill_tool_search !== '' || params.skill_tool_cat !== 'all';

  if (data.items.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-16 text-center'>
        <div className='mb-3 flex h-12 w-12 items-center justify-center rounded-xl border bg-muted/50'>
          <Icons.search className='h-5 w-5 text-muted-foreground' />
        </div>
        <p className='text-sm font-medium'>未找到相关 Skill</p>
        <p className='mt-1 text-xs text-muted-foreground'>尝试描述你的需求，比如"帮我分析代码"</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <p className='text-xs text-muted-foreground'>
        共 <span className='font-medium text-foreground'>{data.total_items}</span> 个 Skill
        {hasFilter && <span>（已过滤）</span>}
      </p>

      <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
        {data.items.map((tool) => (
          <SkillToolCard key={tool.id} tool={tool} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className='flex items-center justify-center gap-1 pt-2'>
          <Button
            variant='outline'
            size='sm'
            className='h-7 w-7 p-0'
            disabled={params.skill_tool_page <= 1}
            onClick={() => setParams({ ...params, skill_tool_page: params.skill_tool_page - 1 })}
          >
            <Icons.chevronLeft className='h-3.5 w-3.5' />
          </Button>

          {(() => {
            const current = params.skill_tool_page;
            const visible = new Set(
              [1, totalPages, current, current - 1, current + 1].filter(
                (p) => p >= 1 && p <= totalPages
              )
            );
            const pages = Array.from(visible).sort((a, b) => a - b);
            const items: React.ReactNode[] = [];
            for (let i = 0; i < pages.length; i++) {
              if (i > 0 && pages[i] - pages[i - 1] > 1) {
                items.push(
                  <span key={`e-${i}`} className='px-1 text-xs text-muted-foreground'>
                    …
                  </span>
                );
              }
              const p = pages[i];
              items.push(
                <Button
                  key={p}
                  variant={current === p ? 'default' : 'outline'}
                  size='sm'
                  className='h-7 w-7 p-0 text-xs'
                  onClick={() => setParams({ ...params, skill_tool_page: p })}
                >
                  {p}
                </Button>
              );
            }
            return items;
          })()}

          <Button
            variant='outline'
            size='sm'
            className='h-7 w-7 p-0'
            disabled={params.skill_tool_page >= totalPages}
            onClick={() => setParams({ ...params, skill_tool_page: params.skill_tool_page + 1 })}
          >
            <Icons.chevronRight className='h-3.5 w-3.5' />
          </Button>
        </div>
      )}
    </div>
  );
}

export function SkillToolGridSkeleton() {
  return (
    <div className='space-y-4'>
      <div className='h-4 w-24 animate-pulse rounded bg-muted' />
      <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
        {Array.from({ length: 12 }).map((_, i) => (
          <SkillToolCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
