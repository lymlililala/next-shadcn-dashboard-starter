#!/usr/bin/env node

/**
 * 通用内容上传脚本
 * 用法：
 *   node scripts/upload-content.mjs news data.json
 *   node scripts/upload-content.mjs tutorials data.json
 *   node scripts/upload-content.mjs use_cases data.json
 *
 * 数据格式（JSON 数组）：
 * [
 *   {
 *     "slug": "unique-slug",
 *     "title": "标题",
 *     "summary": "摘要",
 *     ...其他字段
 *   }
 * ]
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

// 验证表名是否有效
const VALID_TABLES = ['news', 'tutorials', 'use_cases', 'agents', 'mcp_servers'];
const KEY_FIELD = {
  news: 'slug',
  tutorials: 'slug',
  use_cases: 'title',
  agents: 'name',
  mcp_servers: 'name'
};

async function uploadContent(table, dataFile) {
  // 验证参数
  if (!VALID_TABLES.includes(table)) {
    console.error(`❌ 表名无效。支持的表：${VALID_TABLES.join(', ')}`);
    process.exit(1);
  }

  // 读取数据文件
  let items;
  try {
    const content = readFileSync(resolve(dataFile), 'utf-8');
    items = JSON.parse(content);
    if (!Array.isArray(items)) {
      throw new Error('数据必须是 JSON 数组');
    }
  } catch (err) {
    console.error(`❌ 读取文件失败: ${err.message}`);
    process.exit(1);
  }

  if (items.length === 0) {
    console.warn('⚠️  没有要上传的数据');
    return;
  }

  console.log(`\n📤 开始上传 ${items.length} 条数据到 ${table} 表\n`);

  const keyField = KEY_FIELD[table];
  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;
  const errors = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const keyValue = item[keyField];

    if (!keyValue) {
      console.error(`  ❌ [${i + 1}/${items.length}] 缺少字段 "${keyField}"`);
      errorCount++;
      errors.push(`行 ${i + 1}: 缺少 ${keyField} 字段`);
      continue;
    }

    // 检查是否已存在
    const { data: existing, error: checkError } = await sb
      .from(table)
      .select('id')
      .eq(keyField, keyValue)
      .maybeSingle();

    if (checkError) {
      console.error(`  ⚠️  [${i + 1}/${items.length}] 查询失败: ${checkError.message}`);
      errorCount++;
      errors.push(`行 ${i + 1}: 查询失败 - ${checkError.message}`);
      continue;
    }

    if (existing) {
      console.log(`  ⏭  [${i + 1}/${items.length}] 跳过（已存在）: ${keyValue}`);
      skipCount++;
      continue;
    }

    // 插入新数据
    const { error: insertError } = await sb.from(table).insert(item);

    if (insertError) {
      console.error(`  ❌ [${i + 1}/${items.length}] 插入失败: ${keyValue}`);
      console.error(`     错误: ${insertError.message}`);
      errorCount++;
      errors.push(`行 ${i + 1}: ${insertError.message}`);
    } else {
      console.log(`  ✅ [${i + 1}/${items.length}] 插入成功: ${keyValue}`);
      successCount++;
    }
  }

  // 输出总结
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`📊 上传完成`);
  console.log(`  ✅ 成功: ${successCount}`);
  console.log(`  ⏭  跳过: ${skipCount}`);
  console.log(`  ❌ 失败: ${errorCount}`);
  console.log(`${'─'.repeat(50)}\n`);

  if (errors.length > 0) {
    console.log('⚠️  错误详情：');
    errors.forEach((err) => console.log(`  • ${err}`));
    console.log();
  }

  process.exit(errorCount > 0 ? 1 : 0);
}

// 命令行参数处理
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log(`
📚 通用内容上传脚本

用法：
  node scripts/upload-content.mjs <table> <data-file>

参数：
  <table>       表名 (news | tutorials | use_cases)
  <data-file>   JSON 数据文件路径

示例：
  node scripts/upload-content.mjs news data/news.json
  node scripts/upload-content.mjs tutorials data/tutorials.json
  node scripts/upload-content.mjs use_cases data/usecases.json

数据格式示例（JSON 数组）：
  [
    {
      "slug": "article-1",
      "title": "文章标题",
      "summary": "摘要内容",
      "content": "正文（可选）",
      ...其他字段
    }
  ]

支持的字段：
  News:
    - slug (必填)
    - title, summary, source_url, source_name
    - category, tags, status, is_featured, published_at

  Tutorials:
    - slug (必填)
    - title, subtitle, summary, content
    - level, category, tags, estimated_minutes, related_tools
    - is_featured, published_at

  Use Cases:
    - title (必填)
    - description, tools, industry, difficulty
    - estimated_time, steps, tags, is_featured
  `);
  process.exit(1);
}

const [table, dataFile] = args;
uploadContent(table, dataFile).catch((err) => {
  console.error(`❌ 致命错误: ${err.message}`);
  process.exit(1);
});
