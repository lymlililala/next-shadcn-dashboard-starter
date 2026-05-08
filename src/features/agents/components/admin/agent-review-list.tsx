'use client';

import { useState } from 'react';
import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { agentsQueryOptions, agentKeys } from '../../api/queries';
import { reviewAgent } from '../../api/service';
import type { Agent, AgentType } from '../../api/types';

const TYPE_LABELS: Record<AgentType, string> = {
  general: '通用自主',
  research: '深度研究',
  builder: '构建平台',
  computer: '电脑操控',
  creative: '垂直创意',
  proactive: '主动感知'
};

function ReviewDialog({
  agent,
  action,
  open,
  onClose
}: {
  agent: Agent;
  action: 'approve' | 'reject';
  open: boolean;
  onClose: () => void;
}) {
  const [note, setNote] = useState('');
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => reviewAgent(agent.id, action, note),
    onSuccess: () => {
      toast.success(action === 'approve' ? `"${agent.name}" 已通过审核` : `"${agent.name}" 已拒绝`);
      onClose();
      void queryClient.invalidateQueries({ queryKey: agentKeys.all });
    },
    onError: () => toast.error('操作失败，请重试')
  });

  const isApprove = action === 'approve';

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isApprove ? '✅ 通过收录' : '❌ 拒绝 Agent'}</DialogTitle>
          <DialogDescription>
            {isApprove
              ? `确认通过 "${agent.name}"？通过后将在 Agent Hub 公开展示。`
              : `拒绝 "${agent.name}"，可填写原因便于提交方修正。`}
          </DialogDescription>
        </DialogHeader>
        {!isApprove && (
          <div className='space-y-1.5'>
            <Label>拒绝原因（可选）</Label>
            <Textarea
              rows={3}
              placeholder='链接无法访问、描述不够详细、分类错误...'
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        )}
        <DialogFooter>
          <Button variant='outline' onClick={onClose} disabled={mutation.isPending}>
            取消
          </Button>
          <Button
            variant={isApprove ? 'default' : 'destructive'}
            isLoading={mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {isApprove ? '确认通过' : '确认拒绝'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AgentReviewCard({ agent }: { agent: Agent }) {
  const [reviewState, setReviewState] = useState<{ open: boolean; action: 'approve' | 'reject' }>({
    open: false,
    action: 'approve'
  });

  const isExternal = agent.url !== '#';

  return (
    <>
      <ReviewDialog
        agent={agent}
        action={reviewState.action}
        open={reviewState.open}
        onClose={() => setReviewState((s) => ({ ...s, open: false }))}
      />
      <div className='flex flex-col gap-3 rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-md'>
        <div className='flex items-start justify-between gap-3'>
          <div className='min-w-0 flex-1'>
            <div className='flex flex-wrap items-center gap-2'>
              <h3 className='truncate text-sm font-semibold'>{agent.name}</h3>
              <Badge variant='outline' className='shrink-0 text-xs'>
                {TYPE_LABELS[agent.agent_type]}
              </Badge>
            </div>
            <p className='mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground'>
              {isExternal ? agent.url.replace(/^https?:\/\//, '') : '内测中'}
              {agent.open_source === 'open' && (
                <>
                  <span className='mx-1 text-border'>·</span>
                  <span className='text-emerald-600 dark:text-emerald-400'>开源</span>
                </>
              )}
            </p>
          </div>
          <Badge
            variant='outline'
            className={cn(
              'shrink-0 text-xs',
              agent.status === 'pending'
                ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
                : 'bg-rose-500/10 text-rose-600 border-rose-500/20'
            )}
          >
            {agent.status === 'pending' ? '待审核' : '已拒绝'}
          </Badge>
        </div>

        <p className='line-clamp-2 text-xs leading-relaxed text-muted-foreground'>
          {agent.description}
        </p>

        {agent.tags.length > 0 && (
          <div className='flex flex-wrap gap-1'>
            {agent.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className='rounded-md border bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground'
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {agent.review_note && (
          <div className='rounded-lg border border-rose-500/20 bg-rose-500/5 px-3 py-2 text-xs text-rose-600 dark:text-rose-400'>
            <span className='font-medium'>上次拒绝原因：</span>
            {agent.review_note}
          </div>
        )}

        <div className='flex items-center justify-between pt-1'>
          {isExternal ? (
            <Link
              href={agent.url}
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground'
            >
              <Icons.externalLink className='h-3 w-3' />
              查看链接
            </Link>
          ) : (
            <span className='text-[11px] text-muted-foreground/50'>内测中，暂无链接</span>
          )}
          <div className='flex items-center gap-2'>
            <Button
              size='sm'
              variant='outline'
              className='h-7 gap-1 px-2.5 text-xs text-destructive hover:text-destructive border-destructive/30 hover:border-destructive/60'
              onClick={() => setReviewState({ open: true, action: 'reject' })}
            >
              <Icons.circleX className='h-3.5 w-3.5' />
              拒绝
            </Button>
            <Button
              size='sm'
              className='h-7 gap-1 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white'
              onClick={() => setReviewState({ open: true, action: 'approve' })}
            >
              <Icons.circleCheck className='h-3.5 w-3.5' />
              通过
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export function AgentReviewList() {
  const { data: pendingData } = useSuspenseQuery(
    agentsQueryOptions({ status: 'pending', limit: 50 })
  );
  const { data: rejectedData } = useSuspenseQuery(
    agentsQueryOptions({ status: 'rejected', limit: 50 })
  );

  const pendingAgents = pendingData.items;
  const rejectedAgents = rejectedData.items;

  if (pendingAgents.length === 0 && rejectedAgents.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-24 text-center'>
        <div className='mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border bg-muted/50'>
          <Icons.checks className='h-7 w-7 text-emerald-500' />
        </div>
        <p className='text-base font-semibold'>全部处理完毕</p>
        <p className='mt-1.5 text-sm text-muted-foreground'>暂无待审核或已拒绝的 Agent</p>
      </div>
    );
  }

  return (
    <div className='space-y-8'>
      {pendingAgents.length > 0 && (
        <section>
          <div className='mb-4 flex items-center gap-2'>
            <div className='flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/10'>
              <Icons.clock className='h-3.5 w-3.5 text-amber-500' />
            </div>
            <h2 className='text-sm font-semibold'>待审核 Agent</h2>
            <span className='rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-600'>
              {pendingAgents.length}
            </span>
          </div>
          <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {pendingAgents.map((agent) => (
              <AgentReviewCard key={agent.id} agent={agent} />
            ))}
          </div>
        </section>
      )}

      {rejectedAgents.length > 0 && (
        <section>
          <div className='mb-4 flex items-center gap-2'>
            <div className='flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/10'>
              <Icons.circleX className='h-3.5 w-3.5 text-rose-500' />
            </div>
            <h2 className='text-sm font-semibold'>已拒绝 Agent</h2>
            <span className='rounded-full bg-rose-500/10 px-2 py-0.5 text-xs font-medium text-rose-600'>
              {rejectedAgents.length}
            </span>
          </div>
          <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {rejectedAgents.map((agent) => (
              <AgentReviewCard key={agent.id} agent={agent} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export function AgentReviewSkeleton() {
  return (
    <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className='flex flex-col gap-3 rounded-xl border bg-card p-5'>
          <div className='flex items-start justify-between'>
            <div className='space-y-1.5'>
              <div className='h-4 w-32 animate-pulse rounded bg-muted' />
              <div className='h-3 w-20 animate-pulse rounded bg-muted' />
            </div>
            <div className='h-5 w-14 animate-pulse rounded bg-muted' />
          </div>
          <div className='space-y-1'>
            <div className='h-3 w-full animate-pulse rounded bg-muted' />
            <div className='h-3 w-3/4 animate-pulse rounded bg-muted' />
          </div>
          <div className='flex gap-1'>
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className='h-4 w-10 animate-pulse rounded bg-muted' />
            ))}
          </div>
          <div className='flex justify-between pt-1'>
            <div className='h-6 w-16 animate-pulse rounded bg-muted' />
            <div className='flex gap-2'>
              <div className='h-7 w-14 animate-pulse rounded bg-muted' />
              <div className='h-7 w-14 animate-pulse rounded bg-muted' />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
