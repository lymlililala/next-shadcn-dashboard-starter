import type { Metadata } from 'next';
import Link from 'next/link';
import { Icons } from '@/components/icons';
import { HomeNavbar } from '@/components/layout/home-navbar';
import { getAgentStats } from '@/features/agents/api/service';
import { getMcpStats } from '@/features/mcp/api/service';
import { getModelStats } from '@/features/models/api/service';
import { getUseCaseStats } from '@/features/usecases/api/service';
import { getTutorialStats } from '@/features/tutorials/api/service';
import { getNewsStats } from '@/features/news/api/service';

export const metadata: Metadata = {
  title: 'AI Skill Navigation — AI Agent 工具导航',
  description:
    'aiskillnav.com — 一站式 AI Agent 资源导航，收录 Skills、Agents、MCP Server、模型对比、实战教程与场景库，帮助开发者和团队快速找到最优质的 AI 工具。',
  keywords: [
    'AI Agent',
    'AI Skill',
    'AI Skill Navigation',
    'MCP Server',
    'Model Context Protocol',
    'AI 工具导航',
    'AI Agent 工具',
    'AI 导航',
    'LLM',
    '大模型',
    '智能体',
    'OpenAI',
    'Claude',
    'DeepSeek',
    'Gemini',
    'Manus',
    'Devin',
    'Dify',
    'n8n',
    'AI 自动化',
    'AI Agent 教程',
    'AI Agent 场景'
  ],
  alternates: {
    canonical: 'https://aiskillnav.com'
  },
  openGraph: {
    title: 'AI Skill Navigation — AI Agent 工具导航',
    description:
      '一站式 AI Agent 资源导航，收录 Skills、Agents、MCP Server、模型对比、实战教程与场景库',
    url: 'https://aiskillnav.com',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI Skill Navigation — AI Agent 工具导航首页'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Skill Navigation — AI Agent 工具导航',
    description: '一站式 AI Agent 资源导航：Skills、Agents、MCP Server、模型对比、教程与场景库',
    images: ['/og-image.png']
  }
};

// ── Module cards ─────────────────────────────────────────────────────────────

const MODULES = [
  {
    icon: Icons.skillsHub,
    title: 'Skills 导航',
    description:
      '精选全球 AI Skill 资源站，覆盖 ClaWHub、OpenClaw 等官方平台及社区聚合站，一键直达。',
    href: '/skills',
    badge: '精选收录',
    badgeColor: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    gradient: 'from-blue-500/10 to-transparent',
    iconBg: 'bg-blue-500/10',
    iconColor: 'text-blue-600'
  },
  {
    icon: Icons.sparkles,
    title: 'Agent Hub',
    description: '汇聚 Manus、Devin、OpenClaw、Dify 等全球顶级 AI Agent 工具，支持类型筛选和对比。',
    href: '/agents',
    badge: '27+ Agents',
    badgeColor: 'bg-violet-500/10 text-violet-600 border-violet-500/20',
    gradient: 'from-violet-500/10 to-transparent',
    iconBg: 'bg-violet-500/10',
    iconColor: 'text-violet-600'
  },
  {
    icon: Icons.settings,
    title: 'MCP 专区',
    description:
      'Model Context Protocol Server 精选导航，让 AI 连接文件、数据库、GitHub、Notion 等工具，20+ 实用 Server。',
    href: '/mcp',
    badge: '20+ Servers',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    gradient: 'from-emerald-500/10 to-transparent',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-600'
  },
  {
    icon: Icons.trendingUp,
    title: '模型对比',
    description:
      'GPT-4o、Claude 3.5、DeepSeek-V3、Gemini 2.0 等主流模型横向对比，含能力评分、价格和 Benchmark 排行。',
    href: '/models',
    badge: '8 大模型',
    badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    gradient: 'from-amber-500/10 to-transparent',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-600'
  },
  {
    icon: Icons.post,
    title: '教程中心',
    description:
      '从"什么是 AI Agent"到实战操作，8 篇系统教程覆盖新手入门、MCP 使用、Dify 搭建、n8n 自动化。',
    href: '/tutorials',
    badge: '8 篇教程',
    badgeColor: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    gradient: 'from-orange-500/10 to-transparent',
    iconBg: 'bg-orange-500/10',
    iconColor: 'text-orange-600'
  },
  {
    icon: Icons.checks,
    title: '场景库',
    description:
      '15 个真实落地场景：营销自动化、自动修复 Bug、行业调研报告、邮件分类……附推荐工具组合和实现步骤。',
    href: '/usecases',
    badge: '15 个场景',
    badgeColor: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
    gradient: 'from-pink-500/10 to-transparent',
    iconBg: 'bg-pink-500/10',
    iconColor: 'text-pink-600'
  },
  {
    icon: Icons.trendingUp,
    title: 'AI News',
    description:
      '追踪 AI Agent 赛道重大事件：Manus 被 Meta 收购、DeepSeek-R1 开源、MCP 诞生……完整时间线。',
    href: '/news',
    badge: '实时更新',
    badgeColor: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
    gradient: 'from-rose-500/10 to-transparent',
    iconBg: 'bg-rose-500/10',
    iconColor: 'text-rose-600'
  }
];

// ── Stats ─────────────────────────────────────────────────────────────────────

async function getLiveStats() {
  const [agents, mcp, models, usecases, tutorials, news] = await Promise.all([
    getAgentStats().catch(() => ({ total: 0 })),
    getMcpStats().catch(() => ({ total: 0 })),
    getModelStats().catch(() => ({ total: 0 })),
    getUseCaseStats().catch(() => ({ total: 0 })),
    getTutorialStats().catch(() => ({ total: 0 })),
    getNewsStats().catch(() => ({ published: 0 }))
  ]);

  return { agents, mcp, models, usecases, tutorials, news };
}

function buildStats(live: Awaited<ReturnType<typeof getLiveStats>>) {
  return [
    { value: `${live.agents.total}+`, label: 'AI Agent', icon: Icons.sparkles },
    { value: `${live.mcp.total}+`, label: 'MCP Server', icon: Icons.settings },
    { value: `${live.models.total}`, label: '主流模型', icon: Icons.trendingUp },
    { value: `${live.usecases.total}`, label: '落地场景', icon: Icons.checks },
    { value: `${live.tutorials.total}`, label: '实战教程', icon: Icons.post },
    { value: `${live.news.published}`, label: '行业资讯', icon: Icons.info }
  ];
}

function patchModuleBadges(live: Awaited<ReturnType<typeof getLiveStats>>) {
  return MODULES.map((mod) => {
    switch (mod.href) {
      case '/agents':
        return { ...mod, badge: `${live.agents.total}+ Agents` };
      case '/mcp':
        return { ...mod, badge: `${live.mcp.total}+ Servers` };
      case '/models':
        return { ...mod, badge: `${live.models.total} 大模型` };
      case '/tutorials':
        return { ...mod, badge: `${live.tutorials.total} 篇教程` };
      case '/usecases':
        return { ...mod, badge: `${live.usecases.total} 个场景` };
      case '/news':
        return { ...mod, badge: `${live.news.published} 条资讯` };
      default:
        return mod;
    }
  });
}

// ── Timeline preview ──────────────────────────────────────────────────────────

const TIMELINE_PREVIEW = [
  { date: '2024-11', title: 'MCP 协议诞生', desc: 'AI Agent 接口标准化' },
  { date: '2025-01', title: 'DeepSeek-R1', desc: '开源推理，成本仅 3%' },
  { date: '2025-03', title: 'Manus 爆火', desc: '通用 Agent 元年到来' },
  { date: '2025-12', title: 'Meta 收购 Manus', desc: '巨头押注 Agent 赛道' }
];

// JSON-LD 结构化数据 — 提升 Google 搜索富结果展示
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'AI Skill Navigation',
  url: 'https://aiskillnav.com',
  description:
    '一站式 AI Agent 资源导航平台，收录精选 Skills、Agents、MCP Server、主流模型对比、实战教程与场景库',
  inLanguage: 'zh-CN',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://aiskillnav.com/skills?search={search_term_string}'
    },
    'query-input': 'required name=search_term_string'
  }
};

export default async function HomePage() {
  const liveStats = await getLiveStats();
  const STATS = buildStats(liveStats);
  const dynamicModules = patchModuleBadges(liveStats);
  return (
    <div className='min-h-screen bg-background text-foreground'>
      {/* JSON-LD 结构化数据 */}
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* ── Navbar ── */}
      <HomeNavbar />

      {/* ── Hero ── */}
      <section className='relative overflow-hidden border-b py-20 md:py-28'>
        {/* bg decoration */}
        <div className='pointer-events-none absolute inset-0 -z-10'>
          <div className='absolute left-1/2 top-0 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl' />
        </div>

        <div className='mx-auto max-w-4xl px-4 text-center md:px-6'>
          <div className='mb-4 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground shadow-sm'>
            <span className='flex h-1.5 w-1.5 rounded-full bg-emerald-500' />
            aiskillnav.com · AI Agent 工具导航
          </div>

          <h1 className='mb-5 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl'>
            发现最好的
            <span className='relative mx-2 text-primary'>AI Agent</span>
            工具
          </h1>

          <p className='mx-auto mb-8 max-w-2xl text-base text-muted-foreground md:text-lg'>
            汇聚全球 Skills、Agents、MCP Server、主流模型对比，
            <br className='hidden md:block' />
            配套教程和场景库，一站式 AI Agent 资源导航平台
          </p>

          <div className='flex flex-wrap justify-center gap-3'>
            <Link
              href='/skills'
              className='inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md'
            >
              <Icons.skillsHub className='h-4 w-4' />
              浏览 Skills
            </Link>
            <Link
              href='/agents'
              className='inline-flex items-center gap-2 rounded-xl border bg-card px-5 py-2.5 text-sm font-semibold shadow-sm transition-all hover:bg-accent hover:shadow-md'
            >
              <Icons.sparkles className='h-4 w-4' />
              探索 Agents
            </Link>
            <Link
              href='/news'
              className='inline-flex items-center gap-2 rounded-xl border bg-card px-5 py-2.5 text-sm font-semibold shadow-sm transition-all hover:bg-accent hover:shadow-md'
            >
              <Icons.trendingUp className='h-4 w-4' />
              AI News
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className='border-b bg-muted/30'>
        <div className='mx-auto max-w-6xl px-4 py-8 md:px-6'>
          <div className='grid grid-cols-3 gap-4 sm:grid-cols-6'>
            {STATS.map((s) => (
              <div key={s.label} className='flex flex-col items-center gap-1 text-center'>
                <p className='text-2xl font-bold text-foreground md:text-3xl'>{s.value}</p>
                <p className='text-xs text-muted-foreground'>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Module Grid ── */}
      <section className='py-16 md:py-20'>
        <div className='mx-auto max-w-6xl px-4 md:px-6'>
          <div className='mb-10 text-center'>
            <h2 className='text-2xl font-bold tracking-tight md:text-3xl'>全部模块</h2>
            <p className='mt-2 text-muted-foreground'>7 大功能模块，覆盖 AI Agent 使用的全部场景</p>
          </div>

          <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {dynamicModules.map((mod) => {
              const ModIcon = mod.icon;
              return (
                <Link
                  key={mod.href}
                  href={mod.href}
                  className={`group relative flex flex-col rounded-2xl border bg-gradient-to-br ${mod.gradient} p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-primary/30`}
                >
                  {/* Badge */}
                  <span
                    className={`absolute right-4 top-4 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${mod.badgeColor}`}
                  >
                    {mod.badge}
                  </span>

                  {/* Icon */}
                  <div
                    className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${mod.iconBg}`}
                  >
                    <ModIcon className={`h-5 w-5 ${mod.iconColor}`} />
                  </div>

                  {/* Content */}
                  <h3 className='mb-2 text-sm font-bold group-hover:text-primary transition-colors'>
                    {mod.title}
                  </h3>
                  <p className='flex-1 text-xs leading-relaxed text-muted-foreground'>
                    {mod.description}
                  </p>

                  {/* Arrow */}
                  <div className='mt-4 flex items-center gap-1 text-xs font-medium text-primary opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5'>
                    进入 <Icons.chevronRight className='h-3.5 w-3.5' />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Timeline Preview ── */}
      <section className='border-t border-b bg-muted/20 py-14 md:py-16'>
        <div className='mx-auto max-w-6xl px-4 md:px-6'>
          <div className='mb-8 flex items-center justify-between'>
            <div>
              <h2 className='text-xl font-bold tracking-tight md:text-2xl'>AI Agent 重大事件</h2>
              <p className='mt-1 text-sm text-muted-foreground'>2024 年至今，行业里程碑时间线</p>
            </div>
            <Link
              href='/news'
              className='flex items-center gap-1 text-xs text-primary hover:underline'
            >
              查看全部 <Icons.chevronRight className='h-3.5 w-3.5' />
            </Link>
          </div>

          <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
            {TIMELINE_PREVIEW.map((event) => (
              <div
                key={event.date}
                className='flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-sm'
              >
                <span className='text-[11px] font-mono text-primary/80'>{event.date}</span>
                <p className='text-sm font-semibold'>{event.title}</p>
                <p className='text-xs text-muted-foreground'>{event.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className='py-16 md:py-20'>
        <div className='mx-auto max-w-2xl px-4 text-center md:px-6'>
          <h2 className='mb-3 text-2xl font-bold tracking-tight md:text-3xl'>立即开始探索</h2>
          <p className='mb-8 text-muted-foreground'>
            从新手入门教程，到专业 Agent 工具，一站找到你需要的一切
          </p>
          <div className='flex flex-wrap justify-center gap-3'>
            <Link
              href='/tutorials/what-is-ai-agent'
              className='inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors'
            >
              <Icons.post className='h-4 w-4' />
              新手入门教程
            </Link>
            <Link
              href='/mcp'
              className='inline-flex items-center gap-2 rounded-xl border bg-card px-5 py-2.5 text-sm font-semibold shadow-sm hover:bg-accent transition-colors'
            >
              <Icons.settings className='h-4 w-4' />
              MCP 专区
            </Link>
            <Link
              href='/usecases'
              className='inline-flex items-center gap-2 rounded-xl border bg-card px-5 py-2.5 text-sm font-semibold shadow-sm hover:bg-accent transition-colors'
            >
              <Icons.checks className='h-4 w-4' />
              场景库
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className='border-t bg-muted/20 py-10'>
        <div className='mx-auto max-w-6xl px-4 md:px-6'>
          <div className='grid gap-8 sm:grid-cols-2 md:grid-cols-4'>
            {/* Brand */}
            <div className='space-y-3'>
              <div className='flex items-center gap-2'>
                <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
                  <Icons.skillsHub className='h-4 w-4' />
                </div>
                <span className='text-sm font-semibold'>AI Skill Navigation</span>
              </div>
              <p className='text-xs leading-relaxed text-muted-foreground'>
                一站式 AI Agent 工具导航，帮助开发者和团队发现最优质的 AI 工具。
              </p>
              <p className='text-xs text-muted-foreground'>aiskillnav.com</p>
            </div>

            {/* Nav columns */}
            {[
              {
                title: '工具导航',
                links: [
                  { label: 'Skills 导航', href: '/skills' },
                  { label: 'Agent Hub', href: '/agents' },
                  { label: 'MCP 专区', href: '/mcp' }
                ]
              },
              {
                title: '资源',
                links: [
                  { label: '模型对比', href: '/models' },
                  { label: '教程中心', href: '/tutorials' },
                  { label: '场景库', href: '/usecases' }
                ]
              },
              {
                title: '资讯',
                links: [
                  { label: 'AI News', href: '/news' },
                  { label: '新手教程', href: '/tutorials/what-is-ai-agent' },
                  { label: '场景库', href: '/usecases' }
                ]
              }
            ].map((col) => (
              <div key={col.title} className='space-y-3'>
                <p className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
                  {col.title}
                </p>
                <ul className='space-y-2'>
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className='text-xs text-muted-foreground hover:text-foreground transition-colors'
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className='mt-8 flex items-center justify-between border-t pt-6 text-xs text-muted-foreground'>
            <p>© {new Date().getFullYear()} AI Skill Navigation · aiskillnav.com</p>
            <p>All rights reserved</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
