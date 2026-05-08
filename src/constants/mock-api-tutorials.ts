////////////////////////////////////////////////////////////////////////////////
// 🛑 Nothing in here has anything to do with Nextjs, it's just a fake database
////////////////////////////////////////////////////////////////////////////////

import { delay } from './mock-api';

export type TutorialLevel = 'beginner' | 'intermediate' | 'advanced';
export type TutorialCategory = 'concept' | 'hands-on' | 'mcp' | 'agent' | 'workflow';

export type Tutorial = {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  content: string; // Markdown
  level: TutorialLevel;
  category: TutorialCategory;
  tags: string[];
  estimated_minutes: number;
  related_tools: string[]; // 相关工具名
  is_featured: boolean;
  published_at: string;
};

const TUTORIAL_DATA: Omit<Tutorial, 'id'>[] = [
  // ── 新手系列 ──────────────────────────────────────────────────────────────
  {
    slug: 'what-is-ai-agent',
    title: '什么是 AI Agent？',
    subtitle: '5 分钟搞懂和普通 AI 的区别',
    summary:
      '用一个简单的类比解释 AI Agent：ChatGPT 是顾问，Agent 是帮你干活的员工。本文带你快速理解 Agent 的核心概念、与普通 AI 的区别，以及为什么 2025 年是 Agent 元年。',
    content: `# 什么是 AI Agent？

## 一个简单的类比

想象你需要安排一次出差：

- **普通 AI（ChatGPT）**：你问它"帮我规划北京到上海的出差行程"，它给你一个建议清单。**但你还得自己去订机票、订酒店、发邮件通知同事。**

- **AI Agent**：你告诉它"帮我安排3月15日去上海出差，预算5000元以内"，它会**自动**查询机票价格、比较酒店、发送日历邀请、通知相关人员——全程不需要你操作。

> 💡 **一句话总结：ChatGPT 是顾问，Agent 是帮你干活的员工。**

## AI Agent 的三个关键能力

### 1. 感知（Perceive）
Agent 能接收多种输入：文字、图片、文件、网页、代码……

### 2. 规划（Plan）
面对复杂目标，Agent 会自动分解成多个步骤，判断先做什么、后做什么。

### 3. 执行（Act）
Agent 能调用工具：搜索网页、写代码并运行、操控浏览器、读写文件、发送邮件……

## 为什么 2025 年是 Agent 元年？

三个关键突破同时发生：

1. **模型能力飞跃**：Claude 3.5、GPT-4o 等模型的推理能力达到能可靠完成复杂任务的阈值
2. **工具生态成熟**：MCP 协议标准化了工具接入方式，现已有 500+ MCP Server
3. **基础设施完善**：Dify、LangChain 等平台降低了 Agent 开发门槛

## 常见 Agent 类型

| 类型 | 代表产品 | 主要能力 |
|------|---------|---------|
| 通用自主 | Manus, OpenClaw | 能完成任意开放性任务 |
| 软件工程 | Devin, Cursor | 写代码、修 Bug、部署 |
| 研究助手 | Deep Research, Perplexity | 信息收集与分析报告 |
| 流程自动化 | n8n, Dify | 连接多个系统自动化工作 |

## 下一步

- 了解 [什么是 MCP？](/tutorials/what-is-mcp)
- 浏览 [Agent Hub](/agents) 发现更多工具
`,
    level: 'beginner',
    category: 'concept',
    tags: ['AI Agent', '入门', '概念', '新手必读'],
    estimated_minutes: 5,
    related_tools: ['Manus', 'OpenClaw', 'Devin'],
    is_featured: true,
    published_at: '2025-03-01T08:00:00Z'
  },
  {
    slug: 'what-is-mcp',
    title: '什么是 MCP？',
    subtitle: '为什么它让 Agent 变得更强',
    summary:
      'MCP（Model Context Protocol）是 Anthropic 发布的开放协议，让 AI 模型能安全、标准化地连接外部工具和数据。用一个类比：MCP 是 Agent 的 USB 接口。本文带你搞懂 MCP 的原理和价值。',
    content: `# 什么是 MCP？

## MCP 是 Agent 的 USB 接口

在 MCP 出现之前，每当你想让 AI 连接一个新工具（比如 GitHub），开发者需要为每个 AI 平台单独写集成代码。这就像每台设备都需要专属充电线——乱且低效。

**MCP 就是 USB-C**：只要遵循 MCP 协议，任何 AI 模型都能连接任何 MCP Server，任何工具只需实现一次 MCP 接口。

> 💡 **一句话总结：MCP 是 AI 与外部世界通信的标准化插头。**

## MCP 的工作原理

\`\`\`
AI 模型 (Claude/GPT)
    ↕ MCP 协议
MCP Server (工具/数据源)
    ↕ 原生 API
真实系统 (GitHub/数据库/文件系统)
\`\`\`

当你对 Claude 说"帮我查一下 GitHub 上的 open issues"：

1. Claude 识别需要使用 GitHub 工具
2. 通过 MCP 协议调用 GitHub MCP Server
3. Server 用 GitHub API 查询数据
4. 返回结构化结果给 Claude
5. Claude 用自然语言回答你

## 为什么 MCP 很重要？

### 之前：碎片化
- 每个工具需要单独集成
- 不同 AI 平台互不兼容
- 安全性难以保证

### MCP 之后：标准化
- 一次实现，到处可用
- 跨平台：Claude、GPT、Gemini 均支持
- 权限控制：细粒度的工具访问授权

## 目前最受欢迎的 MCP Server

- **filesystem**：读写本地文件（官方）
- **github**：完整 GitHub 操作（官方）
- **brave-search**：实时网页搜索（官方）
- **notion**：Notion 知识库读写
- **puppeteer**：控制浏览器（官方）

👉 [查看全部 MCP Server](/mcp)
`,
    level: 'beginner',
    category: 'mcp',
    tags: ['MCP', '协议', '工具调用', '新手必读'],
    estimated_minutes: 5,
    related_tools: ['filesystem', 'github', 'brave-search'],
    is_featured: true,
    published_at: '2025-03-10T08:00:00Z'
  },
  {
    slug: 'skill-vs-agent-vs-model',
    title: 'Skill vs Agent vs Model：三者关系一张图看懂',
    subtitle: '积木、建造者、大脑的关系',
    summary:
      '很多人搞不清楚 AI Skill、Agent 和 Model 的关系。用一个建房子的类比：Model 是大脑（提供智慧），Skill 是积木（提供能力），Agent 是建造者（负责执行）。',
    content: `# Skill vs Agent vs Model

## 一张图看懂

\`\`\`
┌─────────────────────────────────┐
│           AI Model              │  ← 大脑：提供推理能力
│   (GPT-4o / Claude / DeepSeek)  │
└──────────────┬──────────────────┘
               │ 驱动
┌──────────────▼──────────────────┐
│           AI Agent              │  ← 建造者：负责规划和执行
│   (Manus / Devin / OpenClaw)    │
└──────────────┬──────────────────┘
               │ 调用
┌──────────────▼──────────────────┐
│           AI Skill / MCP        │  ← 积木：提供具体能力
│  (搜索 / 写文件 / 操控浏览器)    │
└─────────────────────────────────┘
\`\`\`

## 三者的角色

### 🧠 Model（模型）= 大脑
- 提供语言理解和推理能力
- 代表：GPT-4o、Claude 3.5、DeepSeek-R1
- 本身**不能执行动作**，只能思考和生成文字

### 🤖 Agent（智能体）= 建造者
- 接收目标，规划步骤，调用工具，完成任务
- 代表：Manus、Devin、OpenClaw、AutoGPT
- **驱动力**来自 Model，**执行力**来自 Skill

### 🧩 Skill / MCP Server = 积木
- 提供具体能力：搜索网页、读写文件、操控浏览器
- 代表：filesystem MCP、github MCP、brave-search MCP
- 本身没有智能，被 Agent 调用后才发挥作用

## 实际案例

**目标**：帮我分析竞品并生成报告

\`\`\`
Model (Claude)      →  理解意图，规划步骤
    ↓
Agent (Manus)       →  分解任务：搜索→分析→写作→输出
    ↓
Skills 调用序列：
  brave-search MCP  →  搜索竞品信息
  fetch MCP         →  抓取竞品官网
  filesystem MCP    →  保存分析结果
  (Claude 生成报告)
\`\`\`
`,
    level: 'beginner',
    category: 'concept',
    tags: ['Skill', 'Agent', 'Model', '概念辨析'],
    estimated_minutes: 5,
    related_tools: ['Manus', 'filesystem', 'brave-search'],
    is_featured: true,
    published_at: '2025-03-15T08:00:00Z'
  },
  // ── 实操系列 ──────────────────────────────────────────────────────────────
  {
    slug: 'openclaw-personal-assistant',
    title: '用 OpenClaw 5分钟搭建你的第一个私人 AI 助手',
    subtitle: '从安装到第一次对话的完整教程',
    summary:
      '本教程手把手带你安装和配置 OpenClaw，搭建完全私有化的 AI 助手。OpenClaw 完全开源，支持自托管，数据不出本地，适合有隐私需求的个人和企业用户。',
    content: `# 用 OpenClaw 搭建私人 AI 助手

## 准备工作

- 系统：macOS / Linux / Windows (WSL2)
- 需要：Node.js 18+ 或 Docker

## 方法一：Docker 一键启动（推荐）

\`\`\`bash
# 拉取镜像
docker pull openclaw/openclaw:latest

# 启动服务
docker run -d \\
  -p 3000:3000 \\
  -v ~/.openclaw:/data \\
  --name openclaw \\
  openclaw/openclaw:latest

# 访问 http://localhost:3000
\`\`\`

## 方法二：本地安装

\`\`\`bash
# 克隆仓库
git clone https://github.com/openclaw/openclaw
cd openclaw

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入你的 API Key

# 启动
npm run dev
\`\`\`

## 配置 AI 模型

OpenClaw 支持接入任意兼容 OpenAI API 格式的模型：

\`\`\`env
# .env 文件
OPENAI_API_KEY=sk-...        # OpenAI
ANTHROPIC_API_KEY=sk-ant-... # Claude
DEEPSEEK_API_KEY=...         # DeepSeek（推荐，性价比高）
\`\`\`

## 添加你的第一个 MCP Tool

\`\`\`json
// .openclaw/config.json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/你的用户名/Documents"]
    }
  }
}
\`\`\`

重启后，你的 AI 助手就能读写 Documents 文件夹了！

## 第一次对话

试试这些指令：
- "帮我在桌面创建一个 todo.txt 文件，写入今天的三个任务"
- "读取我的 Documents/notes.md 并总结要点"
- "搜索最新的 AI Agent 新闻并整理成摘要"
`,
    level: 'intermediate',
    category: 'hands-on',
    tags: ['OpenClaw', '自托管', '安装教程', '私有化'],
    estimated_minutes: 15,
    related_tools: ['OpenClaw', 'filesystem'],
    is_featured: true,
    published_at: '2025-04-01T08:00:00Z'
  },
  {
    slug: 'dify-customer-service-agent',
    title: '用 Dify 零代码构建一个客服 Agent（附模板）',
    subtitle: '30分钟搭建能回答产品问题的智能客服',
    summary:
      'Dify 是目前最易用的 AI Agent 构建平台，无需编写代码，通过可视化界面就能搭建功能完整的客服 Agent。本教程提供完整步骤和可直接导入的模板。',
    content: `# 用 Dify 构建客服 Agent

## 什么是 Dify？

Dify 是一个开源的 LLM 应用开发平台，特点：
- **零代码**：拖拽操作，无需编程
- **开源可自托管**：数据完全自控
- **工作流编排**：支持复杂的多步骤逻辑
- **RAG 内置**：轻松接入私有知识库

## 第一步：注册/部署 Dify

**云端版（推荐新手）**：访问 [dify.ai](https://dify.ai) 注册

**自托管**：
\`\`\`bash
git clone https://github.com/langgenius/dify
cd dify/docker
docker compose up -d
\`\`\`

## 第二步：上传知识库

1. 进入 **知识库** → **创建知识库**
2. 上传你的产品文档（支持 PDF、Word、Markdown）
3. 等待向量化完成

## 第三步：创建 Chatbot

1. **创建应用** → 选择 **Chatbot**
2. 在 **上下文** 中绑定刚创建的知识库
3. 设置系统提示词：

\`\`\`
你是 [公司名] 的智能客服助手。
- 只回答与产品相关的问题
- 如果知识库中没有答案，礼貌告知用户联系人工客服
- 回答简洁友好，使用中文
\`\`\`

## 第四步：添加工具增强

在 **工具** 面板添加：
- **网络搜索**：回答知识库以外的通用问题
- **代码执行**：计算订单金额、处理数据

## 发布与集成

1. 点击 **发布** → 获取 API Key
2. 将以下代码嵌入你的网站：

\`\`\`html
<script>
  window.difyChatbotConfig = {
    token: 'YOUR_TOKEN',
    baseUrl: 'https://api.dify.ai'
  }
</script>
<script src="https://udify.app/embed.min.js"></script>
\`\`\`
`,
    level: 'intermediate',
    category: 'hands-on',
    tags: ['Dify', '零代码', '客服Agent', 'RAG'],
    estimated_minutes: 30,
    related_tools: ['Dify', 'brave-search'],
    is_featured: false,
    published_at: '2025-04-15T08:00:00Z'
  },
  {
    slug: 'top-10-mcp-servers',
    title: '10个最实用的 MCP Server，装完效率翻倍',
    subtitle: '覆盖 GitHub / Notion / 浏览器 / 文件系统',
    summary:
      '从数百个 MCP Server 中精选 10 个最实用的，涵盖开发、效率、搜索、浏览器自动化等场景，并提供每个 Server 的安装命令和使用示例。',
    content: `# 10个最实用的 MCP Server

## 安装方式说明

大多数 MCP Server 通过配置 Claude Desktop 的 \`claude_desktop_config.json\` 来使用：

**macOS**：\`~/Library/Application Support/Claude/claude_desktop_config.json\`

\`\`\`json
{
  "mcpServers": {
    "server-name": {
      "command": "npx",
      "args": ["-y", "@package/name"]
    }
  }
}
\`\`\`

---

## 🥇 Top 10

### 1. filesystem — 读写本地文件
最基础也最常用，让 AI 能直接操作你的文件。
\`\`\`json
"filesystem": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/你的用户名"]
}
\`\`\`
**用途**：整理文档、批量重命名、读取配置文件

### 2. github — GitHub 全功能操作
PR、Issues、代码搜索、仓库管理一手掌握。
\`\`\`json
"github": {
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-github"],
  "env": { "GITHUB_PERSONAL_ACCESS_TOKEN": "ghp_..." }
}
\`\`\`

### 3. brave-search — 实时搜索
让 AI 能搜索最新信息，不再被训练数据截断日期限制。

### 4. puppeteer — 浏览器自动化
让 AI 帮你自动填表、截图、抓取数据。

### 5. notion — Notion 知识库
直接读写 Notion，打造 AI 驱动的个人知识管理系统。

### 6. sqlite — 本地数据库
用自然语言查询和操作 SQLite 数据库。

### 7. fetch — 网页内容抓取
抓取任意网页并转为 Markdown，AI 直接分析。

### 8. slack — 团队沟通自动化
让 AI 帮你发 Slack 消息、查历史记录、自动通知。

### 9. google-drive — 云端文件管理
读写 Google Docs/Sheets，实现 AI 驱动的文档自动化。

### 10. sequential-thinking — 增强推理
复杂问题让 AI 一步步思考，显著提升回答质量。

---

👉 [浏览全部 MCP Server](/mcp)
`,
    level: 'beginner',
    category: 'mcp',
    tags: ['MCP', '效率工具', '最佳实践', '推荐清单'],
    estimated_minutes: 10,
    related_tools: ['filesystem', 'github', 'brave-search', 'notion'],
    is_featured: true,
    published_at: '2025-05-01T08:00:00Z'
  },
  {
    slug: 'claude-computer-use-tutorial',
    title: 'Claude + Computer Use：让 AI 帮你自动填表格、刷网页',
    subtitle: '从零开始使用 Anthropic 的计算机控制功能',
    summary:
      'Claude Computer Use 让 AI 能直接操控电脑界面，本教程带你了解如何通过 API 启用这项功能，并实现自动填写表格、网页数据抓取等实际场景。',
    content: `# Claude Computer Use 教程

## 什么是 Computer Use？

Computer Use 允许 Claude 通过截图感知屏幕状态，然后通过模拟鼠标点击、键盘输入来操控电脑，就像人类使用电脑一样。

**目前支持的操作**：
- 截取屏幕截图
- 移动鼠标、点击
- 键盘输入
- 滚动页面

## 运行环境设置

Anthropic 提供了一个预配置的 Docker 镜像：

\`\`\`bash
# 启动演示环境
docker run \\
  -e ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY \\
  -v $HOME/.anthropic:/home/user/.anthropic \\
  -p 5900:5900 \\
  -p 8501:8501 \\
  -p 6080:6080 \\
  -it ghcr.io/anthropics/anthropic-quickstarts:computer-use-demo-latest

# 通过浏览器访问 http://localhost:6080 查看 AI 操控的桌面
\`\`\`

## 实战：让 AI 自动填写表单

\`\`\`python
import anthropic

client = anthropic.Anthropic()

response = client.beta.messages.create(
    model="claude-3-5-sonnet-20241022",
    max_tokens=4096,
    tools=[{"type": "computer_20241022", "name": "computer", "display_width_px": 1024, "display_height_px": 768}],
    betas=["computer-use-2024-10-22"],
    messages=[{
        "role": "user",
        "content": "打开浏览器，访问 https://example.com/form，填写姓名为'张三'，邮箱为'zhang@example.com'，然后提交"
    }]
)
\`\`\`

## 注意事项

- ⚠️ Computer Use 目前处于 Beta 阶段
- 不要让 AI 操控包含敏感信息的应用
- 建议在沙盒环境中使用
- 每次操作都需要截图，API 费用较高
`,
    level: 'advanced',
    category: 'agent',
    tags: ['Claude', 'Computer Use', '浏览器自动化', 'API'],
    estimated_minutes: 20,
    related_tools: ['Claude Computer Use', 'puppeteer'],
    is_featured: false,
    published_at: '2025-05-15T08:00:00Z'
  },
  {
    slug: 'cursor-mcp-setup-guide',
    title: '在 Cursor 中配置 MCP：构建超强 AI 编程环境',
    subtitle: '让 AI 编辑器直连 GitHub、数据库、实时搜索',
    summary:
      'Cursor 是目前最受欢迎的 AI 代码编辑器，配合 MCP 后能力倍增。本文手把手带你配置 5 个最实用的 MCP Server，让 AI 能直接操作 GitHub PR、查询数据库、搜索实时文档，把 Cursor 变成真正的 AI 编程 Agent。',
    content: `# 在 Cursor 中配置 MCP：30 分钟构建超强 AI 编程环境

## 为什么需要 MCP？

默认 Cursor 只能操作当前打开的文件。配置 MCP 后，AI 可以：
- 直接查询 GitHub Issues 和 PR
- 读写任意目录的文件
- 执行 SQL 数据库查询
- 搜索实时网页和文档信息

## 快速开始

### 1. 打开 MCP 配置文件

按 \`Cmd + Shift + J\` 打开设置，或直接编辑：

\`\`\`bash
# macOS
open ~/.cursor/mcp.json
\`\`\`

### 2. 配置 5 个必备 MCP Server

\`\`\`json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/你的用户名/projects"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_PERSONAL_ACCESS_TOKEN": "你的Token"
      }
    },
    "brave-search": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-brave-search"],
      "env": {
        "BRAVE_API_KEY": "你的API Key"
      }
    },
    "sqlite": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-sqlite", "--db-path", "/path/to/project.db"]
    },
    "fetch": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-fetch"]
    }
  }
}
\`\`\`

### 3. 获取 GitHub Personal Access Token

1. 访问 GitHub → Settings → Developer Settings → Personal Access Tokens
2. 创建新 Token（Classic），勾选 \`repo\`、\`read:org\` 权限
3. 复制 Token 到配置文件

### 4. 申请 Brave Search API Key

1. 访问 https://api.search.brave.com 注册账号
2. 免费套餐：每月 2000 次查询，足够日常使用
3. 复制 API Key 到配置文件

## 验证配置

重启 Cursor 后，在 Chat 中测试：

> "列出我 github.com/你的用户名 仓库的最近 5 个 Issues"

如果 AI 能正确返回 GitHub Issues 列表，说明 MCP 配置成功 ✅

## 实战：让 AI 帮你修 Bug

\`\`\`
你：帮我查一下 #42 这个 Issue，然后找到相关代码修复它
AI：已获取 Issue 内容... 正在分析代码库... 发现问题在 src/auth/validator.ts 第 38 行...
    已生成修复方案，是否创建 PR？
\`\`\`

## 进阶配置

- 添加 \`notion\` MCP：让 AI 直接更新项目文档
- 添加 \`docker\` MCP：让 AI 管理容器和查看日志
- 添加 \`supabase\` MCP：直接操作生产数据库（谨慎使用！）

👉 [查看全部 MCP Server](/mcp)
`,
    level: 'intermediate',
    category: 'mcp',
    tags: ['Cursor', 'MCP', 'GitHub', 'AI编程', '实战配置'],
    estimated_minutes: 20,
    related_tools: ['Cursor', 'github', 'brave-search', 'filesystem'],
    is_featured: true,
    published_at: '2025-04-10T08:00:00Z'
  },
  {
    slug: 'dify-enterprise-knowledge-base',
    title: '用 Dify 搭建企业知识库问答系统',
    subtitle: '30 分钟上线 RAG 应用，告别信息孤岛',
    summary:
      'Dify 是最流行的开源 LLMOps 平台，内置 RAG 知识库功能。本文从零开始，教你把公司文档、内部 Wiki、产品手册全部导入，搭建一个能准确回答业务问题的企业 AI 助手，并分享提升准确率的关键调优技巧。',
    content: `# 用 Dify 搭建企业知识库问答系统

## 什么是 RAG？

RAG（Retrieval-Augmented Generation）= 检索 + 生成

普通 AI 回答问题只靠训练数据，RAG 会先在你的文档库中搜索相关内容，再结合搜索结果生成答案。

**效果对比**：
- 普通 ChatGPT：不了解你公司的产品和流程
- RAG 知识库：能准确回答"我们的退款政策是什么？"

## 1. 安装 Dify

\`\`\`bash
# 克隆仓库
git clone https://github.com/langgenius/dify.git
cd dify/docker

# 启动所有服务
cp .env.example .env
docker compose up -d

# 访问 http://localhost/install 完成初始化
\`\`\`

## 2. 创建知识库

1. 登录 Dify → 点击 **知识库** → **创建知识库**
2. 上传文档（支持 PDF、Word、Markdown、网页链接）
3. 设置分块策略：
   - **分块大小**：推荐 500-1000 字符
   - **重叠长度**：推荐 100 字符（避免语义断裂）
4. 选择 Embedding 模型（推荐 text-embedding-3-small，性价比最高）
5. 等待向量化完成

## 3. 创建 AI 助手应用

1. 点击 **应用** → **创建应用** → **聊天助手**
2. 在编排界面绑定上一步创建的知识库
3. 设置系统提示词：

\`\`\`
你是公司的 AI 客服助手。请基于提供的知识库内容回答用户问题。
如果知识库中没有相关信息，请明确告知"我在知识库中没有找到相关信息"，不要编造答案。
回答要简洁准确，如有必要请引用来源文档。
\`\`\`

## 4. 关键调优技巧

### 提升召回准确率

| 问题 | 解决方案 |
|------|---------|
| 找不到相关内容 | 降低相似度阈值（0.5→0.3）|
| 找到太多无关内容 | 提高阈值或减少召回数量 |
| 答案不完整 | 增加分块大小或召回数量 |
| 引用了错误来源 | 开启 Rerank 模型重排序 |

### 混合检索（推荐）

同时启用**向量搜索**（语义）和**全文搜索**（关键词），两者互补，准确率提升 20-30%。

## 5. 发布和集成

- **Web 应用**：Dify 提供现成的 Web 界面，一键分享链接
- **API 集成**：通过 REST API 嵌入到你的产品中
- **飞书/企业微信**：通过官方集成直接在 IM 中使用

👉 [查看 Dify 使用案例](/usecases)
`,
    level: 'intermediate',
    category: 'hands-on',
    tags: ['Dify', 'RAG', '知识库', '企业AI', 'LLMOps'],
    estimated_minutes: 25,
    related_tools: ['Dify', 'Claude', 'notion', 'filesystem'],
    is_featured: true,
    published_at: '2025-04-20T08:00:00Z'
  },
  {
    slug: 'langgraph-stateful-agent',
    title: '用 LangGraph 构建多步骤 Agent',
    subtitle: '状态机思维：让 Agent 像工作流一样可控',
    summary:
      'LangGraph 是 LangChain 团队推出的 Agent 编排框架，用图（DAG）的方式组织 Agent 逻辑，支持循环、条件分支、状态持久化和人工干预点。相比 ReAct Agent，LangGraph 的行为更可预测、更易调试，是生产级 Agent 开发的首选。',
    content: `# 用 LangGraph 构建多步骤 Agent

## LangGraph vs ReAct Agent

| 维度 | ReAct Agent | LangGraph |
|------|------------|-----------|
| 控制流 | 模型自主决定 | 开发者定义图结构 |
| 可调试性 | 难以追踪 | 每步骤状态可见 |
| 循环支持 | 有限 | 原生支持 |
| 人工干预 | 不支持 | 内置 Interrupt |
| 生产可用 | 一般 | 推荐 |

## 核心概念

\`\`\`
State（状态）：Agent 的记忆，贯穿整个执行过程
Node（节点）：执行具体工作的函数
Edge（边）：节点间的连接，可以是条件跳转
Graph（图）：所有节点和边的集合
\`\`\`

## 安装

\`\`\`bash
pip install langgraph langchain-anthropic
\`\`\`

## 实战：研究报告 Agent

\`\`\`python
from typing import TypedDict, List
from langgraph.graph import StateGraph, END
from langchain_anthropic import ChatAnthropic

# 1. 定义状态
class ResearchState(TypedDict):
    topic: str
    search_results: List[str]
    outline: str
    report: str
    iteration: int

# 2. 定义节点函数
def search_node(state: ResearchState) -> ResearchState:
    """搜索相关信息"""
    # 调用搜索 MCP 或 API
    results = search_web(state["topic"])
    return {"search_results": results}

def outline_node(state: ResearchState) -> ResearchState:
    """生成报告大纲"""
    llm = ChatAnthropic(model="claude-3-5-sonnet-20241022")
    outline = llm.invoke(f"基于以下信息生成报告大纲：{state['search_results']}")
    return {"outline": outline.content}

def write_node(state: ResearchState) -> ResearchState:
    """撰写完整报告"""
    llm = ChatAnthropic(model="claude-3-5-sonnet-20241022")
    report = llm.invoke(f"根据大纲撰写完整报告：{state['outline']}")
    return {"report": report.content, "iteration": state.get("iteration", 0) + 1}

def review_node(state: ResearchState) -> str:
    """决定是继续改进还是完成"""
    if state["iteration"] >= 2:
        return "complete"
    # 检查报告质量
    if len(state["report"]) > 2000:
        return "complete"
    return "revise"

# 3. 构建图
builder = StateGraph(ResearchState)
builder.add_node("search", search_node)
builder.add_node("outline", outline_node)
builder.add_node("write", write_node)

builder.set_entry_point("search")
builder.add_edge("search", "outline")
builder.add_edge("outline", "write")
builder.add_conditional_edges("write", review_node, {
    "complete": END,
    "revise": "search"  # 循环重新搜索
})

graph = builder.compile()

# 4. 运行
result = graph.invoke({"topic": "2025年 AI Agent 发展趋势"})
print(result["report"])
\`\`\`

## 添加人工审核节点

\`\`\`python
from langgraph.checkpoint.memory import MemorySaver

# 在敏感操作前暂停，等待人工确认
builder.add_node("human_review", lambda state: state)
builder.add_edge("outline", "human_review")

# 使用 interrupt_before 参数
graph = builder.compile(
    checkpointer=MemorySaver(),
    interrupt_before=["human_review"]
)

# 运行到中断点
config = {"configurable": {"thread_id": "research-1"}}
graph.invoke({"topic": "..."}, config=config)

# 人工审核后继续
graph.invoke(None, config=config)  # 从断点继续
\`\`\`

## 最佳实践

1. **状态不可变**：每个节点返回新状态，不直接修改
2. **节点单一职责**：每个节点只做一件事
3. **条件边用枚举**：返回字符串 key，避免拼写错误
4. **持久化检查点**：生产环境使用 PostgresSaver 而非 MemorySaver

👉 [查看 Agent 工具](/agents)
`,
    level: 'advanced',
    category: 'agent',
    tags: ['LangGraph', 'Agent', 'Python', '状态机', '可控AI'],
    estimated_minutes: 35,
    related_tools: ['LangGraph', 'Claude', 'brave-search'],
    is_featured: true,
    published_at: '2025-05-01T08:00:00Z'
  },
  {
    slug: 'local-deepseek-ollama',
    title: '本地运行 DeepSeek：零成本私有 AI 部署',
    subtitle: '用 Ollama 在 Mac/Linux 上跑开源大模型',
    summary:
      '不想把数据发给 OpenAI？本文教你用 Ollama 在本地机器上运行 DeepSeek-R1 等开源模型，完全离线、零 API 费用、数据不出本地。从安装到配置 Cursor/Continue 接入本地模型，全程图文指南。',
    content: `# 本地运行 DeepSeek：零成本私有 AI 部署

## 为什么选择本地部署？

- **隐私安全**：代码、文档永不离开本地
- **零费用**：一次配置，无限使用
- **低延迟**：局域网速度，无网络延迟
- **离线可用**：断网也能正常工作

## 硬件要求

| 模型 | 最低显存/内存 | 推荐配置 |
|------|-------------|---------|
| DeepSeek-R1 1.5B | 4GB RAM | M2 MacBook Air |
| DeepSeek-R1 7B | 8GB RAM | M2 MacBook Pro |
| DeepSeek-R1 14B | 16GB RAM | M3 MacBook Pro |
| DeepSeek-R1 32B | 32GB RAM | M3 Max / RTX 4090 |

> 💡 Apple Silicon Mac 的统一内存效率极高，M3 Max 可流畅运行 32B 模型

## 1. 安装 Ollama

\`\`\`bash
# macOS / Linux 一键安装
curl -fsSL https://ollama.ai/install.sh | sh

# 验证安装
ollama --version
\`\`\`

## 2. 下载并运行 DeepSeek

\`\`\`bash
# 下载 7B 模型（4.7GB）
ollama pull deepseek-r1:7b

# 直接运行对话
ollama run deepseek-r1:7b

# 或者后台启动服务（供其他应用调用）
ollama serve
\`\`\`

## 3. 接入 Cursor/VS Code

### Cursor 配置

1. 打开 Cursor Settings → Models
2. 添加自定义模型：
   - Base URL: \`http://localhost:11434/v1\`
   - API Key: \`ollama\`（任意字符串）
   - Model: \`deepseek-r1:7b\`

### Continue 插件配置（VS Code）

\`\`\`json
// ~/.continue/config.json
{
  "models": [
    {
      "title": "DeepSeek R1 Local",
      "provider": "ollama",
      "model": "deepseek-r1:7b",
      "apiBase": "http://localhost:11434"
    }
  ]
}
\`\`\`

## 4. OpenAI 兼容 API

Ollama 提供 OpenAI 兼容的 API，任何支持 OpenAI API 的工具都可以无缝接入：

\`\`\`python
from openai import OpenAI

client = OpenAI(
    base_url="http://localhost:11434/v1",
    api_key="ollama"
)

response = client.chat.completions.create(
    model="deepseek-r1:7b",
    messages=[{"role": "user", "content": "解释量子纠缠"}]
)
print(response.choices[0].message.content)
\`\`\`

## 5. 其他推荐本地模型

\`\`\`bash
# 代码专项（推荐）
ollama pull qwen2.5-coder:7b

# 中文能力最强
ollama pull qwen2.5:14b

# 通用推理
ollama pull llama3.3:70b  # 需要 32GB+ 内存
\`\`\`

## 常见问题

**Q：速度太慢怎么办？**
A：选择更小的模型（1.5B/3B），或使用 \`num_gpu=-1\` 强制使用全部 GPU 层。

**Q：Cursor 显示连接失败？**
A：确认 \`ollama serve\` 已在运行，端口 11434 未被占用。

**Q：中文效果差怎么办？**
A：切换到 Qwen2.5 系列，中文能力更强。

👉 [对比更多模型](/models)
`,
    level: 'beginner',
    category: 'hands-on',
    tags: ['DeepSeek', 'Ollama', '本地部署', '开源模型', '隐私安全'],
    estimated_minutes: 20,
    related_tools: ['Ollama', 'DeepSeek-R1', 'Cursor'],
    is_featured: false,
    published_at: '2025-05-10T08:00:00Z'
  },
  {
    slug: 'n8n-ai-workflow-automation',
    title: '用 n8n + AI Agent 自动化你的日常工作流',
    subtitle: '零代码连接 200+ 应用，让 AI 接管重复性工作',
    summary:
      'n8n 是目前最强大的开源自动化平台，结合 AI Agent 能力，可以将你的日常重复工作完全自动化。本教程以"每日新闻摘要"和"邮件自动处理"为例，展示如何快速搭建工作流。',
    content: `# n8n + AI Agent 工作流教程

## 为什么选择 n8n？

- **完全开源**：可自托管，数据不外流
- **400+ 集成**：Gmail、Slack、GitHub、Notion...
- **可视化编排**：拖拽连接节点，无需写代码
- **AI 原生**：内置 OpenAI、Claude 等 AI 节点

## 安装 n8n

\`\`\`bash
# Docker 安装（推荐）
docker run -it --rm \\
  -p 5678:5678 \\
  -v ~/.n8n:/home/node/.n8n \\
  n8nio/n8n

# 访问 http://localhost:5678
\`\`\`

## 实战 1：每日 AI 新闻摘要邮件

**工作流设计**：
\`\`\`
定时触发（每天 8:00）
    ↓
HTTP Request → 抓取 AI 新闻 RSS
    ↓
AI Agent（Claude）→ 总结今日要点
    ↓
Gmail → 发送摘要邮件
\`\`\`

**关键节点配置**：

AI Agent 提示词：
\`\`\`
以下是今日的 AI 行业新闻：
{{ $json.items }}

请用中文总结：
1. 今日最重要的 3 条新闻
2. 对 AI 行业的影响分析
3. 值得关注的新产品或研究
\`\`\`

## 实战 2：智能邮件处理

**工作流设计**：
\`\`\`
Gmail Trigger（新邮件到达）
    ↓
AI Agent → 判断邮件类型和优先级
    ↓
Switch 节点：
  重要邮件 → 发 Slack 通知
  垃圾邮件 → 自动标记
  普通邮件 → 起草回复草稿
\`\`\`

## 进阶技巧

- 使用 **Code 节点** 处理复杂数据转换
- 使用 **Sub-workflow** 复用工作流模块
- 配置 **Error Workflow** 处理失败情况
`,
    level: 'intermediate',
    category: 'workflow',
    tags: ['n8n', '工作流', '自动化', '邮件处理'],
    estimated_minutes: 25,
    related_tools: ['n8n', 'Claude', 'notion'],
    is_featured: false,
    published_at: '2025-06-01T08:00:00Z'
  }
];

export const fakeTutorials = {
  records: [] as Tutorial[],

  initialize() {
    this.records = TUTORIAL_DATA.map((item, i) => ({ ...item, id: i + 1 }));
  },

  async getTutorials({
    level,
    category,
    search
  }: {
    level?: string;
    category?: string;
    search?: string;
  } = {}) {
    await delay(200);
    let items = [...this.records];
    if (level && level !== 'all') items = items.filter((t) => t.level === level);
    if (category && category !== 'all') items = items.filter((t) => t.category === category);
    if (search) {
      items = items.filter(
        (t) =>
          t.title.toLowerCase().includes(search.toLowerCase()) ||
          t.summary.toLowerCase().includes(search.toLowerCase()) ||
          t.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))
      );
    }
    return items;
  },

  async getTutorialBySlug(slug: string): Promise<Tutorial | null> {
    await delay(150);
    return this.records.find((t) => t.slug === slug) ?? null;
  },

  async getFeatured(): Promise<Tutorial[]> {
    await delay(150);
    return this.records.filter((t) => t.is_featured);
  },

  async create(payload: Omit<Tutorial, 'id'>): Promise<Tutorial> {
    await delay(400);
    const newItem: Tutorial = { ...payload, id: this.records.length + 1 };
    this.records.push(newItem);
    return newItem;
  },

  async update(id: number, payload: Partial<Omit<Tutorial, 'id'>>): Promise<Tutorial | null> {
    await delay(300);
    const idx = this.records.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    this.records[idx] = { ...this.records[idx], ...payload };
    return this.records[idx];
  },

  async delete(id: number): Promise<boolean> {
    await delay(200);
    const idx = this.records.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    this.records.splice(idx, 1);
    return true;
  }
};

fakeTutorials.initialize();
