'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Icons } from '@/components/icons';
import { toast } from 'sonner';
import type { SeoConfig } from '@/features/seo/api/service';

type Props = { initialConfig: SeoConfig };

export function SeoConfigForm({ initialConfig }: Props) {
  const [siteName, setSiteName] = useState(initialConfig.site_name);
  const [siteDescription, setSiteDescription] = useState(initialConfig.site_description);
  const [keywords, setKeywords] = useState(initialConfig.site_keywords.join(', '));
  const [ogImage, setOgImage] = useState(initialConfig.og_image ?? '');
  const [twitterHandle, setTwitterHandle] = useState(initialConfig.twitter_handle ?? '');
  const [isPending, startTransition] = useTransition();

  function handleSave() {
    startTransition(async () => {
      try {
        const { updateSeoConfig } = await import('@/features/seo/api/service');
        await updateSeoConfig({
          site_name: siteName,
          site_description: siteDescription,
          site_keywords: keywords
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean),
          og_image: ogImage || undefined,
          twitter_handle: twitterHandle || undefined
        });
        toast.success('全局 SEO 配置已保存');
      } catch {
        toast.error('保存失败，请重试');
      }
    });
  }

  return (
    <div className='rounded-xl border bg-card p-5 shadow-sm'>
      <div className='grid gap-5 sm:grid-cols-2'>
        {/* Site name */}
        <div className='space-y-1.5'>
          <Label htmlFor='site-name' className='text-xs font-medium'>
            网站名称
          </Label>
          <Input
            id='site-name'
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
            placeholder='AI Skill Navigation'
            className='h-8 text-sm'
          />
          <p className='text-[11px] text-muted-foreground'>出现在浏览器标签和 OG 分享中</p>
        </div>

        {/* OG Image */}
        <div className='space-y-1.5'>
          <Label htmlFor='og-image' className='text-xs font-medium'>
            OG 图片 URL
          </Label>
          <Input
            id='og-image'
            value={ogImage}
            onChange={(e) => setOgImage(e.target.value)}
            placeholder='https://aiskillnav.com/og-image.png'
            className='h-8 text-sm'
          />
          <p className='text-[11px] text-muted-foreground'>社交媒体分享时显示的预览图</p>
        </div>

        {/* Site description */}
        <div className='space-y-1.5 sm:col-span-2'>
          <Label htmlFor='site-desc' className='text-xs font-medium'>
            网站描述
          </Label>
          <Textarea
            id='site-desc'
            value={siteDescription}
            onChange={(e) => setSiteDescription(e.target.value)}
            placeholder='一站式 AI Agent 工具导航...'
            rows={2}
            className='resize-none text-sm'
          />
          <p className='text-[11px] text-muted-foreground'>
            建议 50–160 字，出现在搜索结果摘要中。当前：{siteDescription.length} 字
          </p>
        </div>

        {/* Keywords */}
        <div className='space-y-1.5 sm:col-span-2'>
          <Label htmlFor='keywords' className='text-xs font-medium'>
            全局关键词
            <span className='ml-1.5 text-muted-foreground'>(逗号分隔)</span>
          </Label>
          <Textarea
            id='keywords'
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder='AI Agent, MCP Server, AI 工具导航, 大模型...'
            rows={3}
            className='resize-none font-mono text-xs'
          />
          <div className='flex items-center justify-between'>
            <p className='text-[11px] text-muted-foreground'>
              当前 {keywords.split(',').filter((k) => k.trim()).length} 个关键词
            </p>
            {/* Tag preview */}
            <div className='flex flex-wrap gap-1 justify-end'>
              {keywords
                .split(',')
                .filter((k) => k.trim())
                .slice(0, 5)
                .map((k, i) => (
                  <span
                    key={i}
                    className='rounded bg-muted/50 border px-1.5 py-0.5 text-[10px] text-muted-foreground'
                  >
                    {k.trim()}
                  </span>
                ))}
              {keywords.split(',').filter((k) => k.trim()).length > 5 && (
                <span className='rounded bg-muted/50 border px-1.5 py-0.5 text-[10px] text-muted-foreground'>
                  +{keywords.split(',').filter((k) => k.trim()).length - 5}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Twitter */}
        <div className='space-y-1.5'>
          <Label htmlFor='twitter' className='text-xs font-medium'>
            Twitter Handle
          </Label>
          <Input
            id='twitter'
            value={twitterHandle}
            onChange={(e) => setTwitterHandle(e.target.value)}
            placeholder='@aiskillnav'
            className='h-8 text-sm'
          />
        </div>
      </div>

      <div className='mt-5 flex items-center justify-between border-t pt-4'>
        <p className='text-[11px] text-muted-foreground'>
          最后更新：{new Date(initialConfig.updated_at).toLocaleString('zh-CN')}
        </p>
        <Button size='sm' onClick={handleSave} isLoading={isPending}>
          <Icons.checks className='mr-1.5 h-3.5 w-3.5' />
          保存配置
        </Button>
      </div>
    </div>
  );
}
