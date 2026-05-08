import PageContainer from '@/components/layout/page-container';
import { getModels, getBenchmarks, getModelStats } from '@/features/models/api/service';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import type { AiModel, Benchmark } from '@/features/models/api/service';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const { resolvePageMeta } = await import('@/features/seo/api/service');
  const meta = await resolvePageMeta('/dashboard/models');
  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    alternates: { canonical: 'https://www.aiskillnav.com/models' },
    openGraph: meta.openGraph,
    twitter: meta.twitter
  };
}

function ScoreBar({ score }: { score: number }) {
  const colors = [
    '',
    'bg-rose-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-blue-500',
    'bg-emerald-500'
  ];
  return (
    <div className='flex items-center gap-1'>
      {Array.from({ length: 5 }, (_, i) => (
        <div
          key={i}
          className={`h-1.5 w-4 rounded-full ${i < score ? colors[score] : 'bg-muted'}`}
        />
      ))}
    </div>
  );
}

function ModelCard({ model }: { model: AiModel }) {
  return (
    <div className='flex flex-col rounded-xl border bg-card p-5 shadow-sm'>
      <div className='mb-4 flex items-start justify-between gap-2'>
        <div>
          <div className='flex items-center gap-2'>
            <h3 className='text-sm font-bold'>{model.name}</h3>
            {model.is_featured && <Icons.sparkles className='h-3.5 w-3.5 text-amber-500' />}
          </div>
          <p className='text-xs text-muted-foreground'>{model.vendor}</p>
        </div>
        <div className='flex flex-col items-end gap-1'>
          {model.is_open_source && (
            <Badge
              variant='outline'
              className='text-[10px] text-emerald-600 bg-emerald-500/10 border-emerald-500/20'
            >
              开源
            </Badge>
          )}
          {model.multimodal && (
            <Badge
              variant='outline'
              className='text-[10px] text-blue-600 bg-blue-500/10 border-blue-500/20'
            >
              多模态
            </Badge>
          )}
        </div>
      </div>

      <p className='mb-4 text-xs leading-relaxed text-muted-foreground line-clamp-2'>
        {model.description}
      </p>

      <div className='mb-4 grid grid-cols-2 gap-2'>
        <div className='rounded-lg bg-muted/30 px-2.5 py-2'>
          <p className='text-[10px] text-muted-foreground'>上下文窗口</p>
          <p className='text-xs font-semibold'>{model.context_window}</p>
        </div>
        <div className='rounded-lg bg-muted/30 px-2.5 py-2'>
          <p className='text-[10px] text-muted-foreground'>输入价格</p>
          <p className='text-xs font-semibold'>{model.price_input ?? '—'}</p>
        </div>
      </div>

      <div className='space-y-2 mb-4'>
        <div className='flex items-center justify-between'>
          <span className='text-[10px] text-muted-foreground'>推理能力</span>
          <ScoreBar score={model.reasoning_score} />
        </div>
        <div className='flex items-center justify-between'>
          <span className='text-[10px] text-muted-foreground'>代码能力</span>
          <ScoreBar score={model.code_score} />
        </div>
        <div className='flex items-center justify-between'>
          <span className='text-[10px] text-muted-foreground'>响应速度</span>
          <ScoreBar score={model.speed_score} />
        </div>
      </div>

      <Link
        href={model.url}
        target='_blank'
        rel='noopener noreferrer'
        className='mt-auto flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors hover:bg-accent'
      >
        官网 <Icons.externalLink className='h-3 w-3' />
      </Link>
    </div>
  );
}

const BENCHMARK_CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  agent: { label: 'Agent', color: 'text-violet-600 bg-violet-500/10 border-violet-500/20' },
  code: { label: '代码', color: 'text-blue-600 bg-blue-500/10 border-blue-500/20' },
  reasoning: { label: '推理', color: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20' },
  knowledge: { label: '知识', color: 'text-amber-600 bg-amber-500/10 border-amber-500/20' },
  preference: { label: '用户偏好', color: 'text-pink-600 bg-pink-500/10 border-pink-500/20' }
};

function BenchmarkRow({ bench }: { bench: Benchmark }) {
  const cfg = BENCHMARK_CATEGORY_CONFIG[bench.category] ?? { label: bench.category, color: '' };
  return (
    <div className='flex items-center gap-4 rounded-lg border bg-card px-4 py-3'>
      <div className='min-w-0 flex-1'>
        <div className='flex items-center gap-2'>
          <span className='text-sm font-semibold'>{bench.name}</span>
          <Badge variant='outline' className={`shrink-0 text-[10px] ${cfg.color}`}>
            {cfg.label}
          </Badge>
        </div>
        <p className='mt-0.5 text-xs text-muted-foreground'>{bench.description}</p>
      </div>
      <div className='shrink-0 text-right'>
        <p className='text-xs font-medium text-foreground'>{bench.current_leader}</p>
        {bench.leader_score && (
          <p className='text-[11px] text-muted-foreground'>{bench.leader_score}</p>
        )}
      </div>
      <Link href={bench.url} target='_blank' rel='noopener noreferrer' className='shrink-0'>
        <Icons.externalLink className='h-4 w-4 text-muted-foreground hover:text-foreground transition-colors' />
      </Link>
    </div>
  );
}

export default async function ModelsPage() {
  const [models, benchmarks, stats] = await Promise.all([
    getModels(),
    getBenchmarks(),
    getModelStats()
  ]);

  return (
    <PageContainer
      pageTitle='AI 模型对比'
      pageDescription='主流 AI 模型横向对比：能力评分、价格、上下文窗口与 Benchmark 排名'
    >
      <div className='space-y-8'>
        {/* Stats */}
        <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
          {[
            {
              label: '收录模型',
              value: stats.total,
              icon: Icons.sparkles,
              color: 'text-violet-600',
              bg: 'bg-violet-500/10'
            },
            {
              label: '开源模型',
              value: stats.openSource,
              icon: Icons.github,
              color: 'text-emerald-600',
              bg: 'bg-emerald-500/10'
            },
            {
              label: '多模态',
              value: stats.multimodal,
              icon: Icons.media,
              color: 'text-blue-600',
              bg: 'bg-blue-500/10'
            },
            {
              label: '家厂商',
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

        {/* Models Grid */}
        <section>
          <h2 className='mb-4 text-base font-semibold'>主流模型对比</h2>
          <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {models.map((m) => (
              <ModelCard key={m.id} model={m} />
            ))}
          </div>
        </section>

        {/* Benchmarks */}
        <section>
          <div className='mb-4 flex items-center gap-2'>
            <Icons.trendingUp className='h-4 w-4 text-muted-foreground' />
            <h2 className='text-base font-semibold'>Benchmark 排行</h2>
          </div>
          <div className='space-y-2'>
            {benchmarks.map((b) => (
              <BenchmarkRow key={b.id} bench={b} />
            ))}
          </div>
        </section>

        {/* Pricing comparison table note */}
        <div className='rounded-xl border bg-muted/30 p-4 text-xs text-muted-foreground'>
          <p className='font-medium text-foreground mb-1'>价格说明</p>
          价格为参考值，实际以各厂商官网为准。部分模型提供免费额度或 API
          试用。开源模型可自托管，仅需支付算力成本。
        </div>
      </div>
    </PageContainer>
  );
}
