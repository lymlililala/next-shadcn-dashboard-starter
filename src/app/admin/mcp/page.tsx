import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getMcpServers, getMcpStats } from '@/features/mcp/api/service';
import type { McpServer } from '@/features/mcp/api/service';

export const metadata = {
  title: 'MCP Server 管理 | AI Skill Navigation 管理后台'
};

const CATEGORY_LABEL: Record<string, string> = {
  filesystem: '文件系统',
  database: '数据库',
  browser: '浏览器',
  devtools: '开发工具',
  productivity: '效率工具',
  search: '搜索',
  ai: 'AI 模型'
};

const CATEGORY_COLOR: Record<string, string> = {
  filesystem: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
  database: 'text-blue-600 bg-blue-500/10 border-blue-500/20',
  browser: 'text-violet-600 bg-violet-500/10 border-violet-500/20',
  devtools: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20',
  productivity: 'text-orange-600 bg-orange-500/10 border-orange-500/20',
  search: 'text-pink-600 bg-pink-500/10 border-pink-500/20',
  ai: 'text-cyan-600 bg-cyan-500/10 border-cyan-500/20'
};

function McpRow({ item }: { item: McpServer }) {
  const catColor = CATEGORY_COLOR[item.category] ?? '';
  const catLabel = CATEGORY_LABEL[item.category] ?? item.category;

  return (
    <div className='flex items-center gap-4 rounded-lg border bg-card px-4 py-3 shadow-sm'>
      <div className='min-w-0 flex-1'>
        <div className='flex items-center gap-2'>
          <span className='font-mono text-sm font-semibold'>{item.name}</span>
          {item.is_featured && <Icons.sparkles className='h-3.5 w-3.5 shrink-0 text-amber-500' />}
          {item.is_official && (
            <Badge
              variant='outline'
              className='text-[10px] text-sky-600 bg-sky-500/10 border-sky-500/20'
            >
              官方
            </Badge>
          )}
        </div>
        <p className='mt-0.5 text-xs text-muted-foreground line-clamp-1'>{item.description}</p>
        {item.install_cmd && (
          <p className='mt-1 font-mono text-[11px] text-muted-foreground/70'>{item.install_cmd}</p>
        )}
      </div>
      <div className='flex shrink-0 items-center gap-2'>
        <Badge variant='outline' className={`text-[10px] ${catColor}`}>
          {catLabel}
        </Badge>
        {item.stars != null && (
          <span className='flex items-center gap-1 text-[11px] text-muted-foreground'>
            <Icons.sparkles className='h-3 w-3' />
            {item.stars >= 1000 ? `${(item.stars / 1000).toFixed(1)}k` : item.stars}
          </span>
        )}
        <Link
          href={item.url}
          target='_blank'
          className='rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
        >
          <Icons.externalLink className='h-3.5 w-3.5' />
        </Link>
      </div>
    </div>
  );
}

export default async function AdminMcpPage() {
  const [{ items }, stats] = await Promise.all([getMcpServers({ limit: 100 }), getMcpStats()]);

  const byCategory = stats.byCategory as Record<string, number>;

  return (
    <PageContainer
      pageTitle='MCP Server 管理'
      pageDescription='管理 MCP 专区收录的 MCP Server 列表，支持增删改查'
      pageHeaderAction={
        <div className='flex gap-2'>
          <Button variant='outline' size='sm' asChild>
            <Link href='/dashboard/mcp' target='_blank'>
              <Icons.externalLink className='mr-1.5 h-3.5 w-3.5' />
              查看前台
            </Link>
          </Button>
          <Button size='sm'>
            <Icons.add className='mr-1.5 h-4 w-4' />
            添加 Server
          </Button>
        </div>
      }
    >
      <div className='space-y-6'>
        {/* 统计卡片 */}
        <div className='grid grid-cols-3 gap-3'>
          {[
            {
              label: '全部 Server',
              value: stats.total,
              icon: Icons.page,
              color: 'text-blue-600',
              bg: 'bg-blue-500/10'
            },
            {
              label: '官方维护',
              value: stats.official,
              icon: Icons.circleCheck,
              color: 'text-emerald-600',
              bg: 'bg-emerald-500/10'
            },
            {
              label: '社区贡献',
              value: stats.total - stats.official,
              icon: Icons.teams,
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

        {/* 分类分布 */}
        <div className='rounded-xl border bg-card p-4'>
          <p className='mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
            分类分布
          </p>
          <div className='flex flex-wrap gap-2'>
            {Object.entries(byCategory).map(([cat, count]) => (
              <div
                key={cat}
                className='flex items-center gap-1.5 rounded-lg border bg-muted/30 px-3 py-1.5'
              >
                <span
                  className={`h-2 w-2 rounded-full ${CATEGORY_COLOR[cat]?.split(' ')[2] ?? 'bg-muted'}`}
                />
                <span className='text-xs font-medium'>{CATEGORY_LABEL[cat] ?? cat}</span>
                <span className='text-xs text-muted-foreground'>{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* MCP Server 列表，按分类分组 */}
        {Object.entries(CATEGORY_LABEL).map(([cat, label]) => {
          const catItems = items.filter((m) => m.category === cat);
          if (catItems.length === 0) return null;
          return (
            <div key={cat} className='space-y-2'>
              <div className='flex items-center gap-2'>
                <Badge variant='outline' className={`text-[10px] ${CATEGORY_COLOR[cat] ?? ''}`}>
                  {label}
                </Badge>
                <span className='text-xs text-muted-foreground'>{catItems.length} 个</span>
              </div>
              <div className='space-y-2'>
                {catItems.map((item) => (
                  <McpRow key={item.id} item={item} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </PageContainer>
  );
}
