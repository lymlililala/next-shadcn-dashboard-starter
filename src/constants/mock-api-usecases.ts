////////////////////////////////////////////////////////////////////////////////
// 🛑 Nothing in here has anything to do with Nextjs, it's just a fake database
////////////////////////////////////////////////////////////////////////////////

import { delay } from './mock-api';

export type UseCaseIndustry =
  | 'marketing'
  | 'engineering'
  | 'research'
  | 'productivity'
  | 'industry';
export type UseCaseDifficulty = 1 | 2 | 3; // 1=⭐ 2=⭐⭐ 3=⭐⭐⭐

export type UseCase = {
  id: number;
  title: string;
  description: string;
  tools: string[]; // 推荐工具组合
  industry: UseCaseIndustry;
  difficulty: UseCaseDifficulty;
  estimated_time: string; // "30分钟"
  steps: string[]; // 实现步骤摘要
  tags: string[];
  is_featured: boolean;
};

const USECASE_DATA: Omit<UseCase, 'id'>[] = [
  // ── 营销类 ────────────────────────────────────────────────────────────────
  {
    title: '自动生成社交媒体内容日历',
    description:
      '让 AI Agent 根据品牌定位和热点话题，自动生成一周的社交媒体内容日历，包含文案、发布时间建议和配图描述，大幅降低内容团队工作量。',
    tools: ['Manus', 'Dify', 'brave-search'],
    industry: 'marketing',
    difficulty: 2,
    estimated_time: '1小时搭建，每周自动运行',
    steps: [
      '配置 Dify 工作流，连接 Brave Search 获取行业热点',
      '设置 AI Agent 提示词，定义品牌语调和内容格式',
      '让 Agent 生成 7 天内容日历',
      '输出到 Notion 或 Google Sheets 供团队审核'
    ],
    tags: ['社交媒体', '内容营销', '自动化', '内容日历'],
    is_featured: true
  },
  {
    title: '竞品监控 + 周报自动生成',
    description:
      '设置 Agent 每周自动抓取竞品官网、社交媒体和新闻动态，分析变化并生成结构化竞品周报，帮助团队及时了解市场动向。',
    tools: ['OpenClaw', 'Perplexity', 'fetch', 'google-drive'],
    industry: 'marketing',
    difficulty: 3,
    estimated_time: '2小时搭建，每周自动运行',
    steps: [
      '用 fetch MCP 定期抓取竞品官网内容',
      'Perplexity 搜索竞品相关新闻和社交讨论',
      'AI 分析变化趋势并提炼关键洞察',
      '生成格式化周报并上传 Google Drive'
    ],
    tags: ['竞品分析', '市场监控', '周报', '情报收集'],
    is_featured: true
  },
  {
    title: 'SEO 关键词研究 + 文章批量生成',
    description:
      '通过 AI Agent 完成从关键词发现到文章生成的全流程：搜索目标关键词的搜索意图、竞品排名内容、生成 SEO 优化文章大纲和正文。',
    tools: ['AutoGPT', 'brave-search', 'tavily', 'filesystem'],
    industry: 'marketing',
    difficulty: 2,
    estimated_time: '30分钟/篇',
    steps: [
      '输入目标关键词和竞争对手域名',
      'Agent 自动分析 SERP 结果和用户意图',
      '生成 SEO 优化的文章大纲',
      '逐节生成文章正文并保存到本地'
    ],
    tags: ['SEO', '关键词研究', '内容生成', '搜索优化'],
    is_featured: false
  },
  // ── 编程类 ────────────────────────────────────────────────────────────────
  {
    title: '自动修复 GitHub Issues',
    description:
      '将 Devin 或 SWE-agent 接入 GitHub，让 AI Agent 自动拉取 Issues、分析代码库、生成修复方案并提交 Pull Request，显著提升开发效率。',
    tools: ['Devin', 'SWE-agent', 'github'],
    industry: 'engineering',
    difficulty: 3,
    estimated_time: '配置1小时，之后全自动',
    steps: [
      '安装 SWE-agent 并配置 GitHub Token',
      '设置触发规则（Label 为 "auto-fix" 的 Issues）',
      'Agent 分析 Issue 和相关代码',
      '生成 PR 并等待人工 Review'
    ],
    tags: ['GitHub', 'Bug修复', '自动化', 'SWE-agent'],
    is_featured: true
  },
  {
    title: '代码 Review + 测试用例自动生成',
    description:
      '在 Cursor 中配置 GitHub MCP，让 AI 在代码提交时自动进行初步 Review，指出潜在问题，并为新增功能自动生成单元测试用例。',
    tools: ['Cursor', 'github', 'filesystem'],
    industry: 'engineering',
    difficulty: 2,
    estimated_time: '30分钟配置',
    steps: [
      '在 Cursor 中安装 GitHub MCP Server',
      '设置代码 Review 提示词模板',
      '触发自动 Review 并查看建议',
      '让 AI 基于函数签名生成测试用例'
    ],
    tags: ['代码Review', '测试用例', 'Cursor', '代码质量'],
    is_featured: false
  },
  {
    title: '数据库查询自动化（自然语言转 SQL）',
    description:
      '通过 SQLite 或 PostgreSQL MCP，让非技术人员也能用自然语言查询数据库。"查询上周新增用户数量" → AI 自动生成并执行 SQL，返回结果。',
    tools: ['OpenClaw', 'sqlite', 'postgres'],
    industry: 'engineering',
    difficulty: 2,
    estimated_time: '1小时搭建',
    steps: [
      '配置数据库 MCP Server 连接到目标库',
      '设置只读权限保障数据安全',
      '编写系统提示词，描述数据库表结构',
      '非技术人员可直接用中文提问'
    ],
    tags: ['SQL', '数据库', '自然语言', '数据查询'],
    is_featured: false
  },
  // ── 研究类 ────────────────────────────────────────────────────────────────
  {
    title: '行业调研报告自动生成',
    description:
      '给 Deep Research 或 Genspark 输入一个研究主题，30分钟内自动搜索数十个来源、提炼关键数据、生成带完整引用的专业调研报告。',
    tools: ['OpenAI Deep Research', 'Genspark', 'brave-search'],
    industry: 'research',
    difficulty: 1,
    estimated_time: '30分钟',
    steps: [
      '访问 Deep Research 或 Genspark',
      '输入研究主题和报告框架要求',
      'AI 自动搜索和整合信息',
      '下载带引用来源的完整报告'
    ],
    tags: ['调研报告', 'Deep Research', '信息整合', '一键生成'],
    is_featured: true
  },
  {
    title: '论文摘要批量提取 + 对比分析',
    description:
      '将多篇 PDF 论文上传后，让 AI Agent 自动提取摘要、研究方法、主要发现，并生成对比分析表格，帮助研究人员快速掌握领域进展。',
    tools: ['Perplexity', 'filesystem', 'fetch'],
    industry: 'research',
    difficulty: 2,
    estimated_time: '15分钟/批次',
    steps: [
      '将 PDF 上传到指定文件夹',
      '配置 filesystem MCP 读取文件',
      '让 AI 提取关键信息并结构化',
      '生成 Markdown 对比表格'
    ],
    tags: ['论文分析', '学术研究', 'PDF', '批量处理'],
    is_featured: false
  },
  {
    title: '竞争对手产品分析',
    description:
      '让 Agent 系统性地分析竞争对手的产品特性、定价策略、用户评价和市场定位，生成全面的竞品分析报告，支撑产品决策。',
    tools: ['Manus', 'brave-search', 'fetch'],
    industry: 'research',
    difficulty: 2,
    estimated_time: '1小时',
    steps: [
      '列出目标竞品清单',
      'Agent 自动访问官网、AppStore评价、社交媒体',
      '分析产品特性矩阵和差异化优势',
      '生成结构化竞品分析报告'
    ],
    tags: ['竞品分析', '产品策略', '市场研究'],
    is_featured: false
  },
  // ── 效率/个人类 ───────────────────────────────────────────────────────────
  {
    title: '邮件自动分类 + 回复草稿',
    description:
      '通过 n8n 连接 Gmail，让 AI 自动判断邮件优先级、生成分类标签，并为重要邮件起草回复草稿，每天节省1小时邮件处理时间。',
    tools: ['OpenClaw', 'n8n', 'google-drive'],
    industry: 'productivity',
    difficulty: 2,
    estimated_time: '2小时搭建',
    steps: [
      '在 n8n 创建 Gmail Trigger 工作流',
      '接入 AI 节点判断邮件类型和优先级',
      '重要邮件生成回复草稿并标记',
      '发送 Slack 通知提醒处理高优先级邮件'
    ],
    tags: ['邮件管理', 'Gmail', '效率工具', 'n8n'],
    is_featured: true
  },
  {
    title: '会议记录自动转任务清单',
    description:
      '录制会议音频后，AI 自动转录 → 识别 Action Items → 分配负责人 → 创建 Notion 任务，再也不用手动整理会议纪要。',
    tools: ['n8n', 'notion', 'filesystem'],
    industry: 'productivity',
    difficulty: 2,
    estimated_time: '1小时搭建',
    steps: [
      '会议结束后上传录音文件',
      'Whisper API 自动转录为文字',
      'AI 提取 Action Items 和负责人',
      '自动创建 Notion 任务并@相关人员'
    ],
    tags: ['会议记录', 'Notion', '任务管理', '效率'],
    is_featured: false
  },
  {
    title: '个人知识库问答系统搭建',
    description:
      '将你的笔记、文档、书签全部导入，构建个人知识库，然后用自然语言问答方式检索。"上周看的那篇关于向量数据库的文章说了什么？"',
    tools: ['Dify', 'filesystem', 'notion'],
    industry: 'productivity',
    difficulty: 3,
    estimated_time: '3小时搭建',
    steps: [
      '整理并导出 Notion/Obsidian 笔记',
      '在 Dify 创建知识库并上传文档',
      '配置 RAG 参数（分块大小、相似度阈值）',
      '搭建对话界面并测试问答效果'
    ],
    tags: ['个人知识库', 'RAG', 'Dify', '笔记管理'],
    is_featured: true
  },
  // ── 垂直行业类 ───────────────────────────────────────────────────────────
  {
    title: '法律合同关键条款自动审查',
    description:
      '上传合同 PDF，AI 自动识别风险条款、不平等条款、缺失的关键保护性条款，输出标注报告，帮助法务人员提升合同审查效率 3-5 倍。',
    tools: ['Claude', 'filesystem'],
    industry: 'industry',
    difficulty: 3,
    estimated_time: '15分钟/份合同',
    steps: [
      '配置 filesystem MCP 读取 PDF 合同',
      '编写专业的合同审查提示词',
      'Claude 逐条分析关键条款',
      '输出带风险等级的审查报告'
    ],
    tags: ['法律', '合同审查', 'PDF', '法务自动化'],
    is_featured: false
  },
  {
    title: '电商选品分析 + 上架文案生成',
    description:
      '输入目标品类，AI Agent 自动爬取平台畅销排行、分析竞争格局、评估利润空间，并为选定商品自动生成多版本上架文案和主图描述。',
    tools: ['OpenClaw', 'brave-search', 'fetch'],
    industry: 'industry',
    difficulty: 2,
    estimated_time: '1小时',
    steps: [
      '输入目标品类和目标平台',
      'Agent 搜索热销商品和市场数据',
      '分析竞争格局和价格带',
      '生成商品标题、卖点、详情页文案'
    ],
    tags: ['电商', '选品', '商品文案', '竞争分析'],
    is_featured: false
  },
  {
    title: '财务数据可视化报告自动生成',
    description:
      '连接 Excel 或数据库，让 AI Agent 自动生成月度财务分析报告：收入趋势、成本结构、利润分析、异常预警，并以可视化图表呈现。',
    tools: ['DeepSearcher', 'sqlite', 'filesystem'],
    industry: 'industry',
    difficulty: 3,
    estimated_time: '2小时搭建',
    steps: [
      '配置数据库 MCP 连接财务系统',
      '定义报告模板和分析维度',
      'AI 自动生成 SQL 查询并分析数据',
      '输出包含图表和洞察的 Markdown 报告'
    ],
    tags: ['财务分析', '数据可视化', '自动报告', '商业智能'],
    is_featured: false
  },
  // ── 新增：研究类 ───────────────────────────────────────────────────────────
  {
    title: '投资尽调报告自动化',
    description:
      '输入目标公司名称，AI Agent 自动搜索公司背景、融资历史、创始团队、竞争格局和行业地位，30分钟生成专业投资尽调报告，替代初级分析师 2-3 天的工作量。',
    tools: ['Genspark', 'Perplexity', 'brave-search', 'filesystem'],
    industry: 'research',
    difficulty: 2,
    estimated_time: '30分钟',
    steps: [
      '输入目标公司名称和调研侧重点',
      'Agent 自动搜索公司官网、Crunchbase、领英',
      '分析融资轮次、估值趋势和投资方',
      '整合团队背景和竞争格局分析',
      '生成结构化尽调报告并导出'
    ],
    tags: ['投资尽调', '公司分析', '融资研究', '自动化'],
    is_featured: true
  },
  {
    title: '专利文献批量分析',
    description:
      '批量下载和分析竞争对手的专利文献，AI 提取技术方案要点、保护范围和申请趋势，帮助研发团队快速了解技术格局并规避专利风险。',
    tools: ['Claude', 'filesystem', 'fetch', 'brave-search'],
    industry: 'research',
    difficulty: 3,
    estimated_time: '2-3小时/批次',
    steps: [
      '确定目标专利范围和关键词',
      '通过 fetch MCP 下载 USPTO/EPO 专利文档',
      'Claude 分析专利权利要求书和技术方案',
      '生成专利地图和风险评估报告'
    ],
    tags: ['专利分析', '知识产权', 'R&D', '技术竞争'],
    is_featured: false
  },
  // ── 新增：编程类 ───────────────────────────────────────────────────────────
  {
    title: 'API 文档自动生成',
    description:
      '将代码库接入 AI Agent，让其自动分析函数签名、注释和使用样例，生成标准化的 API 文档（OpenAPI/Swagger 格式），彻底告别手写文档。',
    tools: ['Cursor', 'filesystem', 'github'],
    industry: 'engineering',
    difficulty: 2,
    estimated_time: '1-2小时/项目',
    steps: [
      '配置 filesystem MCP 让 AI 读取代码库',
      '让 AI 分析 Controller/Route 层代码',
      '自动识别接口参数和返回值结构',
      '生成 OpenAPI 3.0 规范 JSON 文件',
      '一键生成 Swagger UI 展示文档'
    ],
    tags: ['API文档', 'OpenAPI', 'Swagger', '自动化文档'],
    is_featured: false
  },
  {
    title: '微服务监控告警 Agent',
    description:
      '将 Agent 接入 Sentry + Kubernetes，让其实时监控服务健康状态：当检测到错误激增或 Pod 异常时，自动分析根因、定位问题代码并发送 Slack 告警，带出初步处理建议。',
    tools: ['OpenHands', 'sentry', 'kubernetes', 'slack'],
    industry: 'engineering',
    difficulty: 3,
    estimated_time: '2小时配置',
    steps: [
      '安装并配置 Sentry MCP 和 K8s MCP',
      '设置监控阈值和触发条件',
      'Agent 接收告警后自动分析堆栈跟踪',
      '关联 GitHub 代码变更找到引入原因',
      '通过 Slack MCP 发送分析报告'
    ],
    tags: ['监控告警', 'Kubernetes', 'Sentry', 'DevOps'],
    is_featured: true
  },
  // ── 新增：效率类 ───────────────────────────────────────────────────────────
  {
    title: '简历筛选 + 初面问题生成',
    description:
      'HR 上传大量简历 PDF 后，AI Agent 自动按岗位要求评分筛选，提取候选人亮点，并为每位候选人生成针对性的初面问题清单，大幅提升招聘效率。',
    tools: ['Claude', 'filesystem', 'notion'],
    industry: 'productivity',
    difficulty: 2,
    estimated_time: '1小时搭建',
    steps: [
      '将简历 PDF 存入指定文件夹',
      '让 AI 提取教育、经验、技能信息',
      '按岗位 JD 自动评分和排序',
      '为 Top 候选人生成个性化面试问题',
      '导入 Notion 数据库供团队协作'
    ],
    tags: ['HR', '简历筛选', '招聘', '效率提升'],
    is_featured: false
  },
  {
    title: '多语言内容本地化',
    description:
      '将营销材料、产品文档或网站内容自动翻译为多语言版本，AI 不只是机翻，还会根据目标市场的文化习惯和语言风格进行本地化适配，比人工翻译快 10 倍。',
    tools: ['Claude', 'DeepSeek-V3', 'filesystem', 'google-drive'],
    industry: 'productivity',
    difficulty: 1,
    estimated_time: '30分钟/千字',
    steps: [
      '上传原始内容到 Google Drive',
      '配置目标语言和本地化风格指南',
      'AI 进行语义翻译（非逐字翻译）',
      '针对各市场文化习惯进行适配',
      '输出多语言版本对照文件'
    ],
    tags: ['多语言', '本地化', '翻译', '国际化'],
    is_featured: false
  },
  // ── 新增：垂直行业 ─────────────────────────────────────────────────────────
  {
    title: '医疗文献综述自动生成',
    description:
      '临床研究人员输入研究问题，AI 自动检索 PubMed/arXiv，筛选高质量文献，提取研究方法和结论，生成符合 PRISMA 规范的系统综述框架，大幅加速科研初期工作。',
    tools: ['Perplexity', 'arxiv', 'fetch', 'filesystem'],
    industry: 'industry',
    difficulty: 3,
    estimated_time: '2-4小时',
    steps: [
      '输入 PICO 格式的研究问题',
      'AI 搜索 PubMed 和 arXiv 相关论文',
      '按纳入/排除标准筛选文献',
      '提取各研究的方法和主要发现',
      '生成结构化综述框架和参考文献'
    ],
    tags: ['医疗', '文献综述', 'PubMed', '循证医学'],
    is_featured: false
  },
  {
    title: '财务报告异常检测',
    description:
      '将公司财务数据接入 AI Agent，自动对比历史趋势和行业标准，识别异常指标（如应收账款暴增、毛利率骤降），并生成风险预警报告，辅助财务分析师决策。',
    tools: ['Claude', 'postgres', 'google-drive', 'filesystem'],
    industry: 'industry',
    difficulty: 3,
    estimated_time: '2小时搭建',
    steps: [
      '连接 PostgreSQL 数据库存储财务数据',
      '配置历史对比和行业基准阈值',
      'AI 自动计算关键财务比率',
      '识别偏离正常范围的异常指标',
      '生成带优先级的风险预警报告'
    ],
    tags: ['财务分析', '异常检测', '风险预警', '审计'],
    is_featured: true
  },
  // ── 销售类 ────────────────────────────────────────────────────────────────
  {
    title: '销售线索自动评分 + 个性化跟进邮件',
    description:
      '让 AI Agent 从 CRM 中读取潜在客户数据，根据行业、公司规模、互动历史等维度自动评分（Lead Scoring），然后为高分客户生成个性化的跟进邮件草稿，销售代表只需一键审核发送，每日节省 2-3 小时重复性工作。',
    tools: ['n8n', 'Dify', 'gmail', 'google-sheets'],
    industry: 'marketing',
    difficulty: 2,
    estimated_time: '1.5小时搭建，每日自动运行',
    steps: [
      '用 n8n 从 CRM（HubSpot/Salesforce）定时拉取新增线索',
      '设计评分规则：公司规模×行业匹配度×互动频次',
      'AI 为每条高分线索生成个性化邮件（引用客户公司最新动态）',
      '草稿汇总到 Google Sheets，销售审核后批量发送',
      '追踪回复率，持续优化评分权重'
    ],
    tags: ['销售自动化', 'Lead Scoring', 'CRM', '个性化邮件', 'n8n'],
    is_featured: true
  },
  // ── HR 类 ─────────────────────────────────────────────────────────────────
  {
    title: 'JD 一键生成 + 多平台自动发布招聘',
    description:
      '输入岗位名称、核心职责和薪资范围，AI Agent 自动生成符合 HR 规范的职位描述（JD），并通过 MCP 工具同步发布到 Boss 直聘、LinkedIn、智联招聘等多个平台，并设置关键词提醒。HR 从「写 JD + 发布」的 2 小时工作压缩到 10 分钟。',
    tools: ['Dify', 'coze', 'browser-use', 'filesystem'],
    industry: 'productivity',
    difficulty: 2,
    estimated_time: '1小时搭建',
    steps: [
      '在 Dify 创建「JD 生成」工作流，输入岗位关键信息',
      'AI 根据模板和行业规范生成完整 JD',
      '用 browser-use 控制浏览器自动登录各招聘平台',
      '填写并发布 JD，截图存档备查',
      '设置候选人关键词提醒，AI 预筛简历'
    ],
    tags: ['HR自动化', '招聘', 'JD生成', '多平台发布', 'browser-use'],
    is_featured: false
  },
  // ── 产品类 ────────────────────────────────────────────────────────────────
  {
    title: '用户反馈自动聚类 + 产品需求洞察报告',
    description:
      '将 App Store 评论、用户调研、工单系统的原始反馈批量喂给 AI Agent，自动聚类相似问题、识别高频痛点、按优先级排序，生成一份结构化的「用户之声」报告，直接输出到产品 Roadmap 工具，帮助 PM 做有据可查的需求决策。',
    tools: ['OpenClaw', 'Dify', 'notion', 'google-sheets'],
    industry: 'productivity',
    difficulty: 2,
    estimated_time: '1小时搭建，随时触发',
    steps: [
      '接入数据源：App Store API / CSV 导入 / Zendesk 工单',
      'AI 对每条反馈打标签：功能请求/Bug/性能/UI体验',
      '自动聚类相似反馈，统计提及频次',
      '按「提及量×情感强度×用户价值」排序需求',
      '生成 Markdown 报告并同步到 Notion Roadmap'
    ],
    tags: ['产品经理', '用户反馈', '需求分析', 'NLP', 'Notion'],
    is_featured: true
  },
  // ── 个人效率类 ─────────────────────────────────────────────────────────────
  {
    title: '每日信息流自动整理 + 个性化早报',
    description:
      '订阅微信公众号、RSS 源、Twitter/X、知乎热榜等多个信息渠道，让 AI Agent 每天早晨自动筛选、摘要、去重，按你定义的兴趣标签（AI/投资/行业动态）整理成一份 5 分钟可读完的个人早报，发送到微信或邮箱。彻底告别刷手机浪费时间。',
    tools: ['n8n', 'coze', 'brave-search', 'gmail'],
    industry: 'productivity',
    difficulty: 1,
    estimated_time: '45分钟搭建，每日自动运行',
    steps: [
      '在 n8n 配置信息源：RSS/Twitter API/微信公众号爬取',
      '设定兴趣关键词和过滤规则（排除广告/低质内容）',
      'AI 对每篇文章生成 2-3 句核心摘要',
      '按相关性排序，合并成 Markdown 早报',
      '通过企业微信 Bot 或邮件在每天 7:30 自动发送'
    ],
    tags: ['个人效率', '信息过滤', '早报', 'RSS', 'n8n'],
    is_featured: false
  },
  // ── 教育类 ────────────────────────────────────────────────────────────────
  {
    title: '个性化学习计划 + AI 练习题生成器',
    description:
      '学生输入学习目标（如「30天通过 PMP 考试」）和当前知识水平，AI Agent 自动生成个性化学习计划：拆分知识点、推荐资源、每日任务安排；并根据每次练习结果动态调整难度，薄弱点自动加强训练，相当于一个全天候的私人 AI 家教。',
    tools: ['Dify', 'coze', 'filesystem', 'notion'],
    industry: 'research',
    difficulty: 2,
    estimated_time: '1小时搭建',
    steps: [
      '收集学员信息：目标考试/当前水平/每天可学习时长',
      'AI 拆解考试大纲，生成带优先级的知识点地图',
      '每日推送当天学习任务和对应资源',
      '完成练习后 AI 批改并分析错误模式',
      '每周生成学习进度报告，自动调整后续计划'
    ],
    tags: ['教育科技', '个性化学习', '练习题', '考试备考', 'AI家教'],
    is_featured: true
  }
];

export const fakeUseCases = {
  records: [] as UseCase[],

  initialize() {
    this.records = USECASE_DATA.map((item, i) => ({ ...item, id: i + 1 }));
  },

  async getUseCases({
    industry,
    difficulty,
    search
  }: {
    industry?: string;
    difficulty?: number;
    search?: string;
  } = {}) {
    await delay(200);
    let items = [...this.records];
    if (industry && industry !== 'all') items = items.filter((u) => u.industry === industry);
    if (difficulty) items = items.filter((u) => u.difficulty === difficulty);
    if (search) {
      items = items.filter(
        (u) =>
          u.title.toLowerCase().includes(search.toLowerCase()) ||
          u.description.toLowerCase().includes(search.toLowerCase()) ||
          u.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
      );
    }
    return items;
  },

  async getFeatured(): Promise<UseCase[]> {
    await delay(150);
    return this.records.filter((u) => u.is_featured);
  },

  async getStats() {
    await delay(100);
    const total = this.records.length;
    const featured = this.records.filter((u) => u.is_featured).length;
    const byIndustry = this.records.reduce(
      (acc, u) => {
        acc[u.industry] = (acc[u.industry] ?? 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );
    return { total, featured, byIndustry };
  },

  async create(payload: Omit<UseCase, 'id'>): Promise<UseCase> {
    await delay(400);
    const newItem: UseCase = { ...payload, id: this.records.length + 1 };
    this.records.push(newItem);
    return newItem;
  },

  async update(id: number, payload: Partial<Omit<UseCase, 'id'>>): Promise<UseCase | null> {
    await delay(300);
    const idx = this.records.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    this.records[idx] = { ...this.records[idx], ...payload };
    return this.records[idx];
  },

  async delete(id: number): Promise<boolean> {
    await delay(200);
    const idx = this.records.findIndex((u) => u.id === id);
    if (idx === -1) return false;
    this.records.splice(idx, 1);
    return true;
  }
};

fakeUseCases.initialize();
