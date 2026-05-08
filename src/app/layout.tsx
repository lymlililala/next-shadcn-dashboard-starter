import Providers from '@/components/layout/providers';
import { Toaster } from '@/components/ui/sonner';
import { fontVariables } from '@/components/themes/font.config';
import { DEFAULT_THEME, THEMES } from '@/components/themes/theme.config';
import ThemeProvider from '@/components/themes/theme-provider';
import { cn } from '@/lib/utils';
import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import NextTopLoader from 'nextjs-toploader';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import '../styles/globals.css';

const META_THEME_COLORS = {
  light: '#ffffff',
  dark: '#09090b'
};

export const metadata: Metadata = {
  metadataBase: new URL('https://aiskillnav.com'),
  title: {
    default: 'AI Skill Navigation — AI Agent 工具导航',
    template: '%s | AI Skill Navigation'
  },
  description:
    'AI Skill Navigation — 一站式 AI Agent 资源导航平台，收录精选 Skills、Agents、MCP Server、主流模型对比、实战教程与场景库，助你高效探索 AI Agent 生态。',
  keywords: [
    'AI Agent',
    'AI Skill',
    'MCP Server',
    'Model Context Protocol',
    'AI 工具导航',
    'AI 导航',
    'LLM',
    '大模型',
    '智能体',
    'AI Agent 教程',
    'OpenAI',
    'Claude',
    'DeepSeek',
    'Gemini',
    'Manus',
    'Devin',
    'AutoGPT',
    'Dify',
    'n8n',
    'AI 自动化',
    'Prompt Engineering',
    'AI Agent 场景'
  ],
  authors: [{ name: 'AI Skill Navigation', url: 'https://aiskillnav.com' }],
  creator: 'AI Skill Navigation',
  publisher: 'AI Skill Navigation',
  category: 'technology',
  // Open Graph — 影响微信/微博/Facebook 分享展示
  openGraph: {
    type: 'website',
    siteName: 'AI Skill Navigation',
    locale: 'zh_CN',
    url: 'https://aiskillnav.com',
    title: 'AI Skill Navigation — AI Agent 工具导航',
    description: '一站式 AI Agent 资源导航：Skills、Agents、MCP Server、模型对比、教程与场景库',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AI Skill Navigation — AI Agent 工具导航平台'
      }
    ]
  },
  // Twitter Card — 影响 Twitter/X 分享展示
  twitter: {
    card: 'summary_large_image',
    site: '@aiskillnav',
    creator: '@aiskillnav',
    title: 'AI Skill Navigation — AI Agent 工具导航',
    description: '一站式 AI Agent 资源导航：Skills、Agents、MCP Server、模型对比、教程与场景库',
    images: ['/og-image.png']
  },
  // 搜索引擎爬取规则
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },
  // 规范链接
  alternates: {
    canonical: 'https://aiskillnav.com'
  },
  // 图标
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico'
  }
};

export const viewport: Viewport = {
  themeColor: META_THEME_COLORS.light
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const activeThemeValue = cookieStore.get('active_theme')?.value;
  const isValidTheme = THEMES.some((t) => t.value === activeThemeValue);
  const themeToApply = isValidTheme ? activeThemeValue! : DEFAULT_THEME;

  return (
    <html lang='zh-CN' suppressHydrationWarning data-theme={themeToApply}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                // Set meta theme color
                if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '${META_THEME_COLORS.dark}')
                }
              } catch (_) {}
            `
          }}
        />
      </head>
      <body
        className={cn(
          'bg-background overflow-x-hidden overscroll-none font-sans antialiased',
          fontVariables
        )}
      >
        <NextTopLoader color='var(--primary)' showSpinner={false} />
        <NuqsAdapter>
          <ThemeProvider
            attribute='class'
            defaultTheme='system'
            enableSystem
            disableTransitionOnChange
            enableColorScheme
          >
            <Providers activeThemeValue={themeToApply}>
              <Toaster />
              {children}
            </Providers>
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
