////////////////////////////////////////////////////////////////////////////////
// 🛑 Nothing in here has anything to do with Nextjs, it's just a fake database
////////////////////////////////////////////////////////////////////////////////

import { matchSorter } from 'match-sorter';
import { delay } from './mock-api';

export type NewsCategory = 'Agent' | '框架' | '模型' | '工具' | '融资' | '研究';
export type NewsStatus = 'published' | 'draft' | 'archived';

export type NewsItem = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  source_url: string;
  source_name: string;
  category: NewsCategory;
  tags: string[];
  status: NewsStatus;
  is_featured: boolean;
  published_at: string;
  created_at: string;
  updated_at: string;
};

export type CreateNewsPayload = Omit<NewsItem, 'id' | 'created_at' | 'updated_at'>;
export type UpdateNewsPayload = Partial<CreateNewsPayload>;

// 重大事件时间线
export type TimelineEvent = {
  date: string;
  title: string;
  description: string;
  category: NewsCategory;
};

export const AI_TIMELINE: TimelineEvent[] = [
  {
    date: '2024-03',
    title: 'Devin 发布',
    description: '全球首个自主 AI 软件工程师，能独立完成完整编程任务',
    category: 'Agent'
  },
  {
    date: '2024-10',
    title: 'Claude Computer Use',
    description: 'Anthropic 让 AI 首次直接操控电脑屏幕，开创计算机使用新范式',
    category: 'Agent'
  },
  {
    date: '2024-11',
    title: 'MCP 协议诞生',
    description: 'Anthropic 发布 Model Context Protocol，成为 Agent 接口事实标准',
    category: '框架'
  },
  {
    date: '2025-01',
    title: 'DeepSeek-R1 震惊全球',
    description: '开源推理模型，成本仅 OpenAI 的 3%，引发全球 AI 格局震动',
    category: '模型'
  },
  {
    date: '2025-02',
    title: 'OpenAI Deep Research',
    description: 'OpenAI 推出深度研究 Agent，一键生成专业研究报告',
    category: 'Agent'
  },
  {
    date: '2025-03',
    title: 'Manus 一夜爆火',
    description: '全球首款通用 AI Agent 在国内社交平台引发空前关注',
    category: 'Agent'
  },
  {
    date: '2025-12',
    title: 'Meta 20亿收购 Manus',
    description: 'Meta 以 20 亿美元收购 Manus AI，通用 Agent 赛道正式被巨头锁定',
    category: 'Agent'
  },
  {
    date: '2026-01',
    title: 'OpenClaw GitHub 爆发',
    description: 'OpenClaw 10 天冲上 GitHub 全球 Top 10，超越 Linux 内核 Star 增速',
    category: 'Agent'
  },
  {
    date: '2024-06',
    title: 'Claude 3.5 登顶 SWE-bench',
    description: '最强编程 AI，Bug 修复能力达到初级工程师水平',
    category: 'Agent' as const
  },
  {
    date: '2024-08',
    title: 'Cursor ARR 破亿',
    description: '史上增长最快 SaaS，AI 编程工具新王者',
    category: '工具' as const
  },
  {
    date: '2024-09',
    title: 'Replit Agent 全栈自动化',
    description: '自然语言到上线产品，面向非工程师',
    category: 'Agent' as const
  },
  {
    date: '2025-02',
    title: 'MCP Server 破 500',
    description: 'MCP 生态爆发，3 个月构建 500+ Server',
    category: '框架' as const
  },
  {
    date: '2025-04',
    title: 'DeepSeek-V3 开源',
    description: '性价比之王，成本仅 GPT-4 的 5%',
    category: '模型' as const
  }
];

// ── 真实新闻数据 ──────────────────────────────────────────────────────────────

const NEWS_DATA: Omit<NewsItem, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    slug: 'manus-acquired-by-meta-2-billion',
    title: 'Manus AI 以 20 亿美元被 Meta 收购',
    summary:
      'Meta 宣布以约 20 亿美元收购通用 AI Agent 公司 Manus AI，这是 AI Agent 赛道迄今最大规模的收购案。Manus 以其自主任务分解和闭环执行能力在 2025 年初一夜爆火，此次收购标志着科技巨头正式大规模布局自主 Agent 领域。',
    source_url: 'https://venturebeat.com',
    source_name: 'VentureBeat',
    category: 'Agent',
    tags: ['Manus', 'Meta', '收购', '通用Agent'],
    status: 'published',
    is_featured: true,
    published_at: '2025-12-15T08:00:00Z'
  },
  {
    slug: 'openclaw-github-top10',
    title: 'OpenClaw 10天冲上 GitHub Top 10，超越 Linux 内核',
    summary:
      '开源通用 Agent 项目 OpenClaw 在发布后 10 天内 Star 数突破 15 万，登上 GitHub 全球 Trending Top 10，单日 Star 增速超过 Linux 内核。其完全开源、支持自托管的特性吸引了大量开发者涌入，社区贡献者已超过 3000 人。',
    source_url: 'https://github.com/openclaw/openclaw',
    source_name: 'GitHub',
    category: 'Agent',
    tags: ['OpenClaw', 'GitHub', '开源', '社区'],
    status: 'published',
    is_featured: true,
    published_at: '2026-01-08T10:00:00Z'
  },
  {
    slug: 'anthropic-claude-computer-use',
    title: 'Anthropic 发布 Claude Computer Use，AI 首次直接操控电脑',
    summary:
      'Anthropic 正式发布 Claude Computer Use 功能，使 AI 能够直接查看屏幕截图、移动光标、点击按钮和输入文字，完成复杂的多步骤计算机任务。这是 AI 从"对话工具"到"自主执行者"的重大转折点。',
    source_url: 'https://www.anthropic.com/news/3-5-models-and-computer-use',
    source_name: 'Anthropic Blog',
    category: 'Agent',
    tags: ['Claude', 'Anthropic', '计算机使用', '自主Agent'],
    status: 'published',
    is_featured: true,
    published_at: '2024-10-22T16:00:00Z'
  },
  {
    slug: 'mcp-model-context-protocol-released',
    title: 'MCP（Model Context Protocol）正式发布，成为 Agent 接口新标准',
    summary:
      'Anthropic 发布开放协议 MCP（Model Context Protocol），旨在标准化 AI 模型与外部工具、数据源的交互方式。发布后迅速获得 OpenAI、Google、Microsoft 等主流厂商支持，成为 AI Agent 生态的事实标准，已有超过 500 个 MCP Server 实现。',
    source_url: 'https://modelcontextprotocol.io',
    source_name: 'modelcontextprotocol.io',
    category: '框架',
    tags: ['MCP', 'Anthropic', '开放协议', '标准化'],
    status: 'published',
    is_featured: true,
    published_at: '2024-11-25T12:00:00Z'
  },
  {
    slug: 'openai-deep-research-launch',
    title: 'OpenAI 推出 Deep Research，一键生成专业研究报告',
    summary:
      'OpenAI 正式发布 Deep Research 功能，能够在数分钟内自主浏览数十个网页、提炼关键信息，并生成带完整引用的专业研究报告。这是 OpenAI 在 Agentic AI 方向的重要里程碑，ChatGPT Pro 用户率先开放使用。',
    source_url: 'https://openai.com/index/introducing-deep-research',
    source_name: 'OpenAI Blog',
    category: 'Agent',
    tags: ['OpenAI', 'Deep Research', '研究Agent', 'ChatGPT'],
    status: 'published',
    is_featured: false,
    published_at: '2025-02-02T18:00:00Z'
  },
  {
    slug: 'devin-first-ai-software-engineer',
    title: 'Devin 发布：第一个自主 AI 软件工程师',
    summary:
      'AI 创业公司 Cognition Labs 发布 Devin，这是业内首个能独立完成完整软件开发任务的 AI Agent，包括：理解需求、写代码、调试、部署全流程。在 SWE-bench 评测中远超此前最优基准，引发业界对 AI 取代软件工程师的广泛讨论。',
    source_url: 'https://cognition.ai',
    source_name: 'Cognition AI',
    category: 'Agent',
    tags: ['Devin', 'Cognition', 'AI工程师', 'SWE-bench'],
    status: 'published',
    is_featured: false,
    published_at: '2024-03-12T14:00:00Z'
  },
  {
    slug: 'deepseek-r1-open-source-shock',
    title: 'DeepSeek-R1 开源，推理成本仅 OpenAI 的 3%',
    summary:
      '中国 AI 公司 DeepSeek 发布并完全开源 R1 推理模型，其在数学推理、代码生成等任务上的表现与 OpenAI o1 相当，但训练成本不到后者的 3%。这一消息震惊全球 AI 行业，引发 NVIDIA 股价大跌，并重燃全球对中国 AI 能力的关注。',
    source_url: 'https://github.com/deepseek-ai/DeepSeek-R1',
    source_name: 'GitHub / DeepSeek',
    category: '模型',
    tags: ['DeepSeek', 'R1', '开源', '推理模型'],
    status: 'published',
    is_featured: true,
    published_at: '2025-01-20T08:00:00Z'
  },
  {
    slug: 'cursor-valuation-50-billion',
    title: 'Cursor 估值谈判达 500 亿美金',
    summary:
      '代码 Agent IDE Cursor 的母公司 Anysphere 据悉正在进行新一轮融资谈判，估值高达 500 亿美元。自 2024 年底以来，Cursor 的月活跃开发者数量增长超 10 倍，成为 AI 编程工具赛道当之无愧的第一。',
    source_url: 'https://bloomberg.com',
    source_name: 'Bloomberg',
    category: '工具',
    tags: ['Cursor', '估值', 'AI编程', 'IDE'],
    status: 'published',
    is_featured: false,
    published_at: '2026-03-01T10:00:00Z'
  },
  {
    slug: 'google-gemini-2-agentic',
    title: 'Google 发布 Gemini 2.0，原生支持 Agentic 能力',
    summary:
      'Google DeepMind 发布 Gemini 2.0 系列模型，这是 Google 首批原生支持 Agentic 能力的模型，包括实时流媒体、原生工具调用和多模态输入输出。Gemini 2.0 Flash 以极低成本提供强大的 Agent 支持，正在快速占领企业市场。',
    source_url: 'https://deepmind.google/technologies/gemini',
    source_name: 'Google DeepMind',
    category: '模型',
    tags: ['Google', 'Gemini', 'Agentic', '多模态'],
    status: 'published',
    is_featured: false,
    published_at: '2024-12-11T18:00:00Z'
  },
  {
    slug: 'crewai-18m-funding',
    title: 'CrewAI 获 1800 万美元融资，多 Agent 协作框架崛起',
    summary:
      'AI 开发框架公司 CrewAI 宣布完成 1800 万美元 A 轮融资，其多 Agent 协作框架在过去一年内 GitHub Star 突破 2 万，被数千家企业用于构建自动化工作流。CrewAI 通过角色分工模型让多个 AI Agent 像团队一样协作，解决单一 Agent 的能力瓶颈。',
    source_url: 'https://crewai.com',
    source_name: 'CrewAI',
    category: '框架',
    tags: ['CrewAI', '融资', '多Agent', '框架'],
    status: 'published',
    is_featured: false,
    published_at: '2024-11-08T14:00:00Z'
  },
  {
    slug: 'anthropic-claude-3-5-sonnet-swe-bench',
    title: 'Claude 3.5 Sonnet 登顶 SWE-bench，成为最强编程 AI',
    summary:
      'Anthropic 发布 Claude 3.5 Sonnet，在 SWE-bench Verified 评测中以 49% 的问题解决率位列第一，超越 GPT-4o 和 Gemini 1.5 Pro。SWE-bench 是测试 AI 真实 GitHub Bug 修复能力的权威基准，这一结果意味着 Claude 在自主软件开发任务上已达到人类初级工程师水平。',
    source_url: 'https://www.anthropic.com/news/claude-3-5-sonnet',
    source_name: 'Anthropic Blog',
    category: '模型',
    tags: ['Claude', 'SWE-bench', '编程AI', 'Anthropic'],
    status: 'published',
    is_featured: false,
    published_at: '2024-06-20T16:00:00Z'
  },
  {
    slug: 'langchain-langgraph-agent-framework',
    title: 'LangGraph 发布：构建有状态 Agent 的新范式',
    summary:
      'LangChain 团队发布 LangGraph，将 Agent 工作流建模为有向图（DAG），支持循环执行、持久化状态和人工干预节点。相比 LangChain Agents，LangGraph 的可控性和可调试性大幅提升，已成为生产级 Agent 开发的首选框架，GitHub Star 超过 9000。',
    source_url: 'https://blog.langchain.dev/langgraph',
    source_name: 'LangChain Blog',
    category: '框架',
    tags: ['LangChain', 'LangGraph', 'Agent框架', '有向图'],
    status: 'published',
    is_featured: false,
    published_at: '2024-07-15T12:00:00Z'
  },
  {
    slug: 'microsoft-autogen-multi-agent',
    title: 'Microsoft AutoGen 2.0：多 Agent 协作框架迭代升级',
    summary:
      'Microsoft Research 发布 AutoGen 2.0，这是其多 Agent 协作框架的重大升级版本，新增异步通信、灵活的对话模式和企业级部署支持。AutoGen 允许多个 AI Agent 像团队成员一样分工协作，广泛应用于代码生成、数据分析和复杂任务分解场景。',
    source_url: 'https://microsoft.github.io/autogen',
    source_name: 'Microsoft Research',
    category: '框架',
    tags: ['Microsoft', 'AutoGen', '多Agent', '协作框架'],
    status: 'published',
    is_featured: false,
    published_at: '2024-09-04T10:00:00Z'
  },
  {
    slug: 'openai-swarm-multi-agent-open-source',
    title: 'OpenAI 开源 Swarm：轻量多 Agent 编排框架',
    summary:
      'OpenAI 突然开源 Swarm，一个专为教育和实验设计的轻量级多 Agent 编排框架。Swarm 的核心概念是 Handoff（任务交接）和 Routines（例行程序），让开发者能快速理解多 Agent 协作的核心机制，但 OpenAI 明确声明 Swarm 不是生产级框架。',
    source_url: 'https://github.com/openai/swarm',
    source_name: 'OpenAI GitHub',
    category: '框架',
    tags: ['OpenAI', 'Swarm', '开源', '多Agent'],
    status: 'published',
    is_featured: false,
    published_at: '2024-10-11T14:00:00Z'
  },
  {
    slug: 'cursor-ai-ide-100-million-arr',
    title: 'Cursor IDE 年收入突破 1 亿美元，改写 AI 编程工具格局',
    summary:
      'AI 代码编辑器 Cursor 的母公司 Anysphere 宣布年化收入（ARR）突破 1 亿美元，成为有史以来增长最快的 SaaS 产品之一。Cursor 将 AI 融入代码编辑的每个环节，包括 Tab 补全、内联对话和 Agent 模式，已取代 GitHub Copilot 成为最多开发者使用的 AI 编程工具。',
    source_url: 'https://cursor.sh',
    source_name: 'Anysphere Blog',
    category: '工具',
    tags: ['Cursor', 'AI编程', 'IDE', '1亿ARR'],
    status: 'published',
    is_featured: true,
    published_at: '2024-08-22T10:00:00Z'
  },
  {
    slug: 'dify-open-source-llmops-platform',
    title: 'Dify 开源 LLMOps 平台 GitHub Star 突破 5 万',
    summary:
      '开源 AI 应用开发平台 Dify 在 GitHub 上的 Star 数突破 5 万，成为最受欢迎的 AI 应用构建工具之一。Dify 支持可视化工作流编排、RAG 知识库、Agent 搭建，并提供完整的 LLMOps 能力。超过 10 万个 AI 应用已基于 Dify 构建。',
    source_url: 'https://dify.ai',
    source_name: 'Dify Blog',
    category: '框架',
    tags: ['Dify', '开源', 'LLMOps', 'RAG'],
    status: 'published',
    is_featured: false,
    published_at: '2025-01-05T08:00:00Z'
  },
  {
    slug: 'anthropic-mcp-500-servers',
    title: 'MCP 生态爆发：社区已发布超过 500 个 Server',
    summary:
      'MCP 协议发布仅 3 个月，社区贡献的 MCP Server 数量已突破 500 个，涵盖数据库、浏览器、代码工具、SaaS 平台等各类场景。Cursor、Windsurf 等主流 AI 编辑器相继宣布支持 MCP，Claude Desktop 成为最受欢迎的 MCP 客户端，用户数超过 200 万。',
    source_url: 'https://modelcontextprotocol.io/examples',
    source_name: 'MCP 官网',
    category: '框架',
    tags: ['MCP', '生态', '500+', 'Claude Desktop'],
    status: 'published',
    is_featured: true,
    published_at: '2025-02-20T10:00:00Z'
  },
  {
    slug: 'replit-agent-coding-platform',
    title: 'Replit Agent 发布：代码到部署全自动，面向非工程师',
    summary:
      'Replit 发布 Replit Agent，这是一款面向非技术用户的全栈 AI 开发助手，能够根据自然语言描述自动创建、调试和部署完整的 Web 应用。Replit Agent 打通了从想法到上线产品的全链路，被认为是"最接近未来程序员被替代"的产品。',
    source_url: 'https://replit.com/blog/agent',
    source_name: 'Replit Blog',
    category: 'Agent',
    tags: ['Replit', '全栈Agent', '无代码', '自动部署'],
    status: 'published',
    is_featured: false,
    published_at: '2024-09-03T16:00:00Z'
  },
  {
    slug: 'swe-agent-princeton-open-source',
    title: 'SWE-agent：普林斯顿开源的软件工程 AI',
    summary:
      '普林斯顿大学开源 SWE-agent，这是一个让语言模型自主解决真实 GitHub Issues 的框架。SWE-agent 在 SWE-bench 测试中达到 12.5% 的解题率，是当时开源方案的最高成绩。它引入了 Agent-Computer Interface（ACI）概念，优化了模型与代码环境的交互方式。',
    source_url: 'https://swe-agent.com',
    source_name: 'Princeton NLP',
    category: 'Agent',
    tags: ['SWE-agent', '开源', '普林斯顿', 'GitHub Issues'],
    status: 'published',
    is_featured: false,
    published_at: '2024-04-02T12:00:00Z'
  },
  {
    slug: 'windsurf-ai-ide-codeium',
    title: 'Windsurf 发布：Codeium 推出对标 Cursor 的 AI IDE',
    summary:
      'AI 代码工具公司 Codeium 发布 Windsurf，这是首款搭载 Cascade 功能的 AI IDE，能够感知整个代码库的上下文并自动执行多步骤任务。Windsurf 发布后迅速获得大量开发者关注，被认为是 Cursor 最强有力的竞争者，推动了 AI IDE 市场的快速竞争格局。',
    source_url: 'https://codeium.com/windsurf',
    source_name: 'Codeium Blog',
    category: '工具',
    tags: ['Windsurf', 'Codeium', 'AI IDE', 'Cascade'],
    status: 'published',
    is_featured: false,
    published_at: '2024-11-13T10:00:00Z'
  },
  // ── 2025 年新增资讯 ─────────────────────────────────────────────────────────
  {
    slug: 'google-adk-agent-development-kit',
    title: 'Google 发布 ADK：让任何开发者都能构建多 Agent 系统',
    summary:
      'Google 正式开源 Agent Development Kit（ADK），这是一个 Python 框架，专为构建、测试和部署多 Agent 工作流设计。ADK 原生支持 Gemini 模型，内置工具调用、状态管理、Agent 间通信机制，并与 Google Cloud Vertex AI 深度集成，支持一键部署到生产环境。不同于 LangChain 的通用设计，ADK 的 Agent 编排以「对话树」为核心，更接近真实业务流程的建模方式。发布后首周 GitHub Star 突破 8000。',
    source_url: 'https://github.com/google/adk-python',
    source_name: 'Google Developers',
    category: '框架',
    tags: ['Google', 'ADK', '多Agent', 'Vertex AI', '开源'],
    status: 'published',
    is_featured: true,
    published_at: '2025-04-10T09:00:00Z'
  },
  {
    slug: 'openai-gpt4o-realtime-function-calling',
    title: 'GPT-4o 实时语音 + 函数调用：Agent 进入「听说做」新时代',
    summary:
      'OpenAI 大幅升级 GPT-4o 的实时 API，新增对话中途函数调用（mid-conversation function calling）能力，允许 Agent 在与用户实时对话的同时查询数据库、调用工具、执行代码，结果无缝回流对话。这一能力打通了语音 Agent 的最后一公里：Agent 不再只是「会说话的助手」，而是能在通话中实时帮你完成订单、查余额、操控系统的执行者。国内多家语音 SaaS 已宣布接入。',
    source_url: 'https://platform.openai.com/docs/guides/realtime',
    source_name: 'OpenAI Platform',
    category: '模型',
    tags: ['GPT-4o', '实时语音', '函数调用', '语音Agent'],
    status: 'published',
    is_featured: false,
    published_at: '2025-03-28T14:00:00Z'
  },
  {
    slug: 'coze-cn-agent-marketplace-500k-bots',
    title: '扣子（Coze）国内版 Bot 数量突破 50 万，成最大中文 Agent 平台',
    summary:
      '字节跳动旗下 AI Agent 构建平台扣子（Coze）宣布，国内版用户创建的 Bot 数量突破 50 万，覆盖客服、内容创作、数据分析、教育辅导等 20+ 行业场景。扣子凭借「零代码拖拽搭建 + 插件市场 + 多平台一键发布（抖音/飞书/微信）」三大优势，在中国市场迅速击败 Dify 等竞争对手，成为中小企业部署 AI Agent 的首选工具。平台 API 调用量日均已超 10 亿次。',
    source_url: 'https://www.coze.cn',
    source_name: '扣子官方',
    category: '工具',
    tags: ['扣子', 'Coze', '字节跳动', '国内Agent平台', '无代码'],
    status: 'published',
    is_featured: true,
    published_at: '2025-04-22T10:00:00Z'
  },
  {
    slug: 'anthropic-claude-4-agent-benchmark',
    title: 'Claude 4 刷新 Agent 基准：SWE-bench 突破 72%，超越人类初级程序员',
    summary:
      'Anthropic 发布 Claude 4，在软件工程基准 SWE-bench Verified 上得分达到 72.5%，首次明显超越人类初级工程师的平均表现（约 60%）。Claude 4 引入「扩展思考（Extended Thinking）」模式，允许模型在给出最终答案前进行长达数分钟的内部推理，在需要多步骤规划的 Agent 任务上尤为突出。Cursor、Windsurf 等 AI IDE 已宣布优先接入 Claude 4 作为默认 Agent 引擎。',
    source_url: 'https://www.anthropic.com/claude',
    source_name: 'Anthropic',
    category: '模型',
    tags: ['Claude 4', 'Anthropic', 'SWE-bench', 'Agent基准', '编程AI'],
    status: 'published',
    is_featured: false,
    published_at: '2025-05-06T11:00:00Z'
  },
  {
    slug: 'mcp-authorization-spec-enterprise-ready',
    title: 'MCP 发布授权规范 1.1：企业级安全 Agent 部署成为可能',
    summary:
      'MCP 工作组正式发布 Authorization Spec 1.1，引入 OAuth 2.0 集成、细粒度权限控制（per-tool scopes）、审计日志和 Token 撤销机制。这一更新解决了企业在部署 Agent 时最担心的「AI 权限失控」问题：现在管理员可以精确控制每个 Agent 能调用哪些工具、访问哪些数据，并留有完整操作记录。Salesforce、Atlassian、GitHub 已宣布其 MCP Server 升级到新规范，企业级 Agent 采购潮被分析师预测将在 2025 年 Q3 爆发。',
    source_url: 'https://modelcontextprotocol.io/specification',
    source_name: 'MCP 官方',
    category: '框架',
    tags: ['MCP', '授权规范', '企业级', '安全', 'OAuth'],
    status: 'published',
    is_featured: false,
    published_at: '2025-04-30T16:00:00Z'
  }
];

let _nextId = NEWS_DATA.length + 1;

export const fakeNews = {
  records: [] as NewsItem[],

  initialize() {
    this.records = NEWS_DATA.map((item, i) => ({
      ...item,
      id: i + 1,
      created_at: item.published_at,
      updated_at: item.published_at
    }));
    _nextId = this.records.length + 1;
  },

  async getNews({
    page = 1,
    limit = 10,
    search,
    category,
    status,
    sort
  }: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: string;
    sort?: string;
  }) {
    await delay(250);
    let items = [...this.records];
    if (category && category !== 'all') items = items.filter((n) => n.category === category);
    if (status && status !== 'all') items = items.filter((n) => n.status === status);
    if (search)
      items = matchSorter(items, search, { keys: ['title', 'summary', 'tags', 'source_name'] });
    if (sort) {
      try {
        const s = JSON.parse(sort) as { id: string; desc: boolean }[];
        if (s.length > 0) {
          const { id, desc } = s[0];
          items.sort((a, b) => {
            const av = String((a as Record<string, unknown>)[id] ?? '');
            const bv = String((b as Record<string, unknown>)[id] ?? '');
            return desc ? bv.localeCompare(av) : av.localeCompare(bv);
          });
        }
      } catch {
        /* ignore */
      }
    } else {
      // default: newest first
      items.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
    }
    const total_items = items.length;
    return { items: items.slice((page - 1) * limit, page * limit), total_items };
  },

  async getPublishedNews(opts: { page?: number; limit?: number; category?: string }) {
    return this.getNews({ ...opts, status: 'published' });
  },

  async getNewsById(id: number): Promise<NewsItem | null> {
    await delay(150);
    return this.records.find((n) => n.id === id) ?? null;
  },

  async getNewsBySlug(slug: string): Promise<NewsItem | null> {
    await delay(150);
    return this.records.find((n) => n.slug === slug) ?? null;
  },

  async getFeaturedNews(): Promise<NewsItem[]> {
    await delay(150);
    return this.records
      .filter((n) => n.is_featured && n.status === 'published')
      .toSorted((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
  },

  async getAllCategories(): Promise<string[]> {
    const cats = new Set(
      this.records.filter((n) => n.status === 'published').map((n) => n.category)
    );
    return Array.from(cats).toSorted();
  },

  async getStats() {
    await delay(150);
    const published = this.records.filter((n) => n.status === 'published').length;
    const draft = this.records.filter((n) => n.status === 'draft').length;
    const featured = this.records.filter((n) => n.is_featured && n.status === 'published').length;
    const byCategory = this.records
      .filter((n) => n.status === 'published')
      .reduce(
        (acc, n) => {
          acc[n.category] = (acc[n.category] ?? 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );
    return { published, draft, featured, byCategory };
  },

  async createNews(payload: CreateNewsPayload): Promise<NewsItem> {
    await delay(400);
    const now = new Date().toISOString();
    const item: NewsItem = { ...payload, id: _nextId++, created_at: now, updated_at: now };
    this.records.push(item);
    return item;
  },

  async updateNews(id: number, payload: UpdateNewsPayload): Promise<NewsItem | null> {
    await delay(300);
    const idx = this.records.findIndex((n) => n.id === id);
    if (idx === -1) return null;
    this.records[idx] = { ...this.records[idx], ...payload, updated_at: new Date().toISOString() };
    return this.records[idx];
  },

  async deleteNews(id: number): Promise<boolean> {
    await delay(200);
    const idx = this.records.findIndex((n) => n.id === id);
    if (idx === -1) return false;
    this.records.splice(idx, 1);
    return true;
  }
};

fakeNews.initialize();
