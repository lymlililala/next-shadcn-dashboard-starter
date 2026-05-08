'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { z } from 'zod';
import { useAppForm } from '@/components/ui/tanstack-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import { createArticle, updateArticle } from '../../api/service';
import { articleKeys } from '../../api/queries';
import type { Article } from '../../api/types';

const articleSchema = z.object({
  title: z.string().min(2, '标题至少 2 个字符'),
  slug: z
    .string()
    .min(2, 'slug 至少 2 个字符')
    .regex(/^[a-z0-9-]+$/, 'slug 只能包含小写字母、数字和连字符'),
  summary: z.string().min(20, '摘要至少 20 个字符'),
  content: z.string().min(10, '正文至少 10 个字符'),
  tags: z.string(),
  status: z.enum(['published', 'draft', 'archived']),
  seo_title: z.string().optional(),
  seo_description: z.string().optional()
});

type ArticleFormValues = z.infer<typeof articleSchema>;

interface ArticleEditorProps {
  article?: Article | null;
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function FieldError({ errors }: { errors: string[] }) {
  if (!errors.length) return null;
  return <p className='text-xs text-destructive'>{errors[0]}</p>;
}

export function ArticleEditor({ article }: ArticleEditorProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditing = !!article;

  const mutation = useMutation({
    mutationFn: async (values: ArticleFormValues) => {
      const tags = values.tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      const payload = {
        ...values,
        tags,
        seo_title: values.seo_title || undefined,
        seo_description: values.seo_description || undefined,
        cover_image: article?.cover_image || undefined,
        published_at: article?.published_at || undefined
      };
      if (isEditing && article) {
        return updateArticle(article.id, payload);
      }
      return createArticle(payload);
    },
    onSuccess: (result) => {
      toast.success(isEditing ? '文章已保存' : '文章已创建');
      void queryClient.invalidateQueries({ queryKey: articleKeys.all });
      if (!isEditing && result) {
        router.push(`/admin/articles/${result.id}`);
      }
    },
    onError: () => {
      toast.error(isEditing ? '保存失败' : '创建失败');
    }
  });

  const form = useAppForm({
    defaultValues: {
      title: article?.title ?? '',
      slug: article?.slug ?? '',
      summary: article?.summary ?? '',
      content: article?.content ?? '',
      tags: article?.tags?.join(', ') ?? '',
      status: (article?.status as ArticleFormValues['status']) ?? 'draft',
      seo_title: article?.seo_title ?? '',
      seo_description: article?.seo_description ?? ''
    },
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value);
    }
  });

  return (
    <form
      className='space-y-0'
      onSubmit={(e) => {
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      {/* Toolbar */}
      <div className='flex items-center justify-between border-b bg-card px-6 py-3'>
        <div className='flex items-center gap-2'>
          <Icons.post className='h-4 w-4 text-muted-foreground' />
          <span className='text-sm font-semibold'>{isEditing ? '编辑文章' : '新建文章'}</span>
          <form.Field name='status'>
            {(field) => (
              <Badge
                variant='outline'
                className={cn(
                  'text-[10px] font-medium',
                  field.state.value === 'published'
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                    : field.state.value === 'archived'
                      ? 'bg-slate-500/10 text-slate-500 border-slate-500/20'
                      : 'bg-gray-500/10 text-gray-500 border-gray-500/20'
                )}
              >
                {field.state.value === 'published'
                  ? '已发布'
                  : field.state.value === 'archived'
                    ? '已归档'
                    : '草稿'}
              </Badge>
            )}
          </form.Field>
        </div>
        <div className='flex items-center gap-2'>
          <form.Field name='status'>
            {(field) => (
              <Select
                value={field.state.value}
                onValueChange={(v) => field.handleChange(v as ArticleFormValues['status'])}
              >
                <SelectTrigger className='h-8 w-28 text-xs'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='draft'>草稿</SelectItem>
                  <SelectItem value='published'>发布</SelectItem>
                  <SelectItem value='archived'>归档</SelectItem>
                </SelectContent>
              </Select>
            )}
          </form.Field>
          <Button type='submit' size='sm' isLoading={mutation.isPending}>
            <Icons.check className='mr-1.5 h-3.5 w-3.5' />
            {isEditing ? '保存' : '创建'}
          </Button>
        </div>
      </div>

      {/* Editor area */}
      <div className='p-6'>
        <Tabs defaultValue='content' className='space-y-6'>
          <TabsList className='h-8'>
            <TabsTrigger value='content' className='text-xs'>
              正文
            </TabsTrigger>
            <TabsTrigger value='meta' className='text-xs'>
              基本信息
            </TabsTrigger>
            <TabsTrigger value='seo' className='text-xs'>
              SEO 设置
            </TabsTrigger>
          </TabsList>

          {/* ── 正文 Tab ── */}
          <TabsContent value='content' className='space-y-4 mt-4'>
            {/* Title */}
            <form.Field
              name='title'
              validators={{
                onChange: ({ value }) => {
                  const r = articleSchema.shape.title.safeParse(value);
                  return r.success ? undefined : r.error.issues[0].message;
                }
              }}
            >
              {(field) => (
                <div className='space-y-1.5'>
                  <Input
                    placeholder='文章标题...'
                    value={field.state.value}
                    onChange={(e) => {
                      field.handleChange(e.target.value);
                      // 新建时自动生成 slug
                      if (!isEditing) {
                        form.setFieldValue('slug', slugify(e.target.value));
                      }
                    }}
                    onBlur={field.handleBlur}
                    className='h-12 border-0 border-b rounded-none px-0 text-xl font-bold placeholder:font-normal shadow-none focus-visible:ring-0 focus-visible:border-b-primary'
                  />
                  <FieldError errors={field.state.meta.errors as string[]} />
                </div>
              )}
            </form.Field>

            {/* Content */}
            <form.Field
              name='content'
              validators={{
                onChange: ({ value }) => {
                  const r = articleSchema.shape.content.safeParse(value);
                  return r.success ? undefined : r.error.issues[0].message;
                }
              }}
            >
              {(field) => (
                <div className='space-y-1.5'>
                  <div className='flex items-center justify-between'>
                    <Label className='text-xs text-muted-foreground'>正文（Markdown）</Label>
                    <a
                      href={`/blog/${article?.slug ?? ''}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      className={cn(
                        'flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors',
                        !article?.slug && 'pointer-events-none opacity-0'
                      )}
                    >
                      <Icons.externalLink className='h-3 w-3' />
                      预览
                    </a>
                  </div>
                  <Textarea
                    placeholder={`# 文章标题\n\n正文内容支持 Markdown 格式...\n\n## 二级标题\n\n- 列表项\n- 列表项\n\n**加粗** *斜体* \`代码\``}
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                    className='min-h-[500px] font-mono text-sm leading-relaxed resize-y'
                  />
                  <FieldError errors={field.state.meta.errors as string[]} />
                </div>
              )}
            </form.Field>
          </TabsContent>

          {/* ── 基本信息 Tab ── */}
          <TabsContent value='meta' className='space-y-4 mt-4'>
            {/* Slug */}
            <form.Field
              name='slug'
              validators={{
                onChange: ({ value }) => {
                  const r = articleSchema.shape.slug.safeParse(value);
                  return r.success ? undefined : r.error.issues[0].message;
                }
              }}
            >
              {(field) => (
                <div className='space-y-1.5'>
                  <Label htmlFor='slug'>URL Slug *</Label>
                  <div className='flex items-center'>
                    <span className='inline-flex h-9 items-center rounded-l-md border border-r-0 bg-muted px-3 text-xs text-muted-foreground'>
                      /blog/
                    </span>
                    <Input
                      id='slug'
                      placeholder='article-slug'
                      value={field.state.value}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onBlur={field.handleBlur}
                      className='rounded-l-none'
                    />
                  </div>
                  <FieldError errors={field.state.meta.errors as string[]} />
                </div>
              )}
            </form.Field>

            {/* Summary */}
            <form.Field
              name='summary'
              validators={{
                onChange: ({ value }) => {
                  const r = articleSchema.shape.summary.safeParse(value);
                  return r.success ? undefined : r.error.issues[0].message;
                }
              }}
            >
              {(field) => (
                <div className='space-y-1.5'>
                  <Label htmlFor='summary'>文章摘要 *</Label>
                  <Textarea
                    id='summary'
                    rows={4}
                    placeholder='简洁描述文章主要内容，显示在列表卡片和 meta description...'
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                  />
                  <p className='text-[11px] text-muted-foreground'>
                    {field.state.value.length} 字符，建议 80-160 字符
                  </p>
                  <FieldError errors={field.state.meta.errors as string[]} />
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
                    placeholder='教程, Skill 资源, 2025'
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  {field.state.value && (
                    <div className='flex flex-wrap gap-1'>
                      {field.state.value
                        .split(',')
                        .map((t) => t.trim())
                        .filter(Boolean)
                        .map((tag) => (
                          <Badge key={tag} variant='secondary' className='text-[10px]'>
                            {tag}
                          </Badge>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </form.Field>
          </TabsContent>

          {/* ── SEO Tab ── */}
          <TabsContent value='seo' className='space-y-4 mt-4'>
            <div className='rounded-lg border bg-muted/30 p-4 text-xs text-muted-foreground space-y-1'>
              <p className='font-medium text-foreground'>💡 SEO 设置说明</p>
              <p>以下字段用于覆盖默认的页面标题和描述。如不填写，将自动使用文章标题和摘要。</p>
            </div>

            <form.Field name='seo_title'>
              {(field) => (
                <div className='space-y-1.5'>
                  <Label htmlFor='seo_title'>
                    自定义页面标题 <span className='text-muted-foreground font-normal'>(可选)</span>
                  </Label>
                  <Input
                    id='seo_title'
                    placeholder={form.getFieldValue('title') || '留空则使用文章标题'}
                    value={field.state.value ?? ''}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <p className='text-[11px] text-muted-foreground'>
                    {(field.state.value ?? '').length} / 60 字符（建议不超过 60）
                  </p>
                </div>
              )}
            </form.Field>

            <form.Field name='seo_description'>
              {(field) => (
                <div className='space-y-1.5'>
                  <Label htmlFor='seo_desc'>
                    自定义 Meta Description{' '}
                    <span className='text-muted-foreground font-normal'>(可选)</span>
                  </Label>
                  <Textarea
                    id='seo_desc'
                    rows={3}
                    placeholder={form.getFieldValue('summary') || '留空则使用文章摘要'}
                    value={field.state.value ?? ''}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <p className='text-[11px] text-muted-foreground'>
                    {(field.state.value ?? '').length} / 160 字符（建议 80-160）
                  </p>
                </div>
              )}
            </form.Field>

            {/* SEO Preview */}
            <div className='rounded-lg border bg-card p-4 space-y-1.5'>
              <p className='text-xs font-medium text-muted-foreground uppercase tracking-wide'>
                搜索结果预览
              </p>
              <form.Subscribe
                selector={(s) => ({
                  seoTitle: s.values.seo_title || s.values.title,
                  seoDesc: s.values.seo_description || s.values.summary,
                  slug: s.values.slug
                })}
              >
                {({ seoTitle, seoDesc, slug }) => (
                  <div className='rounded-md border bg-background p-3 space-y-0.5'>
                    <p className='text-xs text-blue-600 dark:text-blue-400 font-medium line-clamp-1'>
                      {seoTitle || '文章标题'}
                    </p>
                    <p className='text-[11px] text-emerald-700 dark:text-emerald-400 truncate'>
                      skillhub.example.com/blog/{slug || 'article-slug'}
                    </p>
                    <p className='text-xs text-muted-foreground line-clamp-2'>
                      {seoDesc || '文章摘要将显示在这里...'}
                    </p>
                  </div>
                )}
              </form.Subscribe>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </form>
  );
}
