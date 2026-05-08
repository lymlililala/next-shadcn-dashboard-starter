////////////////////////////////////////////////////////////////////////////////
// 🛑 Nothing in here has anything to do with Nextjs, it's just a fake database
////////////////////////////////////////////////////////////////////////////////

import { matchSorter } from 'match-sorter';
import { delay } from './mock-api';

export type ArticleStatus = 'published' | 'draft' | 'archived';

export type Article = {
  id: number;
  slug: string;
  title: string;
  summary: string; // 摘要，用于列表页 / meta description
  content: string; // Markdown 正文
  cover_image?: string; // 封面图 URL（可选）
  tags: string[];
  status: ArticleStatus;
  seo_title?: string; // 自定义 <title>，留空则用 title
  seo_description?: string; // 自定义 meta description，留空则用 summary
  published_at?: string; // 发布时间（已发布时才有值）
  created_at: string;
  updated_at: string;
};

export type CreateArticlePayload = Omit<Article, 'id' | 'created_at' | 'updated_at'>;
export type UpdateArticlePayload = Partial<CreateArticlePayload>;

// ── 示例数据 ─────────────────────────────────────────────────────────────────

const ARTICLE_DATA: Omit<Article, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    slug: 'what-is-skill-hub',
    title: '什么是 AI Skill Navigation？AI 技能聚合导航全解析',
    summary:
      'AI Skill Navigation 是一个专注于汇聚 AI Skill Navigation网站链接的导航平台，帮助开发者和用户快速找到最优质的 AI 技能工具。本文详细介绍 AI Skill Navigation 的定位、收录标准和使用方法。',
    content: `# 什么是 AI Skill Navigation？

AI Skill Navigation 是一个专注于 **aiskillnav.com**的导航网站。我们不自己开发 Skill，而是精心收录来自全球和国内各大平台的优质 Skill 资源网站，帮助用户一站式发现和访问最好的 AI 技能工具。

## 我们收录什么？

- **官方平台**：ClaWHub、OpenClaw AI 等官方 Skill 市场
- **中文聚合站**：专为中国用户优化的 Skill 导航站
- **GitHub 仓库**：开源社区维护的 Skill 合集
- **工具网站**：辅助发现和使用 AI Skills 的工具

## 收录标准

1. 网站可正常访问
2. 内容与 AI Skills 直接相关
3. 有一定的更新维护频率
4. 对用户有实际帮助

## 如何使用

访问 [AI Skill Navigation](/dashboard/skills)，通过地区（国际/中文）和平台类型筛选，或直接搜索站点名称和描述，找到你需要的 Skill 资源网站。
`,
    tags: ['介绍', 'AI Skill Navigation', '指南'],
    status: 'published',
    seo_title: '什么是 AI Skill Navigation？AI 技能聚合导航全解析',
    seo_description:
      'AI Skill Navigation 是专注 aiskillnav.com的导航网站，收录全球和国内优质 Skill 平台。了解我们的收录标准和使用方法。',
    published_at: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString()
  },
  {
    slug: 'top-skill-sites-2025',
    title: '2025 年最值得收藏的 AI Skill Navigation网站盘点',
    summary:
      '本文精选 2025 年最优质的 AI Skill Navigation网站，涵盖官方市场、中文聚合平台、GitHub 仓库等多个类别，帮助你快速找到最适合自己的 Skill 获取渠道。',
    content: `# 2025 年最值得收藏的 AI Skill Navigation网站

随着 AI Agent 生态的快速发展，越来越多的 Skill 资源网站涌现出来。本文为你精选 2025 年最值得收藏的平台。

## 官方平台

### ClaWHub
官方 Skill 市场，由社区开发者发布和审核，是获取高质量 Skill 的首选。

### OpenClaw AI
官网含完整的 Skill 生态介绍和开发者文档，适合想深入了解 Skill 开发的用户。

## 中文平台

### SkillHub 腾讯版
腾讯出品，13000+ 技能，中文搜索，国内节点访问速度快，是中国用户的首选。

### 小龙虾 Skills
245 个技能，按 10 大使用场景分类，含套装搭配推荐，新手友好。

## 如何选择？

- **想快速找到某类 Skill**：推荐 SkillHub 腾讯版（数量最多）
- **想了解官方最新动态**：推荐 ClaWHub 官方市场
- **国内网络访问**：推荐中文镜像站
`,
    tags: ['推荐', 'Skill 资源', '2025'],
    status: 'published',
    seo_title: '2025 最值得收藏的 AI Skill Navigation网站盘点 | AI Skill Navigation',
    seo_description:
      '精选 2025 年最优质的 AI Skill Navigation网站，涵盖官方市场、中文平台、GitHub 仓库，快速找到最适合你的 Skill 获取渠道。',
    published_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
  },
  {
    slug: 'how-to-use-ai-skills',
    title: '如何高效使用 AI Skills：从入门到进阶',
    summary:
      '本文系统介绍如何高效发现、安装和使用 AI Skills，包括如何在不同平台寻找适合自己需求的技能，以及常见的使用技巧和注意事项。',
    content: `# 如何高效使用 AI Skills

AI Skills 是扩展 AI 助手能力的重要方式。本文帮助你从零开始，高效地发现和使用各类 AI Skill。

## 第一步：明确需求

在寻找 Skill 之前，先明确你要解决什么问题：
- 代码相关：代码审查、自动补全、调试助手
- 内容创作：文章生成、SEO 优化、翻译
- 数据分析：数据可视化、报表生成

## 第二步：选择合适的平台

根据你的需求选择平台：
1. **官方平台**：质量有保证，但数量相对较少
2. **中文聚合站**：数量多，有中文介绍，适合中文用户
3. **GitHub**：开源透明，可查看代码，适合开发者

## 第三步：评估 Skill 质量

- 查看描述是否清晰
- 检查最近更新时间
- 参考社区评价

## 常见误区

- 不要安装过多 Skill，会影响响应速度
- 优先选择有明确使用场景的专用 Skill
`,
    tags: ['教程', '使用技巧', 'AI Skills'],
    status: 'published',
    seo_title: '如何高效使用 AI Skills：从入门到进阶教程',
    seo_description:
      '系统介绍如何发现、安装和高效使用 AI Skills，包括平台选择、质量评估和常见使用技巧。',
    published_at: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString()
  },
  {
    slug: 'skill-hub-update-202501',
    title: 'AI Skill Navigation 收录更新：新增多个优质中文平台',
    summary:
      '本月新收录了多个优质的中文 AI Skill Navigation网站，包括腾讯出品的聚合站和多个专注细分场景的工具平台。',
    content: `# AI Skill Navigation 收录更新

## 本月新增收录

### 新增官方/中文平台

- **龙虾技能库** (longxiaskill.com) — 免费技能/插件/模型资源
- **SkillsBot.cn** — ClawHub 中文镜像，含中文教程

### 更新理由

这些平台经过我们的审核，满足以下标准：
- ✅ 网站可正常访问
- ✅ 内容持续更新
- ✅ 对用户有实际价值

## 下期预告

我们正在审核更多社区提交的站点，欢迎[提交你知道的优质站点](#)。
`,
    tags: ['更新日志', '新收录', '公告'],
    status: 'published',
    seo_title: 'AI Skill Navigation 收录更新：新增多个优质中文平台',
    seo_description: '新增多个优质中文 AI Skill 平台收录，包括腾讯聚合站和细分工具平台。',
    published_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
  },
  {
    slug: 'ai-skill-development-guide',
    title: '如何开发一个 AI Skill：完整开发指南',
    summary:
      '想为 AI 助手开发自己的 Skill？本文从零开始介绍 AI Skill 的开发流程，包括设计规范、开发工具和发布到官方市场的完整步骤。',
    content: `# 如何开发一个 AI Skill

> 本文正在撰写中...

## 概述

AI Skill 开发是一个将特定功能封装为可复用模块的过程。
`,
    tags: ['开发', '教程', 'Skill 开发'],
    status: 'draft',
    published_at: undefined
  }
];

let _nextId = ARTICLE_DATA.length + 1;

export const fakeArticles = {
  records: [] as Article[],

  initialize() {
    this.records = ARTICLE_DATA.map((a, i) => ({
      ...a,
      id: i + 1,
      created_at: new Date(
        Date.now() - (ARTICLE_DATA.length - i) * 2 * 24 * 3600 * 1000
      ).toISOString(),
      updated_at: new Date(Date.now() - i * 3600 * 1000).toISOString()
    }));
    _nextId = this.records.length + 1;
  },

  async getArticles({
    page = 1,
    limit = 10,
    search,
    status,
    tag,
    sort
  }: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    tag?: string;
    sort?: string;
  }) {
    await delay(300);
    let items = [...this.records];

    if (status && status !== 'all') {
      items = items.filter((a) => a.status === status);
    }
    if (tag) {
      items = items.filter((a) => a.tags.includes(tag));
    }
    if (search) {
      items = matchSorter(items, search, {
        keys: ['title', 'summary', 'tags', 'slug']
      });
    }
    if (sort) {
      try {
        const sortItems = JSON.parse(sort) as { id: string; desc: boolean }[];
        if (sortItems.length > 0) {
          const { id, desc } = sortItems[0];
          items.sort((a, b) => {
            const aVal = String((a as Record<string, unknown>)[id] ?? '').toLowerCase();
            const bVal = String((b as Record<string, unknown>)[id] ?? '').toLowerCase();
            return desc ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
          });
        }
      } catch {
        /* ignore */
      }
    } else {
      // 默认按 published_at 倒序，draft 排最后
      items.sort((a, b) => {
        if (a.status === 'draft' && b.status !== 'draft') return 1;
        if (b.status === 'draft' && a.status !== 'draft') return -1;
        const aTime = a.published_at ?? a.created_at;
        const bTime = b.published_at ?? b.created_at;
        return bTime.localeCompare(aTime);
      });
    }

    const total_items = items.length;
    const paginatedItems = items.slice((page - 1) * limit, page * limit);
    return { items: paginatedItems, total_items };
  },

  async getPublishedArticles({
    page = 1,
    limit = 9,
    tag
  }: { page?: number; limit?: number; tag?: string } = {}) {
    await delay(250);
    let items = this.records.filter((a) => a.status === 'published');
    if (tag) {
      items = items.filter((a) => a.tags.includes(tag));
    }
    items.sort((a, b) => (b.published_at ?? '').localeCompare(a.published_at ?? ''));
    const total_items = items.length;
    return { items: items.slice((page - 1) * limit, page * limit), total_items };
  },

  async getArticleBySlug(slug: string): Promise<Article | null> {
    await delay(200);
    return this.records.find((a) => a.slug === slug && a.status === 'published') ?? null;
  },

  async getArticleById(id: number): Promise<Article | null> {
    await delay(200);
    return this.records.find((a) => a.id === id) ?? null;
  },

  async getAllTags(): Promise<string[]> {
    await delay(100);
    const tags = new Set<string>();
    this.records
      .filter((a) => a.status === 'published')
      .forEach((a) => a.tags.forEach((t) => tags.add(t)));
    return Array.from(tags).toSorted();
  },

  async createArticle(payload: CreateArticlePayload): Promise<Article> {
    await delay(400);
    const now = new Date().toISOString();
    const article: Article = { ...payload, id: _nextId++, created_at: now, updated_at: now };
    this.records.push(article);
    return article;
  },

  async updateArticle(id: number, payload: UpdateArticlePayload): Promise<Article | null> {
    await delay(300);
    const idx = this.records.findIndex((a) => a.id === id);
    if (idx === -1) return null;
    const now = new Date().toISOString();
    // 如果从 draft 改为 published，自动设置 published_at
    const isPublishing = payload.status === 'published' && this.records[idx].status !== 'published';
    this.records[idx] = {
      ...this.records[idx],
      ...payload,
      published_at: isPublishing ? now : (payload.published_at ?? this.records[idx].published_at),
      updated_at: now
    };
    return this.records[idx];
  },

  async deleteArticle(id: number): Promise<boolean> {
    await delay(200);
    const idx = this.records.findIndex((a) => a.id === id);
    if (idx === -1) return false;
    this.records.splice(idx, 1);
    return true;
  }
};

fakeArticles.initialize();
