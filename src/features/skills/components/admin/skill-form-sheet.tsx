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
import { createSite, updateSite } from '../../api/service';
import { siteKeys } from '../../api/queries';
import type { Site } from '../../api/types';

const siteSchema = z.object({
  name: z.string().min(2, '名称至少 2 个字符'),
  description: z.string().min(10, '描述至少 10 个字符'),
  url: z.string().url('请输入有效的 URL'),
  platform: z.enum(['official', 'mirror', 'github', 'aggregator', 'community', 'tool']),
  region: z.enum(['global', 'cn']),
  status: z.enum(['published', 'pending', 'rejected', 'draft']),
  tags: z.string(),
  is_featured: z.boolean()
});

type SiteFormValues = z.infer<typeof siteSchema>;

interface SkillFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  site?: Site | null;
}

const PLATFORM_OPTIONS = [
  { value: 'official', label: '官方' },
  { value: 'mirror', label: '镜像站' },
  { value: 'github', label: 'GitHub 仓库' },
  { value: 'aggregator', label: '聚合导航' },
  { value: 'community', label: '社区/论坛' },
  { value: 'tool', label: '工具' }
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

export function SkillFormSheet({ open, onOpenChange, site }: SkillFormSheetProps) {
  const queryClient = useQueryClient();
  const isEditing = !!site;

  const mutation = useMutation({
    mutationFn: async (values: SiteFormValues) => {
      const tags = values.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      const payload = { ...values, tags };
      if (isEditing && site) {
        return updateSite(site.id, payload);
      }
      return createSite(payload);
    },
    onSuccess: () => {
      toast.success(isEditing ? '站点已更新' : '站点已添加');
      onOpenChange(false);
      void queryClient.invalidateQueries({ queryKey: siteKeys.all });
    },
    onError: () => {
      toast.error(isEditing ? '更新失败' : '创建失败');
    }
  });

  const form = useAppForm({
    defaultValues: {
      name: site?.name ?? '',
      description: site?.description ?? '',
      url: site?.url ?? '',
      platform: (site?.platform as SiteFormValues['platform']) ?? 'aggregator',
      region: (site?.region as SiteFormValues['region']) ?? 'global',
      status: (site?.status as SiteFormValues['status']) ?? 'draft',
      tags: site?.tags?.join(', ') ?? '',
      is_featured: site?.is_featured ?? false
    },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value);
    }
  });

  useEffect(() => {
    form.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site?.id]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='w-full overflow-y-auto sm:max-w-lg'>
        <SheetHeader>
          <SheetTitle>{isEditing ? '编辑站点' : '添加站点'}</SheetTitle>
          <SheetDescription>
            {isEditing ? '修改站点信息后点击保存' : '填写信息收录一个新的 Skill 资源网站'}
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
                const r = siteSchema.shape.name.safeParse(value);
                return r.success ? undefined : r.error.issues[0].message;
              }
            }}
          >
            {(field) => (
              <div className='space-y-1.5'>
                <Label htmlFor='name'>站点名称 *</Label>
                <Input
                  id='name'
                  placeholder='例如：SkillHub 腾讯版'
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
          <form.Field
            name='url'
            validators={{
              onChange: ({ value }) => {
                const r = siteSchema.shape.url.safeParse(value);
                return r.success ? undefined : r.error.issues[0].message;
              }
            }}
          >
            {(field) => (
              <div className='space-y-1.5'>
                <Label htmlFor='url'>网站 URL *</Label>
                <Input
                  id='url'
                  placeholder='https://...'
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

          {/* Description */}
          <form.Field
            name='description'
            validators={{
              onChange: ({ value }) => {
                const r = siteSchema.shape.description.safeParse(value);
                return r.success ? undefined : r.error.issues[0].message;
              }
            }}
          >
            {(field) => (
              <div className='space-y-1.5'>
                <Label htmlFor='description'>站点描述 *</Label>
                <Textarea
                  id='description'
                  rows={3}
                  placeholder='简要描述这个网站提供哪些 Skill 资源...'
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

          {/* Platform + Region */}
          <div className='grid grid-cols-2 gap-3'>
            <form.Field name='platform'>
              {(field) => (
                <div className='space-y-1.5'>
                  <Label>平台类型</Label>
                  <Select
                    value={field.state.value}
                    onValueChange={(v) => field.handleChange(v as SiteFormValues['platform'])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='选择类型' />
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORM_OPTIONS.map((opt) => (
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
                    onValueChange={(v) => field.handleChange(v as SiteFormValues['region'])}
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

          {/* Status */}
          <form.Field name='status'>
            {(field) => (
              <div className='space-y-1.5'>
                <Label>收录状态</Label>
                <Select
                  value={field.state.value}
                  onValueChange={(v) => field.handleChange(v as SiteFormValues['status'])}
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

          {/* Tags */}
          <form.Field name='tags'>
            {(field) => (
              <div className='space-y-1.5'>
                <Label htmlFor='tags'>标签（逗号分隔）</Label>
                <Input
                  id='tags'
                  placeholder='官方市场, 中文, 免费'
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
                  <p className='text-xs text-muted-foreground mt-0.5'>精选站点会在首页重点展示</p>
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
              {isEditing ? '保存更改' : '添加站点'}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
