/**
 * Link Health Check Script
 *
 * 从 Supabase 抓取所有带 URL 的条目，用 linkinator 逐一检测，
 * 将失效链接（4xx/5xx/超时）通过 API 写回数据库（打 link_status 标记）。
 *
 * 运行方式：
 *   node scripts/link-health-check.mjs
 *
 * 环境变量：
 *   NEXT_PUBLIC_SUPABASE_URL      Supabase 项目 URL
 *   SUPABASE_SERVICE_ROLE_KEY     Supabase service_role key（绕过 RLS）
 *   LINK_CHECK_API_SECRET         与 /api/link-health 共享的密钥（防止未授权调用）
 *   SITE_URL                      站点根地址，用于回调 API（默认 http://localhost:3000）
 *   DRY_RUN                       true = 只报告不写库
 *   TABLES                        逗号分隔，指定只检测某些表（留空=全部）
 */

import { createClient } from '@supabase/supabase-js';
import { LinkChecker } from 'linkinator';
import { writeFileSync } from 'node:fs';

// ── 配置 ──────────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const API_SECRET = process.env.LINK_CHECK_API_SECRET ?? '';
const SITE_URL = (process.env.SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const DRY_RUN = process.env.DRY_RUN === 'true';
const TABLES_FILTER = process.env.TABLES ? process.env.TABLES.split(',').map((t) => t.trim()) : [];

// 并发请求数（避免触发目标站点限流）
const CONCURRENCY = 5;
// 单次请求超时（ms）
const TIMEOUT_MS = 15_000;
// HTTP 状态码在此列表内视为"正常"
const OK_STATUSES = new Set([200, 201, 301, 302, 303, 307, 308]);
// 跳过检测的 URL（占位符 / 内部链接）
const SKIP_PATTERNS = [/^#$/, /^https?:\/\/localhost/, /^https?:\/\/127\.0\.0\.1/];

// 需要检测的表及其配置
const TABLE_CONFIGS = [
  { table: 'agents', urlCol: 'url', nameCol: 'name', statusCol: 'status', hasStatus: true },
  { table: 'skills', urlCol: 'url', nameCol: 'name', statusCol: 'status', hasStatus: true },
  { table: 'mcp_servers', urlCol: 'url', nameCol: 'name', statusCol: null, hasStatus: false },
  { table: 'ai_models', urlCol: 'url', nameCol: 'name', statusCol: null, hasStatus: false }
];

// ── 工具函数 ──────────────────────────────────────────────────────────────────

function shouldSkip(url) {
  if (!url || url === '#') return true;
  return SKIP_PATTERNS.some((p) => p.test(url));
}

/**
 * 用 linkinator 检测单个 URL
 * @returns {{ ok: boolean, status: number | null, error: string | null }}
 */
async function checkUrl(url) {
  const checker = new LinkChecker();
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      resolve({ ok: false, status: null, error: 'timeout' });
    }, TIMEOUT_MS);

    checker.check({ path: url, recurse: false, timeout: TIMEOUT_MS }).then((result) => {
      clearTimeout(timer);
      const link = result.links.find((l) => l.url === url) ?? result.links[0];
      if (!link) {
        resolve({ ok: false, status: null, error: 'no_result' });
        return;
      }
      const ok = OK_STATUSES.has(link.status) || link.status === 0; // 0 = redirect followed ok
      resolve({ ok: link.state === 'OK', status: link.status, error: link.failureDetails?.[0]?.message ?? null });
    }).catch((err) => {
      clearTimeout(timer);
      resolve({ ok: false, status: null, error: String(err.message ?? err) });
    });
  });
}

/**
 * 并发控制：分批处理数组
 */
async function batchProcess(items, fn, concurrency) {
  const results = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(fn));
    results.push(...batchResults);
    process.stdout.write(`  进度: ${Math.min(i + concurrency, items.length)}/${items.length}\r`);
  }
  console.log('');
  return results;
}

/**
 * 调用 /api/link-health 批量写回结果
 */
async function pushResults(updates) {
  if (DRY_RUN) {
    console.log(`[DRY_RUN] 跳过写库，共 ${updates.length} 条更新`);
    return;
  }
  const res = await fetch(`${SITE_URL}/api/link-health`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Link-Health-Secret': API_SECRET
    },
    body: JSON.stringify({ updates })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API 写库失败 ${res.status}: ${text}`);
  }
  const data = await res.json();
  console.log(`  ✅ 写库成功: ${data.updated} 条`);
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
    summary: { total: 0, ok: 0, dead: 0, skipped: 0 },
    dead: [],
    details: []
  };

  const configs = TABLES_FILTER.length
    ? TABLE_CONFIGS.filter((c) => TABLES_FILTER.includes(c.table))
    : TABLE_CONFIGS;

  for (const cfg of configs) {
    console.log(`\n🔍 检测表: ${cfg.table}`);

    // 读取所有已发布条目的 id + url + name
    let query = supabase.from(cfg.table).select(`id, ${cfg.urlCol}, ${cfg.nameCol}`);
    if (cfg.hasStatus) {
      query = query.neq('status', 'rejected'); // 已拒绝的不用检测
    }
    const { data, error } = await query;
    if (error) {
      console.error(`  ❌ 读取 ${cfg.table} 失败: ${error.message}`);
      continue;
    }

    const rows = (data ?? []).filter((r) => !shouldSkip(r[cfg.urlCol]));
    console.log(`  共 ${rows.length} 条有效 URL`);

    // 并发检测
    const results = await batchProcess(
      rows,
      async (row) => {
        const url = row[cfg.urlCol];
        const result = await checkUrl(url);
        return { id: row.id, name: row[cfg.nameCol], url, table: cfg.table, ...result };
      },
      CONCURRENCY
    );

    // 汇总
    const updates = [];
    for (const r of results) {
      report.summary.total++;
      const linkStatus = r.ok ? 'ok' : 'dead';
      if (r.ok) {
        report.summary.ok++;
      } else {
        report.summary.dead++;
        report.dead.push({ table: r.table, id: r.id, name: r.name, url: r.url, status: r.status, error: r.error });
        console.log(`  ❌ [${r.status ?? 'ERR'}] ${r.name}: ${r.url}`);
      }
      report.details.push({ ...r, linkStatus });
      updates.push({ table: cfg.table, id: r.id, linkStatus, lastCheckedAt: new Date().toISOString() });
    }

    // 批量写回
    if (updates.length > 0) {
      await pushResults(updates);
    }
  }

  // 写报告文件
  writeFileSync('/tmp/link-health-report.json', JSON.stringify(report, null, 2));

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 检测完成`);
  console.log(`   总计: ${report.summary.total}`);
  console.log(`   ✅ 正常: ${report.summary.ok}`);
  console.log(`   ❌ 失效: ${report.summary.dead}`);
  if (DRY_RUN) console.log('   ⚠️  DRY_RUN 模式：未写库');

  // 有失效链接时以非零退出码退出（让 CI 标红）
  if (report.summary.dead > 0) {
    console.log('\n失效链接列表:');
    report.dead.forEach((d) => {
      console.log(`  [${d.table}] ${d.name} → ${d.url} (${d.status ?? d.error})`);
    });
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
