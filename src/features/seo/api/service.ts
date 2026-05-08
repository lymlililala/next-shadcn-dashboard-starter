import { supabaseAdmin } from '@/lib/supabase';
import { fakeSeoConfig } from '@/constants/mock-api-seo';
import type { SeoConfig, PageSeo } from '@/constants/mock-api-seo';

export type { SeoConfig, PageSeo };

/** 从 Supabase 获取 SEO 配置，如果表不存在则回退到 mock */
export async function getSeoConfig(): Promise<SeoConfig> {
  try {
    const { data, error } = await supabaseAdmin
      .from('seo_config')
      .select('*')
      .order('id')
      .limit(1)
      .single();
    if (error || !data) return fakeSeoConfig.get();

    return {
      site_name: data.site_name,
      site_description: data.site_description ?? '',
      site_keywords: data.site_keywords ?? [],
      og_image: data.og_image,
      twitter_handle: data.twitter_handle,
      pages: (data.pages as Record<string, PageSeo>) ?? {},
      updated_at: data.updated_at
    };
  } catch {
    return fakeSeoConfig.get();
  }
}

export async function updateSeoConfig(partial: Partial<SeoConfig>): Promise<SeoConfig> {
  try {
    const current = await getSeoConfig();
    const updated = { ...current, ...partial, updated_at: new Date().toISOString() };

    const { data, error } = await supabaseAdmin
      .from('seo_config')
      .upsert({
        id: 1,
        site_name: updated.site_name,
        site_description: updated.site_description,
        site_keywords: updated.site_keywords,
        og_image: updated.og_image,
        twitter_handle: updated.twitter_handle,
        pages: updated.pages,
        updated_at: updated.updated_at
      })
      .select()
      .single();

    if (error || !data) return fakeSeoConfig.update(partial);
    return updated;
  } catch {
    return fakeSeoConfig.update(partial);
  }
}

export async function updatePageSeo(path: string, pageSeo: PageSeo): Promise<SeoConfig> {
  const current = await getSeoConfig();
  const pages = { ...current.pages, [path]: pageSeo };
  return updateSeoConfig({ pages });
}

export async function deletePageSeo(path: string): Promise<SeoConfig> {
  const current = await getSeoConfig();
  const pages = { ...current.pages };
  delete pages[path];
  return updateSeoConfig({ pages });
}

const BASE_URL = 'https://aiskillnav.com';

/** 获取某个路径的完整 SEO 元数据（合并全局 + 页面覆盖，含 OG / Twitter / canonical） */
export async function resolvePageMeta(path: string): Promise<{
  title: string;
  description: string;
  keywords: string[];
  canonical: string;
  openGraph: {
    title: string;
    description: string;
    url: string;
    type: 'website';
    siteName: string;
    locale: string;
    images: { url: string; width: number; height: number; alt: string }[];
  };
  twitter: {
    card: 'summary_large_image';
    title: string;
    description: string;
    images: string[];
  };
}> {
  const cfg = await getSeoConfig();
  const page = cfg.pages[path];
  const title = page?.title ?? cfg.site_name;
  const description = page?.description ?? cfg.site_description;
  const keywords = [...cfg.site_keywords, ...(page?.keywords ?? [])];
  const ogImage = cfg.og_image ?? `${BASE_URL}/og-image.png`;
  const canonicalUrl = `${BASE_URL}${path}`;

  return {
    title,
    description,
    keywords,
    canonical: canonicalUrl,
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      siteName: cfg.site_name,
      locale: 'zh_CN',
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage]
    }
  };
}
