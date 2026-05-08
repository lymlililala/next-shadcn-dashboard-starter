import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getModels, getModelStats, getBenchmarks } from '@/features/models/api/service';
import type { AiModel, Benchmark } from '@/features/models/api/service';

export const metadata = {
  title: '模型对比管理 | AI Skill Navigation 管理后台'
};

const VENDOR_COLOR: Record<string, string> = {
  OpenAI: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20',
  Anthropic: 'text-orange-600 bg-orange-500/10 border-orange-500/20',
  Google: 'text-blue-600 bg-blue-500/10 border-blue-500/20',
  DeepSeek: 'text-violet-600 bg-violet-500/10 border-violet-500/20',
  Meta: 'text-sky-600 bg-sky-500/10 border-sky-500/20',
  Mistral: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
  Alibaba: 'text-red-600 bg-red-500/10 border-red-500/20'
};

const TYPE_LABEL: Record<string, string> = {
  chat: '对话',
  reasoning: '推理',
  code: '代码',
  multimodal: '多模态',
  embedding: 'Embedding'
};

function ScoreBar({ score }: { score: number }) {
  return (
    <div className='flex items-center gap-1'>
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 w-4 rounded-full ${i < score ? 'bg-primary' : 'bg-muted'}`}
        />
      ))}
    </div>
  );
}

function ModelRow({ item }: { item: AiModel }) {
  const vendorColor = VENDOR_COLOR[item.vendor] ?? '';
  return (
    <div className='flex items-start gap-4 rounded-lg border bg-card px-4 py-3 shadow-sm'>
      <div className='min-w-0 flex-1'>
        <div className='flex items-center gap-2'>
          <span className='text-sm font-semibold'>{item.name}</span>
          {item.is_featured && <Icons.sparkles className='h-3.5 w-3.5 shrink-0 text-amber-500' />}
          {item.is_open_source && (
            <Badge
              variant='outline'
              className='text-[10px] text-emerald-600 bg-emerald-500/10 border-emerald-500/20'
            >
              开源
            </Badge>
          )}
        </div>
        <p className='mt-0.5 text-xs text-muted-foreground line-clamp-1'>{item.description}</p>
        <div className='mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1'>
          <div className='flex items-center gap-1.5'>
            <span className='text-[11px] text-muted-foreground'>推理</span>
            <ScoreBar score={item.reasoning_score} />
          </div>
          <div className='flex items-center gap-1.5'>
            <span className='text-[11px] text-muted-foreground'>代码</span>
            <ScoreBar score={item.code_score} />
          </div>
          <div className='flex items-center gap-1.5'>
            <span className='text-[11px] text-muted-foreground'>速度</span>
            <ScoreBar score={item.speed_score} />
          </div>
        </div>
      </div>
      <div className='flex shrink-0 flex-col items-end gap-1.5'>
        <div className='flex items-center gap-1.5'>
          <Badge variant='outline' className={`text-[10px] ${vendorColor}`}>
            {item.vendor}
          </Badge>
          <span className='text-[11px] text-muted-foreground'>{item.context_window}</span>
        </div>
        <div className='flex flex-wrap justify-end gap-1'>
          {item.model_type.map((t) => (
            <span
              key={t}
              className='rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground'
            >
              {TYPE_LABEL[t] ?? t}
            </span>
          ))}
        </div>
        {item.price_input && (
          <span className='text-[11px] text-muted-foreground'>输入 {item.price_input}</span>
        )}
        <Link
          href={item.url}
          target='_blank'
          className='rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
        >
          <Icons.externalLink className='h-3.5 w-3.5' />
        </Link>
      </div>
    </div>
  );
}

function BenchmarkRow({ item }: { item: Benchmark }) {
  const CAT_COLOR: Record<string, string> = {
    agent: 'text-violet-600 bg-violet-500/10 border-violet-500/20',
    code: 'text-blue-600 bg-blue-500/10 border-blue-500/20',
    reasoning: 'text-amber-600 bg-amber-500/10 border-amber-500/20',
    knowledge: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20',
    preference: 'text-pink-600 bg-pink-500/10 border-pink-500/20'
  };
  return (
    <div className='flex items-center gap-4 rounded-lg border bg-card px-4 py-3 shadow-sm'>
      <div className='min-w-0 flex-1'>
        <div className='flex items-center gap-2'>
          <span className='text-sm font-semibold'>{item.name}</span>
          <Badge variant='outline' className={`text-[10px] ${CAT_COLOR[item.category] ?? ''}`}>
            {item.category}
          </Badge>
        </div>
        <p className='mt-0.5 text-xs text-muted-foreground line-clamp-1'>{item.description}</p>
      </div>
      <div className='shrink-0 text-right'>
        <p className='text-sm font-semibold'>{item.current_leader}</p>
        <p className='text-xs text-muted-foreground'>{item.leader_score}</p>
      </div>
      <Link
        href={item.url}
        target='_blank'
        className='shrink-0 rounded p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
      >
        <Icons.externalLink className='h-3.5 w-3.5' />
      </Link>
    </div>
  );
}

export default async function AdminModelsPage() {
  const [models, stats, benchmarks] = await Promise.all([
    getModels(),
    getModelStats(),
    getBenchmarks()
  ]);

  return (
    <PageContainer
      pageTitle='模型对比管理'
      pageDescription='管理 AI 模型对比页收录的模型信息和 Benchmark 数据'
      pageHeaderAction={
        <div className='flex gap-2'>
          <Button variant='outline' size='sm' asChild>
            <Link href='/dashboard/models' target='_blank'>
              <Icons.externalLink className='mr-1.5 h-3.5 w-3.5' />
              查看前台
            </Link>
          </Button>
          <Button size='sm'>
            <Icons.add className='mr-1.5 h-4 w-4' />
            添加模型
          </Button>
        </div>
      }
    >
      <div className='space-y-6'>
        {/* 统计卡片 */}
        <div className='grid grid-cols-4 gap-3'>
          {[
            {
              label: '全部模型',
              value: stats.total,
              icon: Icons.sparkles,
              color: 'text-blue-600',
              bg: 'bg-blue-500/10'
            },
            {
              label: '开源模型',
              value: stats.openSource,
              icon: Icons.checks,
              color: 'text-emerald-600',
              bg: 'bg-emerald-500/10'
            },
            {
              label: '多模态',
              value: stats.multimodal,
              icon: Icons.media,
              color: 'text-violet-600',
              bg: 'bg-violet-500/10'
            },
            {
              label: '厂商数量',
              value: stats.vendors,
              icon: Icons.teams,
              color: 'text-amber-600',
              bg: 'bg-amber-500/10'
            }
          ].map((s) => (
            <div
              key={s.label}
              className='flex items-center gap-3 rounded-xl border bg-card px-4 py-3 shadow-sm'
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${s.bg}`}
              >
                <s.icon className={`h-4 w-4 ${s.color}`} />
              </div>
              <div>
                <p className='text-xl font-bold'>{s.value}</p>
                <p className='text-xs text-muted-foreground'>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 模型列表 */}
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <p className='text-sm font-medium'>全部模型 ({models.length})</p>
          </div>
          <div className='grid gap-2 sm:grid-cols-2'>
            {models.map((m) => (
              <ModelRow key={m.id} item={m} />
            ))}
          </div>
        </div>

        {/* Benchmark 列表 */}
        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <p className='text-sm font-medium'>Benchmark 榜单 ({benchmarks.length})</p>
            <Button size='sm' variant='outline'>
              <Icons.add className='mr-1.5 h-3.5 w-3.5' />
              添加 Benchmark
            </Button>
          </div>
          <div className='space-y-2'>
            {benchmarks.map((b) => (
              <BenchmarkRow key={b.id} item={b} />
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
