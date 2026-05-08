import PageContainer from '@/components/layout/page-container';
import { getMcpServers, getFeaturedMcpServers, getMcpStats } from '@/features/mcp/api/service';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import type { McpServer, McpCategory } from '@/features/mcp/api/service';
import type { SearchParams } from 'nuqs/server';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const { resolvePageMeta } = await import('@/features/seo/api/service');
  const meta = await resolvePageMeta('/dashboard/mcp');
  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    alternates: { canonical: 'https://www.aiskillnav.com/mcp' },
    openGraph: meta.openGraph,
    twitter: meta.twitter
  };
}

const CATEGORY_CONFIG: Record<
  McpCategory,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bg: string }
> = {
  filesystem: {
    label: '文件系统',
    icon: Icons.page,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-500/10'
  },
  database: {
    label: '数据库',
    icon: Icons.settings,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10'
  },
  browser: {
    label: '浏览器',
    icon: Icons.laptop,
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-500/10'
  },
  devtools: {
    label: '开发工具',
    icon: Icons.github,
    color: 'text-slate-600 dark:text-slate-400',
    bg: 'bg-slate-500/10'
  },
  productivity: {
    label: '效率工具',
    icon: Icons.checks,
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-500/10'
  },
  search: {
    label: '搜索',
    icon: Icons.search,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10'
  },
  ai: {
    label: 'AI 模型',
    icon: Icons.sparkles,
    color: 'text-pink-600 dark:text-pink-400',
    bg: 'bg-pink-500/10'
  }
};

const CATEGORY_TABS = [
  { value: 'all', label: '全部' },
  ...Object.entries(CATEGORY_CONFIG).map(([v, c]) => ({ value: v, label: c.label }))
];

function McpCard({ server }: { server: McpServer }) {
  const cfg = CATEGORY_CONFIG[server.category];
  const CatIcon = cfg.icon;
  return (
    <Link
      href={`/mcp/${server.slug ?? server.name}`}
      className='group relative flex flex-col rounded-xl border bg-card p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30'
    >
      {server.is_featured && (
        <div className='absolute -top-2 right-3'>
          <span className='inline-flex items-center gap-0.5 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground'>
            <Icons.sparkles className='h-2.5 w-2.5' />
            推荐
          </span>
        </div>
      )}
      <div className='mb-3 flex items-center gap-2.5'>
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${cfg.bg}`}>
          <CatIcon className={`h-4 w-4 ${cfg.color}`} />
        </div>
        <div className='min-w-0'>
          <div className='flex items-center gap-1.5'>
            <span className='truncate text-sm font-semibold font-mono'>{server.name}</span>
            {server.is_official && (
              <Badge
                variant='outline'
                className='shrink-0 text-[9px] px-1 py-0 border-blue-500/30 text-blue-600'
              >
                官方
              </Badge>
            )}
          </div>
          <Badge variant='outline' className={`text-[10px] font-normal mt-0.5 ${cfg.color}`}>
            {cfg.label}
          </Badge>
        </div>
      </div>
      <p className='mb-3 flex-1 text-xs leading-relaxed text-muted-foreground line-clamp-2'>
        {server.description}
      </p>
      {server.install_cmd && (
        <code className='mb-3 rounded-md bg-muted px-2 py-1.5 text-[10px] font-mono text-foreground/80 block truncate'>
          {server.install_cmd}
        </code>
      )}
      <div className='flex items-center justify-between'>
        <div className='flex flex-wrap gap-1'>
          {server.tags.slice(0, 2).map((t) => (
            <span
              key={t}
              className='rounded border bg-muted/50 px-1.5 py-0.5 text-[10px] text-muted-foreground'
            >
              {t}
            </span>
          ))}
        </div>
        {server.stars !== undefined && (
          <span className='flex items-center gap-1 text-[11px] text-muted-foreground'>
            <Icons.exclusive className='h-3 w-3' />
            {server.stars >= 1000 ? `${(server.stars / 1000).toFixed(1)}k` : server.stars}
          </span>
        )}
      </div>
    </Link>
  );
}

type PageProps = { searchParams: Promise<SearchParams> };

export default async function McpPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const category = typeof params.mcp_cat === 'string' ? params.mcp_cat : 'all';

  const [{ items, total_items }, _featured, stats] = await Promise.all([
    getMcpServers({ limit: 50, category: category !== 'all' ? category : undefined }),
    getFeaturedMcpServers(),
    getMcpStats()
  ]);

  // Group by category for display
  const byCategory: Record<string, McpServer[]> = {};
  items.forEach((s) => {
    if (!byCategory[s.category]) byCategory[s.category] = [];
    byCategory[s.category].push(s);
  });

  return (
    <PageContainer
      pageTitle='MCP 专区'
      pageDescription='Model Context Protocol — AI Agent 的标准化工具接口，收录最实用的 MCP Server'
    >
      <div className='space-y-8'>
        {/* Stats */}
        <div className='grid grid-cols-3 gap-3'>
          {[
            {
              label: '收录 Server',
              value: stats.total,
              icon: Icons.settings,
              color: 'text-blue-600',
              bg: 'bg-blue-500/10'
            },
            {
              label: '官方维护',
              value: stats.official,
              icon: Icons.badgeCheck,
              color: 'text-emerald-600',
              bg: 'bg-emerald-500/10'
            },
            {
              label: '社区贡献',
              value: stats.total - stats.official,
              icon: Icons.github,
              color: 'text-violet-600',
              bg: 'bg-violet-500/10'
            }
          ].map((s) => (
            <div
              key={s.label}
              className='flex items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm'
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${s.bg}`}
              >
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <div>
                <p className='text-xl font-bold'>{s.value}</p>
                <p className='text-xs text-muted-foreground'>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* What is MCP */}
        <div className='rounded-xl border bg-gradient-to-r from-primary/5 to-transparent p-5'>
          <div className='flex items-start gap-3'>
            <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10'>
              <Icons.info className='h-4 w-4 text-primary' />
            </div>
            <div>
              <h2 className='text-sm font-semibold'>什么是 MCP？</h2>
              <p className='mt-1 text-xs leading-relaxed text-muted-foreground'>
                MCP（Model Context Protocol）是 Anthropic 发布的开放协议，让 AI
                模型能安全、标准化地连接外部工具。
                <br />
                <strong className='text-foreground'>类比：MCP 是 AI Agent 的 USB 接口</strong> —
                一次实现，到处可用。
              </p>
              <Link
                href='/tutorials/what-is-mcp'
                className='mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline'
              >
                了解更多 <Icons.chevronRight className='h-3 w-3' />
              </Link>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className='flex flex-wrap gap-1.5'>
          {CATEGORY_TABS.map((tab) => (
            <Link key={tab.value} href={tab.value === 'all' ? '/mcp' : `/mcp?mcp_cat=${tab.value}`}>
              <button
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                  category === tab.value || (tab.value === 'all' && !params.mcp_cat)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background text-muted-foreground hover:bg-accent'
                }`}
              >
                {tab.label}
              </button>
            </Link>
          ))}
        </div>

        {/* Server List — grouped by category when showing all */}
        {category === 'all' || !params.mcp_cat ? (
          <div className='space-y-8'>
            {Object.entries(CATEGORY_CONFIG).map(([cat, cfg]) => {
              const servers = byCategory[cat];
              if (!servers?.length) return null;
              const CatIcon = cfg.icon;
              return (
                <section key={cat}>
                  <div className='mb-3 flex items-center gap-2'>
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-lg ${cfg.bg}`}
                    >
                      <CatIcon className={`h-3.5 w-3.5 ${cfg.color}`} />
                    </div>
                    <h3 className='text-sm font-semibold'>{cfg.label}</h3>
                    <span className='text-xs text-muted-foreground'>({servers.length})</span>
                  </div>
                  <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                    {servers.map((s) => (
                      <McpCard key={s.id} server={s} />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {items.map((s) => (
              <McpCard key={s.id} server={s} />
            ))}
          </div>
        )}

        {total_items === 0 && (
          <div className='flex flex-col items-center justify-center py-16 text-center'>
            <Icons.search className='mb-3 h-10 w-10 text-muted-foreground/40' />
            <p className='text-sm text-muted-foreground'>暂无相关 MCP Server</p>
          </div>
        )}
      </div>
    </PageContainer>
  );
}
