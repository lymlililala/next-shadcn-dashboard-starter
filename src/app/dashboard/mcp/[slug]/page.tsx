import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getMcpBySlug, getAllMcpServers } from '@/features/mcp/api/service';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import PageContainer from '@/components/layout/page-container';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const server = await getMcpBySlug(slug);
  if (!server) return { title: 'MCP Server 不存在' };
  return {
    title: `${server.name} MCP Server — 安装教程与使用指南`,
    description: server.description,
    keywords: server.tags,
    alternates: { canonical: `https://www.aiskillnav.com/dashboard/mcp/${server.slug}` }
  };
}

export async function generateStaticParams() {
  try {
    const servers = await getAllMcpServers();
    return servers.map((s) => ({ slug: s.slug }));
  } catch {
    return [];
  }
}

const CATEGORY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  filesystem: {
    label: '文件系统',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-500/10 border-blue-500/20'
  },
  database: {
    label: '数据库',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10 border-emerald-500/20'
  },
  browser: {
    label: '浏览器',
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-500/10 border-orange-500/20'
  },
  devtools: {
    label: '开发工具',
    color: 'text-slate-600 dark:text-slate-400',
    bg: 'bg-slate-500/10 border-slate-500/20'
  },
  productivity: {
    label: '效率工具',
    color: 'text-violet-600 dark:text-violet-400',
    bg: 'bg-violet-500/10 border-violet-500/20'
  },
  search: {
    label: '搜索',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10 border-amber-500/20'
  },
  ai: {
    label: 'AI 模型',
    color: 'text-pink-600 dark:text-pink-400',
    bg: 'bg-pink-500/10 border-pink-500/20'
  }
};

function ConfigSection({ install_cmd, name }: { install_cmd?: string; name: string }) {
  if (!install_cmd) return null;

  const cursorConfig = JSON.stringify(
    {
      mcpServers: {
        [name]: {
          command: 'npx',
          args: [install_cmd.replace('npx ', '')]
        }
      }
    },
    null,
    2
  );

  return (
    <section className='space-y-4'>
      <h2 className='text-base font-semibold'>安装与配置</h2>

      <div className='space-y-3'>
        <div>
          <p className='mb-1.5 text-xs font-medium text-muted-foreground'>安装命令</p>
          <div className='flex items-center gap-2 rounded-lg border bg-muted px-3 py-2.5'>
            <Icons.settings className='h-3.5 w-3.5 shrink-0 text-muted-foreground' />
            <code className='flex-1 text-xs font-mono text-foreground'>{install_cmd}</code>
          </div>
        </div>

        <div>
          <p className='mb-1.5 text-xs font-medium text-muted-foreground'>
            Cursor / Claude Desktop 配置（
            <code className='rounded bg-muted px-1 text-[11px]'>mcp.json</code>）
          </p>
          <pre className='overflow-x-auto rounded-lg border bg-muted px-4 py-3 text-xs font-mono leading-relaxed'>
            {cursorConfig}
          </pre>
        </div>
      </div>
    </section>
  );
}

export default async function McpDetailPage({ params }: Props) {
  const { slug } = await params;
  const server = await getMcpBySlug(slug);
  if (!server) notFound();

  const cfg = CATEGORY_CONFIG[server.category] ?? CATEGORY_CONFIG['devtools'];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: `${server.name} MCP Server`,
    description: server.description,
    applicationCategory: 'DeveloperApplication',
    keywords: server.tags.join(', '),
    url: server.url
  };

  return (
    <PageContainer pageTitle={`${server.name} MCP Server`} pageDescription={server.description}>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className='mx-auto max-w-3xl space-y-8'>
        {/* Back */}
        <Link
          href='/dashboard/mcp'
          className='inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors'
        >
          <Icons.chevronLeft className='h-4 w-4' />
          返回 MCP 专区
        </Link>

        {/* Header */}
        <header className='space-y-4'>
          <div className='flex flex-wrap items-center gap-2'>
            <Badge variant='outline' className={`text-xs ${cfg.color} ${cfg.bg}`}>
              {cfg.label}
            </Badge>
            {server.is_official && (
              <Badge
                variant='outline'
                className='text-xs text-blue-600 bg-blue-500/10 border-blue-500/20'
              >
                <Icons.badgeCheck className='mr-1 h-3 w-3' />
                官方维护
              </Badge>
            )}
            {server.is_featured && (
              <Badge
                variant='outline'
                className='text-xs text-amber-600 bg-amber-500/10 border-amber-500/20'
              >
                <Icons.sparkles className='mr-1 h-3 w-3' />
                推荐
              </Badge>
            )}
          </div>

          <div className='flex items-center gap-3'>
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${cfg.bg}`}
            >
              <Icons.settings className={`h-6 w-6 ${cfg.color}`} />
            </div>
            <div>
              <h1 className='text-2xl font-bold font-mono'>{server.name}</h1>
              {server.stars !== undefined && (
                <span className='flex items-center gap-1 text-xs text-muted-foreground mt-0.5'>
                  <Icons.exclusive className='h-3 w-3' />
                  {server.stars >= 1000
                    ? `${(server.stars / 1000).toFixed(1)}k`
                    : server.stars}{' '}
                  stars
                </span>
              )}
            </div>
          </div>

          <p className='text-base leading-relaxed text-muted-foreground'>{server.description}</p>

          <div className='flex flex-wrap gap-1.5'>
            {server.tags.map((tag) => (
              <span
                key={tag}
                className='rounded-md bg-muted/50 border px-2 py-0.5 text-xs text-muted-foreground'
              >
                {tag}
              </span>
            ))}
          </div>
          <div className='border-b' />
        </header>

        {/* Install & Config */}
        <ConfigSection install_cmd={server.install_cmd} name={server.name} />

        {/* 使用场景 */}
        <section className='space-y-3'>
          <h2 className='text-base font-semibold'>典型使用场景</h2>
          <div className='rounded-xl border bg-muted/30 p-5 space-y-2'>
            {server.category === 'filesystem' && (
              <ul className='space-y-2 text-sm text-muted-foreground'>
                <li className='flex items-start gap-2'>
                  <Icons.check className='mt-0.5 h-4 w-4 shrink-0 text-emerald-500' />让 AI
                  读取本地代码文件，提供精准的代码审查建议
                </li>
                <li className='flex items-start gap-2'>
                  <Icons.check className='mt-0.5 h-4 w-4 shrink-0 text-emerald-500' />
                  自动整理文件夹结构，批量重命名或移动文件
                </li>
                <li className='flex items-start gap-2'>
                  <Icons.check className='mt-0.5 h-4 w-4 shrink-0 text-emerald-500' />
                  扫描目录生成项目文档或 README
                </li>
              </ul>
            )}
            {server.category === 'database' && (
              <ul className='space-y-2 text-sm text-muted-foreground'>
                <li className='flex items-start gap-2'>
                  <Icons.check className='mt-0.5 h-4 w-4 shrink-0 text-emerald-500' />
                  用自然语言查询数据库，无需记忆 SQL 语法
                </li>
                <li className='flex items-start gap-2'>
                  <Icons.check className='mt-0.5 h-4 w-4 shrink-0 text-emerald-500' />
                  分析数据库数据，生成图表和报告
                </li>
                <li className='flex items-start gap-2'>
                  <Icons.check className='mt-0.5 h-4 w-4 shrink-0 text-emerald-500' />
                  自动生成 Schema 迁移脚本
                </li>
              </ul>
            )}
            {server.category === 'browser' && (
              <ul className='space-y-2 text-sm text-muted-foreground'>
                <li className='flex items-start gap-2'>
                  <Icons.check className='mt-0.5 h-4 w-4 shrink-0 text-emerald-500' />
                  自动填写表单、点击按钮完成网页操作
                </li>
                <li className='flex items-start gap-2'>
                  <Icons.check className='mt-0.5 h-4 w-4 shrink-0 text-emerald-500' />
                  抓取网页内容并进行分析或摘要
                </li>
                <li className='flex items-start gap-2'>
                  <Icons.check className='mt-0.5 h-4 w-4 shrink-0 text-emerald-500' />
                  截图网页用于 UI 审查或记录
                </li>
              </ul>
            )}
            {server.category === 'devtools' && (
              <ul className='space-y-2 text-sm text-muted-foreground'>
                <li className='flex items-start gap-2'>
                  <Icons.check className='mt-0.5 h-4 w-4 shrink-0 text-emerald-500' />
                  AI 直接创建 PR、查看 Issues、提交代码
                </li>
                <li className='flex items-start gap-2'>
                  <Icons.check className='mt-0.5 h-4 w-4 shrink-0 text-emerald-500' />
                  自动化 CI/CD 流程，监控构建状态
                </li>
                <li className='flex items-start gap-2'>
                  <Icons.check className='mt-0.5 h-4 w-4 shrink-0 text-emerald-500' />
                  智能 Code Review，自动标注问题
                </li>
              </ul>
            )}
            {server.category === 'productivity' && (
              <ul className='space-y-2 text-sm text-muted-foreground'>
                <li className='flex items-start gap-2'>
                  <Icons.check className='mt-0.5 h-4 w-4 shrink-0 text-emerald-500' />
                  AI 自动整理知识库，按主题分类归档
                </li>
                <li className='flex items-start gap-2'>
                  <Icons.check className='mt-0.5 h-4 w-4 shrink-0 text-emerald-500' />
                  发送消息通知、管理日程和任务
                </li>
                <li className='flex items-start gap-2'>
                  <Icons.check className='mt-0.5 h-4 w-4 shrink-0 text-emerald-500' />
                  跨工具自动同步信息，减少手动操作
                </li>
              </ul>
            )}
            {server.category === 'search' && (
              <ul className='space-y-2 text-sm text-muted-foreground'>
                <li className='flex items-start gap-2'>
                  <Icons.check className='mt-0.5 h-4 w-4 shrink-0 text-emerald-500' />
                  实时获取最新信息，突破训练数据截止日期限制
                </li>
                <li className='flex items-start gap-2'>
                  <Icons.check className='mt-0.5 h-4 w-4 shrink-0 text-emerald-500' />
                  研究型 Agent 自动搜索并汇总多方来源
                </li>
                <li className='flex items-start gap-2'>
                  <Icons.check className='mt-0.5 h-4 w-4 shrink-0 text-emerald-500' />
                  监控竞品动态、市场变化
                </li>
              </ul>
            )}
            {server.category === 'ai' && (
              <ul className='space-y-2 text-sm text-muted-foreground'>
                <li className='flex items-start gap-2'>
                  <Icons.check className='mt-0.5 h-4 w-4 shrink-0 text-emerald-500' />
                  在一个对话中调用多个 AI 模型能力
                </li>
                <li className='flex items-start gap-2'>
                  <Icons.check className='mt-0.5 h-4 w-4 shrink-0 text-emerald-500' />
                  复杂推理任务拆解为链式步骤
                </li>
                <li className='flex items-start gap-2'>
                  <Icons.check className='mt-0.5 h-4 w-4 shrink-0 text-emerald-500' />
                  图像生成、语音合成等多模态任务
                </li>
              </ul>
            )}
          </div>
        </section>

        {/* GitHub Link */}
        <section className='rounded-xl border bg-muted/30 p-5 space-y-3'>
          <p className='text-sm font-medium'>查看源码 / 官方文档</p>
          <p className='text-xs text-muted-foreground'>
            访问 GitHub 仓库获取最新文档、配置说明和 issue 反馈。
          </p>
          <Link
            href={server.url}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors'
          >
            <Icons.github className='h-4 w-4' />在 GitHub 上查看
            <Icons.externalLink className='h-3.5 w-3.5' />
          </Link>
        </section>

        {/* Related Links */}
        <div className='rounded-xl border bg-muted/30 p-5 space-y-2'>
          <p className='text-xs font-semibold text-muted-foreground uppercase tracking-wide'>
            继续探索
          </p>
          <Link
            href='/dashboard/mcp'
            className='flex items-center justify-between rounded-lg border bg-card px-4 py-3 text-sm hover:border-primary/30 hover:bg-accent transition-colors'
          >
            <span className='font-medium'>浏览更多 MCP Server</span>
            <Icons.chevronRight className='h-4 w-4 text-muted-foreground' />
          </Link>
          <Link
            href='/dashboard/tutorials/what-is-mcp'
            className='flex items-center justify-between rounded-lg border bg-card px-4 py-3 text-sm hover:border-primary/30 hover:bg-accent transition-colors'
          >
            <span className='font-medium'>什么是 MCP？完整入门教程</span>
            <Icons.chevronRight className='h-4 w-4 text-muted-foreground' />
          </Link>
          <Link
            href='/dashboard/tutorials/mcp-server-vs-function-calling'
            className='flex items-center justify-between rounded-lg border bg-card px-4 py-3 text-sm hover:border-primary/30 hover:bg-accent transition-colors'
          >
            <span className='font-medium'>MCP vs Function Calling 深度对比</span>
            <Icons.chevronRight className='h-4 w-4 text-muted-foreground' />
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
