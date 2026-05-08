/**
 * Supabase 建表 + 数据初始化脚本
 * 
 * 由于 Supabase REST API 不支持直接 DDL，本脚本通过以下步骤执行：
 * 1. 先用 service_role key 通过 fetch 调用 Supabase Management API
 * 2. 然后 seed 数据
 * 
 * 运行: node scripts/supabase-setup.mjs [ACCESS_TOKEN]
 * ACCESS_TOKEN 可在 https://supabase.com/dashboard/account/tokens 获取
 */

const PROJECT_REF = 'tixgzezefjjsyuzgdhcd';
const SUPABASE_URL = `https://${PROJECT_REF}.supabase.co`;
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpeGd6ZXplZmpqc3l1emdkaGNkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE0OTM3OCwiZXhwIjoyMDkzNzI1Mzc4fQ.CBarLrHnr-tr5ZPaGs2JvW3NJE6O5O1Hw7oTWsHuI-E';

// Personal Access Token from https://supabase.com/dashboard/account/tokens
const ACCESS_TOKEN = process.argv[2] || '';

const apiHeaders = {
  'Content-Type': 'application/json',
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Prefer': 'return=minimal'
};

// ─── DDL via Management API ───────────────────────────────────────────────────

async function execSQL(sql) {
  if (!ACCESS_TOKEN) {
    console.error('❌ Missing ACCESS_TOKEN. Usage: node scripts/supabase-setup.mjs <ACCESS_TOKEN>');
    console.error('   Get your token at: https://supabase.com/dashboard/account/tokens');
    process.exit(1);
  }
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${ACCESS_TOKEN}`
    },
    body: JSON.stringify({ query: sql })
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Management API error ${res.status}: ${text}`);
  return text;
}

// ─── Insert data via REST ─────────────────────────────────────────────────────

async function upsert(table, rows) {
  if (!rows.length) return;

  // Normalize all rows to have the same set of keys (union of all keys)
  // This is required by PostgREST (PGRST102) — all objects must have matching keys
  const allKeys = [...new Set(rows.flatMap(r => Object.keys(r)))];
  const normalizedRows = rows.map(row => {
    const normalized = {};
    for (const k of allKeys) normalized[k] = row[k] !== undefined ? row[k] : null;
    return normalized;
  });

  // First: delete all existing rows to avoid conflicts, then insert fresh
  await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=gte.0`, {
    method: 'DELETE',
    headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` }
  });
  // Also handle tables without numeric id (delete all)
  await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=not.is.null`, {
    method: 'DELETE',
    headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` }
  });

  // Insert fresh data (use normalizedRows to guarantee all objects share the same keys)
  let res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: { ...apiHeaders, 'Prefer': 'return=minimal' },
    body: JSON.stringify(normalizedRows)
  });

  if (!res.ok) {
    const errText = await res.text();
    let errJson;
    try { errJson = JSON.parse(errText); } catch { errJson = {}; }

    // PGRST204: column not found in schema cache — strip unknown columns and retry
    if (errJson.code === 'PGRST204') {
      const missingCol = errJson.message?.match(/'([^']+)' column/)?.[1];
      if (missingCol) {
        console.log(`  ⚠  ${table}: column '${missingCol}' not found, stripping and retrying...`);
        // Strip all unknown columns by probing with a single row
        const stripped = await stripUnknownColumns(table, normalizedRows);
        res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
          method: 'POST',
          headers: { ...apiHeaders, 'Prefer': 'return=minimal' },
          body: JSON.stringify(stripped)
        });
        if (res.ok) {
          console.log(`  ✓ ${table}: ${stripped.length} rows (partial columns)`);
          return;
        }
        const text2 = await res.text();
        throw new Error(`Upsert ${table} failed after retry (${res.status}): ${text2}`);
      }
    }
    throw new Error(`Upsert ${table} failed (${res.status}): ${errText}`);
  }
  console.log(`  ✓ ${table}: ${normalizedRows.length} rows`);
}

/**
 * Iteratively strip columns that PostgREST reports as missing.
 * Probes by sending a single row and removing bad columns until insert succeeds.
 */
async function stripUnknownColumns(table, rows) {
  if (!rows.length) return rows;
  let sampleRow = { ...rows[0] };
  let attempts = 0;

  while (attempts < 20) {
    attempts++;
    const probe = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: { ...apiHeaders, 'Prefer': 'return=minimal' },
      body: JSON.stringify([sampleRow])
    });
    if (probe.ok) break;
    const errText = await probe.text();
    let errJson;
    try { errJson = JSON.parse(errText); } catch { errJson = {}; }
    if (errJson.code === 'PGRST204') {
      const col = errJson.message?.match(/'([^']+)' column/)?.[1];
      if (col) {
        console.log(`    → removing column '${col}' from payload`);
        delete sampleRow[col];
      } else break;
    } else break;
  }

  // Apply the same column mask to all rows
  const allowedKeys = Object.keys(sampleRow);
  return rows.map(row => {
    const filtered = {};
    for (const k of allowedKeys) filtered[k] = row[k];
    return filtered;
  });
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const SCHEMA_SQL = `
create table if not exists agents (
  id           bigserial primary key,
  name         text not null,
  description  text,
  url          text not null,
  agent_type   text not null default 'general',
  open_source  text not null default 'closed',
  region       text not null default 'global',
  tags         text[] default '{}',
  is_featured  boolean default false,
  status       text not null default 'published',
  review_note  text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create table if not exists news (
  id           bigserial primary key,
  slug         text unique not null,
  title        text not null,
  summary      text,
  source_url   text,
  source_name  text,
  category     text not null default 'Agent',
  tags         text[] default '{}',
  status       text not null default 'published',
  is_featured  boolean default false,
  published_at timestamptz default now(),
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create table if not exists mcp_servers (
  id           bigserial primary key,
  name         text not null,
  description  text,
  url          text not null,
  category     text not null default 'filesystem',
  is_official  boolean default false,
  install_cmd  text,
  tags         text[] default '{}',
  stars        integer default 0,
  is_featured  boolean default false,
  created_at   timestamptz default now()
);

create table if not exists ai_models (
  id              bigserial primary key,
  name            text not null,
  vendor          text not null,
  description     text,
  url             text,
  model_type      text[] default '{}',
  context_window  text,
  multimodal      boolean default false,
  is_open_source  boolean default false,
  price_input     text,
  price_output    text,
  reasoning_score integer default 3,
  code_score      integer default 3,
  speed_score     integer default 3,
  is_featured     boolean default false,
  tags            text[] default '{}',
  release_date    date
);

create table if not exists benchmarks (
  id             bigserial primary key,
  name           text not null,
  description    text,
  url            text,
  category       text not null default 'agent',
  current_leader text,
  leader_score   text
);

create table if not exists tutorials (
  id                 bigserial primary key,
  slug               text unique not null,
  title              text not null,
  subtitle           text,
  summary            text,
  content            text,
  level              text not null default 'beginner',
  category           text not null default 'concept',
  tags               text[] default '{}',
  estimated_minutes  integer default 10,
  related_tools      text[] default '{}',
  is_featured        boolean default false,
  published_at       timestamptz default now()
);

create table if not exists use_cases (
  id              bigserial primary key,
  title           text not null,
  description     text,
  tools           text[] default '{}',
  industry        text not null default 'productivity',
  difficulty      integer default 1,
  estimated_time  text,
  steps           text[] default '{}',
  tags            text[] default '{}',
  is_featured     boolean default false
);

create table if not exists seo_config (
  id               bigserial primary key,
  site_name        text not null default 'AI Skill Navigation',
  site_description text,
  site_keywords    text[] default '{}',
  og_image         text,
  twitter_handle   text,
  pages            jsonb default '{}',
  updated_at       timestamptz default now()
);

-- Skills table update (add missing columns if needed)
alter table skills add column if not exists review_note text;
alter table skills add column if not exists platform text not null default 'aggregator';
alter table skills add column if not exists region text not null default 'global';

-- RLS
alter table agents       enable row level security;
alter table news         enable row level security;
alter table mcp_servers  enable row level security;
alter table ai_models    enable row level security;
alter table benchmarks   enable row level security;
alter table tutorials    enable row level security;
alter table use_cases    enable row level security;
alter table seo_config   enable row level security;

-- Policies (ignore errors if already exist)
do $$ begin
  create policy "public_read_agents"     on agents       for select using (status = 'published');
  exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public_read_news"       on news         for select using (status = 'published');
  exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public_read_mcp"        on mcp_servers  for select using (true);
  exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public_read_models"     on ai_models    for select using (true);
  exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public_read_benchmarks" on benchmarks   for select using (true);
  exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public_read_tutorials"  on tutorials    for select using (true);
  exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public_read_usecases"   on use_cases    for select using (true);
  exception when duplicate_object then null; end $$;
do $$ begin
  create policy "public_read_seo"        on seo_config   for select using (true);
  exception when duplicate_object then null; end $$;
do $$ begin
  create policy "service_all_agents"     on agents       for all using (auth.role() = 'service_role');
  exception when duplicate_object then null; end $$;
do $$ begin
  create policy "service_all_news"       on news         for all using (auth.role() = 'service_role');
  exception when duplicate_object then null; end $$;
do $$ begin
  create policy "service_all_mcp"        on mcp_servers  for all using (auth.role() = 'service_role');
  exception when duplicate_object then null; end $$;
do $$ begin
  create policy "service_all_models"     on ai_models    for all using (auth.role() = 'service_role');
  exception when duplicate_object then null; end $$;
do $$ begin
  create policy "service_all_benchmarks" on benchmarks   for all using (auth.role() = 'service_role');
  exception when duplicate_object then null; end $$;
do $$ begin
  create policy "service_all_tutorials"  on tutorials    for all using (auth.role() = 'service_role');
  exception when duplicate_object then null; end $$;
do $$ begin
  create policy "service_all_usecases"   on use_cases    for all using (auth.role() = 'service_role');
  exception when duplicate_object then null; end $$;
do $$ begin
  create policy "service_all_seo"        on seo_config   for all using (auth.role() = 'service_role');
  exception when duplicate_object then null; end $$;
`;

// ─── Seed data ────────────────────────────────────────────────────────────────

const now = new Date().toISOString();

const SKILLS_DATA = [
  // ── 官方 / 国际 ─────────────────────────────────────────────────────────
  { name: 'ClaWHub', url: 'https://clawhub.com', description: '官方 Skill 市场，最权威的来源，Skills 由社区开发者发布和审核', platform: 'official', region: 'global', tags: ['官方市场', '技能发现', '社区'], is_featured: true, status: 'published', created_at: now, updated_at: now },
  { name: 'OpenClaw AI', url: 'https://openclaw.ai', description: 'OpenClaw 官网，含 Skill 生态介绍、开发者文档与安装指南', platform: 'official', region: 'global', tags: ['官方', '文档', '开发者'], is_featured: true, status: 'published', created_at: now, updated_at: now },
  { name: 'openclaw/openclaw', url: 'https://github.com/openclaw/openclaw', description: '官方 GitHub 仓库，可直接找社区 Skill、提交 Issue 和贡献代码', platform: 'github', region: 'global', tags: ['GitHub', '开源', '社区贡献'], is_featured: false, status: 'published', created_at: now, updated_at: now },
  // ── 中文 / 国内 ──────────────────────────────────────────────────────────
  { name: 'SkillHub 腾讯版', url: 'https://skillhub.tencent.com', description: '腾讯出品，13000+ 技能，中文搜索，国内节点下载快', platform: 'aggregator', region: 'cn', tags: ['腾讯', '中文', '国内加速', '大量技能'], is_featured: true, status: 'published', created_at: now, updated_at: now },
  { name: 'SkillHub.cn', url: 'https://www.skillhub.cn', description: '面向中国用户，精选 Top 50 Skills，经安全审核，适合新手入门', platform: 'aggregator', region: 'cn', tags: ['精选', '中文', '新手友好'], is_featured: true, status: 'published', created_at: now, updated_at: now },
  { name: 'SkillsBot.cn', url: 'https://www.skillsbot.cn', description: 'ClawHub 中文镜像，分类更细，含中文教程和使用案例', platform: 'mirror', region: 'cn', tags: ['中文镜像', '教程', '详细分类'], is_featured: false, status: 'published', created_at: now, updated_at: now },
  { name: '小龙虾 Skills', url: 'https://www.xiaolongxia.app/skills', description: '245个技能，10大场景分类，含踩坑提醒和套装搭配推荐', platform: 'aggregator', region: 'cn', tags: ['245+ 技能', '场景分类', '套装推荐'], is_featured: true, status: 'published', created_at: now, updated_at: now },
  { name: '龙虾技能库', url: 'https://longxiaskill.com', description: '龙虾技能库，免费技能/插件/模型资源，持续更新，覆盖多个 AI 平台', platform: 'aggregator', region: 'cn', tags: ['免费资源', '插件', '模型', '持续更新'], is_featured: false, status: 'published', created_at: now, updated_at: now },
  { name: 'OpenClaw 中文版', url: 'https://openclawai.org.cn', description: '龙虾官方中文版，支持一键安装、多平台集成，中文界面友好', platform: 'mirror', region: 'cn', tags: ['官方中文', '一键安装', '多平台'], is_featured: true, status: 'published', created_at: now, updated_at: now },
  // ── 社区 / 论坛 ──────────────────────────────────────────────────────────
  { name: 'Reddit r/ClawHub', url: 'https://reddit.com/r/clawhub', description: '英文社区，讨论 Skill 开发、分享使用技巧与最新资源', platform: 'community', region: 'global', tags: ['Reddit', '英文社区', '技巧分享'], is_featured: false, status: 'published', created_at: now, updated_at: now },
  { name: '龙虾技能交流群', url: 'https://t.me/clawhub_cn', description: 'Telegram 中文频道，实时推送新技能、讨论使用心得', platform: 'community', region: 'cn', tags: ['Telegram', '中文', '实时更新'], is_featured: false, status: 'published', created_at: now, updated_at: now },
  // ── 工具 ──────────────────────────────────────────────────────────────────
  { name: 'Skill Rank', url: 'https://skillrank.io', description: 'Skills 排行榜与使用数据统计，帮助发现当前最热门的 AI 技能', platform: 'tool', region: 'global', tags: ['排行榜', '数据统计', '趋势'], is_featured: false, status: 'published', created_at: now, updated_at: now },
  // ── 工具 / 开发者 ──────────────────────────────────────────────────────────
  { name: 'Awesome Claude Prompts', url: 'https://github.com/langgptai/awesome-claude-prompts', description: 'GitHub 上最全的 Claude 提示词合集，包含 200+ 高质量提示词和 Skill 配置模板，开发者必备参考', platform: 'github', region: 'global', tags: ['Claude', 'Prompt', 'GitHub', '提示词'], is_featured: false, status: 'published', created_at: now, updated_at: now },
  { name: 'Awesome MCP Servers', url: 'https://github.com/punkpeye/awesome-mcp-servers', description: '社区维护的 MCP Server 精选列表，覆盖各类工具、数据库、API 集成，是发现新 MCP Server 的最佳入口', platform: 'github', region: 'global', tags: ['MCP', 'GitHub', 'Awesome列表', 'Server集合'], is_featured: true, status: 'published', created_at: now, updated_at: now },
  { name: 'Claude Skills 官方文档', url: 'https://docs.anthropic.com/en/docs/build-with-claude/skills', description: 'Anthropic 官方 Skills 开发文档，包含 API 规范、最佳实践、测试方法', platform: 'official', region: 'global', tags: ['官方文档', 'Anthropic', 'API', '开发者'], is_featured: true, status: 'published', created_at: now, updated_at: now },
  { name: 'LangChain Hub', url: 'https://smith.langchain.com/hub', description: 'LangChain 官方 Prompt Hub，共享可复用的 Chain、Agent 配置和提示词模板', platform: 'official', region: 'global', tags: ['LangChain', 'Prompt Hub', '模板', 'Chain'], is_featured: false, status: 'published', created_at: now, updated_at: now },
  { name: 'FlowGPT', url: 'https://flowgpt.com', description: '全球最大 AI 提示词分享平台，50万+ 提示词，包含大量 Claude Skill 配置和 System Prompt', platform: 'aggregator', region: 'global', tags: ['提示词', '社区分享', '50万+', 'System Prompt'], is_featured: true, status: 'published', created_at: now, updated_at: now },
  { name: 'PromptBase', url: 'https://promptbase.com', description: '提示词市场，可购买高质量提示词，涵盖 Claude、GPT、Midjourney 等主流 AI', platform: 'aggregator', region: 'global', tags: ['提示词市场', '付费', '高质量', '多平台'], is_featured: false, status: 'published', created_at: now, updated_at: now },
  { name: 'Dify Marketplace', url: 'https://marketplace.dify.ai', description: 'Dify 官方应用市场，收录数百个可一键部署的 AI 应用模板，包含大量 Agent 工作流', platform: 'official', region: 'global', tags: ['Dify', '工作流', '应用模板', '一键部署'], is_featured: true, status: 'published', created_at: now, updated_at: now },
  { name: 'n8n Workflow Templates', url: 'https://n8n.io/workflows', description: 'n8n 官方工作流模板库，1000+ AI 自动化工作流，涵盖邮件、CRM、社交媒体等场景', platform: 'official', region: 'global', tags: ['n8n', '工作流', '自动化', '模板库'], is_featured: false, status: 'published', created_at: now, updated_at: now },
  // ── 国内平台 ────────────────────────────────────────────────────────────────
  { name: 'Coze（扣子）', url: 'https://www.coze.cn', description: '字节跳动 AI Bot 平台，支持插件调用、工作流搭建，可发布到飞书/微信/抖音', platform: 'official', region: 'cn', tags: ['字节跳动', 'Bot平台', '插件', '工作流'], is_featured: true, status: 'published', created_at: now, updated_at: now },
  { name: '文心智能体', url: 'https://agents.baidu.com', description: '百度文心一言 Agent 平台，内置丰富插件，支持搜索增强、知识库问答、代码执行', platform: 'official', region: 'cn', tags: ['百度', '文心一言', 'Agent', '插件'], is_featured: false, status: 'published', created_at: now, updated_at: now },
  { name: '智谱 AI 智能体', url: 'https://agents.zhipuai.cn', description: '智谱 AI（GLM 系列）的智能体平台，支持联网检索、代码解释器、图片理解', platform: 'official', region: 'cn', tags: ['智谱', 'GLM', '智能体', '联网检索'], is_featured: false, status: 'published', created_at: now, updated_at: now },
  { name: '阿里云百炼应用广场', url: 'https://bailian.aliyun.com/market', description: '阿里云大模型服务平台应用广场，企业级 AI 应用，通义千问驱动，支持私有部署', platform: 'official', region: 'cn', tags: ['阿里云', '通义千问', '企业级', '私有部署'], is_featured: false, status: 'published', created_at: now, updated_at: now },
  { name: 'AI 研究所', url: 'https://www.aiyanjiu.com', description: '国内 AI 应用场景库，收录 500+ 中文 AI 提示词和使用案例，按职业和场景分类', platform: 'aggregator', region: 'cn', tags: ['中文提示词', '场景案例', '500+', '职业分类'], is_featured: false, status: 'published', created_at: now, updated_at: now },
  { name: 'AI 帮个忙', url: 'https://aibang.run', description: '中文 AI 工具导航，汇聚国内外 200+ AI 工具，按功能分类清晰，每日更新', platform: 'aggregator', region: 'cn', tags: ['工具导航', '200+', '功能分类', '每日更新'], is_featured: false, status: 'published', created_at: now, updated_at: now },
  // ── 待审核示例 ────────────────────────────────────────────────────────────
  { name: 'AI Skills Weekly', url: 'https://aiskillsweekly.substack.com', description: '每周精选 AI Skills 资讯邮件，适合想跟上最新动态的用户', platform: 'community', region: 'global', tags: ['Newsletter', '每周精选', '英文'], is_featured: false, status: 'pending', review_note: '', created_at: now, updated_at: now },
  { name: 'Claw Skills 中文导航', url: 'https://clawskills.cn', description: '中文技能导航站，分类整理了 300+ 个 AI 技能链接', platform: 'aggregator', region: 'cn', tags: ['导航', '中文', '300+ 链接'], is_featured: false, status: 'pending', review_note: '', created_at: now, updated_at: now },
  { name: '某已下线站点', url: 'https://deadsite.example.com', description: '该站点已无法访问', platform: 'aggregator', region: 'cn', tags: [], is_featured: false, status: 'rejected', review_note: 'URL 无法访问，网站已下线', created_at: now, updated_at: now }
];

const AGENTS_DATA = [
  // ── 通用自主 Agent ──────────────────────────────────────────────────────────
  { name: 'Manus', url: 'https://manus.im', description: '全球首款通用 AI Agent，已被 Meta 收购，自主任务分解+执行闭环，能独立完成复杂工作任务', agent_type: 'general', open_source: 'closed', region: 'global', tags: ['通用 Agent', 'Meta', '任务自动化', '闭环执行'], is_featured: true, status: 'published', created_at: now, updated_at: now },
  { name: 'OpenClaw', url: 'https://openclaw.ai', description: '开源通用 Agent，GitHub 2026 年爆火，社区生态强，支持自托管部署', agent_type: 'general', open_source: 'open', region: 'global', tags: ['开源', 'GitHub', '社区生态', '自托管'], is_featured: true, status: 'published', created_at: now, updated_at: now },
  { name: 'AutoGPT', url: 'https://agpt.co', description: '最早期自主 Agent，开源鼻祖，GPT-4 驱动的自主任务执行框架', agent_type: 'general', open_source: 'open', region: 'global', tags: ['开源鼻祖', 'GPT-4', '自主任务', '早期项目'], is_featured: false, status: 'published', created_at: now, updated_at: now },
  { name: 'OpenHands', url: 'https://github.com/All-Hands-AI/OpenHands', description: '前身 OpenDevin，专注软件开发 Agent，可自动化完成编程任务、代码审查和部署', agent_type: 'general', open_source: 'open', region: 'global', tags: ['软件开发', 'OpenDevin', 'GitHub', '代码自动化'], is_featured: true, status: 'published', created_at: now, updated_at: now },
  { name: 'Devin', url: 'https://cognition.ai', description: '自主 AI 软件工程师，全流程写代码：从需求到调试到部署，估值超过 10 亿美元', agent_type: 'general', open_source: 'closed', region: 'global', tags: ['AI 工程师', '写代码', 'Cognition', '全流程'], is_featured: true, status: 'published', created_at: now, updated_at: now },
  { name: 'SWE-agent', url: 'https://swe-agent.com', description: '专注代码 bug 修复的 Agent，SWE-bench 评测领先，学术界和工程界均认可', agent_type: 'general', open_source: 'open', region: 'global', tags: ['Bug 修复', 'SWE-bench', '代码修复', '学术'], is_featured: false, status: 'published', created_at: now, updated_at: now },
  // ── 深度研究型 Agent ────────────────────────────────────────────────────────
  { name: 'OpenAI Deep Research', url: 'https://openai.com', description: '一键生成专业研究报告，自动搜索、整合、分析多维度信息，输出结构化报告', agent_type: 'research', open_source: 'closed', region: 'global', tags: ['OpenAI', '研究报告', '信息整合', '专业分析'], is_featured: true, status: 'published', created_at: now, updated_at: now },
  { name: 'Perplexity', url: 'https://perplexity.ai', description: '实时联网问答+引用来源，搜索引擎的 AI 替代品，答案透明可溯源', agent_type: 'research', open_source: 'closed', region: 'global', tags: ['实时联网', '引用来源', '搜索替代', '透明答案'], is_featured: true, status: 'published', created_at: now, updated_at: now },
  { name: 'DeepSearcher', url: 'https://github.com/zilliztech/deep-searcher', description: '开源，结合私有知识库，企业级 RAG 方案，支持 Milvus 向量数据库', agent_type: 'research', open_source: 'open', region: 'global', tags: ['开源', 'RAG', '私有知识库', 'Milvus', '企业级'], is_featured: false, status: 'published', created_at: now, updated_at: now },
  { name: 'Genspark', url: 'https://genspark.ai', description: '搜索+Agent 一体化，中国团队出品，生成 Sparkpages 沉浸式阅读体验', agent_type: 'research', open_source: 'closed', region: 'cn', tags: ['中国团队', '搜索一体化', 'Sparkpages', '沉浸式'], is_featured: true, status: 'published', created_at: now, updated_at: now },
  // ── Agent 构建平台 ──────────────────────────────────────────────────────────
  { name: 'Dify', url: 'https://dify.ai', description: '开源 Agent 构建平台，支持工作流编排、RAG、工具调用，一站式 LLM 应用开发', agent_type: 'builder', open_source: 'open', region: 'cn', tags: ['开源', '工作流编排', 'RAG', 'LLM 应用', '中国团队'], is_featured: true, status: 'published', created_at: now, updated_at: now },
  { name: 'Coze（扣子）', url: 'https://coze.com', description: '字节跳动出品，国际版，Plugins 生态丰富，无代码搭建 AI Bot 和 Agent', agent_type: 'builder', open_source: 'closed', region: 'cn', tags: ['字节跳动', 'Plugins', '无代码', 'Bot', '扣子'], is_featured: true, status: 'published', created_at: now, updated_at: now },
  { name: 'n8n', url: 'https://n8n.io', description: '开源自动化工作流平台，支持 AI Agent 流水线，400+ 集成节点，可自托管', agent_type: 'builder', open_source: 'open', region: 'global', tags: ['开源', '自动化工作流', '400+ 集成', '自托管'], is_featured: false, status: 'published', created_at: now, updated_at: now },
  { name: 'LangChain', url: 'https://langchain.com', description: 'Agent 开发框架，生态最大，Python/JS 双端支持，LangGraph 支持多 Agent 编排', agent_type: 'builder', open_source: 'open', region: 'global', tags: ['开发框架', '生态最大', 'LangGraph', 'Python', 'JavaScript'], is_featured: true, status: 'published', created_at: now, updated_at: now },
  { name: 'CrewAI', url: 'https://crewai.com', description: '多 Agent 协作框架，通过角色分工实现 Agent 团队协作，生产就绪', agent_type: 'builder', open_source: 'open', region: 'global', tags: ['多 Agent', '角色协作', '开源框架', '生产就绪'], is_featured: false, status: 'published', created_at: now, updated_at: now },
  { name: 'AgentGPT', url: 'https://agentgpt.reworkd.ai', description: '网页端直接部署自主 Agent，无需代码，设定目标后自动分解和执行任务', agent_type: 'builder', open_source: 'open', region: 'global', tags: ['网页端', '无代码', '自主 Agent', '目标分解'], is_featured: false, status: 'published', created_at: now, updated_at: now },
  { name: 'Flowise', url: 'https://flowiseai.com', description: '可视化 LLM 流程构建，低代码拖拽搭建 Agent，支持 LangChain 和 LlamaIndex', agent_type: 'builder', open_source: 'open', region: 'global', tags: ['低代码', '可视化', 'LangChain', 'LlamaIndex', '拖拽'], is_featured: false, status: 'published', created_at: now, updated_at: now },
  // ── 计算机操控型 Agent ──────────────────────────────────────────────────────
  { name: 'Claude Computer Use', url: 'https://www.anthropic.com', description: 'Anthropic 出品，直接操控电脑屏幕，执行点击/输入/浏览等操作，开创计算机使用新范式', agent_type: 'computer', open_source: 'closed', region: 'global', tags: ['Anthropic', '操控电脑', '屏幕交互', '计算机使用'], is_featured: true, status: 'published', created_at: now, updated_at: now },
  { name: 'browser-use', url: 'https://github.com/browser-use/browser-use', description: '开源浏览器自动化 Agent，LLM 直接控制浏览器，GitHub 爆火项目', agent_type: 'computer', open_source: 'open', region: 'global', tags: ['开源', '浏览器自动化', 'GitHub 热门', 'Playwright'], is_featured: true, status: 'published', created_at: now, updated_at: now },
  { name: 'Multion', url: 'https://multion.ai', description: '浏览器 Agent，帮你完成网页任务，支持复杂多步骤网页操作自动化', agent_type: 'computer', open_source: 'closed', region: 'global', tags: ['浏览器 Agent', '网页任务', '多步骤操作'], is_featured: false, status: 'published', created_at: now, updated_at: now },
  { name: 'Skyvern', url: 'https://skyvern.com', description: '视觉 + LLM 驱动的浏览器自动化，无需 CSS 选择器，直接理解网页视觉结构', agent_type: 'computer', open_source: 'open', region: 'global', tags: ['视觉驱动', '浏览器自动化', '无选择器', '开源'], is_featured: false, status: 'published', created_at: now, updated_at: now },
  // ── 垂直创意型 Agent ────────────────────────────────────────────────────────
  { name: 'Lovart', url: 'https://lovart.ai', description: '设计师 AI Agent，自动出图/排版/品牌设计，理解设计意图并输出专业视觉作品', agent_type: 'creative', open_source: 'closed', region: 'global', tags: ['设计 Agent', '出图', '排版', '品牌设计', '创意'], is_featured: true, status: 'published', created_at: now, updated_at: now },
  { name: 'Gamma', url: 'https://gamma.app', description: '自动生成 PPT/文档/网页的 Agent，输入主题即可产出精美演示文稿', agent_type: 'creative', open_source: 'closed', region: 'global', tags: ['PPT 生成', '文档 Agent', '演示文稿', '一键生成'], is_featured: true, status: 'published', created_at: now, updated_at: now },
  { name: 'Cursor', url: 'https://cursor.com', description: '代码 Agent IDE，估值 500 亿美金，AI 原生代码编辑器，重新定义编程工作流', agent_type: 'creative', open_source: 'closed', region: 'global', tags: ['代码 Agent', 'IDE', '500 亿估值', 'AI 编程', '代码补全'], is_featured: true, status: 'published', created_at: now, updated_at: now },
  // ── Proactive Agent ─────────────────────────────────────────────────────────
  { name: 'ColaOS', url: '#', description: '"Soul-First" AI OS，主动感知用户上下文，下一代 Proactive Agent 操作系统，内测中', agent_type: 'proactive', open_source: 'closed', region: 'global', tags: ['AI OS', 'Soul-First', '主动感知', '内测', '下一代'], is_featured: false, status: 'published', created_at: now, updated_at: now },
  { name: 'Paperboy', url: '#', description: '主动整合邮件/日历/文档上下文，提前感知用户需求并主动推送，内测中', agent_type: 'proactive', open_source: 'closed', region: 'global', tags: ['邮件整合', '日历', '主动推送', '上下文感知', '内测'], is_featured: false, status: 'published', created_at: now, updated_at: now },
  // ── 新增：深度研究型 ────────────────────────────────────────────────────────
  { name: 'You.com Research', url: 'https://you.com', description: '带 AI 助手的搜索引擎，可在同一界面完成搜索+分析+写作，支持代码执行和文件上传', agent_type: 'research', open_source: 'closed', region: 'global', tags: ['AI搜索', '代码执行', '文件上传', '一体化'], is_featured: false, status: 'published', created_at: now, updated_at: now },
  // ── 新增：构建平台 ──────────────────────────────────────────────────────────
  { name: 'Botpress', url: 'https://botpress.com', description: '企业级对话 Agent 平台，支持知识库接入、多渠道部署、A/B测试，已有数千企业客户', agent_type: 'builder', open_source: 'partial', region: 'global', tags: ['企业级', '知识库', '多渠道', '对话Bot'], is_featured: false, status: 'published', created_at: now, updated_at: now },
  { name: 'Stack AI', url: 'https://www.stack-ai.com', description: '企业 AI 工作流构建平台，无代码搭建 RAG 应用和 Agent，内置数十种数据连接器', agent_type: 'builder', open_source: 'closed', region: 'global', tags: ['企业AI', 'RAG', '无代码', '数据连接器'], is_featured: false, status: 'published', created_at: now, updated_at: now },
  // ── 新增：计算机操控型 ──────────────────────────────────────────────────────
  { name: 'Browser Use', url: 'https://github.com/browser-use/browser-use', description: '开源浏览器自动化 Agent 库，让 AI 像人一样操控 Chrome，GitHub 10k+ Star，Python 生态友好', agent_type: 'computer', open_source: 'open', region: 'global', tags: ['浏览器自动化', '开源', 'Python', 'Chrome'], is_featured: true, status: 'published', created_at: now, updated_at: now },
  { name: 'Playwright MCP', url: 'https://github.com/microsoft/playwright-mcp', description: 'Microsoft 官方 Playwright MCP Server，让 Claude 等 AI 直接控制浏览器进行自动化测试和信息抓取', agent_type: 'computer', open_source: 'open', region: 'global', tags: ['Microsoft', 'Playwright', 'MCP', '浏览器控制'], is_featured: true, status: 'published', created_at: now, updated_at: now },
  // ── 新增：垂直创意型 ────────────────────────────────────────────────────────
  { name: 'Jasper', url: 'https://www.jasper.ai', description: '面向企业的 AI 营销内容创作平台，支持品牌语调训练、多语言创作，月活百万级', agent_type: 'creative', open_source: 'closed', region: 'global', tags: ['营销文案', '品牌语调', '多语言', '企业级'], is_featured: false, status: 'published', created_at: now, updated_at: now },
  { name: 'Midjourney', url: 'https://midjourney.com', description: '最具艺术感的 AI 图像生成工具，Discord 驱动，用户超 1600 万，专业设计师首选', agent_type: 'creative', open_source: 'closed', region: 'global', tags: ['图像生成', 'Discord', '艺术风格', '专业设计'], is_featured: false, status: 'published', created_at: now, updated_at: now }
];

const NEWS_DATA = [
  { slug: 'manus-acquired-by-meta-2-billion', title: 'Manus AI 以 20 亿美元被 Meta 收购', summary: 'Meta 宣布以约 20 亿美元收购通用 AI Agent 公司 Manus AI，这是 AI Agent 赛道迄今最大规模的收购案。Manus 以其自主任务分解和闭环执行能力在 2025 年初一夜爆火，此次收购标志着科技巨头正式大规模布局自主 Agent 领域。', source_url: 'https://venturebeat.com', source_name: 'VentureBeat', category: 'Agent', tags: ['Manus', 'Meta', '收购', '通用Agent'], status: 'published', is_featured: true, published_at: '2025-12-15T08:00:00Z', created_at: '2025-12-15T08:00:00Z', updated_at: '2025-12-15T08:00:00Z' },
  { slug: 'openclaw-github-top10', title: 'OpenClaw 10天冲上 GitHub Top 10，超越 Linux 内核', summary: '开源通用 Agent 项目 OpenClaw 在发布后 10 天内 Star 数突破 15 万，登上 GitHub 全球 Trending Top 10，单日 Star 增速超过 Linux 内核。其完全开源、支持自托管的特性吸引了大量开发者涌入，社区贡献者已超过 3000 人。', source_url: 'https://github.com/openclaw/openclaw', source_name: 'GitHub', category: 'Agent', tags: ['OpenClaw', 'GitHub', '开源', '社区'], status: 'published', is_featured: true, published_at: '2026-01-08T10:00:00Z', created_at: '2026-01-08T10:00:00Z', updated_at: '2026-01-08T10:00:00Z' },
  { slug: 'anthropic-claude-computer-use', title: 'Anthropic 发布 Claude Computer Use，AI 首次直接操控电脑', summary: 'Anthropic 正式发布 Claude Computer Use 功能，使 AI 能够直接查看屏幕截图、移动光标、点击按钮和输入文字，完成复杂的多步骤计算机任务。这是 AI 从"对话工具"到"自主执行者"的重大转折点。', source_url: 'https://www.anthropic.com/news/3-5-models-and-computer-use', source_name: 'Anthropic Blog', category: 'Agent', tags: ['Claude', 'Anthropic', '计算机使用', '自主Agent'], status: 'published', is_featured: true, published_at: '2024-10-22T16:00:00Z', created_at: '2024-10-22T16:00:00Z', updated_at: '2024-10-22T16:00:00Z' },
  { slug: 'mcp-model-context-protocol-released', title: 'MCP（Model Context Protocol）正式发布，成为 Agent 接口新标准', summary: 'Anthropic 发布开放协议 MCP（Model Context Protocol），旨在标准化 AI 模型与外部工具、数据源的交互方式。发布后迅速获得 OpenAI、Google、Microsoft 等主流厂商支持，成为 AI Agent 生态的事实标准，已有超过 500 个 MCP Server 实现。', source_url: 'https://modelcontextprotocol.io', source_name: 'modelcontextprotocol.io', category: '框架', tags: ['MCP', 'Anthropic', '开放协议', '标准化'], status: 'published', is_featured: true, published_at: '2024-11-25T12:00:00Z', created_at: '2024-11-25T12:00:00Z', updated_at: '2024-11-25T12:00:00Z' },
  { slug: 'openai-deep-research-launch', title: 'OpenAI 推出 Deep Research，一键生成专业研究报告', summary: 'OpenAI 正式发布 Deep Research 功能，能够在数分钟内自主浏览数十个网页、提炼关键信息，并生成带完整引用的专业研究报告。这是 OpenAI 在 Agentic AI 方向的重要里程碑，ChatGPT Pro 用户率先开放使用。', source_url: 'https://openai.com/index/introducing-deep-research', source_name: 'OpenAI Blog', category: 'Agent', tags: ['OpenAI', 'Deep Research', '研究Agent', 'ChatGPT'], status: 'published', is_featured: false, published_at: '2025-02-02T18:00:00Z', created_at: '2025-02-02T18:00:00Z', updated_at: '2025-02-02T18:00:00Z' },
  { slug: 'devin-first-ai-software-engineer', title: 'Devin 发布：第一个自主 AI 软件工程师', summary: 'AI 创业公司 Cognition Labs 发布 Devin，这是业内首个能独立完成完整软件开发任务的 AI Agent，包括：理解需求、写代码、调试、部署全流程。在 SWE-bench 评测中远超此前最优基准，引发业界对 AI 取代软件工程师的广泛讨论。', source_url: 'https://cognition.ai', source_name: 'Cognition AI', category: 'Agent', tags: ['Devin', 'Cognition', 'AI工程师', 'SWE-bench'], status: 'published', is_featured: false, published_at: '2024-03-12T14:00:00Z', created_at: '2024-03-12T14:00:00Z', updated_at: '2024-03-12T14:00:00Z' },
  { slug: 'deepseek-r1-open-source-shock', title: 'DeepSeek-R1 开源，推理成本仅 OpenAI 的 3%', summary: '中国 AI 公司 DeepSeek 发布并完全开源 R1 推理模型，其在数学推理、代码生成等任务上的表现与 OpenAI o1 相当，但训练成本不到后者的 3%。这一消息震惊全球 AI 行业，引发 NVIDIA 股价大跌，并重燃全球对中国 AI 能力的关注。', source_url: 'https://github.com/deepseek-ai/DeepSeek-R1', source_name: 'GitHub / DeepSeek', category: '模型', tags: ['DeepSeek', 'R1', '开源', '推理模型'], status: 'published', is_featured: true, published_at: '2025-01-20T08:00:00Z', created_at: '2025-01-20T08:00:00Z', updated_at: '2025-01-20T08:00:00Z' },
  { slug: 'cursor-valuation-50-billion', title: 'Cursor 估值谈判达 500 亿美金', summary: '代码 Agent IDE Cursor 的母公司 Anysphere 据悉正在进行新一轮融资谈判，估值高达 500 亿美元。自 2024 年底以来，Cursor 的月活跃开发者数量增长超 10 倍，成为 AI 编程工具赛道当之无愧的第一。', source_url: 'https://bloomberg.com', source_name: 'Bloomberg', category: '工具', tags: ['Cursor', '估值', 'AI编程', 'IDE'], status: 'published', is_featured: false, published_at: '2026-03-01T10:00:00Z', created_at: '2026-03-01T10:00:00Z', updated_at: '2026-03-01T10:00:00Z' },
  { slug: 'google-gemini-2-agentic', title: 'Google 发布 Gemini 2.0，原生支持 Agentic 能力', summary: 'Google DeepMind 发布 Gemini 2.0 系列模型，这是 Google 首批原生支持 Agentic 能力的模型，包括实时流媒体、原生工具调用和多模态输入输出。Gemini 2.0 Flash 以极低成本提供强大的 Agent 支持，正在快速占领企业市场。', source_url: 'https://deepmind.google/technologies/gemini', source_name: 'Google DeepMind', category: '模型', tags: ['Google', 'Gemini', 'Agentic', '多模态'], status: 'published', is_featured: false, published_at: '2024-12-11T18:00:00Z', created_at: '2024-12-11T18:00:00Z', updated_at: '2024-12-11T18:00:00Z' },
  { slug: 'crewai-18m-funding', title: 'CrewAI 获 1800 万美元融资，多 Agent 协作框架崛起', summary: 'AI 开发框架公司 CrewAI 宣布完成 1800 万美元 A 轮融资，其多 Agent 协作框架在过去一年内 GitHub Star 突破 2 万，被数千家企业用于构建自动化工作流。CrewAI 通过角色分工模型让多个 AI Agent 像团队一样协作，解决单一 Agent 的能力瓶颈。', source_url: 'https://crewai.com', source_name: 'CrewAI', category: '框架', tags: ['CrewAI', '融资', '多Agent', '框架'], status: 'published', is_featured: false, published_at: '2024-11-08T14:00:00Z', created_at: '2024-11-08T14:00:00Z', updated_at: '2024-11-08T14:00:00Z' },
  { slug: 'anthropic-claude-3-5-sonnet-swe-bench', title: 'Claude 3.5 Sonnet 登顶 SWE-bench，成为最强编程 AI', summary: 'Anthropic 发布 Claude 3.5 Sonnet，在 SWE-bench Verified 评测中以 49% 的问题解决率位列第一，超越 GPT-4o 和 Gemini 1.5 Pro。SWE-bench 是测试 AI 真实 GitHub Bug 修复能力的权威基准，这一结果意味着 Claude 在自主软件开发任务上已达到人类初级工程师水平。', source_url: 'https://www.anthropic.com/news/claude-3-5-sonnet', source_name: 'Anthropic Blog', category: '模型', tags: ['Claude', 'SWE-bench', '编程AI', 'Anthropic'], status: 'published', is_featured: false, published_at: '2024-06-20T16:00:00Z', created_at: '2024-06-20T16:00:00Z', updated_at: '2024-06-20T16:00:00Z' },
  { slug: 'langchain-langgraph-agent-framework', title: 'LangGraph 发布：构建有状态 Agent 的新范式', summary: 'LangChain 团队发布 LangGraph，将 Agent 工作流建模为有向图（DAG），支持循环执行、持久化状态和人工干预节点。相比 LangChain Agents，LangGraph 的可控性和可调试性大幅提升，已成为生产级 Agent 开发的首选框架，GitHub Star 超过 9000。', source_url: 'https://blog.langchain.dev/langgraph', source_name: 'LangChain Blog', category: '框架', tags: ['LangChain', 'LangGraph', 'Agent框架', '有向图'], status: 'published', is_featured: false, published_at: '2024-07-15T12:00:00Z', created_at: '2024-07-15T12:00:00Z', updated_at: '2024-07-15T12:00:00Z' },
  { slug: 'microsoft-autogen-multi-agent', title: 'Microsoft AutoGen 2.0：多 Agent 协作框架迭代升级', summary: 'Microsoft Research 发布 AutoGen 2.0，这是其多 Agent 协作框架的重大升级版本，新增异步通信、灵活的对话模式和企业级部署支持。AutoGen 允许多个 AI Agent 像团队成员一样分工协作，广泛应用于代码生成、数据分析和复杂任务分解场景。', source_url: 'https://microsoft.github.io/autogen', source_name: 'Microsoft Research', category: '框架', tags: ['Microsoft', 'AutoGen', '多Agent', '协作框架'], status: 'published', is_featured: false, published_at: '2024-09-04T10:00:00Z', created_at: '2024-09-04T10:00:00Z', updated_at: '2024-09-04T10:00:00Z' },
  { slug: 'openai-swarm-multi-agent-open-source', title: 'OpenAI 开源 Swarm：轻量多 Agent 编排框架', summary: 'OpenAI 突然开源 Swarm，一个专为教育和实验设计的轻量级多 Agent 编排框架。Swarm 的核心概念是 Handoff（任务交接）和 Routines（例行程序），让开发者能快速理解多 Agent 协作的核心机制，但 OpenAI 明确声明 Swarm 不是生产级框架。', source_url: 'https://github.com/openai/swarm', source_name: 'OpenAI GitHub', category: '框架', tags: ['OpenAI', 'Swarm', '开源', '多Agent'], status: 'published', is_featured: false, published_at: '2024-10-11T14:00:00Z', created_at: '2024-10-11T14:00:00Z', updated_at: '2024-10-11T14:00:00Z' },
  { slug: 'cursor-ai-ide-100-million-arr', title: 'Cursor IDE 年收入突破 1 亿美元，改写 AI 编程工具格局', summary: 'AI 代码编辑器 Cursor 的母公司 Anysphere 宣布年化收入（ARR）突破 1 亿美元，成为有史以来增长最快的 SaaS 产品之一。Cursor 将 AI 融入代码编辑的每个环节，包括 Tab 补全、内联对话和 Agent 模式，已取代 GitHub Copilot 成为最多开发者使用的 AI 编程工具。', source_url: 'https://cursor.sh', source_name: 'Anysphere Blog', category: '工具', tags: ['Cursor', 'AI编程', 'IDE', '1亿ARR'], status: 'published', is_featured: true, published_at: '2024-08-22T10:00:00Z', created_at: '2024-08-22T10:00:00Z', updated_at: '2024-08-22T10:00:00Z' },
  { slug: 'dify-open-source-llmops-platform', title: 'Dify 开源 LLMOps 平台 GitHub Star 突破 5 万', summary: '开源 AI 应用开发平台 Dify 在 GitHub 上的 Star 数突破 5 万，成为最受欢迎的 AI 应用构建工具之一。Dify 支持可视化工作流编排、RAG 知识库、Agent 搭建，并提供完整的 LLMOps 能力。超过 10 万个 AI 应用已基于 Dify 构建。', source_url: 'https://dify.ai', source_name: 'Dify Blog', category: '框架', tags: ['Dify', '开源', 'LLMOps', 'RAG'], status: 'published', is_featured: false, published_at: '2025-01-05T08:00:00Z', created_at: '2025-01-05T08:00:00Z', updated_at: '2025-01-05T08:00:00Z' },
  { slug: 'anthropic-mcp-500-servers', title: 'MCP 生态爆发：社区已发布超过 500 个 Server', summary: 'MCP 协议发布仅 3 个月，社区贡献的 MCP Server 数量已突破 500 个，涵盖数据库、浏览器、代码工具、SaaS 平台等各类场景。Cursor、Windsurf 等主流 AI 编辑器相继宣布支持 MCP，Claude Desktop 成为最受欢迎的 MCP 客户端，用户数超过 200 万。', source_url: 'https://modelcontextprotocol.io/examples', source_name: 'MCP 官网', category: '框架', tags: ['MCP', '生态', '500+', 'Claude Desktop'], status: 'published', is_featured: true, published_at: '2025-02-20T10:00:00Z', created_at: '2025-02-20T10:00:00Z', updated_at: '2025-02-20T10:00:00Z' },
  { slug: 'replit-agent-coding-platform', title: 'Replit Agent 发布：代码到部署全自动，面向非工程师', summary: 'Replit 发布 Replit Agent，这是一款面向非技术用户的全栈 AI 开发助手，能够根据自然语言描述自动创建、调试和部署完整的 Web 应用。Replit Agent 打通了从想法到上线产品的全链路，被认为是"最接近未来程序员被替代"的产品。', source_url: 'https://replit.com/blog/agent', source_name: 'Replit Blog', category: 'Agent', tags: ['Replit', '全栈Agent', '无代码', '自动部署'], status: 'published', is_featured: false, published_at: '2024-09-03T16:00:00Z', created_at: '2024-09-03T16:00:00Z', updated_at: '2024-09-03T16:00:00Z' },
  { slug: 'swe-agent-princeton-open-source', title: 'SWE-agent：普林斯顿开源的软件工程 AI', summary: '普林斯顿大学开源 SWE-agent，这是一个让语言模型自主解决真实 GitHub Issues 的框架。SWE-agent 在 SWE-bench 测试中达到 12.5% 的解题率，是当时开源方案的最高成绩。它引入了 Agent-Computer Interface（ACI）概念，优化了模型与代码环境的交互方式。', source_url: 'https://swe-agent.com', source_name: 'Princeton NLP', category: 'Agent', tags: ['SWE-agent', '开源', '普林斯顿', 'GitHub Issues'], status: 'published', is_featured: false, published_at: '2024-04-02T12:00:00Z', created_at: '2024-04-02T12:00:00Z', updated_at: '2024-04-02T12:00:00Z' },
  { slug: 'windsurf-ai-ide-codeium', title: 'Windsurf 发布：Codeium 推出对标 Cursor 的 AI IDE', summary: 'AI 代码工具公司 Codeium 发布 Windsurf，这是首款搭载 Cascade 功能的 AI IDE，能够感知整个代码库的上下文并自动执行多步骤任务。Windsurf 发布后迅速获得大量开发者关注，被认为是 Cursor 最强有力的竞争者，推动了 AI IDE 市场的快速竞争格局。', source_url: 'https://codeium.com/windsurf', source_name: 'Codeium Blog', category: '工具', tags: ['Windsurf', 'Codeium', 'AI IDE', 'Cascade'], status: 'published', is_featured: false, published_at: '2024-11-13T10:00:00Z', created_at: '2024-11-13T10:00:00Z', updated_at: '2024-11-13T10:00:00Z' }
];

const MCP_DATA = [
  // ── 文件系统 ──────────────────────────────────────────────────────────────
  { name: 'filesystem', description: '读写本地文件系统，支持文件创建、修改、删除、目录遍历，是最常用的 MCP Server 之一', url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem', category: 'filesystem', is_official: true, install_cmd: 'npx @modelcontextprotocol/server-filesystem', tags: ['文件读写', '目录', '本地文件', '官方'], stars: 28000, is_featured: true, created_at: now },
  { name: 'everything', description: 'Windows 平台文件极速搜索，通过 Everything 引擎实现毫秒级文件定位', url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/everything', category: 'filesystem', is_official: true, install_cmd: 'npx @modelcontextprotocol/server-everything', tags: ['Windows', '文件搜索', 'Everything', '官方'], stars: 28000, is_featured: false, created_at: now },
  // ── 数据库 ────────────────────────────────────────────────────────────────
  { name: 'sqlite', description: '读写 SQLite 数据库，支持执行 SQL 查询、创建表、插入更新数据，适合本地开发调试', url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/sqlite', category: 'database', is_official: true, install_cmd: 'npx @modelcontextprotocol/server-sqlite', tags: ['SQLite', '数据库', 'SQL', '官方'], stars: 28000, is_featured: true, created_at: now },
  { name: 'postgres', description: '连接 PostgreSQL 数据库执行查询，支持完整的 SQL 操作，适合生产环境数据分析', url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/postgres', category: 'database', is_official: true, install_cmd: 'npx @modelcontextprotocol/server-postgres', tags: ['PostgreSQL', '数据库', 'SQL', '官方'], stars: 28000, is_featured: false, created_at: now },
  { name: 'mysql', description: '连接 MySQL/MariaDB 数据库，支持查询、插入、更新等完整操作，社区维护', url: 'https://github.com/benborla/mcp-server-mysql', category: 'database', is_official: false, install_cmd: 'npx mcp-server-mysql', tags: ['MySQL', 'MariaDB', '数据库', '社区'], stars: 800, is_featured: false, created_at: now },
  // ── 浏览器/网页 ───────────────────────────────────────────────────────────
  { name: 'puppeteer', description: '通过 Puppeteer 控制 Chrome 浏览器，支持网页截图、表单填写、点击操作、JavaScript 执行', url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/puppeteer', category: 'browser', is_official: true, install_cmd: 'npx @modelcontextprotocol/server-puppeteer', tags: ['Puppeteer', '浏览器自动化', 'Chrome', '官方'], stars: 28000, is_featured: true, created_at: now },
  { name: 'fetch', description: '抓取网页内容并转换为 Markdown 格式，AI 可直接阅读和分析任意网页', url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/fetch', category: 'browser', is_official: true, install_cmd: 'npx @modelcontextprotocol/server-fetch', tags: ['网页抓取', 'Markdown', 'HTTP', '官方'], stars: 28000, is_featured: true, created_at: now },
  { name: 'browserbase', description: '云端无头浏览器控制，无需本地安装 Chrome，通过 API 实现规模化浏览器自动化', url: 'https://github.com/browserbase/mcp-server-browserbase', category: 'browser', is_official: false, install_cmd: 'npx @browserbasehq/mcp', tags: ['云端浏览器', '无头', 'Browserbase'], stars: 1200, is_featured: false, created_at: now },
  // ── 开发工具 ──────────────────────────────────────────────────────────────
  { name: 'github', description: '完整的 GitHub 操作：创建 PR、查看 Issues、提交代码、管理仓库，开发者必备', url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/github', category: 'devtools', is_official: true, install_cmd: 'npx @modelcontextprotocol/server-github', tags: ['GitHub', 'PR', 'Issues', '代码仓库', '官方'], stars: 28000, is_featured: true, created_at: now },
  { name: 'gitlab', description: '对接 GitLab 实例，支持仓库操作、Merge Request、Pipeline 状态查询', url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/gitlab', category: 'devtools', is_official: true, install_cmd: 'npx @modelcontextprotocol/server-gitlab', tags: ['GitLab', 'MR', 'CI/CD', '官方'], stars: 28000, is_featured: false, created_at: now },
  { name: 'git', description: '本地 Git 仓库操作：commit、diff、log、branch 管理，无需离开 AI 界面', url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/git', category: 'devtools', is_official: true, install_cmd: 'npx @modelcontextprotocol/server-git', tags: ['Git', 'Commit', 'Diff', '版本控制', '官方'], stars: 28000, is_featured: false, created_at: now },
  // ── 效率工具 ──────────────────────────────────────────────────────────────
  { name: 'slack', description: '在 Slack 中收发消息、查询频道历史、管理通知，让 AI 融入团队沟通', url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/slack', category: 'productivity', is_official: true, install_cmd: 'npx @modelcontextprotocol/server-slack', tags: ['Slack', '消息', '团队协作', '官方'], stars: 28000, is_featured: false, created_at: now },
  { name: 'google-drive', description: '读写 Google Drive 文件，支持 Docs、Sheets、Slides 的创建和编辑', url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/gdrive', category: 'productivity', is_official: true, install_cmd: 'npx @modelcontextprotocol/server-gdrive', tags: ['Google Drive', 'Docs', 'Sheets', '云存储', '官方'], stars: 28000, is_featured: false, created_at: now },
  { name: 'google-maps', description: '地图搜索、地址解析、路线规划、周边 POI 查询，地理位置相关任务必备', url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/google-maps', category: 'productivity', is_official: true, install_cmd: 'npx @modelcontextprotocol/server-google-maps', tags: ['Google Maps', '地图', '地址查询', '官方'], stars: 28000, is_featured: false, created_at: now },
  { name: 'notion', description: '操作 Notion 数据库和页面，支持创建、查询、更新 Block，知识管理利器', url: 'https://github.com/makenotion/notion-mcp-server', category: 'productivity', is_official: false, install_cmd: 'npx @notionhq/notion-mcp-server', tags: ['Notion', '知识库', '数据库', '笔记'], stars: 3500, is_featured: true, created_at: now },
  // ── 数据/搜索 ─────────────────────────────────────────────────────────────
  { name: 'brave-search', description: 'Brave 搜索引擎实时搜索，无追踪隐私保护，返回结构化搜索结果', url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/brave-search', category: 'search', is_official: true, install_cmd: 'npx @modelcontextprotocol/server-brave-search', tags: ['Brave', '搜索', '实时', '隐私', '官方'], stars: 28000, is_featured: true, created_at: now },
  { name: 'tavily', description: 'AI 优化的搜索 API，专为 Agent 设计，返回高质量摘要而非原始链接列表', url: 'https://github.com/tavily-ai/tavily-mcp', category: 'search', is_official: false, install_cmd: 'npx tavily-mcp', tags: ['Tavily', 'AI搜索', '摘要', 'Agent专用'], stars: 2100, is_featured: true, created_at: now },
  { name: 'exa', description: '语义搜索引擎，理解搜索意图而非关键词匹配，适合复杂研究任务', url: 'https://github.com/exa-labs/exa-mcp-server', category: 'search', is_official: false, install_cmd: 'npx exa-mcp-server', tags: ['Exa', '语义搜索', '研究', 'RAG'], stars: 1800, is_featured: false, created_at: now },
  // ── AI 模型 ───────────────────────────────────────────────────────────────
  { name: 'openai', description: '在 Claude 中调用 GPT 系列模型，实现多模型协作，适合需要图像生成或特定能力的场景', url: 'https://github.com/openai/openai-mcp', category: 'ai', is_official: false, install_cmd: 'npx openai-mcp', tags: ['OpenAI', 'GPT-4', '多模型', 'DALL-E'], stars: 4200, is_featured: false, created_at: now },
  { name: 'sequential-thinking', description: '链式推理增强 Server，让 AI 在复杂问题上逐步思考，显著提升逻辑推理质量', url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/sequentialthinking', category: 'ai', is_official: true, install_cmd: 'npx @modelcontextprotocol/server-sequential-thinking', tags: ['推理增强', '链式思考', 'CoT', '官方'], stars: 28000, is_featured: true, created_at: now },
  // ── 新增：效率工具 ──────────────────────────────────────────────────────────
  { name: 'linear', description: '连接 Linear 项目管理工具，AI 可查询/创建 Issues、管理 Sprint、追踪工作进度', url: 'https://github.com/linear/linear-mcp-server', category: 'productivity', is_official: false, install_cmd: 'npx @linear/mcp-server', tags: ['Linear', '项目管理', 'Issue追踪', 'Sprint'], stars: 2800, is_featured: false, created_at: now },
  { name: 'jira', description: '集成 Atlassian Jira，支持创建和查询 Tickets、管理 Sprint、读取项目看板状态', url: 'https://github.com/atlassian-labs/atlassian-mcp-server', category: 'productivity', is_official: false, install_cmd: 'npx @atlassian/mcp-server', tags: ['Jira', 'Atlassian', 'Ticket管理', '看板'], stars: 1900, is_featured: false, created_at: now },
  { name: 'calendar', description: 'Google Calendar 读写，AI 可查询日程、创建会议、设置提醒，提升时间管理效率', url: 'https://github.com/modelcontextprotocol/servers/tree/main/src/gcalendar', category: 'productivity', is_official: true, install_cmd: 'npx @modelcontextprotocol/server-gcalendar', tags: ['Google Calendar', '日程管理', '会议创建', '官方'], stars: 28000, is_featured: false, created_at: now },
  { name: 'discord', description: '读取 Discord 频道消息、发送通知、管理服务器，适合构建自动化社区管理 Agent', url: 'https://github.com/discordjs/discord-mcp-server', category: 'productivity', is_official: false, install_cmd: 'npx discord-mcp', tags: ['Discord', '社区管理', '消息自动化', '通知'], stars: 950, is_featured: false, created_at: now },
  { name: 'confluence', description: '读写 Atlassian Confluence Wiki，AI 可搜索文档、创建页面、更新知识库内容', url: 'https://github.com/atlassian-labs/confluence-mcp-server', category: 'productivity', is_official: false, install_cmd: 'npx @atlassian/confluence-mcp', tags: ['Confluence', 'Wiki', '知识库', 'Atlassian'], stars: 1400, is_featured: false, created_at: now },
  // ── 新增：开发工具 ──────────────────────────────────────────────────────────
  { name: 'docker', description: '管理 Docker 容器和镜像，AI 可启动/停止容器、查看日志、管理 Docker Compose', url: 'https://github.com/ckreiling/mcp-server-docker', category: 'devtools', is_official: false, install_cmd: 'npx mcp-server-docker', tags: ['Docker', '容器管理', 'DevOps', '日志查看'], stars: 3200, is_featured: true, created_at: now },
  { name: 'kubernetes', description: '管理 Kubernetes 集群，查询 Pod 状态、部署应用、查看事件日志，DevOps 必备', url: 'https://github.com/strowk/mcp-k8s-go', category: 'devtools', is_official: false, install_cmd: 'npx mcp-k8s', tags: ['Kubernetes', 'K8s', 'DevOps', '集群管理'], stars: 2100, is_featured: false, created_at: now },
  { name: 'sentry', description: '连接 Sentry 错误追踪，AI 可查询错误详情、分析堆栈跟踪、关联代码问题', url: 'https://github.com/getsentry/sentry-mcp', category: 'devtools', is_official: false, install_cmd: 'npx sentry-mcp', tags: ['Sentry', '错误追踪', '堆栈分析', '监控'], stars: 1600, is_featured: false, created_at: now },
  { name: 'aws', description: '访问 AWS 云服务，查询 EC2/S3/Lambda 状态，管理云资源，适合 DevOps 自动化', url: 'https://github.com/aws/aws-mcp-server', category: 'devtools', is_official: false, install_cmd: 'npx @aws/mcp-server', tags: ['AWS', 'S3', 'EC2', 'Lambda', '云服务'], stars: 4500, is_featured: true, created_at: now },
  // ── 新增：数据库 ────────────────────────────────────────────────────────────
  { name: 'redis', description: '操作 Redis 缓存数据库，支持 GET/SET/查询 Key、分析内存使用、监控连接状态', url: 'https://github.com/redis-py/redis-mcp', category: 'database', is_official: false, install_cmd: 'npx redis-mcp', tags: ['Redis', '缓存', 'Key-Value', '内存数据库'], stars: 890, is_featured: false, created_at: now },
  { name: 'mongodb', description: '连接 MongoDB 文档数据库，AI 可执行查询、聚合管道分析，无需记忆 Query 语法', url: 'https://github.com/mongodb-labs/mongodb-mcp-server', category: 'database', is_official: false, install_cmd: 'npx mongodb-mcp', tags: ['MongoDB', '文档数据库', '聚合查询', 'NoSQL'], stars: 1700, is_featured: false, created_at: now },
  { name: 'supabase', description: '连接 Supabase 后端服务，支持数据库查询、文件存储、认证管理，开发者最爱', url: 'https://github.com/supabase/mcp-server-supabase', category: 'database', is_official: false, install_cmd: 'npx @supabase/mcp-server', tags: ['Supabase', 'PostgreSQL', '后端即服务', '开发者工具'], stars: 5200, is_featured: true, created_at: now },
  // ── 新增：AI模型 ────────────────────────────────────────────────────────────
  { name: 'huggingface', description: 'Hugging Face 模型推理 MCP Server，让 AI 直接调用 HF 上的数万个开源模型', url: 'https://github.com/huggingface/huggingface-mcp', category: 'ai', is_official: false, install_cmd: 'npx huggingface-mcp', tags: ['HuggingFace', '开源模型', '模型推理', '模型库'], stars: 3800, is_featured: false, created_at: now },
  { name: 'replicate', description: '调用 Replicate 上的 AI 模型（图像生成、语音合成等），一行命令运行任意 AI 模型', url: 'https://github.com/replicate/replicate-mcp', category: 'ai', is_official: false, install_cmd: 'npx replicate-mcp', tags: ['Replicate', '图像生成', '语音合成', '多模态'], stars: 2300, is_featured: false, created_at: now },
  // ── 新增：搜索 ─────────────────────────────────────────────────────────────
  { name: 'perplexity-search', description: 'Perplexity AI 搜索 MCP，带 AI 摘要的实时搜索，特别适合研究型 Agent 任务', url: 'https://github.com/ppl-ai/perplexity-mcp', category: 'search', is_official: false, install_cmd: 'npx perplexity-mcp', tags: ['Perplexity', 'AI摘要', '实时搜索', '研究Agent'], stars: 1400, is_featured: false, created_at: now },
  { name: 'arxiv', description: '搜索 arXiv 学术论文数据库，获取最新研究成果，适合科研型 Agent', url: 'https://github.com/blazickjp/arxiv-mcp-server', category: 'search', is_official: false, install_cmd: 'npx arxiv-mcp-server', tags: ['arXiv', '论文搜索', '学术研究', '科研'], stars: 650, is_featured: false, created_at: now }
];

const MODELS_DATA = [
  { name: 'GPT-4o', vendor: 'OpenAI', description: 'OpenAI 旗舰多模态模型，视觉/语音/文字全能，响应速度快，生态最完善', url: 'https://openai.com/gpt-4o', model_type: ['chat', 'multimodal'], context_window: '128K', multimodal: true, is_open_source: false, price_input: '$5 / 1M', price_output: '$15 / 1M', reasoning_score: 4, code_score: 4, speed_score: 4, is_featured: true, tags: ['多模态', '视觉', 'OpenAI', '旗舰'], release_date: '2024-05-13' },
  { name: 'Claude 3.5 Sonnet', vendor: 'Anthropic', description: 'Anthropic 最强编程模型，SWE-bench 第一，代码质量和指令遵循能力顶级，Agent 任务表现优异', url: 'https://anthropic.com', model_type: ['chat', 'code'], context_window: '200K', multimodal: true, is_open_source: false, price_input: '$3 / 1M', price_output: '$15 / 1M', reasoning_score: 5, code_score: 5, speed_score: 4, is_featured: true, tags: ['代码', 'SWE-bench第一', 'Anthropic', 'Agent'], release_date: '2024-06-20' },
  { name: 'Gemini 2.0 Flash', vendor: 'Google', description: 'Google 最新 Agentic 模型，百万 Token 超长上下文，原生支持工具调用，价格极低', url: 'https://ai.google.dev', model_type: ['chat', 'multimodal'], context_window: '1M', multimodal: true, is_open_source: false, price_input: '$0.1 / 1M', price_output: '$0.4 / 1M', reasoning_score: 4, code_score: 4, speed_score: 5, is_featured: true, tags: ['长上下文', '低价', 'Google', 'Agentic'], release_date: '2024-12-11' },
  { name: 'DeepSeek-V3', vendor: 'DeepSeek', description: '国产旗舰模型，代码和数学能力媲美 Claude，价格仅为 OpenAI 的 5%，性价比之王', url: 'https://deepseek.com', model_type: ['chat', 'code'], context_window: '64K', multimodal: false, is_open_source: true, price_input: '$0.27 / 1M', price_output: '$1.1 / 1M', reasoning_score: 5, code_score: 5, speed_score: 4, is_featured: true, tags: ['开源', '高性价比', 'DeepSeek', '代码'], release_date: '2024-12-26' },
  { name: 'DeepSeek-R1', vendor: 'DeepSeek', description: '专为复杂推理设计，数学/逻辑/代码能力与 o1 相当，但完全开源，训练成本仅 3%', url: 'https://deepseek.com', model_type: ['reasoning', 'code'], context_window: '64K', multimodal: false, is_open_source: true, price_input: '$0.55 / 1M', price_output: '$2.19 / 1M', reasoning_score: 5, code_score: 5, speed_score: 3, is_featured: true, tags: ['开源', '推理', 'R1', '数学'], release_date: '2025-01-20' },
  { name: 'Llama 3.3 70B', vendor: 'Meta', description: 'Meta 最新开源旗舰，700 亿参数，可自托管，商业友好 License，性能逼近闭源模型', url: 'https://llama.meta.com', model_type: ['chat', 'code'], context_window: '128K', multimodal: false, is_open_source: true, price_input: '开源免费', price_output: '开源免费', reasoning_score: 4, code_score: 4, speed_score: 4, is_featured: false, tags: ['开源', 'Meta', '自托管', '70B'], release_date: '2024-12-06' },
  { name: 'Mistral Large', vendor: 'Mistral', description: '欧洲最强 AI 模型，多语言能力出色，支持 Function Calling，适合欧洲合规场景', url: 'https://mistral.ai', model_type: ['chat', 'code'], context_window: '128K', multimodal: false, is_open_source: false, price_input: '$2 / 1M', price_output: '$6 / 1M', reasoning_score: 4, code_score: 4, speed_score: 4, is_featured: false, tags: ['欧洲', '多语言', 'Mistral', '合规'], release_date: '2024-11-18' },
  { name: 'Qwen2.5-72B', vendor: 'Alibaba', description: '阿里巴巴通义千问最新旗舰，中文能力国内最强，完全开源，支持多模态', url: 'https://qwen.readthedocs.io', model_type: ['chat', 'multimodal'], context_window: '128K', multimodal: true, is_open_source: true, price_input: '开源免费', price_output: '开源免费', reasoning_score: 4, code_score: 4, speed_score: 4, is_featured: false, tags: ['开源', '中文最强', '阿里巴巴', '多模态'], release_date: '2024-09-19' },
  { name: 'GPT-4o mini', vendor: 'OpenAI', description: 'GPT-4o 轻量版，速度比 GPT-4o 快 3 倍，价格降低 95%，适合高并发 Agent 场景', url: 'https://openai.com/gpt-4o-mini', model_type: ['chat'], context_window: '128K', multimodal: true, is_open_source: false, price_input: '$0.15 / 1M', price_output: '$0.6 / 1M', reasoning_score: 3, code_score: 3, speed_score: 5, is_featured: false, tags: ['轻量', '高速', '低价', '高并发'], release_date: '2024-07-18' },
  { name: 'o1-preview', vendor: 'OpenAI', description: 'OpenAI 推理专项模型，深度思考后回答，数学/科学/代码复杂问题表现最强，但速度慢', url: 'https://openai.com/o1', model_type: ['reasoning'], context_window: '128K', multimodal: false, is_open_source: false, price_input: '$15 / 1M', price_output: '$60 / 1M', reasoning_score: 5, code_score: 5, speed_score: 2, is_featured: true, tags: ['推理专项', '深度思考', '数学', 'o1'], release_date: '2024-09-12' },
  { name: 'Claude 3 Haiku', vendor: 'Anthropic', description: 'Anthropic 最快最便宜的模型，适合实时对话和高频 API 调用，成本极低', url: 'https://anthropic.com', model_type: ['chat'], context_window: '200K', multimodal: true, is_open_source: false, price_input: '$0.25 / 1M', price_output: '$1.25 / 1M', reasoning_score: 3, code_score: 3, speed_score: 5, is_featured: false, tags: ['超快速', '超低价', 'Anthropic', '高频调用'], release_date: '2024-03-13' },
  { name: 'Gemini 1.5 Pro', vendor: 'Google', description: 'Google 超长上下文专项模型，200 万 Token 窗口，可分析整部代码库或长视频', url: 'https://ai.google.dev', model_type: ['chat', 'multimodal'], context_window: '2M', multimodal: true, is_open_source: false, price_input: '$3.5 / 1M', price_output: '$10.5 / 1M', reasoning_score: 4, code_score: 4, speed_score: 3, is_featured: false, tags: ['超长上下文', '200万Token', '视频分析', 'Google'], release_date: '2024-05-14' },
  { name: 'Qwen2.5-Coder', vendor: 'Alibaba', description: '阿里代码专项模型，代码能力超越 Claude 3.5 Sonnet，HumanEval 98.5%，完全开源', url: 'https://qwen.readthedocs.io', model_type: ['code'], context_window: '128K', multimodal: false, is_open_source: true, price_input: '开源免费', price_output: '开源免费', reasoning_score: 4, code_score: 5, speed_score: 4, is_featured: true, tags: ['代码专项', '开源', 'HumanEval', '阿里巴巴'], release_date: '2024-11-12' },
  { name: 'Mixtral 8x22B', vendor: 'Mistral', description: 'Mistral 旗舰 MoE 架构开源模型，1410 亿参数激活 390 亿，性能与成本的最佳平衡', url: 'https://mistral.ai', model_type: ['chat', 'code'], context_window: '64K', multimodal: false, is_open_source: true, price_input: '开源免费', price_output: '开源免费', reasoning_score: 4, code_score: 4, speed_score: 4, is_featured: false, tags: ['MoE架构', '开源', '高性价比', 'Mistral'], release_date: '2024-04-17' }
];

const BENCHMARKS_DATA = [
  { name: 'GAIA', description: '测量 AI Agent 完成真实世界任务的能力，包括多步骤推理、工具使用和信息检索', url: 'https://huggingface.co/datasets/gaia-benchmark/GAIA', category: 'agent', current_leader: 'Claude 3.5 Sonnet', leader_score: '53.6%' },
  { name: 'SWE-bench Verified', description: '基于真实 GitHub Issues 测试 AI 修复代码 Bug 的能力，被认为是最接近真实开发场景的评测', url: 'https://www.swebench.com', category: 'code', current_leader: 'Claude 3.5 Sonnet', leader_score: '49%' },
  { name: 'HumanEval', description: '代码生成能力基准，包含 164 个编程问题，测试从描述直接生成函数的能力', url: 'https://paperswithcode.com/sota/code-generation-on-humaneval', category: 'code', current_leader: 'DeepSeek-V3', leader_score: '90.2%' },
  { name: 'MMLU', description: '57个学科的综合知识理解测试，覆盖数学、科学、法律、医学等，评估模型的广泛知识储备', url: 'https://paperswithcode.com/sota/multi-task-language-understanding-on-mmlu', category: 'knowledge', current_leader: 'GPT-4o', leader_score: '88.7%' },
  { name: 'Chatbot Arena', description: '基于真实用户盲测投票的偏好排行榜，是最能反映实际用户满意度的评测', url: 'https://lmarena.ai', category: 'preference', current_leader: 'Claude 3.5 Sonnet', leader_score: 'ELO 1268' },
  { name: 'HumanEval+', description: 'OpenAI 发布的代码生成基准，评估模型编写 Python 函数解决算法问题的能力', url: 'https://github.com/openai/human-eval', category: 'code', current_leader: 'Qwen2.5-Coder 32B', leader_score: '98.5%' },
  { name: 'MATH', description: '高中到竞赛级别数学问题测试集，考查模型的数学推理和解题能力', url: 'https://github.com/hendrycks/math', category: 'reasoning', current_leader: 'o1-preview', leader_score: '94.8%' },
  { name: 'MMLU Pro', description: '涵盖 57 个学科的多任务语言理解基准，是最广泛使用的知识评测集', url: 'https://github.com/hendrycks/test', category: 'knowledge', current_leader: 'GPT-4o', leader_score: '88.7%' }
];

const TUTORIALS_DATA = [
  {
    slug: 'what-is-ai-agent',
    title: '什么是 AI Agent？',
    subtitle: '5 分钟搞懂和普通 AI 的区别',
    summary: '用一个简单的类比解释 AI Agent：ChatGPT 是顾问，Agent 是帮你干活的员工。本文带你快速理解 Agent 的核心概念、与普通 AI 的区别，以及为什么 2025 年是 Agent 元年。',
    content: '# 什么是 AI Agent？\n\n## 一个简单的类比\n\n想象你需要安排一次出差：\n\n- **普通 AI（ChatGPT）**：你问它"帮我规划北京到上海的出差行程"，它给你一个建议清单。**但你还得自己去订机票、订酒店、发邮件通知同事。**\n\n- **AI Agent**：你告诉它"帮我安排3月15日去上海出差，预算5000元以内"，它会**自动**查询机票价格、比较酒店、发送日历邀请、通知相关人员——全程不需要你操作。\n\n> 💡 **一句话总结：ChatGPT 是顾问，Agent 是帮你干活的员工。**\n\n## AI Agent 的三个关键能力\n\n### 1. 感知（Perceive）\nAgent 能接收多种输入：文字、图片、文件、网页、代码……\n\n### 2. 规划（Plan）\n面对复杂目标，Agent 会自动分解成多个步骤，判断先做什么、后做什么。\n\n### 3. 执行（Act）\nAgent 能调用工具：搜索网页、写代码并运行、操控浏览器、读写文件、发送邮件……\n\n## 为什么 2025 年是 Agent 元年？\n\n三个关键突破同时发生：\n\n1. **模型能力飞跃**：Claude 3.5、GPT-4o 等模型的推理能力达到能可靠完成复杂任务的阈值\n2. **工具生态成熟**：MCP 协议标准化了工具接入方式，现已有 500+ MCP Server\n3. **基础设施完善**：Dify、LangChain 等平台降低了 Agent 开发门槛\n\n## 常见 Agent 类型\n\n| 类型 | 代表产品 | 主要能力 |\n|------|---------|----------|\n| 通用自主 | Manus, OpenClaw | 能完成任意开放性任务 |\n| 软件工程 | Devin, Cursor | 写代码、修 Bug、部署 |\n| 研究助手 | Deep Research, Perplexity | 信息收集与分析报告 |\n| 流程自动化 | n8n, Dify | 连接多个系统自动化工作 |',
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
    summary: 'MCP（Model Context Protocol）是 Anthropic 发布的开放协议，让 AI 模型能安全、标准化地连接外部工具和数据。用一个类比：MCP 是 Agent 的 USB 接口。本文带你搞懂 MCP 的原理和价值。',
    content: '# 什么是 MCP？\n\n## MCP 是 Agent 的 USB 接口\n\n在 MCP 出现之前，每当你想让 AI 连接一个新工具（比如 GitHub），开发者需要为每个 AI 平台单独写集成代码。这就像每台设备都需要专属充电线——乱且低效。\n\n**MCP 就是 USB-C**：只要遵循 MCP 协议，任何 AI 模型都能连接任何 MCP Server，任何工具只需实现一次 MCP 接口。\n\n> 💡 **一句话总结：MCP 是 AI 与外部世界通信的标准化插头。**\n\n## MCP 的工作原理\n\n当你对 Claude 说"帮我查一下 GitHub 上的 open issues"：\n\n1. Claude 识别需要使用 GitHub 工具\n2. 通过 MCP 协议调用 GitHub MCP Server\n3. Server 用 GitHub API 查询数据\n4. 返回结构化结果给 Claude\n5. Claude 用自然语言回答你\n\n## 为什么 MCP 很重要？\n\n### 之前：碎片化\n- 每个工具需要单独集成\n- 不同 AI 平台互不兼容\n- 安全性难以保证\n\n### MCP 之后：标准化\n- 一次实现，到处可用\n- 跨平台：Claude、GPT、Gemini 均支持\n- 权限控制：细粒度的工具访问授权\n\n## 目前最受欢迎的 MCP Server\n\n- **filesystem**：读写本地文件（官方）\n- **github**：完整 GitHub 操作（官方）\n- **brave-search**：实时网页搜索（官方）\n- **notion**：Notion 知识库读写\n- **puppeteer**：控制浏览器（官方）',
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
    summary: '很多人搞不清楚 AI Skill、Agent 和 Model 的关系。用一个建房子的类比：Model 是大脑（提供智慧），Skill 是积木（提供能力），Agent 是建造者（负责执行）。',
    content: '# Skill vs Agent vs Model\n\n## 三者的角色\n\n### 🧠 Model（模型）= 大脑\n- 提供语言理解和推理能力\n- 代表：GPT-4o、Claude 3.5、DeepSeek-R1\n- 本身**不能执行动作**，只能思考和生成文字\n\n### 🤖 Agent（智能体）= 建造者\n- 接收目标，规划步骤，调用工具，完成任务\n- 代表：Manus、Devin、OpenClaw、AutoGPT\n- **驱动力**来自 Model，**执行力**来自 Skill\n\n### 🧩 Skill / MCP Server = 积木\n- 提供具体能力：搜索网页、读写文件、操控浏览器\n- 代表：filesystem MCP、github MCP、brave-search MCP\n- 本身没有智能，被 Agent 调用后才发挥作用\n\n## 实际案例\n\n**目标**：帮我分析竞品并生成报告\n\n- Model (Claude) → 理解意图，规划步骤\n- Agent (Manus) → 分解任务：搜索→分析→写作→输出\n- Skills 调用序列：brave-search → fetch → filesystem（保存结果）',
    level: 'beginner',
    category: 'concept',
    tags: ['Skill', 'Agent', 'Model', '概念辨析'],
    estimated_minutes: 5,
    related_tools: ['Manus', 'filesystem', 'brave-search'],
    is_featured: true,
    published_at: '2025-03-15T08:00:00Z'
  },
  {
    slug: 'openclaw-personal-assistant',
    title: '用 OpenClaw 5分钟搭建你的第一个私人 AI 助手',
    subtitle: '从安装到第一次对话的完整教程',
    summary: '本教程手把手带你安装和配置 OpenClaw，搭建完全私有化的 AI 助手。OpenClaw 完全开源，支持自托管，数据不出本地，适合有隐私需求的个人和企业用户。',
    content: '# 用 OpenClaw 搭建私人 AI 助手\n\n## 准备工作\n\n- 系统：macOS / Linux / Windows (WSL2)\n- 需要：Node.js 18+ 或 Docker\n\n## 方法一：Docker 一键启动（推荐）\n\n```bash\ndocker pull openclaw/openclaw:latest\ndocker run -d -p 3000:3000 -v ~/.openclaw:/data --name openclaw openclaw/openclaw:latest\n# 访问 http://localhost:3000\n```\n\n## 方法二：本地安装\n\n```bash\ngit clone https://github.com/openclaw/openclaw\ncd openclaw\nnpm install\ncp .env.example .env\nnpm run dev\n```\n\n## 配置 AI 模型\n\nOpenClaw 支持接入任意兼容 OpenAI API 格式的模型：\n\n```env\nOPENAI_API_KEY=sk-...        # OpenAI\nANTHROPIC_API_KEY=sk-ant-... # Claude\nDEEPSEEK_API_KEY=...         # DeepSeek（推荐，性价比高）\n```\n\n## 添加你的第一个 MCP Tool\n\n在 .openclaw/config.json 中添加 mcpServers 配置，重启后 AI 助手即可读写指定文件夹。\n\n## 第一次对话\n\n试试这些指令：\n- "帮我在桌面创建一个 todo.txt 文件，写入今天的三个任务"\n- "读取我的 Documents/notes.md 并总结要点"\n- "搜索最新的 AI Agent 新闻并整理成摘要"',
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
    summary: 'Dify 是目前最易用的 AI Agent 构建平台，无需编写代码，通过可视化界面就能搭建功能完整的客服 Agent。本教程提供完整步骤和可直接导入的模板。',
    content: '# 用 Dify 构建客服 Agent\n\n## 什么是 Dify？\n\nDify 是一个开源的 LLM 应用开发平台，特点：\n- **零代码**：拖拽操作，无需编程\n- **开源可自托管**：数据完全自控\n- **工作流编排**：支持复杂的多步骤逻辑\n- **RAG 内置**：轻松接入私有知识库\n\n## 第一步：注册/部署 Dify\n\n**云端版（推荐新手）**：访问 dify.ai 注册\n\n**自托管**：\n```bash\ngit clone https://github.com/langgenius/dify\ncd dify/docker\ndocker compose up -d\n```\n\n## 第二步：上传知识库\n\n1. 进入 **知识库** → **创建知识库**\n2. 上传你的产品文档（支持 PDF、Word、Markdown）\n3. 等待向量化完成\n\n## 第三步：创建 Chatbot\n\n1. **创建应用** → 选择 **Chatbot**\n2. 在 **上下文** 中绑定刚创建的知识库\n3. 设置系统提示词，定义回答范围和风格\n\n## 第四步：添加工具增强\n\n在 **工具** 面板添加网络搜索和代码执行节点。\n\n## 发布与集成\n\n点击 **发布** → 获取 API Key，通过官方 embed 脚本嵌入到你的网站。',
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
    summary: '从数百个 MCP Server 中精选 10 个最实用的，涵盖开发、效率、搜索、浏览器自动化等场景，并提供每个 Server 的安装命令和使用示例。',
    content: '# 10个最实用的 MCP Server\n\n大多数 MCP Server 通过配置 Claude Desktop 的 claude_desktop_config.json 来使用。\n\n## 🥇 Top 10\n\n1. **filesystem** — 读写本地文件，最基础也最常用\n2. **github** — PR、Issues、代码搜索、仓库管理一手掌握\n3. **brave-search** — 实时搜索，不再受训练数据截断日期限制\n4. **puppeteer** — 浏览器自动化，自动填表、截图、抓取数据\n5. **notion** — 直接读写 Notion，打造 AI 驱动的个人知识管理系统\n6. **sqlite** — 用自然语言查询和操作 SQLite 数据库\n7. **fetch** — 抓取任意网页并转为 Markdown，AI 直接分析\n8. **slack** — 让 AI 帮你发 Slack 消息、查历史记录、自动通知\n9. **google-drive** — 读写 Google Docs/Sheets，实现文档自动化\n10. **sequential-thinking** — 复杂问题让 AI 一步步思考，显著提升回答质量',
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
    summary: 'Claude Computer Use 让 AI 能直接操控电脑界面，本教程带你了解如何通过 API 启用这项功能，并实现自动填写表格、网页数据抓取等实际场景。',
    content: '# Claude Computer Use 教程\n\n## 什么是 Computer Use？\n\nComputer Use 允许 Claude 通过截图感知屏幕状态，然后通过模拟鼠标点击、键盘输入来操控电脑，就像人类使用电脑一样。\n\n**目前支持的操作**：截取屏幕截图、移动鼠标、点击、键盘输入、滚动页面\n\n## 运行环境设置\n\nAnthropic 提供了一个预配置的 Docker 镜像，通过浏览器访问 http://localhost:6080 查看 AI 操控的桌面。\n\n## 注意事项\n\n- ⚠️ Computer Use 目前处于 Beta 阶段\n- 不要让 AI 操控包含敏感信息的应用\n- 建议在沙盒环境中使用\n- 每次操作都需要截图，API 费用较高',
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
    summary: 'Cursor 是目前最受欢迎的 AI 代码编辑器，配合 MCP 后能力倍增。本文手把手带你配置 5 个最实用的 MCP Server，让 AI 能直接操作 GitHub PR、查询数据库、搜索实时文档，把 Cursor 变成真正的 AI 编程 Agent。',
    content: '# 在 Cursor 中配置 MCP：30 分钟构建超强 AI 编程环境\n\n## 为什么需要 MCP？\n\n默认 Cursor 只能操作当前打开的文件。配置 MCP 后，AI 可以：\n- 直接查询 GitHub Issues 和 PR\n- 读写任意目录的文件\n- 执行 SQL 数据库查询\n- 搜索实时网页和文档信息\n\n## 快速开始\n\n按 Cmd + Shift + J 打开设置，或直接编辑 ~/.cursor/mcp.json，配置 filesystem、github、brave-search、sqlite、fetch 等 MCP Server。\n\n## 验证配置\n\n重启 Cursor 后，在 Chat 中测试："列出我 github.com/你的用户名 仓库的最近 5 个 Issues"\n\n## 进阶配置\n\n- 添加 notion MCP：让 AI 直接更新项目文档\n- 添加 docker MCP：让 AI 管理容器和查看日志\n- 添加 supabase MCP：直接操作生产数据库（谨慎使用！）',
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
    summary: 'Dify 是最流行的开源 LLMOps 平台，内置 RAG 知识库功能。本文从零开始，教你把公司文档、内部 Wiki、产品手册全部导入，搭建一个能准确回答业务问题的企业 AI 助手，并分享提升准确率的关键调优技巧。',
    content: '# 用 Dify 搭建企业知识库问答系统\n\n## 什么是 RAG？\n\nRAG（Retrieval-Augmented Generation）= 检索 + 生成\n\n普通 AI 回答问题只靠训练数据，RAG 会先在你的文档库中搜索相关内容，再结合搜索结果生成答案。\n\n## 1. 安装 Dify\n\n```bash\ngit clone https://github.com/langgenius/dify.git\ncd dify/docker\ncp .env.example .env\ndocker compose up -d\n# 访问 http://localhost/install 完成初始化\n```\n\n## 2. 创建知识库\n\n1. 登录 Dify → 点击 **知识库** → **创建知识库**\n2. 上传文档（支持 PDF、Word、Markdown、网页链接）\n3. 设置分块策略：分块大小 500-1000 字符，重叠长度 100 字符\n4. 选择 Embedding 模型\n\n## 3. 创建 AI 助手应用\n\n绑定知识库，配置系统提示词，设置回答范围和引用规范。\n\n## 4. 关键调优技巧\n\n- 找不到相关内容：降低相似度阈值\n- 答案不完整：增加分块大小或召回数量\n- 同时启用向量搜索和全文搜索，准确率提升 20-30%\n\n## 5. 发布和集成\n\n支持 Web 应用、REST API 集成、飞书/企业微信等多种方式。',
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
    summary: 'LangGraph 是 LangChain 团队推出的 Agent 编排框架，用图（DAG）的方式组织 Agent 逻辑，支持循环、条件分支、状态持久化和人工干预点。相比 ReAct Agent，LangGraph 的行为更可预测、更易调试，是生产级 Agent 开发的首选。',
    content: '# 用 LangGraph 构建多步骤 Agent\n\n## LangGraph vs ReAct Agent\n\n| 维度 | ReAct Agent | LangGraph |\n|------|------------|----------|\n| 控制流 | 模型自主决定 | 开发者定义图结构 |\n| 可调试性 | 难以追踪 | 每步骤状态可见 |\n| 循环支持 | 有限 | 原生支持 |\n| 人工干预 | 不支持 | 内置 Interrupt |\n| 生产可用 | 一般 | 推荐 |\n\n## 核心概念\n\n- State（状态）：Agent 的记忆，贯穿整个执行过程\n- Node（节点）：执行具体工作的函数\n- Edge（边）：节点间的连接，可以是条件跳转\n- Graph（图）：所有节点和边的集合\n\n## 安装\n\n```bash\npip install langgraph langchain-anthropic\n```\n\n## 最佳实践\n\n1. **状态不可变**：每个节点返回新状态，不直接修改\n2. **节点单一职责**：每个节点只做一件事\n3. **条件边用枚举**：返回字符串 key，避免拼写错误\n4. **持久化检查点**：生产环境使用 PostgresSaver 而非 MemorySaver',
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
    summary: '不想把数据发给 OpenAI？本文教你用 Ollama 在本地机器上运行 DeepSeek-R1 等开源模型，完全离线、零 API 费用、数据不出本地。从安装到配置 Cursor/Continue 接入本地模型，全程图文指南。',
    content: '# 本地运行 DeepSeek：零成本私有 AI 部署\n\n## 为什么选择本地部署？\n\n- **隐私安全**：代码、文档永不离开本地\n- **零费用**：一次配置，无限使用\n- **低延迟**：局域网速度，无网络延迟\n- **离线可用**：断网也能正常工作\n\n## 1. 安装 Ollama\n\n```bash\ncurl -fsSL https://ollama.ai/install.sh | sh\nollama --version\n```\n\n## 2. 下载并运行 DeepSeek\n\n```bash\nollama pull deepseek-r1:7b\nollama run deepseek-r1:7b\n```\n\n## 3. 接入 Cursor/VS Code\n\nCursor Settings → Models → 添加自定义模型：Base URL http://localhost:11434/v1，Model deepseek-r1:7b\n\n## 4. OpenAI 兼容 API\n\nOllama 提供 OpenAI 兼容的 API，任何支持 OpenAI API 的工具都可以无缝接入。\n\n## 其他推荐本地模型\n\n- qwen2.5-coder:7b — 代码专项\n- qwen2.5:14b — 中文能力最强\n- llama3.3:70b — 通用推理（需要 32GB+ 内存）',
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
    summary: 'n8n 是目前最强大的开源自动化平台，结合 AI Agent 能力，可以将你的日常重复工作完全自动化。本教程以"每日新闻摘要"和"邮件自动处理"为例，展示如何快速搭建工作流。',
    content: '# n8n + AI Agent 工作流教程\n\n## 为什么选择 n8n？\n\n- **完全开源**：可自托管，数据不外流\n- **400+ 集成**：Gmail、Slack、GitHub、Notion...\n- **可视化编排**：拖拽连接节点，无需写代码\n- **AI 原生**：内置 OpenAI、Claude 等 AI 节点\n\n## 安装 n8n\n\n```bash\ndocker run -it --rm -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n\n# 访问 http://localhost:5678\n```\n\n## 实战 1：每日 AI 新闻摘要邮件\n\n定时触发（每天 8:00）→ HTTP Request 抓取 AI 新闻 RSS → AI Agent（Claude）总结今日要点 → Gmail 发送摘要邮件\n\n## 实战 2：智能邮件处理\n\nGmail Trigger（新邮件到达）→ AI Agent 判断邮件类型和优先级 → Switch 节点分流处理\n\n## 进阶技巧\n\n- 使用 **Code 节点** 处理复杂数据转换\n- 使用 **Sub-workflow** 复用工作流模块\n- 配置 **Error Workflow** 处理失败情况',
    level: 'intermediate',
    category: 'workflow',
    tags: ['n8n', '工作流', '自动化', '邮件处理'],
    estimated_minutes: 25,
    related_tools: ['n8n', 'Claude', 'notion'],
    is_featured: false,
    published_at: '2025-06-01T08:00:00Z'
  }
];

const USECASES_DATA = [
  // ── 营销类 ────────────────────────────────────────────────────────────────
  { title: '自动生成社交媒体内容日历', description: '让 AI Agent 根据品牌定位和热点话题，自动生成一周的社交媒体内容日历，包含文案、发布时间建议和配图描述，大幅降低内容团队工作量。', tools: ['Manus', 'Dify', 'brave-search'], industry: 'marketing', difficulty: 2, estimated_time: '1小时搭建，每周自动运行', steps: ['配置 Dify 工作流，连接 Brave Search 获取行业热点', '设置 AI Agent 提示词，定义品牌语调和内容格式', '让 Agent 生成 7 天内容日历', '输出到 Notion 或 Google Sheets 供团队审核'], tags: ['社交媒体', '内容营销', '自动化', '内容日历'], is_featured: true },
  { title: '竞品监控 + 周报自动生成', description: '设置 Agent 每周自动抓取竞品官网、社交媒体和新闻动态，分析变化并生成结构化竞品周报，帮助团队及时了解市场动向。', tools: ['OpenClaw', 'Perplexity', 'fetch', 'google-drive'], industry: 'marketing', difficulty: 3, estimated_time: '2小时搭建，每周自动运行', steps: ['用 fetch MCP 定期抓取竞品官网内容', 'Perplexity 搜索竞品相关新闻和社交讨论', 'AI 分析变化趋势并提炼关键洞察', '生成格式化周报并上传 Google Drive'], tags: ['竞品分析', '市场监控', '周报', '情报收集'], is_featured: true },
  { title: 'SEO 关键词研究 + 文章批量生成', description: '通过 AI Agent 完成从关键词发现到文章生成的全流程：搜索目标关键词的搜索意图、竞品排名内容、生成 SEO 优化文章大纲和正文。', tools: ['AutoGPT', 'brave-search', 'tavily', 'filesystem'], industry: 'marketing', difficulty: 2, estimated_time: '30分钟/篇', steps: ['输入目标关键词和竞争对手域名', 'Agent 自动分析 SERP 结果和用户意图', '生成 SEO 优化的文章大纲', '逐节生成文章正文并保存到本地'], tags: ['SEO', '关键词研究', '内容生成', '搜索优化'], is_featured: false },
  // ── 编程类 ────────────────────────────────────────────────────────────────
  { title: '自动修复 GitHub Issues', description: '将 Devin 或 SWE-agent 接入 GitHub，让 AI Agent 自动拉取 Issues、分析代码库、生成修复方案并提交 Pull Request，显著提升开发效率。', tools: ['Devin', 'SWE-agent', 'github'], industry: 'engineering', difficulty: 3, estimated_time: '配置1小时，之后全自动', steps: ['安装 SWE-agent 并配置 GitHub Token', '设置触发规则（Label 为 "auto-fix" 的 Issues）', 'Agent 分析 Issue 和相关代码', '生成 PR 并等待人工 Review'], tags: ['GitHub', 'Bug修复', '自动化', 'SWE-agent'], is_featured: true },
  { title: '代码 Review + 测试用例自动生成', description: '在 Cursor 中配置 GitHub MCP，让 AI 在代码提交时自动进行初步 Review，指出潜在问题，并为新增功能自动生成单元测试用例。', tools: ['Cursor', 'github', 'filesystem'], industry: 'engineering', difficulty: 2, estimated_time: '30分钟配置', steps: ['在 Cursor 中安装 GitHub MCP Server', '设置代码 Review 提示词模板', '触发自动 Review 并查看建议', '让 AI 基于函数签名生成测试用例'], tags: ['代码Review', '测试用例', 'Cursor', '代码质量'], is_featured: false },
  { title: '数据库查询自动化（自然语言转 SQL）', description: '通过 SQLite 或 PostgreSQL MCP，让非技术人员也能用自然语言查询数据库。"查询上周新增用户数量" → AI 自动生成并执行 SQL，返回结果。', tools: ['OpenClaw', 'sqlite', 'postgres'], industry: 'engineering', difficulty: 2, estimated_time: '1小时搭建', steps: ['配置数据库 MCP Server 连接到目标库', '设置只读权限保障数据安全', '编写系统提示词，描述数据库表结构', '非技术人员可直接用中文提问'], tags: ['SQL', '数据库', '自然语言', '数据查询'], is_featured: false },
  // ── 研究类 ────────────────────────────────────────────────────────────────
  { title: '行业调研报告自动生成', description: '给 Deep Research 或 Genspark 输入一个研究主题，30分钟内自动搜索数十个来源、提炼关键数据、生成带完整引用的专业调研报告。', tools: ['OpenAI Deep Research', 'Genspark', 'brave-search'], industry: 'research', difficulty: 1, estimated_time: '30分钟', steps: ['访问 Deep Research 或 Genspark', '输入研究主题和报告框架要求', 'AI 自动搜索和整合信息', '下载带引用来源的完整报告'], tags: ['调研报告', 'Deep Research', '信息整合', '一键生成'], is_featured: true },
  { title: '论文摘要批量提取 + 对比分析', description: '将多篇 PDF 论文上传后，让 AI Agent 自动提取摘要、研究方法、主要发现，并生成对比分析表格，帮助研究人员快速掌握领域进展。', tools: ['Perplexity', 'filesystem', 'fetch'], industry: 'research', difficulty: 2, estimated_time: '15分钟/批次', steps: ['将 PDF 上传到指定文件夹', '配置 filesystem MCP 读取文件', '让 AI 提取关键信息并结构化', '生成 Markdown 对比表格'], tags: ['论文分析', '学术研究', 'PDF', '批量处理'], is_featured: false },
  { title: '竞争对手产品分析', description: '让 Agent 系统性地分析竞争对手的产品特性、定价策略、用户评价和市场定位，生成全面的竞品分析报告，支撑产品决策。', tools: ['Manus', 'brave-search', 'fetch'], industry: 'research', difficulty: 2, estimated_time: '1小时', steps: ['列出目标竞品清单', 'Agent 自动访问官网、AppStore评价、社交媒体', '分析产品特性矩阵和差异化优势', '生成结构化竞品分析报告'], tags: ['竞品分析', '产品策略', '市场研究'], is_featured: false },
  // ── 效率/个人类 ───────────────────────────────────────────────────────────
  { title: '邮件自动分类 + 回复草稿', description: '通过 n8n 连接 Gmail，让 AI 自动判断邮件优先级、生成分类标签，并为重要邮件起草回复草稿，每天节省1小时邮件处理时间。', tools: ['OpenClaw', 'n8n', 'google-drive'], industry: 'productivity', difficulty: 2, estimated_time: '2小时搭建', steps: ['在 n8n 创建 Gmail Trigger 工作流', '接入 AI 节点判断邮件类型和优先级', '重要邮件生成回复草稿并标记', '发送 Slack 通知提醒处理高优先级邮件'], tags: ['邮件管理', 'Gmail', '效率工具', 'n8n'], is_featured: true },
  { title: '会议记录自动转任务清单', description: '录制会议音频后，AI 自动转录 → 识别 Action Items → 分配负责人 → 创建 Notion 任务，再也不用手动整理会议纪要。', tools: ['n8n', 'notion', 'filesystem'], industry: 'productivity', difficulty: 2, estimated_time: '1小时搭建', steps: ['会议结束后上传录音文件', 'Whisper API 自动转录为文字', 'AI 提取 Action Items 和负责人', '自动创建 Notion 任务并@相关人员'], tags: ['会议记录', 'Notion', '任务管理', '效率'], is_featured: false },
  { title: '个人知识库问答系统搭建', description: '将你的笔记、文档、书签全部导入，构建个人知识库，然后用自然语言问答方式检索。"上周看的那篇关于向量数据库的文章说了什么？"', tools: ['Dify', 'filesystem', 'notion'], industry: 'productivity', difficulty: 3, estimated_time: '3小时搭建', steps: ['整理并导出 Notion/Obsidian 笔记', '在 Dify 创建知识库并上传文档', '配置 RAG 参数（分块大小、相似度阈值）', '搭建对话界面并测试问答效果'], tags: ['个人知识库', 'RAG', 'Dify', '笔记管理'], is_featured: true },
  // ── 垂直行业类 ───────────────────────────────────────────────────────────
  { title: '法律合同关键条款自动审查', description: '上传合同 PDF，AI 自动识别风险条款、不平等条款、缺失的关键保护性条款，输出标注报告，帮助法务人员提升合同审查效率 3-5 倍。', tools: ['Claude', 'filesystem'], industry: 'industry', difficulty: 3, estimated_time: '15分钟/份合同', steps: ['配置 filesystem MCP 读取 PDF 合同', '编写专业的合同审查提示词', 'Claude 逐条分析关键条款', '输出带风险等级的审查报告'], tags: ['法律', '合同审查', 'PDF', '法务自动化'], is_featured: false },
  { title: '电商选品分析 + 上架文案生成', description: '输入目标品类，AI Agent 自动爬取平台畅销排行、分析竞争格局、评估利润空间，并为选定商品自动生成多版本上架文案和主图描述。', tools: ['OpenClaw', 'brave-search', 'fetch'], industry: 'industry', difficulty: 2, estimated_time: '1小时', steps: ['输入目标品类和目标平台', 'Agent 搜索热销商品和市场数据', '分析竞争格局和价格带', '生成商品标题、卖点、详情页文案'], tags: ['电商', '选品', '商品文案', '竞争分析'], is_featured: false },
  { title: '财务数据可视化报告自动生成', description: '连接 Excel 或数据库，让 AI Agent 自动生成月度财务分析报告：收入趋势、成本结构、利润分析、异常预警，并以可视化图表呈现。', tools: ['DeepSearcher', 'sqlite', 'filesystem'], industry: 'industry', difficulty: 3, estimated_time: '2小时搭建', steps: ['配置数据库 MCP 连接财务系统', '定义报告模板和分析维度', 'AI 自动生成 SQL 查询并分析数据', '输出包含图表和洞察的 Markdown 报告'], tags: ['财务分析', '数据可视化', '自动报告', '商业智能'], is_featured: false },
  // ── 新增：研究类 ───────────────────────────────────────────────────────────
  { title: '投资尽调报告自动化', description: '输入目标公司名称，AI Agent 自动搜索公司背景、融资历史、创始团队、竞争格局和行业地位，30分钟生成专业投资尽调报告，替代初级分析师 2-3 天的工作量。', tools: ['Genspark', 'Perplexity', 'brave-search', 'filesystem'], industry: 'research', difficulty: 2, estimated_time: '30分钟', steps: ['输入目标公司名称和调研侧重点', 'Agent 自动搜索公司官网、Crunchbase、领英', '分析融资轮次、估值趋势和投资方', '整合团队背景和竞争格局分析', '生成结构化尽调报告并导出'], tags: ['投资尽调', '公司分析', '融资研究', '自动化'], is_featured: true },
  { title: '专利文献批量分析', description: '批量下载和分析竞争对手的专利文献，AI 提取技术方案要点、保护范围和申请趋势，帮助研发团队快速了解技术格局并规避专利风险。', tools: ['Claude', 'filesystem', 'fetch', 'brave-search'], industry: 'research', difficulty: 3, estimated_time: '2-3小时/批次', steps: ['确定目标专利范围和关键词', '通过 fetch MCP 下载 USPTO/EPO 专利文档', 'Claude 分析专利权利要求书和技术方案', '生成专利地图和风险评估报告'], tags: ['专利分析', '知识产权', 'R&D', '技术竞争'], is_featured: false },
  // ── 新增：编程类 ───────────────────────────────────────────────────────────
  { title: 'API 文档自动生成', description: '将代码库接入 AI Agent，让其自动分析函数签名、注释和使用样例，生成标准化的 API 文档（OpenAPI/Swagger 格式），彻底告别手写文档。', tools: ['Cursor', 'filesystem', 'github'], industry: 'engineering', difficulty: 2, estimated_time: '1-2小时/项目', steps: ['配置 filesystem MCP 让 AI 读取代码库', '让 AI 分析 Controller/Route 层代码', '自动识别接口参数和返回值结构', '生成 OpenAPI 3.0 规范 JSON 文件', '一键生成 Swagger UI 展示文档'], tags: ['API文档', 'OpenAPI', 'Swagger', '自动化文档'], is_featured: false },
  { title: '微服务监控告警 Agent', description: '将 Agent 接入 Sentry + Kubernetes，让其实时监控服务健康状态：当检测到错误激增或 Pod 异常时，自动分析根因、定位问题代码并发送 Slack 告警，带出初步处理建议。', tools: ['OpenHands', 'sentry', 'kubernetes', 'slack'], industry: 'engineering', difficulty: 3, estimated_time: '2小时配置', steps: ['安装并配置 Sentry MCP 和 K8s MCP', '设置监控阈值和触发条件', 'Agent 接收告警后自动分析堆栈跟踪', '关联 GitHub 代码变更找到引入原因', '通过 Slack MCP 发送分析报告'], tags: ['监控告警', 'Kubernetes', 'Sentry', 'DevOps'], is_featured: true },
  // ── 新增：效率类 ───────────────────────────────────────────────────────────
  { title: '简历筛选 + 初面问题生成', description: 'HR 上传大量简历 PDF 后，AI Agent 自动按岗位要求评分筛选，提取候选人亮点，并为每位候选人生成针对性的初面问题清单，大幅提升招聘效率。', tools: ['Claude', 'filesystem', 'notion'], industry: 'productivity', difficulty: 2, estimated_time: '1小时搭建', steps: ['将简历 PDF 存入指定文件夹', '让 AI 提取教育、经验、技能信息', '按岗位 JD 自动评分和排序', '为 Top 候选人生成个性化面试问题', '导入 Notion 数据库供团队协作'], tags: ['HR', '简历筛选', '招聘', '效率提升'], is_featured: false },
  { title: '多语言内容本地化', description: '将营销材料、产品文档或网站内容自动翻译为多语言版本，AI 不只是机翻，还会根据目标市场的文化习惯和语言风格进行本地化适配，比人工翻译快 10 倍。', tools: ['Claude', 'DeepSeek-V3', 'filesystem', 'google-drive'], industry: 'productivity', difficulty: 1, estimated_time: '30分钟/千字', steps: ['上传原始内容到 Google Drive', '配置目标语言和本地化风格指南', 'AI 进行语义翻译（非逐字翻译）', '针对各市场文化习惯进行适配', '输出多语言版本对照文件'], tags: ['多语言', '本地化', '翻译', '国际化'], is_featured: false },
  // ── 新增：垂直行业 ─────────────────────────────────────────────────────────
  { title: '医疗文献综述自动生成', description: '临床研究人员输入研究问题，AI 自动检索 PubMed/arXiv，筛选高质量文献，提取研究方法和结论，生成符合 PRISMA 规范的系统综述框架，大幅加速科研初期工作。', tools: ['Perplexity', 'arxiv', 'fetch', 'filesystem'], industry: 'industry', difficulty: 3, estimated_time: '2-4小时', steps: ['输入 PICO 格式的研究问题', 'AI 搜索 PubMed 和 arXiv 相关论文', '按纳入/排除标准筛选文献', '提取各研究的方法和主要发现', '生成结构化综述框架和参考文献'], tags: ['医疗', '文献综述', 'PubMed', '循证医学'], is_featured: false },
  { title: '财务报告异常检测', description: '将公司财务数据接入 AI Agent，自动对比历史趋势和行业标准，识别异常指标（如应收账款暴增、毛利率骤降），并生成风险预警报告，辅助财务分析师决策。', tools: ['Claude', 'postgres', 'google-drive', 'filesystem'], industry: 'industry', difficulty: 3, estimated_time: '2小时搭建', steps: ['连接 PostgreSQL 数据库存储财务数据', '配置历史对比和行业基准阈值', 'AI 自动计算关键财务比率', '识别偏离正常范围的异常指标', '生成带优先级的风险预警报告'], tags: ['财务分析', '异常检测', '风险预警', '审计'], is_featured: true }
];

const SEO_DATA = [{
  site_name: 'AI Skill Navigation',
  site_description: 'aiskillnav.com — 一站式 AI Agent 资源导航，收录 Skills、Agents、MCP Server、模型对比、实战教程与场景库',
  site_keywords: ['AI Agent', 'AI Skill', 'MCP Server', 'Model Context Protocol', 'AI 工具导航', 'AI 导航', 'LLM', '大模型', '智能体', 'OpenAI', 'Claude', 'DeepSeek', 'Gemini', 'Manus', 'Devin', 'AutoGPT', 'Dify', 'AI Agent 教程', 'AI Agent 场景'],
  og_image: 'https://aiskillnav.com/og-image.png',
  twitter_handle: '@aiskillnav',
  pages: {
    '/': { title: 'AI Skill Navigation — AI Agent 工具导航首页', description: '发现最好的 AI Agent 工具，汇聚 Skills、Agents、MCP Server、模型对比、教程与场景库', keywords: ['AI Agent 导航首页', 'AI 工具大全', 'AI Skill 导航'] },
    '/dashboard/news': { title: 'AI Agent News — 行业动态', description: 'AI Agent 赛道最新动态：Manus 被收购、DeepSeek 开源、MCP 协议发布等重大事件', keywords: ['AI Agent 新闻', 'AI 行业动态', 'Manus', 'DeepSeek'] },
    '/dashboard/skills': { title: 'AI Skills 导航 — 精选资源站', description: '收录全球优质 AI Skill 资源网站，包括官方平台、社区聚合站、GitHub 仓库等', keywords: ['AI Skill', 'ClaWHub', 'OpenClaw', 'AI Skills 平台'] },
    '/dashboard/agents': { title: 'AI Agent Hub — 智能体工具导航', description: '汇聚 Manus、Devin、OpenClaw、Dify 等顶级 AI Agent 工具，支持类型筛选', keywords: ['AI Agent', 'Manus', 'Devin', 'AutoGPT', 'Dify', '智能体工具'] },
    '/dashboard/mcp': { title: 'MCP Server 导航 — Model Context Protocol', description: '20+ 精选 MCP Server，让 AI 连接文件系统、数据库、GitHub、Notion 等工具', keywords: ['MCP Server', 'Model Context Protocol', 'Claude MCP', 'AI 工具连接'] },
    '/dashboard/models': { title: 'AI 模型对比 — GPT-4o vs Claude vs DeepSeek', description: '主流 AI 模型横向对比：能力评分、价格、上下文窗口与 Benchmark 排名', keywords: ['AI 模型对比', 'GPT-4o', 'Claude 3.5', 'DeepSeek', 'Gemini', 'LLM 对比'] },
    '/dashboard/tutorials': { title: 'AI Agent 教程中心 — 从入门到实战', description: '系统学习 AI Agent：概念理解、MCP 使用、Dify 零代码搭建、n8n 工作流自动化', keywords: ['AI Agent 教程', 'MCP 教程', 'Dify 教程', 'n8n AI', 'AI 入门'] },
    '/dashboard/usecases': { title: 'AI Agent 场景库 — 真实落地案例', description: '15 个 AI Agent 真实场景：营销自动化、Bug 修复、调研报告、知识库搭建', keywords: ['AI Agent 应用场景', 'AI 自动化', 'AI 营销', 'AI 编程', 'AI 效率工具'] }
  },
  updated_at: now
}];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function checkTable(table) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?limit=1`, {
    headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` }
  });
  return res.status !== 404 && res.status !== 400;
}

async function main() {
  console.log('🚀 AI Skill Navigation — Supabase Setup');
  console.log(`   Project: ${PROJECT_REF}\n`);

  // Step 1: Check tables
  console.log('📋 Checking tables...');
  const tables = ['skills', 'agents', 'news', 'mcp_servers', 'ai_models', 'benchmarks', 'tutorials', 'use_cases', 'seo_config'];
  const existing = {};
  for (const t of tables) {
    existing[t] = await checkTable(t);
    console.log(`  ${existing[t] ? '✅' : '❌'} ${t}`);
  }

  const missing = tables.filter(t => !existing[t]);

  // Step 2: Create missing tables via Management API
  if (missing.length > 0) {
    console.log(`\n🔧 Creating ${missing.length} missing tables...`);
    if (!ACCESS_TOKEN) {
      console.log('\n⚠️  To create tables automatically, provide your Supabase Access Token:');
      console.log('   1. Go to: https://supabase.com/dashboard/account/tokens');
      console.log('   2. Create a new token');
      console.log('   3. Run: node scripts/supabase-setup.mjs YOUR_TOKEN_HERE\n');
      console.log('   OR manually run scripts/supabase-schema.sql in the SQL Editor:');
      console.log('   https://supabase.com/dashboard/project/tixgzezefjjsyuzgdhcd/sql/new\n');
      process.exit(0);
    }
    try {
      await execSQL(SCHEMA_SQL);
      console.log('  ✅ All tables created');
    } catch (err) {
      console.error('  ❌ Failed:', err.message);
      process.exit(1);
    }
  } else {
    console.log('  ✅ All tables exist');
  }

  // Step 3: Seed data
  console.log('\n📤 Seeding data...');
  await upsert('skills', SKILLS_DATA);
  await upsert('agents', AGENTS_DATA);
  await upsert('news', NEWS_DATA);
  await upsert('mcp_servers', MCP_DATA);
  await upsert('ai_models', MODELS_DATA);
  await upsert('benchmarks', BENCHMARKS_DATA);
  await upsert('tutorials', TUTORIALS_DATA);
  await upsert('use_cases', USECASES_DATA);
  await upsert('seo_config', SEO_DATA);

  console.log('\n🎉 Done! Your Supabase database is ready.');
}

main().catch(err => {
  console.error('❌ Fatal error:', err.message);
  process.exit(1);
});
