#!/usr/bin/env node
/**
 * 将 OpenClaw Skills 数据导入到 Supabase skill_tools 表
 * 数据来源：wenzhang/openclaw-skills-list.md
 * 用法: node scripts/import-skill-tools.mjs
 *
 * 需要环境变量:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ 缺少环境变量 NEXT_PUBLIC_SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// OpenClaw Skills 数据（来源：clawhub.ai 官方注册表）
const SKILLS = [
  // 开发工具
  { slug: 'github', name: 'GitHub', description: 'GitHub 仓库、PR、Issue、CI 管理（steipete 出品）', url: 'https://clawhub.ai/github', category: '开发工具', tags: ['github', 'code', 'ci'] },
  { slug: 'web-scraping', name: 'Web Scraping', description: '网页数据提取，支持静态/动态页面', url: 'https://clawhub.ai/web-scraping', category: '开发工具', tags: ['scraping', 'data'] },
  { slug: 'code-review', name: 'Code Review', description: '代码审查', url: 'https://clawhub.ai/code-review', category: '开发工具', tags: ['code', 'review'] },
  { slug: 'gitlab-code-review', name: 'GitLab Code Review', description: 'GitLab 代码审查集成', url: 'https://clawhub.ai/gitlab-code-review', category: '开发工具', tags: ['gitlab', 'code', 'review'] },
  { slug: 'github-trending-feed', name: 'GitHub Trending Feed', description: '追踪 GitHub 热门项目', url: 'https://clawhub.ai/github-trending-feed', category: '开发工具', tags: ['github', 'trending'] },
  { slug: 'openclaw-github-assistant', name: 'OpenClaw GitHub Assistant', description: 'OpenClaw 专属 GitHub 助手', url: 'https://clawhub.ai/openclaw-github-assistant', category: '开发工具', tags: ['github', 'assistant'] },
  { slug: 'sql-database-toolkit', name: 'SQL Database Toolkit', description: 'SQL 数据库工具包', url: 'https://clawhub.ai/sql-database-toolkit', category: '开发工具', tags: ['sql', 'database'] },
  { slug: 'microsoft-azure-sql-database', name: 'Azure SQL Database', description: 'Azure SQL 数据库集成', url: 'https://clawhub.ai/microsoft-azure-sql-database', category: '开发工具', tags: ['azure', 'sql', 'database'] },

  // 网页 & 浏览器
  { slug: 'free-google-search-with-browser', name: 'Free Google Search', description: '免费 Google 搜索（浏览器）', url: 'https://clawhub.ai/free-google-search-with-browser', category: '网页与浏览器', tags: ['google', 'search', 'browser'] },
  { slug: 'actionbook', name: 'Actionbook', description: '全网自动化，截图、表单、爬取', url: 'https://clawhub.ai/actionbook', category: '网页与浏览器', tags: ['automation', 'browser', 'scraping'] },
  { slug: 'afrexai-web-scraping-engine', name: 'Web Scraping Engine', description: '网页抓取 & 数据提取引擎', url: 'https://clawhub.ai/afrexai-web-scraping-engine', category: '网页与浏览器', tags: ['scraping', 'data'] },

  // 效率 & 协作
  { slug: 'notion', name: 'Notion', description: 'Notion 页面、数据库管理（steipete 出品）', url: 'https://clawhub.ai/notion', category: '效率与协作', tags: ['notion', 'productivity', 'database'] },
  { slug: 'slack', name: 'Slack', description: 'Slack 消息集成', url: 'https://clawhub.ai/slack', category: '效率与协作', tags: ['slack', 'messaging'] },
  { slug: 'slack-api', name: 'Slack API', description: 'Slack API 扩展', url: 'https://clawhub.ai/slack-api', category: '效率与协作', tags: ['slack', 'api'] },
  { slug: 'google-slides', name: 'Google Slides', description: 'Google 幻灯片', url: 'https://clawhub.ai/google-slides', category: '效率与协作', tags: ['google', 'slides', 'presentation'] },
  { slug: 'google-meet', name: 'Google Meet', description: 'Google 会议集成', url: 'https://clawhub.ai/google-meet', category: '效率与协作', tags: ['google', 'meeting', 'video'] },
  { slug: 'google-workspace-admin', name: 'Google Workspace Admin', description: 'Google Workspace 管理', url: 'https://clawhub.ai/google-workspace-admin', category: '效率与协作', tags: ['google', 'workspace', 'admin'] },
  { slug: 'airtable-automation', name: 'Airtable Automation', description: 'Airtable 自动化（via Composio）', url: 'https://clawhub.ai/airtable-automation', category: '效率与协作', tags: ['airtable', 'automation'] },
  { slug: 'azure-devops', name: 'Azure DevOps', description: 'Azure DevOps 项目、PR、工作项', url: 'https://clawhub.ai/azure-devops', category: '效率与协作', tags: ['azure', 'devops'] },
  { slug: 'file-management', name: 'File Management', description: '文件管理', url: 'https://clawhub.ai/file-management', category: '效率与协作', tags: ['file', 'management'] },

  // 邮件 & 通信
  { slug: 'porteden-email', name: 'PortEden Email', description: 'Gmail/Outlook/Exchange 邮件访问', url: 'https://clawhub.ai/porteden-email', category: '邮件与通信', tags: ['email', 'gmail', 'outlook'] },
  { slug: 'sendclaw-email', name: 'SendClaw Email', description: '免费 Bot 邮件地址，无需人工授权', url: 'https://clawhub.ai/sendclaw-email', category: '邮件与通信', tags: ['email', 'bot'] },
  { slug: 'imap-smtp-email-chinese', name: 'IMAP/SMTP 中文邮件', description: '中文环境 IMAP/SMTP 邮件', url: 'https://clawhub.ai/imap-smtp-email-chinese', category: '邮件与通信', tags: ['email', 'imap', 'smtp', 'chinese'] },
  { slug: 'cold-email-outreach', name: 'Cold Email Outreach', description: '冷邮件外发自动化', url: 'https://clawhub.ai/cold-email-outreach', category: '邮件与通信', tags: ['email', 'outreach', 'automation'] },

  // 内容生成
  { slug: 'image-generation', name: 'AI Image Generation', description: 'GPT Image/FLUX/Imagen 等主流图像生成', url: 'https://clawhub.ai/image-generation', category: '内容生成', tags: ['image', 'ai', 'generation'], is_featured: true },
  { slug: 'ernie-image-radeon', name: 'Ernie Image Radeon', description: '文心图像生成（AMD Radeon 云，免费）', url: 'https://clawhub.ai/ernie-image-radeon', category: '内容生成', tags: ['image', 'ernie', 'free'] },
  { slug: 'video', name: 'Video', description: '视频生成', url: 'https://clawhub.ai/video', category: '内容生成', tags: ['video', 'generation'] },
  { slug: 'demo-video', name: 'Demo Video Creator', description: '演示视频制作', url: 'https://clawhub.ai/demo-video', category: '内容生成', tags: ['video', 'demo'] },
  { slug: 'jimeng-prompter', name: 'Jimeng Prompter', description: '即梦 2.0 AI 视频提示词工程师', url: 'https://clawhub.ai/jimeng-prompter', category: '内容生成', tags: ['video', 'prompt', 'chinese'] },
  { slug: 'design-panel', name: 'Design Panel', description: '多角色 UX/UI 设计审查', url: 'https://clawhub.ai/design-panel', category: '内容生成', tags: ['design', 'ux', 'ui'] },
  { slug: 'feature-spec-enhanced', name: 'Feature Spec Enhanced', description: '产品需求文档（PRD）生成', url: 'https://clawhub.ai/feature-spec-enhanced', category: '内容生成', tags: ['prd', 'product', 'spec'] },
  { slug: '2slides-skills', name: '2Slides', description: 'AI 幻灯片生成（2slides API）', url: 'https://clawhub.ai/2slides-skills', category: '内容生成', tags: ['slides', 'presentation', 'ai'] },
  { slug: 'skywork-ppt', name: 'Skywork PPT', description: '生成/模仿/编辑 PPT', url: 'https://github.com/openclaw/skills/blob/main/skills/gxcun17/skywork-ppt/SKILL.md', category: '内容生成', tags: ['ppt', 'presentation'] },
  { slug: 'skywork-music-maker', name: 'Skywork Music Maker', description: 'Mureka AI 音乐创作', url: 'https://github.com/openclaw/skills/blob/main/skills/gxcun17/skywork-music-maker/SKILL.md', category: '内容生成', tags: ['music', 'ai', 'generation'] },

  // AI Agent & 记忆
  { slug: 'agent-memory-store', name: 'Agent Memory Store', description: '跨 Agent 语义记忆存储，SQLite 持久化', url: 'https://clawhub.ai/agent-memory-store', category: 'AI Agent', tags: ['memory', 'agent', 'sqlite'] },
  { slug: 'persistent-agent-memory-1-0-1', name: 'Persistent Agent Memory', description: '持久化 Agent 记忆', url: 'https://clawhub.ai/persistent-agent-memory-1-0-1', category: 'AI Agent', tags: ['memory', 'agent', 'persistent'] },
  { slug: 'agent-memory-patterns', name: 'Agent Memory Patterns', description: 'Agent 记忆模式', url: 'https://clawhub.ai/agent-memory-patterns', category: 'AI Agent', tags: ['memory', 'agent', 'patterns'] },
  { slug: 'agent-commons', name: 'Agent Commons', description: '推理链咨询、提交、扩展', url: 'https://clawhub.ai/agent-commons', category: 'AI Agent', tags: ['agent', 'reasoning'] },
  { slug: 'agent-team-orchestration', name: 'Agent Team Orchestration', description: '多 Agent 团队编排', url: 'https://clawhub.ai/agent-team-orchestration', category: 'AI Agent', tags: ['agent', 'orchestration', 'multi-agent'] },
  { slug: 'active-maintenance', name: 'Active Maintenance', description: 'OpenClaw 自动系统健康维护', url: 'https://clawhub.ai/active-maintenance', category: 'AI Agent', tags: ['maintenance', 'system'] },
  { slug: 'alex-session-wrap-up', name: 'Session Wrap-Up', description: '会话结束自动提交、提取经验', url: 'https://clawhub.ai/alex-session-wrap-up', category: 'AI Agent', tags: ['session', 'memory', 'agent'] },

  // 中文平台专属
  { slug: 'wechat', name: 'WeChat Connect', description: '微信连接', url: 'https://clawhub.ai/wechat', category: '中文平台', tags: ['wechat', 'chinese', 'messaging'] },
  { slug: 'clawphone-wechat-control', name: 'ClawPhone WeChat Control', description: '手机微信控制', url: 'https://clawhub.ai/clawphone-wechat-control', category: '中文平台', tags: ['wechat', 'phone', 'control'] },
  { slug: 'wechat-mp-to-notion', name: 'WeChat MP to Notion', description: '微信公众号内容同步到 Notion', url: 'https://clawhub.ai/wechat-mp-to-notion', category: '中文平台', tags: ['wechat', 'notion', 'sync'] },
  { slug: 'wechat-to-xiaohongshu', name: 'WeChat to Xiaohongshu', description: '微信内容发布到小红书', url: 'https://clawhub.ai/wechat-to-xiaohongshu', category: '中文平台', tags: ['wechat', 'xiaohongshu'] },
  { slug: 'zhihu', name: 'Zhihu', description: '知乎内容获取', url: 'https://clawhub.ai/zhihu', category: '中文平台', tags: ['zhihu', 'content'] },
  { slug: 'zhihu-hot-cn', name: 'Zhihu Hot CN', description: '知乎热榜', url: 'https://clawhub.ai/zhihu-hot-cn', category: '中文平台', tags: ['zhihu', 'trending'] },
  { slug: 'zhihu-fetcher', name: '知乎数据获取', description: '知乎数据爬取', url: 'https://clawhub.ai/zhihu-fetcher', category: '中文平台', tags: ['zhihu', 'scraping'] },
  { slug: 'bilibili', name: 'Bilibili', description: 'B站内容', url: 'https://clawhub.ai/bilibili', category: '中文平台', tags: ['bilibili', 'video', 'chinese'] },
  { slug: 'bilibili-all-in-one', name: 'Bilibili All-in-One', description: 'B站全功能', url: 'https://clawhub.ai/bilibili-all-in-one', category: '中文平台', tags: ['bilibili', 'all-in-one'] },
  { slug: 'best-bilibili-ai-subtitle', name: 'Bilibili AI 字幕', description: 'B站 AI 字幕（最佳）', url: 'https://clawhub.ai/best-bilibili-ai-subtitle', category: '中文平台', tags: ['bilibili', 'subtitle', 'ai'] },
  { slug: 'fox-xiaohongshu-publish', name: 'Fox 小红书发布', description: '小红书内容发布', url: 'https://clawhub.ai/fox-xiaohongshu-publish', category: '中文平台', tags: ['xiaohongshu', 'publish'] },
  { slug: 'xiaohongshu-mcp', name: '小红书 MCP', description: '小红书自动化', url: 'https://clawhub.ai/xiaohongshu-mcp', category: '中文平台', tags: ['xiaohongshu', 'automation'] },
  { slug: 'douyin-video-fetch', name: 'Douyin Video Fetch', description: '抖音视频获取', url: 'https://clawhub.ai/douyin-video-fetch', category: '中文平台', tags: ['douyin', 'video'] },
  { slug: 'douyinwenan', name: '抖音文案', description: '高中教育内容生产（抖音）', url: 'https://clawhub.ai/douyinwenan', category: '中文平台', tags: ['douyin', 'content', 'education'] },
  { slug: 'summarize-cn', name: 'Summarize CN', description: '中文智能内容摘要', url: 'https://clawhub.ai/summarize-cn', category: '中文平台', tags: ['summarize', 'chinese'] },
  { slug: 'obsidian-cli-cn', name: 'Obsidian CLI 中文', description: 'Obsidian 笔记命令行工具（中文）', url: 'https://clawhub.ai/obsidian-cli-cn', category: '中文平台', tags: ['obsidian', 'cli', 'notes'] },
  { slug: 'n8n-workflow-cn', name: 'n8n 工作流中文', description: 'n8n 工作流中文工具包', url: 'https://clawhub.ai/n8n-workflow-cn', category: '中文平台', tags: ['n8n', 'workflow', 'automation'] },
  { slug: 'multi-platform-translator', name: '多平台翻译', description: '讯飞/豆包/腾讯元宝/DeepL/金山词霸中英互译', url: 'https://clawhub.ai/multi-platform-translator', category: '中文平台', tags: ['translation', 'multilingual'] },
  { slug: 'document-pro-cn', name: 'Document Pro 中文', description: '专业文档处理（格式转换、OCR 等）', url: 'https://clawhub.ai/document-pro-cn', category: '中文平台', tags: ['document', 'ocr', 'chinese'] },
  { slug: 'chinese', name: 'Chinese', description: '中文能力增强', url: 'https://clawhub.ai/chinese', category: '中文平台', tags: ['chinese', 'language'] },
  { slug: 'humanize-chinese', name: 'Humanize Chinese', description: '中文去 AI 味', url: 'https://clawhub.ai/humanize-chinese', category: '中文平台', tags: ['chinese', 'writing', 'humanize'] },

  // 安全 & 审计
  { slug: 'arc-security-audit', name: 'ARC Security Audit', description: 'Agent 完整技能栈安全审计', url: 'https://clawhub.ai/arc-security-audit', category: '安全与审计', tags: ['security', 'audit', 'agent'] },
  { slug: 'arc-trust-verifier', name: 'ARC Trust Verifier', description: 'ClawHub 技能来源验证 & 信任评分', url: 'https://clawhub.ai/arc-trust-verifier', category: '安全与审计', tags: ['security', 'trust', 'verify'] },
  { slug: 'agentaudit', name: 'Agent Audit', description: '安全门禁，安装前检查漏洞库', url: 'https://clawhub.ai/agentaudit', category: '安全与审计', tags: ['security', 'audit', 'vulnerability'] },
  { slug: 'aegis-shield', name: 'Aegis Shield', description: '提示注入 & 数据泄露筛查', url: 'https://clawhub.ai/aegis-shield', category: '安全与审计', tags: ['security', 'prompt-injection', 'privacy'] },
  { slug: 'agent-access-control', name: 'Agent Access Control', description: '分级陌生人访问控制', url: 'https://clawhub.ai/agent-access-control', category: '安全与审计', tags: ['security', 'access-control', 'agent'] },

  // 工具 & 运维
  { slug: 'skill-distributor', name: 'Skill Distributor', description: '一键将 Skill 分发到全平台', url: 'https://clawhub.ai/skill-distributor', category: '工具与运维', tags: ['distribution', 'platform'] },
  { slug: 'add-top-openrouter-models', name: 'Add OpenRouter Models', description: '同步 OpenRouter 模型到 OpenClaw', url: 'https://clawhub.ai/add-top-openrouter-models', category: '工具与运维', tags: ['openrouter', 'models'] },
  { slug: 'arxiv-search-collector', name: 'ArXiv Search Collector', description: 'arXiv 论文检索工作流', url: 'https://clawhub.ai/arxiv-search-collector', category: '工具与运维', tags: ['arxiv', 'research', 'papers'] },
  { slug: 'academic-research', name: 'Academic Research', description: '学术论文搜索（OpenAlex，免费）', url: 'https://clawhub.ai/academic-research', category: '工具与运维', tags: ['research', 'academic', 'free'] },
  { slug: 'ecommerce-pricing', name: 'E-commerce Pricing', description: '主流电商价格监控比较', url: 'https://clawhub.ai/ecommerce-pricing', category: '工具与运维', tags: ['ecommerce', 'pricing', 'monitoring'] },
  { slug: 'adblock-dns', name: 'AdBlock DNS', description: '全网 DNS 广告拦截', url: 'https://clawhub.ai/adblock-dns', category: '工具与运维', tags: ['dns', 'adblock', 'privacy'] },
  { slug: 'beeminder', name: 'Beeminder', description: '目标追踪 & 承诺机制', url: 'https://clawhub.ai/beeminder', category: '工具与运维', tags: ['goals', 'tracking', 'productivity'] },
  { slug: 'adspower-browser', name: 'AdsPower Browser', description: 'AdsPower 多账号浏览器管理', url: 'https://github.com/openclaw/skills/tree/main/skills/adspower/adspower-browser', category: '工具与运维', tags: ['browser', 'multi-account'] },
  { slug: 'duoplus-agent', name: 'DuoPlus Agent', description: '多加云手机 ADB 控制', url: 'https://github.com/openclaw/skills/tree/main/skills/duoplusofficial/duoplus-agent/SKILL.md', category: '工具与运维', tags: ['phone', 'adb', 'control'] }
];

// 处理数据
const rows = SKILLS.map((s) => ({
  name: s.name,
  description: s.description,
  url: s.url,
  category: s.category,
  source: 'clawhub.ai',
  tags: s.tags ?? [],
  is_featured: s.is_featured ?? false,
  status: 'published'
}));

console.log(`📦 准备导入 ${rows.length} 条 OpenClaw Skills`);

// 第一步：清空旧数据
console.log('🗑️  清空旧数据...');
const { error: deleteError } = await supabase
  .from('skill_tools')
  .delete()
  .neq('id', 0); // 删除所有

if (deleteError) {
  console.error('❌ 清空失败:', deleteError.message);
  process.exit(1);
}
console.log('✅ 旧数据已清空');

// 第二步：批量插入
const BATCH = 100;
let inserted = 0;

for (let i = 0; i < rows.length; i += BATCH) {
  const batch = rows.slice(i, i + BATCH);
  const { data, error } = await supabase.from('skill_tools').insert(batch).select('id');
  if (error) {
    console.error(`❌ 批次 ${Math.floor(i / BATCH) + 1} 失败:`, error.message);
  } else {
    inserted += (data ?? []).length;
    console.log(`  批次 ${Math.floor(i / BATCH) + 1}: 插入 ${(data ?? []).length} 条`);
  }
}

console.log(`\n🎉 完成！共插入 ${inserted} 条 OpenClaw Skills`);
