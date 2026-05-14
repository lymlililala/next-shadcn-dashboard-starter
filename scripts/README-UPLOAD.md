# 通用内容上传脚本使用指南

## 概述

`upload-content.mjs` 是一个通用的数据库内容上传脚本，支持 News、Tutorials、Use Cases 三种内容类型的批量上传。

## 快速开始

### 1. 准备数据文件

创建一个 JSON 文件，包含要上传的数据数组。参考 `data/` 目录中的示例文件。

### 2. 运行上传

```bash
# 上传 News
node scripts/upload-content.mjs news data/news.json

# 上传 Tutorials
node scripts/upload-content.mjs tutorials data/tutorials.json

# 上传 Use Cases
node scripts/upload-content.mjs use_cases data/usecases.json
```

## 详细用法

### 命令格式

```bash
node scripts/upload-content.mjs <table> <data-file>
```

**参数说明**：
- `<table>`：表名，支持 `news`、`tutorials`、`use_cases`
- `<data-file>`：JSON 数据文件的相对路径

### 数据格式

#### News 数据格式

```json
[
  {
    "slug": "unique-article-slug",
    "title": "文章标题",
    "summary": "文章摘要（显示在列表）",
    "source_url": "https://example.com/source",
    "source_name": "来源名称",
    "category": "工具|模型|框架|融资|研究|Agent",
    "tags": ["tag1", "tag2"],
    "status": "published|draft",
    "is_featured": true,
    "published_at": "2026-05-15T08:00:00Z"
  }
]
```

**必填字段**：`slug`

**可选字段**：其他所有字段（未提供时使用默认值）

#### Tutorials 数据格式

```json
[
  {
    "slug": "unique-tutorial-slug",
    "title": "教程标题",
    "subtitle": "副标题",
    "summary": "教程摘要",
    "content": "# Markdown 格式的完整内容",
    "level": "beginner|intermediate|advanced",
    "category": "hands-on|concept|mcp|agent|workflow",
    "tags": ["tag1", "tag2"],
    "estimated_minutes": 20,
    "related_tools": ["Tool1", "Tool2"],
    "is_featured": true,
    "published_at": "2026-05-15T08:00:00Z"
  }
]
```

**必填字段**：`slug`

#### Use Cases 数据格式

```json
[
  {
    "title": "用例标题",
    "description": "用例描述",
    "tools": ["Tool1", "Tool2"],
    "industry": "marketing|engineering|research|productivity|industry",
    "difficulty": 1,
    "estimated_time": "预估时间说明",
    "steps": ["Step 1", "Step 2", "Step 3"],
    "tags": ["tag1", "tag2"],
    "is_featured": true
  }
]
```

**必填字段**：`title`

## 示例

### 示例 1：上传单个 News

```bash
node scripts/upload-content.mjs news data/news-example.json
```

输出：
```
📤 开始上传 2 条数据到 news 表

  ✅ [1/2] 插入成功: example-news-article-1
  ✅ [2/2] 插入成功: example-news-article-2

──────────────────────────────────────────────────
📊 上传完成
  ✅ 成功: 2
  ⏭  跳过: 0
  ❌ 失败: 0
──────────────────────────────────────────────────
```

### 示例 2：批量更新（部分已存在）

```bash
node scripts/upload-content.mjs tutorials data/new-tutorials.json
```

输出：
```
📤 开始上传 5 条数据到 tutorials 表

  ✅ [1/5] 插入成功: new-tutorial-1
  ⏭  [2/5] 跳过（已存在）: existing-tutorial
  ✅ [3/5] 插入成功: new-tutorial-2
  ❌ [4/5] 插入失败: invalid-tutorial
     错误: Invalid value for field 'level'
  ✅ [5/5] 插入成功: new-tutorial-3

──────────────────────────────────────────────────
📊 上传完成
  ✅ 成功: 3
  ⏭  跳过: 1
  ❌ 失败: 1
──────────────────────────────────────────────────

⚠️  错误详情：
  • 行 4: Invalid value for field 'level'
```

## 重要说明

### 幂等性（Idempotent）

脚本会自动检测重复数据，避免插入重复记录：
- 对于 **News** 和 **Tutorials**：按 `slug` 字段检测重复
- 对于 **Use Cases**：按 `title` 字段检测重复

重复的记录会被跳过，显示 `⏭  跳过（已存在）`。

### 字段验证

- 每个数据项必须包含对应表的**必填字段**
- 字段值必须符合数据类型和枚举值
- 异常数据会被记录并显示错误信息

### 环境变量

确保设置了以下环境变量：

```bash
export NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

或在项目根目录创建 `.env.local` 文件。

## 常见问题

### Q1：如何检查数据是否已存在？

脚本会自动检查。已存在的数据会显示为 `⏭  跳过（已存在）`。

### Q2：支持什么样的 slug 格式？

slug 应该：
- 全部小写
- 使用 `-` 分隔单词
- 不包含特殊字符
- 举例：`my-first-article`、`claude-setup-guide`

### Q3：失败的数据会被部分上传吗？

不会。如果某行数据插入失败，会跳过该行继续处理下一行。其他数据不受影响。

### Q4：如何批量修改已上传的数据？

当前脚本只支持插入新数据，不支持更新。如需修改，请：
1. 直接在 Supabase 控制台修改
2. 或编写自定义 update 脚本

### Q5：有文件大小限制吗？

没有严格限制，但建议单次不超过 1000 条记录，以避免超时。

## 工作流示例

### 场景：每周更新一次 News

1. 准备 `data/weekly-news.json`
2. 运行 `node scripts/upload-content.mjs news data/weekly-news.json`
3. 脚本自动跳过重复数据
4. 查看输出确认上传状态
5. 完成！新 News 会自动出现在网站上

### 场景：批量导入教程

1. 从其他来源（CSV/Excel）生成 JSON
2. 验证 JSON 格式正确
3. 运行上传脚本
4. 检查错误并修正
5. 重新运行脚本

## 调试技巧

### 打印完整错误信息

如果需要更详细的错误信息，可以修改脚本添加日志：

```javascript
// 在 insertError 处理部分添加
console.log('完整错误对象:', insertError);
```

### 验证 JSON 格式

在上传前验证 JSON 文件是否有效：

```bash
node -e "console.log(JSON.parse(require('fs').readFileSync('data/news.json', 'utf-8')))"
```

### 测试模式

修改脚本添加 `--dry-run` 标志以进行测试（不实际插入）。

## 联系支持

遇到问题？检查以下内容：
1. 环境变量是否正确设置
2. JSON 文件格式是否有效
3. 必填字段是否都提供了
4. Supabase 连接是否正常

## 更新日志

- **v1.0** (2026-05-15)
  - 初始版本
  - 支持 News、Tutorials、Use Cases 三种表
  - 自动去重
  - 详细错误报告
