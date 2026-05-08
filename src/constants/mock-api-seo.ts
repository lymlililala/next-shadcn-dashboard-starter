////////////////////////////////////////////////////////////////////////////////
// 🛑 Nothing in here has anything to do with Nextjs, it's just a fake database
////////////////////////////////////////////////////////////////////////////////

import { delay } from './mock-api';

export type SeoConfig = {
  // 网站全局
  site_name: string;
  site_description: string;
  site_keywords: string[]; // 全局关键词
  // 各页面可覆盖的 SEO
  pages: Record<string, PageSeo>;
  // OG / Twitter
  og_image?: string;
  twitter_handle?: string;
  // 更新时间
  updated_at: string;
};

export type PageSeo = {
  title?: string;
  description?: string;
  keywords?: string[];
};

const defaultConfig: SeoConfig = {
  site_name: 'AI Skill Navigation',
  site_description:
    'aiskillnav.com — 一站式 AI Agent 资源导航，收录 Skills、Agents、MCP Server、模型对比、实战教程与场景库',
  site_keywords: [
    'AI Agent',
    'AI Skill',
    'MCP Server',
    'Model Context Protocol',
    'AI 工具导航',
    'AI 导航',
    'LLM',
    '大模型',
    '智能体',
    'OpenAI',
    'Claude',
    'DeepSeek',
    'Gemini',
    'Manus',
    'Devin',
    'AutoGPT',
    'Dify',
    'AI Agent 教程',
    'AI Agent 场景'
  ],
  pages: {
    '/': {
      title: 'AI Skill Navigation — AI Agent 工具导航首页',
      description:
        '发现最好的 AI Agent 工具，汇聚 Skills、Agents、MCP Server、模型对比、教程与场景库',
      keywords: ['AI Agent 导航首页', 'AI 工具大全', 'AI Skill 导航']
    },
    '/dashboard/news': {
      title: 'AI Agent News — 行业动态',
      description: 'AI Agent 赛道最新动态：Manus 被收购、DeepSeek 开源、MCP 协议发布等重大事件',
      keywords: ['AI Agent 新闻', 'AI 行业动态', 'Manus', 'DeepSeek']
    },
    '/dashboard/skills': {
      title: 'AI Skills 导航 — 精选资源站',
      description: '收录全球优质 AI Skill 资源网站，包括官方平台、社区聚合站、GitHub 仓库等',
      keywords: ['AI Skill', 'ClaWHub', 'OpenClaw', 'AI Skills 平台']
    },
    '/dashboard/agents': {
      title: 'AI Agent Hub — 智能体工具导航',
      description: '汇聚 Manus、Devin、OpenClaw、Dify 等顶级 AI Agent 工具，支持类型筛选',
      keywords: ['AI Agent', 'Manus', 'Devin', 'AutoGPT', 'Dify', '智能体工具']
    },
    '/dashboard/mcp': {
      title: 'MCP Server 导航 — Model Context Protocol',
      description: '20+ 精选 MCP Server，让 AI 连接文件系统、数据库、GitHub、Notion 等工具',
      keywords: ['MCP Server', 'Model Context Protocol', 'Claude MCP', 'AI 工具连接']
    },
    '/dashboard/models': {
      title: 'AI 模型对比 — GPT-4o vs Claude vs DeepSeek',
      description: '主流 AI 模型横向对比：能力评分、价格、上下文窗口与 Benchmark 排名',
      keywords: ['AI 模型对比', 'GPT-4o', 'Claude 3.5', 'DeepSeek', 'Gemini', 'LLM 对比']
    },
    '/dashboard/tutorials': {
      title: 'AI Agent 教程中心 — 从入门到实战',
      description: '系统学习 AI Agent：概念理解、MCP 使用、Dify 零代码搭建、n8n 工作流自动化',
      keywords: ['AI Agent 教程', 'MCP 教程', 'Dify 教程', 'n8n AI', 'AI 入门']
    },
    '/dashboard/usecases': {
      title: 'AI Agent 场景库 — 真实落地案例',
      description: '15 个 AI Agent 真实场景：营销自动化、Bug 修复、调研报告、知识库搭建',
      keywords: ['AI Agent 应用场景', 'AI 自动化', 'AI 营销', 'AI 编程', 'AI 效率工具']
    }
  },
  og_image: 'https://aiskillnav.com/og-image.png',
  twitter_handle: '@aiskillnav',
  updated_at: new Date().toISOString()
};

export const fakeSeoConfig = {
  config: { ...defaultConfig } as SeoConfig,

  async get(): Promise<SeoConfig> {
    await delay(100);
    return this.config;
  },

  async update(partial: Partial<SeoConfig>): Promise<SeoConfig> {
    await delay(300);
    this.config = {
      ...this.config,
      ...partial,
      updated_at: new Date().toISOString()
    };
    return this.config;
  },

  async updatePageSeo(path: string, pageSeo: PageSeo): Promise<SeoConfig> {
    await delay(200);
    this.config.pages[path] = { ...(this.config.pages[path] ?? {}), ...pageSeo };
    this.config.updated_at = new Date().toISOString();
    return this.config;
  },

  async deletePageSeo(path: string): Promise<SeoConfig> {
    await delay(150);
    delete this.config.pages[path];
    this.config.updated_at = new Date().toISOString();
    return this.config;
  }
};
