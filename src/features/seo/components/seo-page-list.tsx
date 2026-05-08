'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Icons } from '@/components/icons';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { SeoConfig, PageSeo } from '@/features/seo/api/service';

type Props = { initialConfig: SeoConfig };

type EditState = {
  path: string;
  title: string;
  description: string;
  keywords: string;
};

function PageSeoRow({
  path,
  seo,
  onEdit,
  onDelete
}: {
  path: string;
  seo: PageSeo;
  onEdit: (path: string) => void;
  onDelete: (path: string) => void;
}) {
  return (
    <div className='flex items-start gap-3 rounded-lg border bg-card px-4 py-3 shadow-sm'>
      <div className='min-w-0 flex-1'>
        <div className='flex items-center gap-2'>
          <code className='rounded bg-muted/50 border px-1.5 py-0.5 text-[11px] font-mono'>
            {path}
          </code>
          {seo.keywords && seo.keywords.length > 0 && (
            <Badge variant='outline' className='text-[10px]'>
              {seo.keywords.length} 关键词
            </Badge>
          )}
        </div>
        {seo.title && <p className='mt-1 text-xs font-medium line-clamp-1'>{seo.title}</p>}
        {seo.description && (
          <p className='text-[11px] text-muted-foreground line-clamp-1'>{seo.description}</p>
        )}
      </div>
      <div className='flex shrink-0 items-center gap-1'>
        <Button variant='ghost' size='sm' className='h-7 px-2' onClick={() => onEdit(path)}>
          <Icons.edit className='h-3.5 w-3.5' />
        </Button>
        <Button
          variant='ghost'
          size='sm'
          className='h-7 px-2 text-rose-500 hover:text-rose-600'
          onClick={() => onDelete(path)}
        >
          <Icons.trash className='h-3.5 w-3.5' />
        </Button>
      </div>
    </div>
  );
}

function EditDrawer({
  edit,
  onSave,
  onClose,
  isPending
}: {
  edit: EditState;
  onSave: (state: EditState) => void;
  onClose: () => void;
  isPending: boolean;
}) {
  const [state, setState] = useState(edit);

  return (
    <div className='rounded-xl border bg-card p-5 shadow-sm ring-1 ring-primary/20'>
      <div className='mb-4 flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Icons.edit className='h-4 w-4 text-muted-foreground' />
          <span className='text-sm font-semibold'>编辑页面 SEO</span>
          <code className='rounded bg-muted/50 border px-1.5 py-0.5 text-[11px] font-mono'>
            {state.path}
          </code>
        </div>
        <Button variant='ghost' size='sm' className='h-7 w-7 p-0' onClick={onClose}>
          <Icons.close className='h-3.5 w-3.5' />
        </Button>
      </div>

      <div className='grid gap-4 sm:grid-cols-2'>
        <div className='space-y-1.5 sm:col-span-2'>
          <Label className='text-xs'>页面路径</Label>
          <Input
            value={state.path}
            onChange={(e) => setState((s) => ({ ...s, path: e.target.value }))}
            placeholder='/dashboard/skills'
            className='h-8 font-mono text-sm'
          />
        </div>
        <div className='space-y-1.5 sm:col-span-2'>
          <Label className='text-xs'>
            页面标题 <span className='text-muted-foreground ml-1'>(留空则用全局)</span>
          </Label>
          <Input
            value={state.title}
            onChange={(e) => setState((s) => ({ ...s, title: e.target.value }))}
            placeholder='AI Skills 导航 — 精选资源站'
            className='h-8 text-sm'
          />
          <p className='text-[11px] text-muted-foreground'>
            当前：{state.title.length} 字，建议 30–60 字
          </p>
        </div>
        <div className='space-y-1.5 sm:col-span-2'>
          <Label className='text-xs'>
            页面描述 <span className='text-muted-foreground ml-1'>(留空则用全局)</span>
          </Label>
          <Textarea
            value={state.description}
            onChange={(e) => setState((s) => ({ ...s, description: e.target.value }))}
            placeholder='收录全球优质 AI Skill 资源网站...'
            rows={2}
            className='resize-none text-sm'
          />
          <p className='text-[11px] text-muted-foreground'>
            当前：{state.description.length} 字，建议 50–160 字
          </p>
        </div>
        <div className='space-y-1.5 sm:col-span-2'>
          <Label className='text-xs'>
            页面关键词
            <span className='ml-1.5 text-muted-foreground'>(会与全局关键词合并，逗号分隔)</span>
          </Label>
          <Textarea
            value={state.keywords}
            onChange={(e) => setState((s) => ({ ...s, keywords: e.target.value }))}
            placeholder='AI Skill, ClaWHub, OpenClaw...'
            rows={2}
            className='resize-none font-mono text-xs'
          />
        </div>
      </div>

      <div className='mt-4 flex justify-end gap-2'>
        <Button variant='outline' size='sm' onClick={onClose}>
          取消
        </Button>
        <Button size='sm' onClick={() => onSave(state)} isLoading={isPending}>
          <Icons.checks className='mr-1.5 h-3.5 w-3.5' />
          保存
        </Button>
      </div>
    </div>
  );
}

export function SeoPageList({ initialConfig }: Props) {
  const [pages, setPages] = useState(initialConfig.pages);
  const [editing, setEditing] = useState<EditState | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showNewForm, setShowNewForm] = useState(false);

  function startEdit(path: string) {
    const seo = pages[path] ?? {};
    setEditing({
      path,
      title: seo.title ?? '',
      description: seo.description ?? '',
      keywords: (seo.keywords ?? []).join(', ')
    });
    setShowNewForm(false);
  }

  function handleSave(state: EditState) {
    startTransition(async () => {
      try {
        const { updatePageSeo } = await import('@/features/seo/api/service');
        const kws = state.keywords
          .split(',')
          .map((k) => k.trim())
          .filter(Boolean);
        const updated = await updatePageSeo(state.path, {
          title: state.title || undefined,
          description: state.description || undefined,
          keywords: kws.length > 0 ? kws : undefined
        });
        setPages(updated.pages);
        setEditing(null);
        setShowNewForm(false);
        toast.success('页面 SEO 已保存');
      } catch {
        toast.error('保存失败');
      }
    });
  }

  function handleDelete(path: string) {
    startTransition(async () => {
      try {
        const { deletePageSeo } = await import('@/features/seo/api/service');
        const updated = await deletePageSeo(path);
        setPages(updated.pages);
        toast.success(`已删除 ${path} 的 SEO 配置`);
      } catch {
        toast.error('删除失败');
      }
    });
  }

  const blankEdit: EditState = { path: '', title: '', description: '', keywords: '' };

  return (
    <div className='space-y-3'>
      {/* Existing pages */}
      {Object.entries(pages).map(([path, seo]) =>
        editing?.path === path && !showNewForm ? (
          <EditDrawer
            key={path}
            edit={editing}
            onSave={handleSave}
            onClose={() => setEditing(null)}
            isPending={isPending}
          />
        ) : (
          <PageSeoRow key={path} path={path} seo={seo} onEdit={startEdit} onDelete={handleDelete} />
        )
      )}

      {/* New page form */}
      {showNewForm ? (
        <EditDrawer
          edit={blankEdit}
          onSave={handleSave}
          onClose={() => setShowNewForm(false)}
          isPending={isPending}
        />
      ) : (
        <Button
          variant='outline'
          size='sm'
          className='w-full border-dashed'
          onClick={() => {
            setShowNewForm(true);
            setEditing(null);
          }}
        >
          <Icons.add className='mr-1.5 h-3.5 w-3.5' />
          添加页面 SEO 配置
        </Button>
      )}

      <div className='rounded-lg border bg-muted/30 p-3 text-[11px] text-muted-foreground'>
        <p className='font-medium text-foreground mb-1'>说明</p>
        <p>
          页面级配置会完全覆盖该页面的标题和描述，关键词则与全局关键词合并。实际生效需在各页面的{' '}
          <code className='bg-muted rounded px-1'>generateMetadata</code> 中调用{' '}
          <code className='bg-muted rounded px-1'>resolvePageMeta()</code>。
        </p>
      </div>
    </div>
  );
}
