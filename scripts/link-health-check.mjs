/**
 * Link Health Check Script
 *
 * 从 Supabase 抓取所有带 URL 的条目，用 HEAD/GET 请求逐一检测，
 * 将失效链接（4xx/5xx/超时/连接失败）通过 API 写回数据库。
 *
 * 运行方式：
 *   node scripts/link-health-check.mjs
 *
 * 环境变量：
 *   NEXT_PUBLIC_SUPABASE_URL      Supabase 项目 URL
 *   SUPABASE_SERVICE_ROLE_KEY     Supabase service_role key（绕过 RLS）
 *   LINK_CHECK_API_SECRET         与 /api/link-health 共享的密钥
 *   SITE_URL                      站点根地址（默认 http://localhost:3000）
 *   DRY_RUN                       true = 只报告不写库
 *   TABLES                        逗号分隔，指定只检测某些表（留空=全部）
 */

import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'node:fs';

// ── 配置 ──────────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const API_SECRET = process.env.LINK_CHECK_API_SECRET ?? '';
const SITE_URL = (process.env.SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const DRY_RUN = process.env.DRY_RUN === 'true';
const TABLES_FILTER = process.env.TABLES ? process.env.TABLES.split(',').map((t) => t.trim()) : [];

// 并发数（太高会被目标站点限流）
const CONCURRENCY = 8;
// 超时时间（ms）
const TIMEOUT_MS = 12_000;

// 这些状态码视为"正常"——含 403/429，因为很多站反爬但链接真实存在
const OK_STATUSES = new Set([200, 201, 301, 302, 303, 307, 308, 403, 429, 503]);

// 真正"失效"的状态码：域名不存在、页面不存在
const DEAD_STATUSES = new Set([404, 410, 451]);

// 跳过检测的 URL
const SKIP_PATTERNS = [/^#$/, /^https?:\/\/localhost/, /^https?:\/\/127\./];

// 需要检测的表
const TABLE_CONFIGS = [
  { table: 'agents',      urlCol: 'url', nameCol: 'name', hasStatus: true },
  { table: 'skills',      urlCol: 'url', nameCol: 'name', hasStatus: true },
  { table: 'mcp_servers', urlCol: 'url', nameCol: 'name', hasStatus: false },
  { table: 'ai_models',   urlCol: 'url', nameCol: 'name', hasStatus: false }
];

// ── 检测函数 ──────────────────────────────────────────────────────────────────

/**
 * 检测单个 URL 是否可访问
 * 策略：先 HEAD，若失败或 405 再 GET（只取响应头）
 */
async function checkUrl(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const headers = {
    'User-Agent':
      'Mozilla/5.0 (compatible; LinkHealthBot/1.0; +https://aiskillnav.com)',
    Accept: 'text/html,application/xhtml+xml,*/*',
    'Accept-Language': 'en-US,en;q=0.9'
  };

  try {
    let res = await fetch(url, {
      method: 'HEAD',
      headers,
      redirect: 'follow',
      signal: controller.signal
    });

    // 有些服务器不支持 HEAD，返回 405，改用 GET
    if (res.status === 405 || res.status === 501) {
      res = await fetch(url, {
        method: 'GET',
        headers,
        redirect: 'follow',
        signal: controller.signal
      });
    }

    clearTimeout(timer);
    const status = res.status;

    if (OK_STATUSES.has(status)) {
      return { ok: true, status, error: null };
    }
    if (DEAD_STATUSES.has(status)) {
      return { ok: false, status, error: null };
    }
    // 其他状态码（5xx 等）：保守处理，不标死链
    return { ok: true, status, error: `non-critical: ${status}` };
  } catch (err) {
    clearTimeout(timer);
    const msg = String(err?.message ?? err);
    // 连接被拒绝、DNS 解析失败 → 真正失效
    if (
      msg.includes('ENOTFOUND') ||
      msg.includes('ECONNREFUSED') ||
      msg.includes('ERR_NAME_NOT_RESOLVED')
    ) {
      return { ok: false, status: null, error: msg };
    }
    // 超时、SSL 错误等 → 保守处理，不标死链
    return { ok: true, status: null, error: `skip: ${msg.slice(0, 80)}` };
  }
}

// ── 并发控制 ──────────────────────────────────────────────────────────────────

async function batchProcess(items, fn, concurrency) {
  const results = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(fn));
    results.push(...batchResults);
    process.stdout.write(
      `  进度: ${Math.min(i + concurrency, items.length)}/${items.length}\r`
    );
  }
  process.stdout.write('\n');
  return results;
}

// ── 写库 ──────────────────────────────────────────────────────────────────────

/**
 * 直接写 Supabase（本地运行时用 service_role key，无需经过 API）
 */
async function pushResults(updates, supabase) {
  if (DRY_RUN) {
    console.log(`  [DRY_RUN] 跳过写库，共 ${updates.length} 条`);
    return;
  }

  const ALLOWED_TABLES = new Set(['agents', 'skills', 'mcp_servers', 'ai_models']);
  let updated = 0;
  const errors = [];

  for (const item of updates) {
    if (!ALLOWED_TABLES.has(item.table)) continue;

    const patch = {
      link_status: item.linkStatus,
      last_checked_at: item.lastCheckedAt
    };
    // agents / skills 失效链接自动标为 offline
    if ((item.table === 'agents' || item.table === 'skills') && item.linkStatus === 'dead') {
      patch.status = 'offline';
    }

    const { error } = await supabase.from(item.table).update(patch).eq('id', item.id);
    if (error) {
      errors.push(`${item.table}#${item.id}: ${error.message}`);
    } else {
      updated++;
    }
  }

  if (errors.length > 0) console.error('  ⚠️  部分写库错误:', errors);
  console.log(`  ✅ 写库成功: ${updated} 条`);
}

// ── 主流程 ────────────────────────────────────────────────────────────────────

async function main() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('❌ 缺少环境变量: NEXT_PUBLIC_SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  const report = {
    checkedAt: new Date().toISOString(),
    dryRun: DRY_RUN,
    summary: { total: 0, ok: 0, dead: 0 },
    dead: [],
    details: []
  };

  const configs = TABLES_FILTER.length
    ? TABLE_CONFIGS.filter((c) => TABLES_FILTER.includes(c.table))
    : TABLE_CONFIGS;

  for (const cfg of configs) {
    console.log(`\n🔍 检测表: ${cfg.table}`);

    let query = supabase.from(cfg.table).select(`id, ${cfg.urlCol}, ${cfg.nameCol}`);
    if (cfg.hasStatus) query = query.neq('status', 'rejected');

    const { data, error } = await query;
    if (error) {
      console.error(`  ❌ 读取 ${cfg.table} 失败: ${error.message}`);
      continue;
    }

    const rows = (data ?? []).filter(
      (r) => r[cfg.urlCol] && !SKIP_PATTERNS.some((p) => p.test(r[cfg.urlCol]))
    );
    console.log(`  共 ${rows.length} 条有效 URL`);

    const results = await batchProcess(
      rows,
      async (row) => {
        const url = row[cfg.urlCol];
        const result = await checkUrl(url);
        return { id: row.id, name: row[cfg.nameCol], url, table: cfg.table, ...result };
      },
      CONCURRENCY
    );

    const updates = [];
    for (const r of results) {
      report.summary.total++;
      if (r.ok) {
        report.summary.ok++;
      } else {
        report.summary.dead++;
        report.dead.push({ table: r.table, id: r.id, name: r.name, url: r.url, status: r.status, error: r.error });
        console.log(`  ❌ [${r.status ?? r.error ?? 'ERR'}] ${r.name}: ${r.url}`);
      }
      report.details.push({ ...r });
      updates.push({
        table: cfg.table,
        id: r.id,
        linkStatus: r.ok ? 'ok' : 'dead',
        lastCheckedAt: new Date().toISOString()
      });
    }

    if (updates.length > 0) await pushResults(updates, supabase);
  }

  writeFileSync('/tmp/link-health-report.json', JSON.stringify(report, null, 2));

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 检测完成  ${new Date().toLocaleString('zh-CN')}`);
  console.log(`   总计: ${report.summary.total}  ✅ 正常: ${report.summary.ok}  ❌ 失效: ${report.summary.dead}`);
  if (DRY_RUN) console.log('   ⚠️  DRY_RUN 模式：未写库');

  if (report.summary.dead > 0) {
    console.log('\n真正失效链接（DNS 解析失败 / 404 / 410）:');
    report.dead.forEach((d) =>
      console.log(`  [${d.table}] ${d.name} → ${d.url}  (${d.status ?? d.error})`)
    );
  }
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
