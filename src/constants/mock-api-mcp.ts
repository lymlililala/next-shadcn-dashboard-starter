////////////////////////////////////////////////////////////////////////////////
// 🛑 Nothing in here has anything to do with Nextjs, it's just a fake database
////////////////////////////////////////////////////////////////////////////////

import { matchSorter } from 'match-sorter';
import { delay } from './mock-api';

export type McpCategory =
  | 'filesystem' // 文件系统
  | 'database' // 数据库
  | 'browser' // 浏览器/网页
  | 'devtools' // 开发工具
  | 'productivity' // 效率工具
  | 'search' // 数据/搜索
  | 'ai'; // AI 模型

export type McpServer = {
  id: number;
  name: string;
  description: string;
  url: string;
  category: McpCategory;
  is_official: boolean; // 是否 Anthropic 官方维护
  install_cmd?: string; // npm install / pip install 命令
  tags: string[];
  stars?: number; // GitHub stars (近似)
  is_featured: boolean;
  created_at: string;
};

const MCP_DATA: Omit<McpServer, 'id' | 'created_at'>[] = [
  // ── 文件系统 ──────────────────────────────────────────────────────────────
  {
    name: 'filesystem',
    description: '读写本地文件系统，支持文件创建、修改、删除、目录遍历，是最常用的 MCP Server 之一',
    url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem',
    category: 'filesystem',
    is_official: true,
    install_cmd: 'npx @modelcontextprotocol/server-filesystem',
    tags: ['文件读写', '目录', '本地文件', '官方'],
    stars: 28000,
    is_featured: true
  },
  {
    name: 'everything',
    description: 'Windows 平台文件极速搜索，通过 Everything 引擎实现毫秒级文件定位',
    url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/everything',
    category: 'filesystem',
    is_official: true,
    install_cmd: 'npx @modelcontextprotocol/server-everything',
    tags: ['Windows', '文件搜索', 'Everything', '官方'],
    stars: 28000,
    is_featured: false
  },
  // ── 数据库 ────────────────────────────────────────────────────────────────
  {
    name: 'sqlite',
    description: '读写 SQLite 数据库，支持执行 SQL 查询、创建表、插入更新数据，适合本地开发调试',
    url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/sqlite',
    category: 'database',
    is_official: true,
    install_cmd: 'npx @modelcontextprotocol/server-sqlite',
    tags: ['SQLite', '数据库', 'SQL', '官方'],
    stars: 28000,
    is_featured: true
  },
  {
    name: 'postgres',
    description: '连接 PostgreSQL 数据库执行查询，支持完整的 SQL 操作，适合生产环境数据分析',
    url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/postgres',
    category: 'database',
    is_official: true,
    install_cmd: 'npx @modelcontextprotocol/server-postgres',
    tags: ['PostgreSQL', '数据库', 'SQL', '官方'],
    stars: 28000,
    is_featured: false
  },
  {
    name: 'mysql',
    description: '连接 MySQL/MariaDB 数据库，支持查询、插入、更新等完整操作，社区维护',
    url: 'https://github.com/benborla/mcp-server-mysql',
    category: 'database',
    is_official: false,
    install_cmd: 'npx mcp-server-mysql',
    tags: ['MySQL', 'MariaDB', '数据库', '社区'],
    stars: 800,
    is_featured: false
  },
  // ── 浏览器/网页 ───────────────────────────────────────────────────────────
  {
    name: 'puppeteer',
    description:
      '通过 Puppeteer 控制 Chrome 浏览器，支持网页截图、表单填写、点击操作、JavaScript 执行',
    url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer',
    category: 'browser',
    is_official: true,
    install_cmd: 'npx @modelcontextprotocol/server-puppeteer',
    tags: ['Puppeteer', '浏览器自动化', 'Chrome', '官方'],
    stars: 28000,
    is_featured: true
  },
  {
    name: 'fetch',
    description: '抓取网页内容并转换为 Markdown 格式，AI 可直接阅读和分析任意网页',
    url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/fetch',
    category: 'browser',
    is_official: true,
    install_cmd: 'npx @modelcontextprotocol/server-fetch',
    tags: ['网页抓取', 'Markdown', 'HTTP', '官方'],
    stars: 28000,
    is_featured: true
  },
  {
    name: 'browserbase',
    description: '云端无头浏览器控制，无需本地安装 Chrome，通过 API 实现规模化浏览器自动化',
    url: 'https://github.com/browserbase/mcp-server-browserbase',
    category: 'browser',
    is_official: false,
    install_cmd: 'npx @browserbasehq/mcp',
    tags: ['云端浏览器', '无头', 'Browserbase'],
    stars: 1200,
    is_featured: false
  },
  // ── 开发工具 ──────────────────────────────────────────────────────────────
  {
    name: 'github',
    description: '完整的 GitHub 操作：创建 PR、查看 Issues、提交代码、管理仓库，开发者必备',
    url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/github',
    category: 'devtools',
    is_official: true,
    install_cmd: 'npx @modelcontextprotocol/server-github',
    tags: ['GitHub', 'PR', 'Issues', '代码仓库', '官方'],
    stars: 28000,
    is_featured: true
  },
  {
    name: 'gitlab',
    description: '对接 GitLab 实例，支持仓库操作、Merge Request、Pipeline 状态查询',
    url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/gitlab',
    category: 'devtools',
    is_official: true,
    install_cmd: 'npx @modelcontextprotocol/server-gitlab',
    tags: ['GitLab', 'MR', 'CI/CD', '官方'],
    stars: 28000,
    is_featured: false
  },
  {
    name: 'git',
    description: '本地 Git 仓库操作：commit、diff、log、branch 管理，无需离开 AI 界面',
    url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/git',
    category: 'devtools',
    is_official: true,
    install_cmd: 'npx @modelcontextprotocol/server-git',
    tags: ['Git', 'Commit', 'Diff', '版本控制', '官方'],
    stars: 28000,
    is_featured: false
  },
  // ── 效率工具 ──────────────────────────────────────────────────────────────
  {
    name: 'slack',
    description: '在 Slack 中收发消息、查询频道历史、管理通知，让 AI 融入团队沟通',
    url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/slack',
    category: 'productivity',
    is_official: true,
    install_cmd: 'npx @modelcontextprotocol/server-slack',
    tags: ['Slack', '消息', '团队协作', '官方'],
    stars: 28000,
    is_featured: false
  },
  {
    name: 'google-drive',
    description: '读写 Google Drive 文件，支持 Docs、Sheets、Slides 的创建和编辑',
    url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/gdrive',
    category: 'productivity',
    is_official: true,
    install_cmd: 'npx @modelcontextprotocol/server-gdrive',
    tags: ['Google Drive', 'Docs', 'Sheets', '云存储', '官方'],
    stars: 28000,
    is_featured: false
  },
  {
    name: 'google-maps',
    description: '地图搜索、地址解析、路线规划、周边 POI 查询，地理位置相关任务必备',
    url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/google-maps',
    category: 'productivity',
    is_official: true,
    install_cmd: 'npx @modelcontextprotocol/server-google-maps',
    tags: ['Google Maps', '地图', '地址查询', '官方'],
    stars: 28000,
    is_featured: false
  },
  {
    name: 'notion',
    description: '操作 Notion 数据库和页面，支持创建、查询、更新 Block，知识管理利器',
    url: 'https://github.com/makenotion/notion-mcp-server',
    category: 'productivity',
    is_official: false,
    install_cmd: 'npx @notionhq/notion-mcp-server',
    tags: ['Notion', '知识库', '数据库', '笔记'],
    stars: 3500,
    is_featured: true
  },
  // ── 数据/搜索 ─────────────────────────────────────────────────────────────
  {
    name: 'brave-search',
    description: 'Brave 搜索引擎实时搜索，无追踪隐私保护，返回结构化搜索结果',
    url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search',
    category: 'search',
    is_official: true,
    install_cmd: 'npx @modelcontextprotocol/server-brave-search',
    tags: ['Brave', '搜索', '实时', '隐私', '官方'],
    stars: 28000,
    is_featured: true
  },
  {
    name: 'tavily',
    description: 'AI 优化的搜索 API，专为 Agent 设计，返回高质量摘要而非原始链接列表',
    url: 'https://github.com/tavily-ai/tavily-mcp',
    category: 'search',
    is_official: false,
    install_cmd: 'npx tavily-mcp',
    tags: ['Tavily', 'AI搜索', '摘要', 'Agent专用'],
    stars: 2100,
    is_featured: true
  },
  {
    name: 'exa',
    description: '语义搜索引擎，理解搜索意图而非关键词匹配，适合复杂研究任务',
    url: 'https://github.com/exa-labs/exa-mcp-server',
    category: 'search',
    is_official: false,
    install_cmd: 'npx exa-mcp-server',
    tags: ['Exa', '语义搜索', '研究', 'RAG'],
    stars: 1800,
    is_featured: false
  },
  // ── AI 模型 ───────────────────────────────────────────────────────────────
  {
    name: 'openai',
    description: '在 Claude 中调用 GPT 系列模型，实现多模型协作，适合需要图像生成或特定能力的场景',
    url: 'https://github.com/openai/openai-mcp',
    category: 'ai',
    is_official: false,
    install_cmd: 'npx openai-mcp',
    tags: ['OpenAI', 'GPT-4', '多模型', 'DALL-E'],
    stars: 4200,
    is_featured: false
  },
  {
    name: 'sequential-thinking',
    description: '链式推理增强 Server，让 AI 在复杂问题上逐步思考，显著提升逻辑推理质量',
    url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking',
    category: 'ai',
    is_official: true,
    install_cmd: 'npx @modelcontextprotocol/server-sequential-thinking',
    tags: ['推理增强', '链式思考', 'CoT', '官方'],
    stars: 28000,
    is_featured: true
  },
  // ── 新增：效率工具 ──────────────────────────────────────────────────────────
  {
    name: 'linear',
    description: '连接 Linear 项目管理工具，AI 可查询/创建 Issues、管理 Sprint、追踪工作进度',
    url: 'https://github.com/linear/linear-mcp-server',
    category: 'productivity',
    is_official: false,
    install_cmd: 'npx @linear/mcp-server',
    tags: ['Linear', '项目管理', 'Issue追踪', 'Sprint'],
    stars: 2800,
    is_featured: false
  },
  {
    name: 'jira',
    description: '集成 Atlassian Jira，支持创建和查询 Tickets、管理 Sprint、读取项目看板状态',
    url: 'https://github.com/atlassian-labs/atlassian-mcp-server',
    category: 'productivity',
    is_official: false,
    install_cmd: 'npx @atlassian/mcp-server',
    tags: ['Jira', 'Atlassian', 'Ticket管理', '看板'],
    stars: 1900,
    is_featured: false
  },
  {
    name: 'calendar',
    description: 'Google Calendar 读写，AI 可查询日程、创建会议、设置提醒，提升时间管理效率',
    url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/gcalendar',
    category: 'productivity',
    is_official: true,
    install_cmd: 'npx @modelcontextprotocol/server-gcalendar',
    tags: ['Google Calendar', '日程管理', '会议创建', '官方'],
    stars: 28000,
    is_featured: false
  },
  {
    name: 'discord',
    description: '读取 Discord 频道消息、发送通知、管理服务器，适合构建自动化社区管理 Agent',
    url: 'https://github.com/discordjs/discord-mcp-server',
    category: 'productivity',
    is_official: false,
    install_cmd: 'npx discord-mcp',
    tags: ['Discord', '社区管理', '消息自动化', '通知'],
    stars: 950,
    is_featured: false
  },
  {
    name: 'confluence',
    description: '读写 Atlassian Confluence Wiki，AI 可搜索文档、创建页面、更新知识库内容',
    url: 'https://github.com/atlassian-labs/confluence-mcp-server',
    category: 'productivity',
    is_official: false,
    install_cmd: 'npx @atlassian/confluence-mcp',
    tags: ['Confluence', 'Wiki', '知识库', 'Atlassian'],
    stars: 1400,
    is_featured: false
  },
  // ── 新增：开发工具 ──────────────────────────────────────────────────────────
  {
    name: 'docker',
    description: '管理 Docker 容器和镜像，AI 可启动/停止容器、查看日志、管理 Docker Compose',
    url: 'https://github.com/ckreiling/mcp-server-docker',
    category: 'devtools',
    is_official: false,
    install_cmd: 'npx mcp-server-docker',
    tags: ['Docker', '容器管理', 'DevOps', '日志查看'],
    stars: 3200,
    is_featured: true
  },
  {
    name: 'kubernetes',
    description: '管理 Kubernetes 集群，查询 Pod 状态、部署应用、查看事件日志，DevOps 必备',
    url: 'https://github.com/strowk/mcp-k8s-go',
    category: 'devtools',
    is_official: false,
    install_cmd: 'npx mcp-k8s',
    tags: ['Kubernetes', 'K8s', 'DevOps', '集群管理'],
    stars: 2100,
    is_featured: false
  },
  {
    name: 'sentry',
    description: '连接 Sentry 错误追踪，AI 可查询错误详情、分析堆栈跟踪、关联代码问题',
    url: 'https://github.com/getsentry/sentry-mcp',
    category: 'devtools',
    is_official: false,
    install_cmd: 'npx sentry-mcp',
    tags: ['Sentry', '错误追踪', '堆栈分析', '监控'],
    stars: 1600,
    is_featured: false
  },
  {
    name: 'aws',
    description: '访问 AWS 云服务，查询 EC2/S3/Lambda 状态，管理云资源，适合 DevOps 自动化',
    url: 'https://github.com/aws/aws-mcp-server',
    category: 'devtools',
    is_official: false,
    install_cmd: 'npx @aws/mcp-server',
    tags: ['AWS', 'S3', 'EC2', 'Lambda', '云服务'],
    stars: 4500,
    is_featured: true
  },
  // ── 新增：数据库 ────────────────────────────────────────────────────────────
  {
    name: 'redis',
    description: '操作 Redis 缓存数据库，支持 GET/SET/查询 Key、分析内存使用、监控连接状态',
    url: 'https://github.com/redis-py/redis-mcp',
    category: 'database',
    is_official: false,
    install_cmd: 'npx redis-mcp',
    tags: ['Redis', '缓存', 'Key-Value', '内存数据库'],
    stars: 890,
    is_featured: false
  },
  {
    name: 'mongodb',
    description: '连接 MongoDB 文档数据库，AI 可执行查询、聚合管道分析，无需记忆 Query 语法',
    url: 'https://github.com/mongodb-labs/mongodb-mcp-server',
    category: 'database',
    is_official: false,
    install_cmd: 'npx mongodb-mcp',
    tags: ['MongoDB', '文档数据库', '聚合查询', 'NoSQL'],
    stars: 1700,
    is_featured: false
  },
  {
    name: 'supabase',
    description: '连接 Supabase 后端服务，支持数据库查询、文件存储、认证管理，开发者最爱',
    url: 'https://github.com/supabase/mcp-server-supabase',
    category: 'database',
    is_official: false,
    install_cmd: 'npx @supabase/mcp-server',
    tags: ['Supabase', 'PostgreSQL', '后端即服务', '开发者工具'],
    stars: 5200,
    is_featured: true
  },
  // ── 新增：AI模型 ────────────────────────────────────────────────────────────
  {
    name: 'huggingface',
    description: 'Hugging Face 模型推理 MCP Server，让 AI 直接调用 HF 上的数万个开源模型',
    url: 'https://github.com/huggingface/huggingface-mcp',
    category: 'ai',
    is_official: false,
    install_cmd: 'npx huggingface-mcp',
    tags: ['HuggingFace', '开源模型', '模型推理', '模型库'],
    stars: 3800,
    is_featured: false
  },
  {
    name: 'replicate',
    description: '调用 Replicate 上的 AI 模型（图像生成、语音合成等），一行命令运行任意 AI 模型',
    url: 'https://github.com/replicate/replicate-mcp',
    category: 'ai',
    is_official: false,
    install_cmd: 'npx replicate-mcp',
    tags: ['Replicate', '图像生成', '语音合成', '多模态'],
    stars: 2300,
    is_featured: false
  },
  // ── 新增：搜索 ─────────────────────────────────────────────────────────────
  {
    name: 'perplexity-search',
    description: 'Perplexity AI 搜索 MCP，带 AI 摘要的实时搜索，特别适合研究型 Agent 任务',
    url: 'https://github.com/ppl-ai/perplexity-mcp',
    category: 'search',
    is_official: false,
    install_cmd: 'npx perplexity-mcp',
    tags: ['Perplexity', 'AI摘要', '实时搜索', '研究Agent'],
    stars: 1400,
    is_featured: false
  },
  {
    name: 'arxiv',
    description: '搜索 arXiv 学术论文数据库，获取最新研究成果，适合科研型 Agent',
    url: 'https://github.com/blazickjp/arxiv-mcp-server',
    category: 'search',
    is_official: false,
    install_cmd: 'npx arxiv-mcp-server',
    tags: ['arXiv', '论文搜索', '学术研究', '科研'],
    stars: 650,
    is_featured: false
  }
];

export const fakeMcpServers = {
  records: [] as McpServer[],

  initialize() {
    this.records = MCP_DATA.map((item, i) => ({
      ...item,
      id: i + 1,
      created_at: new Date(Date.now() - (MCP_DATA.length - i) * 7 * 24 * 3600 * 1000).toISOString()
    }));
  },

  async getMcpServers({
    page = 1,
    limit = 12,
    search,
    category,
    is_official
  }: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    is_official?: boolean;
  }) {
    await delay(250);
    let items = [...this.records];
    if (category && category !== 'all') items = items.filter((m) => m.category === category);
    if (is_official !== undefined) items = items.filter((m) => m.is_official === is_official);
    if (search) items = matchSorter(items, search, { keys: ['name', 'description', 'tags'] });
    const total_items = items.length;
    return { items: items.slice((page - 1) * limit, page * limit), total_items };
  },

  async getFeatured(): Promise<McpServer[]> {
    await delay(150);
    return this.records.filter((m) => m.is_featured);
  },

  async getStats() {
    await delay(100);
    const total = this.records.length;
    const official = this.records.filter((m) => m.is_official).length;
    const byCategory = this.records.reduce(
      (acc, m) => {
        acc[m.category] = (acc[m.category] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    return { total, official, community: total - official, byCategory };
  },

  async getById(id: number): Promise<McpServer | null> {
    await delay(150);
    return this.records.find((m) => m.id === id) ?? null;
  },

  async create(payload: Omit<McpServer, 'id' | 'created_at'>): Promise<McpServer> {
    await delay(400);
    const now = new Date().toISOString();
    const newItem: McpServer = { ...payload, id: this.records.length + 1, created_at: now };
    this.records.push(newItem);
    return newItem;
  },

  async update(
    id: number,
    payload: Partial<Omit<McpServer, 'id' | 'created_at'>>
  ): Promise<McpServer | null> {
    await delay(300);
    const idx = this.records.findIndex((m) => m.id === id);
    if (idx === -1) return null;
    this.records[idx] = { ...this.records[idx], ...payload };
    return this.records[idx];
  },

  async delete(id: number): Promise<boolean> {
    await delay(200);
    const idx = this.records.findIndex((m) => m.id === id);
    if (idx === -1) return false;
    this.records.splice(idx, 1);
    return true;
  }
};

fakeMcpServers.initialize();
