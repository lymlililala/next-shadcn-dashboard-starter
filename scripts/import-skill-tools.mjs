#!/usr/bin/env node
/**
 * 将 wenzhang/skill_full.json 导入到 Supabase skill_tools 表
 * 用法: node scripts/import-skill-tools.mjs
 *
 * 需要环境变量:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

import { readFileSync } from 'fs';
import { createClient } from '@supabase/supabase-js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ 缺少环境变量 NEXT_PUBLIC_SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 读取 JSON 文件
const jsonPath = join(__dirname, '../wenzhang/skill_full.json');
const raw = JSON.parse(readFileSync(jsonPath, 'utf-8'));
const items = raw.items ?? [];

console.log(`📦 读取到 ${items.length} 条记录`);

// 转换为 skill_tools 表格式
const rows = items.map((item) => ({
  name: item.name?.trim() ?? '',
  description: (item.description ?? '').slice(0, 500), // 限制长度
  url: item.url?.trim() ?? '',
  category: item.category?.trim() ?? 'Other',
  source: item.source ?? null,
  tags: [],
  is_featured: false,
  status: 'published'
})).filter((r) => r.name && r.url); // 过滤无效数据

console.log(`✅ 有效记录: ${rows.length} 条`);

// 批量插入（每批 200 条，避免超时）
const BATCH = 200;
let inserted = 0;
let skipped = 0;

for (let i = 0; i < rows.length; i += BATCH) {
  const batch = rows.slice(i, i + BATCH);
  const { error, data } = await supabase
    .from('skill_tools')
    .insert(batch)
    .select('id');

  if (error) {
    console.error(`❌ 批次 ${Math.floor(i / BATCH) + 1} 插入失败:`, error.message);
  } else {
    inserted += (data ?? []).length;
    skipped += batch.length - (data ?? []).length;
    console.log(`  批次 ${Math.floor(i / BATCH) + 1}/${Math.ceil(rows.length / BATCH)}: 插入 ${(data ?? []).length} 条`);
  }
}

console.log(`\n🎉 完成！插入: ${inserted} 条，跳过(重复): ${skipped} 条`);
