import { supabaseAdmin } from '@/lib/supabase';
import { fakeSeoConfig } from '@/constants/mock-api-seo';
import { NextRequest, NextResponse } from 'next/server';
import type { SeoConfig, PageSeo } from '@/constants/mock-api-seo';

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('seo_config')
      .select('*')
      .order('id')
      .limit(1)
      .single();
    if (error || !data) return NextResponse.json(fakeSeoConfig.get());

    const config: SeoConfig = {
      site_name: data.site_name,
      site_description: data.site_description ?? '',
      site_keywords: data.site_keywords ?? [],
      og_image: data.og_image,
      twitter_handle: data.twitter_handle,
      pages: (data.pages as Record<string, PageSeo>) ?? {},
      updated_at: data.updated_at
    };
    return NextResponse.json(config);
  } catch {
    return NextResponse.json(fakeSeoConfig.get());
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const partial = (await request.json()) as Partial<SeoConfig>;
    const getRes = await fetch(new URL('/api/seo', request.url));
    const current = (await getRes.json()) as SeoConfig;
    const updated = { ...current, ...partial, updated_at: new Date().toISOString() };

    const { error } = await supabaseAdmin.from('seo_config').upsert({
      id: 1,
      site_name: updated.site_name,
      site_description: updated.site_description,
      site_keywords: updated.site_keywords,
      og_image: updated.og_image,
      twitter_handle: updated.twitter_handle,
      pages: updated.pages,
      updated_at: updated.updated_at
    });

    if (error) return NextResponse.json(fakeSeoConfig.update(partial));
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Failed to update SEO config' }, { status: 500 });
  }
}
