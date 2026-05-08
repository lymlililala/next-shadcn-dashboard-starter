-- ============================================================
-- AI Skill Navigation — Supabase Database Schema
-- 在 Supabase Dashboard > SQL Editor 中执行此文件
-- ============================================================

-- ── SKILLS ──────────────────────────────────────────────────
create table if not exists skills (
  id           bigserial primary key,
  name         text not null,
  description  text,
  url          text not null,
  platform     text not null default 'aggregator',
  region       text not null default 'global',
  tags         text[] default '{}',
  is_featured  boolean default false,
  status       text not null default 'published',
  review_note  text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- ── AGENTS ──────────────────────────────────────────────────
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

-- ── NEWS ────────────────────────────────────────────────────
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

-- ── MCP_SERVERS ─────────────────────────────────────────────
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

-- ── AI_MODELS ───────────────────────────────────────────────
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

-- ── BENCHMARKS ──────────────────────────────────────────────
create table if not exists benchmarks (
  id             bigserial primary key,
  name           text not null,
  description    text,
  url            text,
  category       text not null default 'agent',
  current_leader text,
  leader_score   text
);

-- ── TUTORIALS ───────────────────────────────────────────────
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

-- ── USE_CASES ───────────────────────────────────────────────
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

-- ── SEO_CONFIG ──────────────────────────────────────────────
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

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table skills       enable row level security;
alter table agents       enable row level security;
alter table news         enable row level security;
alter table mcp_servers  enable row level security;
alter table ai_models    enable row level security;
alter table benchmarks   enable row level security;
alter table tutorials    enable row level security;
alter table use_cases    enable row level security;
alter table seo_config   enable row level security;

-- 公开读取（已发布内容）
create policy "public_read_skills"     on skills       for select using (status = 'published');
create policy "public_read_agents"     on agents       for select using (status = 'published');
create policy "public_read_news"       on news         for select using (status = 'published');
create policy "public_read_mcp"        on mcp_servers  for select using (true);
create policy "public_read_models"     on ai_models    for select using (true);
create policy "public_read_benchmarks" on benchmarks   for select using (true);
create policy "public_read_tutorials"  on tutorials    for select using (true);
create policy "public_read_usecases"   on use_cases    for select using (true);
create policy "public_read_seo"        on seo_config   for select using (true);

-- 服务角色完全访问（后台管理用）
create policy "service_all_skills"     on skills       for all using (auth.role() = 'service_role');
create policy "service_all_agents"     on agents       for all using (auth.role() = 'service_role');
create policy "service_all_news"       on news         for all using (auth.role() = 'service_role');
create policy "service_all_mcp"        on mcp_servers  for all using (auth.role() = 'service_role');
create policy "service_all_models"     on ai_models    for all using (auth.role() = 'service_role');
create policy "service_all_benchmarks" on benchmarks   for all using (auth.role() = 'service_role');
create policy "service_all_tutorials"  on tutorials    for all using (auth.role() = 'service_role');
create policy "service_all_usecases"   on use_cases    for all using (auth.role() = 'service_role');
create policy "service_all_seo"        on seo_config   for all using (auth.role() = 'service_role');

-- ============================================================
-- PATCH: 修复旧 skills 表（如果 platform/region 列不存在）
-- 如果 skills 表是旧版本，执行此段补全缺失列
-- ============================================================
alter table skills add column if not exists platform     text not null default 'aggregator';
alter table skills add column if not exists region       text not null default 'global';
alter table skills add column if not exists review_note  text;
-- 删除旧版不需要的 category/stars 列（可选，不影响功能）
-- alter table skills drop column if exists category;
-- alter table skills drop column if exists stars;
