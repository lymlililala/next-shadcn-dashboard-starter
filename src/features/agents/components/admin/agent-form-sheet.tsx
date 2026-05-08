'use client';

import { useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { z } from 'zod';
import { useAppForm } from '@/components/ui/tanstack-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { createAgent, updateAgent } from '../../api/service';
import { agentKeys } from '../../api/queries';
import type { Agent } from '../../api/types';

const agentSchema = z.object({
  name: z.string().min(2, '名称至少 2 个字符'),
  description: z.string().min(10, '描述至少 10 个字符'),
  url: z.string().min(1, 'URL 不能为空'),
  agent_type: z.enum(['general', 'research', 'builder', 'computer', 'creative', 'proactive']),
  open_source: z.enum(['open', 'closed', 'partial']),
  region: z.enum(['global', 'cn']),
  status: z.enum(['published', 'pending', 'rejected', 'draft']),
  tags: z.string(),
  is_featured: z.boolean()
});

type AgentFormValues = z.infer<typeof agentSchema>;

const TYPE_OPTIONS = [
  { value: 'general', label: '🤖 通用自主 Agent' },
  { value: 'research', label: '🔍 深度研究 Agent' },
  { value: 'builder', label: '🏗️ Agent 构建平台' },
  { value: 'computer', label: '🖥️ 计算机操控 Agent' },
  { value: 'creative', label: '🎨 垂直创意 Agent' },
  { value: 'proactive', label: '🔮 主动感知 Agent' }
];

const OSS_OPTIONS = [
  { value: 'open', label: '✅ 开源' },
  { value: 'closed', label: '🔒 闭源' },
  { value: 'partial', label: '⚡ 部分开源' }
];

const REGION_OPTIONS = [
  { value: 'global', label: '🌐 国际' },
  { value: 'cn', label: '🇨🇳 中文/国内' }
];

const STATUS_OPTIONS = [
  { value: 'published', label: '已发布' },
  { value: 'pending', label: '待审核' },
  { value: 'draft', label: '草稿' },
  { value: 'rejected', label: '已拒绝' }
];

export function AgentFormSheet({
  open,
  onOpenChange,
  agent
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  agent?: Agent | null;
}) {
  const queryClient = useQueryClient();
  const isEditing = !!agent;

  const mutation = useMutation({
    mutationFn: async (values: AgentFormValues) => {
      const tags = values.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      const payload = { ...values, tags };
      if (isEditing && agent) {
        return updateAgent(agent.id, payload);
      }
      return createAgent(payload);
    },
    onSuccess: () => {
      toast.success(isEditing ? 'Agent 已更新' : 'Agent 已添加');
      onOpenChange(false);
      void queryClient.invalidateQueries({ queryKey: agentKeys.all });
    },
    onError: () => toast.error(isEditing ? '更新失败' : '创建失败')
  });

  const form = useAppForm({
    defaultValues: {
      name: agent?.name ?? '',
      description: agent?.description ?? '',
      url: agent?.url ?? '',
      agent_type: (agent?.agent_type as AgentFormValues['agent_type']) ?? 'general',
      open_source: (agent?.open_source as AgentFormValues['open_source']) ?? 'closed',
      region: (agent?.region as AgentFormValues['region']) ?? 'global',
      status: (agent?.status as AgentFormValues['status']) ?? 'draft',
      tags: agent?.tags?.join(', ') ?? '',
      is_featured: agent?.is_featured ?? false
    },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value);
    }
  });

  useEffect(() => {
    form.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agent?.id]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='w-full overflow-y-auto sm:max-w-lg'>
        <SheetHeader>
          <SheetTitle>{isEditing ? '编辑 Agent' : '添加 Agent'}</SheetTitle>
          <SheetDescription>
            {isEditing ? '修改 Agent 信息后点击保存' : '填写信息收录一个新的 AI Agent'}
          </SheetDescription>
        </SheetHeader>

        <form
          className='space-y-4 px-4 py-4'
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
        >
          {/* Name */}
          <form.Field
            name='name'
            validators={{
              onChange: ({ value }) => {
                const r = agentSchema.shape.name.safeParse(value);
                return r.success ? undefined : r.error.issues[0].message;
              }
            }}
          >
            {(field) => (
              <div className='space-y-1.5'>
                <Label htmlFor='name'>Agent 名称 *</Label>
                <Input
                  id='name'
                  placeholder='例如：Manus'
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className='text-xs text-destructive'>{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          </form.Field>

          {/* URL */}
          <form.Field name='url'>
            {(field) => (
              <div className='space-y-1.5'>
                <Label htmlFor='url'>网站 URL（内测中可填 #）</Label>
                <Input
                  id='url'
                  placeholder='https://... 或 #'
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
              </div>
            )}
          </form.Field>

          {/* Description */}
          <form.Field
            name='description'
            validators={{
              onChange: ({ value }) => {
                const r = agentSchema.shape.description.safeParse(value);
                return r.success ? undefined : r.error.issues[0].message;
              }
            }}
          >
            {(field) => (
              <div className='space-y-1.5'>
                <Label htmlFor='description'>Agent 描述 *</Label>
                <Textarea
                  id='description'
                  rows={3}
                  placeholder='简要描述这个 Agent 的核心能力和特点...'
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                  onBlur={field.handleBlur}
                />
                {field.state.meta.errors.length > 0 && (
                  <p className='text-xs text-destructive'>{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          </form.Field>

          {/* Type + Region */}
          <div className='grid grid-cols-2 gap-3'>
            <form.Field name='agent_type'>
              {(field) => (
                <div className='space-y-1.5'>
                  <Label>Agent 分类</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(v) => field.handleChange(v as AgentFormValues['agent_type'])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='选择分类' />
                    </SelectTrigger>
                    <SelectContent>
                      {TYPE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>

            <form.Field name='region'>
              {(field) => (
                <div className='space-y-1.5'>
                  <Label>地区</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(v) => field.handleChange(v as AgentFormValues['region'])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='选择地区' />
                    </SelectTrigger>
                    <SelectContent>
                      {REGION_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>
          </div>

          {/* OpenSource + Status */}
          <div className='grid grid-cols-2 gap-3'>
            <form.Field name='open_source'>
              {(field) => (
                <div className='space-y-1.5'>
                  <Label>开源状态</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(v) => field.handleChange(v as AgentFormValues['open_source'])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='选择状态' />
                    </SelectTrigger>
                    <SelectContent>
                      {OSS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>

            <form.Field name='status'>
              {(field) => (
                <div className='space-y-1.5'>
                  <Label>收录状态</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(v) => field.handleChange(v as AgentFormValues['status'])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='选择状态' />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>
          </div>

          {/* Tags */}
          <form.Field name='tags'>
            {(field) => (
              <div className='space-y-1.5'>
                <Label htmlFor='tags'>标签（逗号分隔）</Label>
                <Input
                  id='tags'
                  placeholder='开源, GitHub, 自动化'
                  value={field.state.value}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          </form.Field>

          {/* Featured */}
          <form.Field name='is_featured'>
            {(field) => (
              <div className='flex items-center justify-between rounded-lg border p-3'>
                <div>
                  <Label className='text-sm font-medium'>设为精选</Label>
                  <p className='mt-0.5 text-xs text-muted-foreground'>
                    精选 Agent 会在首页重点展示
                  </p>
                </div>
                <Switch checked={field.state.value} onCheckedChange={field.handleChange} />
              </div>
            )}
          </form.Field>

          <SheetFooter className='pt-2'>
            <Button
              type='button'
              variant='outline'
              onClick={() => onOpenChange(false)}
              disabled={mutation.isPending}
            >
              取消
            </Button>
            <Button type='submit' isLoading={mutation.isPending}>
              {isEditing ? '保存更改' : '添加 Agent'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
