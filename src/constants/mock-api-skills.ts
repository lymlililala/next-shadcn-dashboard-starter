////////////////////////////////////////////////////////////////////////////////
// 🛑 Nothing in here has anything to do with Nextjs, it's just a fake database
////////////////////////////////////////////////////////////////////////////////

import { matchSorter } from 'match-sorter';
import { delay } from './mock-api';

// 平台类型：官方市场 / 第三方聚合 / GitHub 仓库 / 中文镜像 / 社区论坛 / 工具网站
export type SitePlatform =
  | 'official' // 官方发布的市场/文档
  | 'mirror' // 中文镜像站
  | 'github' // GitHub 仓库
  | 'aggregator' // 第三方聚合站
  | 'community' // 社区/论坛
  | 'tool'; // 工具/辅助网站

// 地区：国际 / 中国大陆
export type SiteRegion = 'global' | 'cn';

// 收录状态
export type SiteStatus = 'published' | 'pending' | 'rejected' | 'draft';

export type Site = {
  id: number;
  name: string;
  description: string;
  url: string;
  platform: SitePlatform;
  region: SiteRegion;
  tags: string[];
  is_featured: boolean;
  status: SiteStatus;
  review_note?: string;
  created_at: string;
  updated_at: string;
};

export type CreateSitePayload = Omit<Site, 'id' | 'created_at' | 'updated_at'>;
export type UpdateSitePayload = Partial<CreateSitePayload>;

// ── 示例数据 ─────────────────────────────────────────────────────────────────

const SITE_DATA: Omit<Site, 'id' | 'created_at' | 'updated_at'>[] = [
  // ── 官方 / 国际 ─────────────────────────────────────────────────────────
  {
    name: 'ClaWHub',
    url: 'https://clawhub.com',
    description: '官方 Skill 市场，最权威的来源，Skills 由社区开发者发布和审核',
    platform: 'official',
    region: 'global',
    tags: ['官方市场', '技能发现', '社区'],
    is_featured: true,
    status: 'published'
  },
  {
    name: 'OpenClaw AI',
    url: 'https://openclaw.ai',
    description: 'OpenClaw 官网，含 Skill 生态介绍、开发者文档与安装指南',
    platform: 'official',
    region: 'global',
    tags: ['官方', '文档', '开发者'],
    is_featured: true,
    status: 'published'
  },
  {
    name: 'openclaw/openclaw',
    url: 'https://github.com/openclaw/openclaw',
    description: '官方 GitHub 仓库，可直接找社区 Skill、提交 Issue 和贡献代码',
    platform: 'github',
    region: 'global',
    tags: ['GitHub', '开源', '社区贡献'],
    is_featured: false,
    status: 'published'
  },
  // ── 中文 / 国内 ──────────────────────────────────────────────────────────
  {
    name: 'SkillHub 腾讯版',
    url: 'https://skillhub.tencent.com',
    description: '腾讯出品，13000+ 技能，中文搜索，国内节点下载快',
    platform: 'aggregator',
    region: 'cn',
    tags: ['腾讯', '中文', '国内加速', '大量技能'],
    is_featured: true,
    status: 'published'
  },
  {
    name: 'SkillHub.cn',
    url: 'https://www.skillhub.cn',
    description: '面向中国用户，精选 Top 50 Skills，经安全审核，适合新手入门',
    platform: 'aggregator',
    region: 'cn',
    tags: ['精选', '中文', '新手友好'],
    is_featured: true,
    status: 'published'
  },
  {
    name: 'SkillsBot.cn',
    url: 'https://www.skillsbot.cn',
    description: 'ClawHub 中文镜像，分类更细，含中文教程和使用案例',
    platform: 'mirror',
    region: 'cn',
    tags: ['中文镜像', '教程', '详细分类'],
    is_featured: false,
    status: 'published'
  },
  {
    name: '小龙虾 Skills',
    url: 'https://www.xiaolongxia.app/skills',
    description: '245个技能，10大场景分类，含踩坑提醒和套装搭配推荐',
    platform: 'aggregator',
    region: 'cn',
    tags: ['245+ 技能', '场景分类', '套装推荐'],
    is_featured: true,
    status: 'published'
  },
  {
    name: '龙虾技能库',
    url: 'https://longxiaskill.com',
    description: '龙虾技能库，免费技能/插件/模型资源，持续更新，覆盖多个 AI 平台',
    platform: 'aggregator',
    region: 'cn',
    tags: ['免费资源', '插件', '模型', '持续更新'],
    is_featured: false,
    status: 'published'
  },
  {
    name: 'OpenClaw 中文版',
    url: 'https://openclawai.org.cn',
    description: '龙虾官方中文版，支持一键安装、多平台集成，中文界面友好',
    platform: 'mirror',
    region: 'cn',
    tags: ['官方中文', '一键安装', '多平台'],
    is_featured: true,
    status: 'published'
  },
  // ── 社区 / 论坛 ──────────────────────────────────────────────────────────
  {
    name: 'Reddit r/ClawHub',
    url: 'https://reddit.com/r/clawhub',
    description: '英文社区，讨论 Skill 开发、分享使用技巧与最新资源',
    platform: 'community',
    region: 'global',
    tags: ['Reddit', '英文社区', '技巧分享'],
    is_featured: false,
    status: 'published'
  },
  {
    name: '龙虾技能交流群',
    url: 'https://t.me/clawhub_cn',
    description: 'Telegram 中文频道，实时推送新技能、讨论使用心得',
    platform: 'community',
    region: 'cn',
    tags: ['Telegram', '中文', '实时更新'],
    is_featured: false,
    status: 'published'
  },
  // ── 工具 ──────────────────────────────────────────────────────────────────
  {
    name: 'Skill Rank',
    url: 'https://skillrank.io',
    description: 'Skills 排行榜与使用数据统计，帮助发现当前最热门的 AI 技能',
    platform: 'tool',
    region: 'global',
    tags: ['排行榜', '数据统计', '趋势'],
    is_featured: false,
    status: 'published'
  },
  // ── 工具 / 开发者 ──────────────────────────────────────────────────────────
  {
    name: 'Awesome Claude Prompts',
    url: 'https://github.com/langgptai/awesome-claude-prompts',
    description:
      'GitHub 上最全的 Claude 提示词合集，包含 200+ 高质量提示词和 Skill 配置模板，开发者必备参考',
    platform: 'github',
    region: 'global',
    tags: ['Claude', 'Prompt', 'GitHub', '提示词'],
    is_featured: false,
    status: 'published' as const
  },
  {
    name: 'Awesome MCP Servers',
    url: 'https://github.com/punkpeye/awesome-mcp-servers',
    description:
      '社区维护的 MCP Server 精选列表，覆盖各类工具、数据库、API 集成，是发现新 MCP Server 的最佳入口',
    platform: 'github',
    region: 'global',
    tags: ['MCP', 'GitHub', 'Awesome列表', 'Server集合'],
    is_featured: true,
    status: 'published' as const
  },
  {
    name: 'Claude Skills 官方文档',
    url: 'https://docs.anthropic.com/en/docs/build-with-claude/skills',
    description: 'Anthropic 官方 Skills 开发文档，包含 API 规范、最佳实践、测试方法',
    platform: 'official',
    region: 'global',
    tags: ['官方文档', 'Anthropic', 'API', '开发者'],
    is_featured: true,
    status: 'published' as const
  },
  {
    name: 'LangChain Hub',
    url: 'https://smith.langchain.com/hub',
    description: 'LangChain 官方 Prompt Hub，共享可复用的 Chain、Agent 配置和提示词模板',
    platform: 'official',
    region: 'global',
    tags: ['LangChain', 'Prompt Hub', '模板', 'Chain'],
    is_featured: false,
    status: 'published' as const
  },
  {
    name: 'FlowGPT',
    url: 'https://flowgpt.com',
    description:
      '全球最大 AI 提示词分享平台，50万+ 提示词，包含大量 Claude Skill 配置和 System Prompt',
    platform: 'aggregator',
    region: 'global',
    tags: ['提示词', '社区分享', '50万+', 'System Prompt'],
    is_featured: true,
    status: 'published' as const
  },
  {
    name: 'PromptBase',
    url: 'https://promptbase.com',
    description: '提示词市场，可购买高质量提示词，涵盖 Claude、GPT、Midjourney 等主流 AI',
    platform: 'aggregator',
    region: 'global',
    tags: ['提示词市场', '付费', '高质量', '多平台'],
    is_featured: false,
    status: 'published' as const
  },
  {
    name: 'Dify Marketplace',
    url: 'https://marketplace.dify.ai',
    description: 'Dify 官方应用市场，收录数百个可一键部署的 AI 应用模板，包含大量 Agent 工作流',
    platform: 'official',
    region: 'global',
    tags: ['Dify', '工作流', '应用模板', '一键部署'],
    is_featured: true,
    status: 'published' as const
  },
  {
    name: 'n8n Workflow Templates',
    url: 'https://n8n.io/workflows',
    description: 'n8n 官方工作流模板库，1000+ AI 自动化工作流，涵盖邮件、CRM、社交媒体等场景',
    platform: 'official',
    region: 'global',
    tags: ['n8n', '工作流', '自动化', '模板库'],
    is_featured: false,
    status: 'published' as const
  },
  // ── 国内平台 ────────────────────────────────────────────────────────────────
  {
    name: 'Coze（扣子）',
    url: 'https://www.coze.cn',
    description: '字节跳动 AI Bot 平台，支持插件调用、工作流搭建，可发布到飞书/微信/抖音',
    platform: 'official',
    region: 'cn',
    tags: ['字节跳动', 'Bot平台', '插件', '工作流'],
    is_featured: true,
    status: 'published' as const
  },
  {
    name: '文心智能体',
    url: 'https://agents.baidu.com',
    description: '百度文心一言 Agent 平台，内置丰富插件，支持搜索增强、知识库问答、代码执行',
    platform: 'official',
    region: 'cn',
    tags: ['百度', '文心一言', 'Agent', '插件'],
    is_featured: false,
    status: 'published' as const
  },
  {
    name: '智谱 AI 智能体',
    url: 'https://agents.zhipuai.cn',
    description: '智谱 AI（GLM 系列）的智能体平台，支持联网检索、代码解释器、图片理解',
    platform: 'official',
    region: 'cn',
    tags: ['智谱', 'GLM', '智能体', '联网检索'],
    is_featured: false,
    status: 'published' as const
  },
  {
    name: '阿里云百炼应用广场',
    url: 'https://bailian.aliyun.com/market',
    description: '阿里云大模型服务平台应用广场，企业级 AI 应用，通义千问驱动，支持私有部署',
    platform: 'official',
    region: 'cn',
    tags: ['阿里云', '通义千问', '企业级', '私有部署'],
    is_featured: false,
    status: 'published' as const
  },
  {
    name: 'AI 研究所',
    url: 'https://www.aiyanjiu.com',
    description: '国内 AI 应用场景库，收录 500+ 中文 AI 提示词和使用案例，按职业和场景分类',
    platform: 'aggregator',
    region: 'cn',
    tags: ['中文提示词', '场景案例', '500+', '职业分类'],
    is_featured: false,
    status: 'published' as const
  },
  {
    name: 'AI 帮个忙',
    url: 'https://aibang.run',
    description: '中文 AI 工具导航，汇聚国内外 200+ AI 工具，按功能分类清晰，每日更新',
    platform: 'aggregator',
    region: 'cn',
    tags: ['工具导航', '200+', '功能分类', '每日更新'],
    is_featured: false,
    status: 'published' as const
  },
  // ── 待审核示例 ────────────────────────────────────────────────────────────
  {
    name: 'AI Skills Weekly',
    url: 'https://aiskillsweekly.substack.com',
    description: '每周精选 AI Skills 资讯邮件，适合想跟上最新动态的用户',
    platform: 'community',
    region: 'global',
    tags: ['Newsletter', '每周精选', '英文'],
    is_featured: false,
    status: 'pending',
    review_note: ''
  },
  {
    name: 'Claw Skills 中文导航',
    url: 'https://clawskills.cn',
    description: '中文技能导航站，分类整理了 300+ 个 AI 技能链接',
    platform: 'aggregator',
    region: 'cn',
    tags: ['导航', '中文', '300+ 链接'],
    is_featured: false,
    status: 'pending',
    review_note: ''
  },
  {
    name: '某已下线站点',
    url: 'https://deadsite.example.com',
    description: '该站点已无法访问',
    platform: 'aggregator',
    region: 'cn',
    tags: [],
    is_featured: false,
    status: 'rejected',
    review_note: 'URL 无法访问，网站已下线'
  }
];

let _nextId = SITE_DATA.length + 1;

export const fakeSites = {
  records: [] as Site[],

  initialize() {
    this.records = SITE_DATA.map((s, i) => ({
      ...s,
      id: i + 1,
      created_at: new Date(Date.now() - Math.random() * 365 * 24 * 3600 * 1000).toISOString(),
      updated_at: new Date(Date.now() - Math.random() * 30 * 24 * 3600 * 1000).toISOString()
    }));
    _nextId = this.records.length + 1;
  },

  async getSites({
    page = 1,
    limit = 12,
    search,
    platform,
    region,
    status,
    sort
  }: {
    page?: number;
    limit?: number;
    search?: string;
    platform?: string;
    region?: string;
    status?: string;
    sort?: string;
  }) {
    await delay(300);
    let items = [...this.records];

    if (platform && platform !== 'all') {
      items = items.filter((s) => s.platform === platform);
    }
    if (region && region !== 'all') {
      items = items.filter((s) => s.region === region);
    }
    if (status && status !== 'all') {
      items = items.filter((s) => s.status === status);
    }
    if (search) {
      items = matchSorter(items, search, {
        keys: ['name', 'description', 'tags', 'url']
      });
    }
    if (sort) {
      try {
        const sortItems = JSON.parse(sort) as { id: string; desc: boolean }[];
        if (sortItems.length > 0) {
          const { id, desc } = sortItems[0];
          items.sort((a, b) => {
            const aVal = (a as Record<string, unknown>)[id];
            const bVal = (b as Record<string, unknown>)[id];
            const aStr = String(aVal ?? '').toLowerCase();
            const bStr = String(bVal ?? '').toLowerCase();
            return desc ? bStr.localeCompare(aStr) : aStr.localeCompare(bStr);
          });
        }
      } catch {
        /* ignore */
      }
    }

    const total_items = items.length;
    const paginatedItems = items.slice((page - 1) * limit, page * limit);
    return { items: paginatedItems, total_items };
  },

  async getFeaturedSites(): Promise<Site[]> {
    await delay(200);
    return this.records.filter((s) => s.is_featured && s.status === 'published');
  },

  async getSiteById(id: number): Promise<Site | null> {
    await delay(200);
    return this.records.find((s) => s.id === id) ?? null;
  },

  async getStats() {
    await delay(150);
    const published = this.records.filter((s) => s.status === 'published');
    const total = published.length;
    const featured = published.filter((s) => s.is_featured).length;
    const pending = this.records.filter((s) => s.status === 'pending').length;
    const rejected = this.records.filter((s) => s.status === 'rejected').length;
    const byPlatform = published.reduce(
      (acc, s) => {
        acc[s.platform] = (acc[s.platform] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    const byRegion = published.reduce(
      (acc, s) => {
        acc[s.region] = (acc[s.region] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    return { total, featured, pending, rejected, byPlatform, byRegion };
  },

  async createSite(payload: CreateSitePayload): Promise<Site> {
    await delay(400);
    const now = new Date().toISOString();
    const newSite: Site = { ...payload, id: _nextId++, created_at: now, updated_at: now };
    this.records.push(newSite);
    return newSite;
  },

  async updateSite(id: number, payload: UpdateSitePayload): Promise<Site | null> {
    await delay(300);
    const idx = this.records.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    this.records[idx] = { ...this.records[idx], ...payload, updated_at: new Date().toISOString() };
    return this.records[idx];
  },

  async deleteSite(id: number): Promise<boolean> {
    await delay(200);
    const idx = this.records.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    this.records.splice(idx, 1);
    return true;
  },

  async reviewSite(id: number, action: 'approve' | 'reject', note?: string): Promise<Site | null> {
    await delay(300);
    const idx = this.records.findIndex((s) => s.id === id);
    if (idx === -1) return null;
    this.records[idx] = {
      ...this.records[idx],
      status: action === 'approve' ? 'published' : 'rejected',
      review_note: note ?? '',
      updated_at: new Date().toISOString()
    };
    return this.records[idx];
  }
};

fakeSites.initialize();
