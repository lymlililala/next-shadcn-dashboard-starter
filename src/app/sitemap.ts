import type { MetadataRoute } from 'next';

const BASE_URL = 'https://aiskillnav.com';

/**
 * 动态生成 sitemap.xml
 * 访问地址: /sitemap.xml
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // 静态页面 — 高优先级
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1.0
    },
    {
      url: `${BASE_URL}/skills`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9
    },
    {
      url: `${BASE_URL}/agents`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9
    },
    {
      url: `${BASE_URL}/mcp`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85
    },
    {
      url: `${BASE_URL}/models`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85
    },
    {
      url: `${BASE_URL}/tutorials`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85
    },
    {
      url: `${BASE_URL}/usecases`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8
    },
    {
      url: `${BASE_URL}/news`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9
    },
    // 教程详情页 — 深度内容，高 SEO 价值
    {
      url: `${BASE_URL}/tutorials/deepseek-r1-local-deployment`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9
    },
    {
      url: `${BASE_URL}/tutorials/manus-vs-autogpt-vs-openclaw`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.88
    },
    {
      url: `${BASE_URL}/tutorials/ai-agent-complete-guide-2026`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.92
    },
    {
      url: `${BASE_URL}/tutorials/mcp-server-vs-function-calling`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.88
    },
    {
      url: `${BASE_URL}/tutorials/what-is-mcp`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9
    },
    {
      url: `${BASE_URL}/tutorials/openclaw-personal-assistant`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.85
    },
    {
      url: `${BASE_URL}/tutorials/cursor-claude-opus-agent-setup-2026`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.92
    },
    {
      url: `${BASE_URL}/tutorials/agent-reasoning-vs-streaming-tradeoff`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9
    },
    // News 详情页 — 热点资讯，高价值
    {
      url: `${BASE_URL}/news/anthropic-claude-opus-4-1-2026-reasoning`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.88
    },
    // 通用页面
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5
    },
    {
      url: `${BASE_URL}/privacy-policy`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3
    },
    {
      url: `${BASE_URL}/terms-of-service`,
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3
    }
  ];

  return staticPages;
}
