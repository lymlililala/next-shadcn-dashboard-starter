'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Icons } from '@/components/icons';

const NAV_GROUPS = [
  {
    label: '概览',
    items: [
      {
        title: '数据概览',
        href: '/admin/analytics',
        icon: Icons.trendingUp,
        description: '统计与分布'
      }
    ]
  },
  {
    label: 'Skills 管理',
    items: [
      {
        title: 'Skill 管理',
        href: '/admin/skills',
        icon: Icons.skillsHub,
        description: '增删改查'
      },
      {
        title: 'Skill 审核',
        href: '/admin/review',
        icon: Icons.checks,
        description: '待审核列表'
      }
    ]
  },
  {
    label: 'Agent 管理',
    items: [
      {
        title: 'Agent 管理',
        href: '/admin/agents',
        icon: Icons.sparkles,
        description: '增删改查'
      },
      {
        title: 'Agent 审核',
        href: '/admin/agents/review',
        icon: Icons.circleCheck,
        description: '待审核列表'
      }
    ]
  },
  {
    label: '内容管理',
    items: [
      {
        title: 'News 管理',
        href: '/admin/news',
        icon: Icons.trendingUp,
        description: 'AI 行业资讯'
      },
      {
        title: 'MCP 管理',
        href: '/admin/mcp',
        icon: Icons.page,
        description: 'MCP Server 列表'
      },
      {
        title: '模型对比管理',
        href: '/admin/models',
        icon: Icons.sparkles,
        description: 'AI 模型 & Benchmark'
      },
      {
        title: '教程中心管理',
        href: '/admin/tutorials',
        icon: Icons.post,
        description: 'AI Agent 教程'
      },
      {
        title: '场景库管理',
        href: '/admin/usecases',
        icon: Icons.kanban,
        description: '行业应用场景'
      }
    ]
  },
  {
    label: '设置',
    items: [
      {
        title: 'SEO 管理',
        href: '/admin/seo',
        icon: Icons.search,
        description: '关键词 / 标题 / 描述'
      }
    ]
  }
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch('/api/admin/auth', { method: 'DELETE' });
    router.push('/admin/login');
    router.refresh();
  }

  return (
    <aside className='flex w-56 shrink-0 flex-col border-r bg-card'>
      {/* Brand */}
      <div className='flex h-14 items-center gap-2.5 border-b px-4'>
        <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
          <Icons.skillsHub className='h-4 w-4' />
        </div>
        <div className='flex flex-col leading-tight'>
          <span className='text-sm font-semibold'>AI Skill Navigation</span>
          <span className='text-[10px] tracking-wide text-muted-foreground uppercase'>
            管理后台
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className='flex flex-1 flex-col gap-4 overflow-y-auto p-3'>
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className='mb-1 px-3 text-[10px] font-semibold tracking-widest text-muted-foreground/60 uppercase'>
              {group.label}
            </p>
            <div className='space-y-0.5'>
              {group.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}
                  >
                    <item.icon className='h-4 w-4 shrink-0' />
                    <div className='flex flex-col'>
                      <span className='font-medium leading-tight'>{item.title}</span>
                      <span
                        className={cn(
                          'text-[11px] leading-tight',
                          isActive ? 'text-primary-foreground/70' : 'text-muted-foreground'
                        )}
                      >
                        {item.description}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer: back to front + logout */}
      <div className='border-t p-3 space-y-0.5'>
        <Link
          href='/skills'
          className='flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
        >
          <Icons.externalLink className='h-3.5 w-3.5 shrink-0' />
          <span>查看前台展示</span>
        </Link>
        <button
          onClick={handleLogout}
          className='flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive'
        >
          <Icons.logout className='h-3.5 w-3.5 shrink-0' />
          <span>退出登录</span>
        </button>
      </div>
    </aside>
  );
}
