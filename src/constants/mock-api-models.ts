////////////////////////////////////////////////////////////////////////////////
// 🛑 Nothing in here has anything to do with Nextjs, it's just a fake database
////////////////////////////////////////////////////////////////////////////////

import { delay } from './mock-api';

export type ModelVendor =
  | 'OpenAI'
  | 'Anthropic'
  | 'Google'
  | 'DeepSeek'
  | 'Meta'
  | 'Mistral'
  | 'Alibaba';
export type ModelType = 'chat' | 'reasoning' | 'code' | 'multimodal' | 'embedding';

export type AiModel = {
  id: number;
  name: string;
  vendor: ModelVendor;
  description: string;
  url: string;
  model_type: ModelType[];
  context_window: string; // "128K", "1M" 等
  multimodal: boolean;
  is_open_source: boolean;
  price_input?: string; // "$ 5 / 1M tokens" 或 "开源免费"
  price_output?: string;
  reasoning_score: number; // 1-5
  code_score: number;
  speed_score: number;
  is_featured: boolean;
  tags: string[];
  release_date: string;
};

export type Benchmark = {
  id: number;
  name: string;
  description: string;
  url: string;
  category: 'agent' | 'code' | 'reasoning' | 'knowledge' | 'preference';
  current_leader: string;
  leader_score?: string;
};

// ── 主流模型数据 ─────────────────────────────────────────────────────────────

const MODEL_DATA: Omit<AiModel, 'id'>[] = [
  {
    name: 'GPT-4o',
    vendor: 'OpenAI',
    description: 'OpenAI 旗舰多模态模型，视觉/语音/文字全能，响应速度快，生态最完善',
    url: 'https://openai.com/gpt-4o',
    model_type: ['chat', 'multimodal'],
    context_window: '128K',
    multimodal: true,
    is_open_source: false,
    price_input: '$5 / 1M',
    price_output: '$15 / 1M',
    reasoning_score: 4,
    code_score: 4,
    speed_score: 4,
    is_featured: true,
    tags: ['多模态', '视觉', 'OpenAI', '旗舰'],
    release_date: '2024-05-13'
  },
  {
    name: 'Claude 3.5 Sonnet',
    vendor: 'Anthropic',
    description:
      'Anthropic 最强编程模型，SWE-bench 第一，代码质量和指令遵循能力顶级，Agent 任务表现优异',
    url: 'https://anthropic.com',
    model_type: ['chat', 'code'],
    context_window: '200K',
    multimodal: true,
    is_open_source: false,
    price_input: '$3 / 1M',
    price_output: '$15 / 1M',
    reasoning_score: 5,
    code_score: 5,
    speed_score: 4,
    is_featured: true,
    tags: ['代码', 'SWE-bench第一', 'Anthropic', 'Agent'],
    release_date: '2024-06-20'
  },
  {
    name: 'Gemini 2.0 Flash',
    vendor: 'Google',
    description: 'Google 最新 Agentic 模型，百万 Token 超长上下文，原生支持工具调用，价格极低',
    url: 'https://ai.google.dev',
    model_type: ['chat', 'multimodal'],
    context_window: '1M',
    multimodal: true,
    is_open_source: false,
    price_input: '$0.1 / 1M',
    price_output: '$0.4 / 1M',
    reasoning_score: 4,
    code_score: 4,
    speed_score: 5,
    is_featured: true,
    tags: ['长上下文', '低价', 'Google', 'Agentic'],
    release_date: '2024-12-11'
  },
  {
    name: 'DeepSeek-V3',
    vendor: 'DeepSeek',
    description: '国产旗舰模型，代码和数学能力媲美 Claude，价格仅为 OpenAI 的 5%，性价比之王',
    url: 'https://deepseek.com',
    model_type: ['chat', 'code'],
    context_window: '64K',
    multimodal: false,
    is_open_source: true,
    price_input: '$0.27 / 1M',
    price_output: '$1.1 / 1M',
    reasoning_score: 5,
    code_score: 5,
    speed_score: 4,
    is_featured: true,
    tags: ['开源', '高性价比', 'DeepSeek', '代码'],
    release_date: '2024-12-26'
  },
  {
    name: 'DeepSeek-R1',
    vendor: 'DeepSeek',
    description: '专为复杂推理设计，数学/逻辑/代码能力与 o1 相当，但完全开源，训练成本仅 3%',
    url: 'https://deepseek.com',
    model_type: ['reasoning', 'code'],
    context_window: '64K',
    multimodal: false,
    is_open_source: true,
    price_input: '$0.55 / 1M',
    price_output: '$2.19 / 1M',
    reasoning_score: 5,
    code_score: 5,
    speed_score: 3,
    is_featured: true,
    tags: ['开源', '推理', 'R1', '数学'],
    release_date: '2025-01-20'
  },
  {
    name: 'Llama 3.3 70B',
    vendor: 'Meta',
    description: 'Meta 最新开源旗舰，700 亿参数，可自托管，商业友好 License，性能逼近闭源模型',
    url: 'https://llama.meta.com',
    model_type: ['chat', 'code'],
    context_window: '128K',
    multimodal: false,
    is_open_source: true,
    price_input: '开源免费',
    price_output: '开源免费',
    reasoning_score: 4,
    code_score: 4,
    speed_score: 4,
    is_featured: false,
    tags: ['开源', 'Meta', '自托管', '70B'],
    release_date: '2024-12-06'
  },
  {
    name: 'Mistral Large',
    vendor: 'Mistral',
    description: '欧洲最强 AI 模型，多语言能力出色，支持 Function Calling，适合欧洲合规场景',
    url: 'https://mistral.ai',
    model_type: ['chat', 'code'],
    context_window: '128K',
    multimodal: false,
    is_open_source: false,
    price_input: '$2 / 1M',
    price_output: '$6 / 1M',
    reasoning_score: 4,
    code_score: 4,
    speed_score: 4,
    is_featured: false,
    tags: ['欧洲', '多语言', 'Mistral', '合规'],
    release_date: '2024-11-18'
  },
  {
    name: 'Qwen2.5-72B',
    vendor: 'Alibaba',
    description: '阿里巴巴通义千问最新旗舰，中文能力国内最强，完全开源，支持多模态',
    url: 'https://qwen.readthedocs.io',
    model_type: ['chat', 'multimodal'],
    context_window: '128K',
    multimodal: true,
    is_open_source: true,
    price_input: '开源免费',
    price_output: '开源免费',
    reasoning_score: 4,
    code_score: 4,
    speed_score: 4,
    is_featured: false,
    tags: ['开源', '中文最强', '阿里巴巴', '多模态'],
    release_date: '2024-09-19'
  },
  {
    name: 'GPT-4o mini',
    vendor: 'OpenAI',
    description: 'GPT-4o 轻量版，速度比 GPT-4o 快 3 倍，价格降低 95%，适合高并发 Agent 场景',
    url: 'https://openai.com/gpt-4o-mini',
    model_type: ['chat'],
    context_window: '128K',
    multimodal: true,
    is_open_source: false,
    price_input: '$0.15 / 1M',
    price_output: '$0.6 / 1M',
    reasoning_score: 3,
    code_score: 3,
    speed_score: 5,
    is_featured: false,
    tags: ['轻量', '高速', '低价', '高并发'],
    release_date: '2024-07-18'
  },
  {
    name: 'o1-preview',
    vendor: 'OpenAI',
    description: 'OpenAI 推理专项模型，深度思考后回答，数学/科学/代码复杂问题表现最强，但速度慢',
    url: 'https://openai.com/o1',
    model_type: ['reasoning'],
    context_window: '128K',
    multimodal: false,
    is_open_source: false,
    price_input: '$15 / 1M',
    price_output: '$60 / 1M',
    reasoning_score: 5,
    code_score: 5,
    speed_score: 2,
    is_featured: true,
    tags: ['推理专项', '深度思考', '数学', 'o1'],
    release_date: '2024-09-12'
  },
  {
    name: 'Claude 3 Haiku',
    vendor: 'Anthropic',
    description: 'Anthropic 最快最便宜的模型，适合实时对话和高频 API 调用，成本极低',
    url: 'https://anthropic.com',
    model_type: ['chat'],
    context_window: '200K',
    multimodal: true,
    is_open_source: false,
    price_input: '$0.25 / 1M',
    price_output: '$1.25 / 1M',
    reasoning_score: 3,
    code_score: 3,
    speed_score: 5,
    is_featured: false,
    tags: ['超快速', '超低价', 'Anthropic', '高频调用'],
    release_date: '2024-03-13'
  },
  {
    name: 'Gemini 1.5 Pro',
    vendor: 'Google',
    description: 'Google 超长上下文专项模型，200 万 Token 窗口，可分析整部代码库或长视频',
    url: 'https://ai.google.dev',
    model_type: ['chat', 'multimodal'],
    context_window: '2M',
    multimodal: true,
    is_open_source: false,
    price_input: '$3.5 / 1M',
    price_output: '$10.5 / 1M',
    reasoning_score: 4,
    code_score: 4,
    speed_score: 3,
    is_featured: false,
    tags: ['超长上下文', '200万Token', '视频分析', 'Google'],
    release_date: '2024-05-14'
  },
  {
    name: 'Qwen2.5-Coder',
    vendor: 'Alibaba',
    description: '阿里代码专项模型，代码能力超越 Claude 3.5 Sonnet，HumanEval 98.5%，完全开源',
    url: 'https://qwen.readthedocs.io',
    model_type: ['code'],
    context_window: '128K',
    multimodal: false,
    is_open_source: true,
    price_input: '开源免费',
    price_output: '开源免费',
    reasoning_score: 4,
    code_score: 5,
    speed_score: 4,
    is_featured: true,
    tags: ['代码专项', '开源', 'HumanEval', '阿里巴巴'],
    release_date: '2024-11-12'
  },
  {
    name: 'Mixtral 8x22B',
    vendor: 'Mistral',
    description: 'Mistral 旗舰 MoE 架构开源模型，1410 亿参数激活 390 亿，性能与成本的最佳平衡',
    url: 'https://mistral.ai',
    model_type: ['chat', 'code'],
    context_window: '64K',
    multimodal: false,
    is_open_source: true,
    price_input: '开源免费',
    price_output: '开源免费',
    reasoning_score: 4,
    code_score: 4,
    speed_score: 4,
    is_featured: false,
    tags: ['MoE架构', '开源', '高性价比', 'Mistral'],
    release_date: '2024-04-17'
  }
];

// ── Benchmark 数据 ────────────────────────────────────────────────────────────

export const BENCHMARKS: Benchmark[] = [
  {
    id: 1,
    name: 'GAIA',
    description: '测量 AI Agent 完成真实世界任务的能力，包括多步骤推理、工具使用和信息检索',
    url: 'https://huggingface.co/datasets/gaia-benchmark/GAIA',
    category: 'agent',
    current_leader: 'Claude 3.5 Sonnet',
    leader_score: '53.6%'
  },
  {
    id: 2,
    name: 'SWE-bench Verified',
    description:
      '基于真实 GitHub Issues 测试 AI 修复代码 Bug 的能力，被认为是最接近真实开发场景的评测',
    url: 'https://www.swebench.com',
    category: 'code',
    current_leader: 'Claude 3.5 Sonnet',
    leader_score: '49%'
  },
  {
    id: 3,
    name: 'HumanEval',
    description: '代码生成能力基准，包含 164 个编程问题，测试从描述直接生成函数的能力',
    url: 'https://paperswithcode.com/sota/code-generation-on-humaneval',
    category: 'code',
    current_leader: 'DeepSeek-V3',
    leader_score: '90.2%'
  },
  {
    id: 4,
    name: 'MMLU',
    description: '57个学科的综合知识理解测试，覆盖数学、科学、法律、医学等，评估模型的广泛知识储备',
    url: 'https://paperswithcode.com/sota/multi-task-language-understanding-on-mmlu',
    category: 'knowledge',
    current_leader: 'GPT-4o',
    leader_score: '88.7%'
  },
  {
    id: 5,
    name: 'Chatbot Arena',
    description: '基于真实用户盲测投票的偏好排行榜，是最能反映实际用户满意度的评测',
    url: 'https://lmarena.ai',
    category: 'preference',
    current_leader: 'Claude 3.5 Sonnet',
    leader_score: 'ELO 1268'
  },
  {
    id: 6,
    name: 'HumanEval',
    description: 'OpenAI 发布的代码生成基准，评估模型编写 Python 函数解决算法问题的能力',
    url: 'https://github.com/openai/human-eval',
    category: 'code',
    current_leader: 'Qwen2.5-Coder 32B',
    leader_score: '98.5%'
  },
  {
    id: 7,
    name: 'MATH',
    description: '高中到竞赛级别数学问题测试集，考查模型的数学推理和解题能力',
    url: 'https://github.com/hendrycks/math',
    category: 'reasoning',
    current_leader: 'o1-preview',
    leader_score: '94.8%'
  },
  {
    id: 8,
    name: 'MMLU',
    description: '涵盖 57 个学科的多任务语言理解基准，是最广泛使用的知识评测集',
    url: 'https://github.com/hendrycks/test',
    category: 'knowledge',
    current_leader: 'GPT-4o',
    leader_score: '88.7%'
  }
];

export type CreateModelPayload = Omit<AiModel, 'id'>;
export type UpdateModelPayload = Partial<CreateModelPayload>;

export const fakeModels = {
  records: [] as AiModel[],

  initialize() {
    this.records = MODEL_DATA.map((item, i) => ({ ...item, id: i + 1 }));
  },

  async getModels({
    search,
    vendor,
    is_open_source
  }: {
    search?: string;
    vendor?: string;
    is_open_source?: boolean;
  } = {}) {
    await delay(200);
    let items = [...this.records];
    if (vendor && vendor !== 'all') items = items.filter((m) => m.vendor === vendor);
    if (is_open_source !== undefined)
      items = items.filter((m) => m.is_open_source === is_open_source);
    if (search) {
      items = items.filter(
        (m) =>
          m.name.toLowerCase().includes(search.toLowerCase()) ||
          m.description.toLowerCase().includes(search.toLowerCase()) ||
          m.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))
      );
    }
    return items;
  },

  async getBenchmarks(): Promise<Benchmark[]> {
    await delay(100);
    return BENCHMARKS;
  },

  async getStats() {
    await delay(100);
    const total = this.records.length;
    const openSource = this.records.filter((m) => m.is_open_source).length;
    const multimodal = this.records.filter((m) => m.multimodal).length;
    const vendors = new Set(this.records.map((m) => m.vendor)).size;
    return { total, openSource, multimodal, vendors };
  },

  async getById(id: number): Promise<AiModel | null> {
    await delay(150);
    return this.records.find((m) => m.id === id) ?? null;
  },

  async create(payload: CreateModelPayload): Promise<AiModel> {
    await delay(400);
    const newItem: AiModel = { ...payload, id: this.records.length + 1 };
    this.records.push(newItem);
    return newItem;
  },

  async update(id: number, payload: UpdateModelPayload): Promise<AiModel | null> {
    await delay(300);
    const idx = this.records.findIndex((m) => m.id === id);
    if (idx === -1) return null;
    this.records[idx] = { ...this.records[idx], ...payload };
    return this.records[idx];
  },

  async delete(id: number): Promise<boolean> {
    await delay(200);
    const idx = this.records.findIndex((m) => m.id === id);
    if (idx === -1) return false;
    this.records.splice(idx, 1);
    return true;
  }
};

fakeModels.initialize();
