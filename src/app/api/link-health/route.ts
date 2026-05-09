/**
 * POST /api/link-health
 *
 * 接收 link-health-check.mjs 脚本的批量检测结果，
 * 将 link_status 和 last_checked_at 写入对应的数据库表。
 *
 * 请求体：
 * {
 *   updates: Array<{
 *     table: 'agents' | 'skills' | 'mcp_servers' | 'ai_models'
 *     id: number
 *     linkStatus: 'ok' | 'dead'
 *     lastCheckedAt: string  // ISO 8601
 *   }>
 * }
 *
 * 安全：通过 X-Link-Health-Secret 头验证请求来源（与 LINK_CHECK_API_SECRET 对比）
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

// 允许写入的表白名单（防止任意表注入）
const ALLOWED_TABLES = new Set(['agents', 'skills', 'mcp_servers', 'ai_models']);

type UpdateItem = {
  table: string;
  id: number;
  linkStatus: 'ok' | 'dead';
  lastCheckedAt: string;
};

export async function POST(request: NextRequest) {
  // ── 鉴权 ────────────────────────────────────────────────────────────────────
  const secret = process.env.LINK_CHECK_API_SECRET ?? '';
  const incoming = request.headers.get('X-Link-Health-Secret') ?? '';

  if (!secret || incoming !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // ── 解析请求体 ───────────────────────────────────────────────────────────────
  let body: { updates?: UpdateItem[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const updates = body.updates;
  if (!Array.isArray(updates) || updates.length === 0) {
    return NextResponse.json({ error: 'updates must be a non-empty array' }, { status: 400 });
  }

  // ── 按表分组，批量更新 ───────────────────────────────────────────────────────
  const supabase = getSupabaseAdmin();
  let totalUpdated = 0;
  const errors: string[] = [];

  // 按 table 分组
  const byTable = updates.reduce<Record<string, UpdateItem[]>>((acc, item) => {
    if (!ALLOWED_TABLES.has(item.table)) return acc; // 跳过非白名单表
    (acc[item.table] ??= []).push(item);
    return acc;
  }, {});

  for (const [table, items] of Object.entries(byTable)) {
    // 将 dead 链接的 items 单独处理：可选择自动把 status 改为 'offline'
    for (const item of items) {
      const patch: Record<string, unknown> = {
        link_status: item.linkStatus,
        last_checked_at: item.lastCheckedAt
      };

      // 对有 status 字段的表：dead 链接自动标为 'offline'（不直接删除）
      if ((table === 'agents' || table === 'skills') && item.linkStatus === 'dead') {
        patch.status = 'offline';
      }

      const { error } = await supabase.from(table).update(patch).eq('id', item.id);

      if (error) {
        errors.push(`${table}#${item.id}: ${error.message}`);
      } else {
        totalUpdated++;
      }
    }
  }

  if (errors.length > 0) {
    console.error('[link-health] partial errors:', errors);
  }

  return NextResponse.json({
    updated: totalUpdated,
    errors: errors.length > 0 ? errors : undefined
  });
}

/**
 * GET /api/link-health — 返回当前失效链接汇总（供管理后台展示）
 */
export async function GET(request: NextRequest) {
  const secret = process.env.LINK_CHECK_API_SECRET ?? '';
  const incoming = request.headers.get('X-Link-Health-Secret') ?? '';
  if (!secret || incoming !== secret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const results: Record<string, unknown[]> = {};

  for (const table of ALLOWED_TABLES) {
    const { data } = await supabase
      .from(table)
      .select('id, name, url, link_status, last_checked_at')
      .eq('link_status', 'dead');
    results[table] = data ?? [];
  }

  return NextResponse.json(results);
}
