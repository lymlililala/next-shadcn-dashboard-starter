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
    {
      url: `${BASE_URL}/news/best-mcp-servers-2026-100-ranked-categorized`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.92
    },
    {
      url: `${BASE_URL}/news/top-10-new-mcp-servers-may-2026-releases`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9
    },
    {
      url: `${BASE_URL}/tutorials/best-mcp-servers-2026-ranked-comprehensive-guide`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.95
    },
    {
      url: `${BASE_URL}/tutorials/how-to-install-mcp-server-claude-code-complete-guide`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.91
    },
    {
      url: `${BASE_URL}/tutorials/claude-code-vs-cursor-2026-complete-comparison`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.89
    },
    // News 详情页 — 新增（2026-05-12）
    {
      url: `${BASE_URL}/news/2025-best-ai-tools-new-releases-roundup`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.88
    },
    {
      url: `${BASE_URL}/news/openai-vs-anthropic-vs-google-2025-ai-battle`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9
    },
    {
      url: `${BASE_URL}/news/ai-agent-era-autonomous-ai-workflow-revolution-2025`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.91
    },
    {
      url: `${BASE_URL}/news/weekly-ai-tools-roundup-may-2026`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85
    },
    {
      url: `${BASE_URL}/news/multimodal-ai-tools-explained-use-cases-2025`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.88
    },
    // Tutorials 详情页 — 新增（2026-05-13）
    {
      url: `${BASE_URL}/tutorials/dify-vs-coze-vs-fastgpt-2026-comparison`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.91
    },
    {
      url: `${BASE_URL}/tutorials/ai-agent-prompt-engineering-guide-2026`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.92
    },
    {
      url: `${BASE_URL}/tutorials/github-copilot-vs-cursor-vs-claude-code-2026`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.93
    },
    // News 详情页 — 新增（2026-05-13）
    {
      url: `${BASE_URL}/news/claude-4-opus-sonnet-2026-release-analysis`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.92
    },
    {
      url: `${BASE_URL}/news/mcp-ecosystem-2026-100-servers-milestone`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9
    },
    {
      url: `${BASE_URL}/news/cursor-200-million-users-ai-ide-market-2026`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.87
    },
    // Tutorials 详情页 — 新增（2026-05-14）
    {
      url: `${BASE_URL}/tutorials/gemini-2-complete-guide-2026`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.93
    },
    {
      url: `${BASE_URL}/tutorials/perplexity-ai-complete-guide-tips-2026`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.92
    },
    {
      url: `${BASE_URL}/tutorials/china-ai-models-comparison-2026-kimi-doubao-qwen-deepseek`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.93
    },
    {
      url: `${BASE_URL}/tutorials/vector-database-comparison-pinecone-weaviate-chroma-2026`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9
    },
    // News 详情页 — 新增（2026-05-14）
    {
      url: `${BASE_URL}/news/gpt-5-release-date-features-2026-analysis`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.94
    },
    {
      url: `${BASE_URL}/news/ai-agent-funding-landscape-2026-q2`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.91
    },
    {
      url: `${BASE_URL}/news/openai-o3-o4-mini-benchmark-analysis-2026`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.9
    },
    // Tutorials 详情页 — 新增（2026-05-15）SEO/GEO 优化
    {
      url: `${BASE_URL}/tutorials/n8n-mcp-server-integration-guide-2026`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.93
    },
    {
      url: `${BASE_URL}/tutorials/dify-enterprise-knowledge-base`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.92
    },
    {
      url: `${BASE_URL}/tutorials/rag-knowledge-base-best-practices`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.91
    },
    // News 详情页 — 新增（2026-05-15）SEO/GEO 优化
    {
      url: `${BASE_URL}/news/mcp-ecosystem-architecture-evolution-2026`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.92
    },
    {
      url: `${BASE_URL}/news/ai-agent-framework-comparison-langgraph-crewai-autogen-2026`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.91
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
