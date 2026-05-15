import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const action = searchParams.get('action');

  if (action === 'stats') {
    const [totalRes, featuredRes] = await Promise.all([
      supabaseAdmin
        .from('skill_tools')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'published'),
      supabaseAdmin
        .from('skill_tools')
        .select('*', { count: 'exact', head: true })
        .eq('is_featured', true)
        .eq('status', 'published')
    ]);
    if (totalRes.error)
      return NextResponse.json({ error: totalRes.error.message }, { status: 500 });

    // 分类统计 — 用 count:exact 分别查，避免 1000 行截断
    const KNOWN_CATEGORIES = [
      '开发工具',
      '效率与协作',
      '中文平台',
      '内容生成',
      'AI Agent',
      '网页与浏览器',
      '邮件与通信',
      '安全与审计',
      '工具与运维'
    ];
    const catResults = await Promise.all(
      KNOWN_CATEGORIES.map((cat) =>
        supabaseAdmin
          .from('skill_tools')
          .select('*', { count: 'exact', head: true })
          .eq('category', cat)
          .eq('status', 'published')
      )
    );
    const byCategory = Object.fromEntries(
      KNOWN_CATEGORIES.map((cat, i) => [cat, catResults[i].count ?? 0])
    );

    return NextResponse.json({
      total: totalRes.count ?? 0,
      featured: featuredRes.count ?? 0,
      byCategory
    });
  }

  if (action === 'featured') {
    const { data, error } = await supabaseAdmin
      .from('skill_tools')
      .select('*')
      .eq('is_featured', true)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(8);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  }

  const page = Number(searchParams.get('page') ?? 1);
  const limit = Number(searchParams.get('limit') ?? 24);
  const search = searchParams.get('search') ?? undefined;
  const category = searchParams.get('category') ?? undefined;
  const status = searchParams.get('status') ?? 'published';

  let query = supabaseAdmin.from('skill_tools').select('*', { count: 'exact' });

  if (status && status !== 'all') query = query.eq('status', status);
  if (category && category !== 'all') query = query.eq('category', category);
  if (search) query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);

  query = query
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false });

  const { data, count, error } = await query.range((page - 1) * limit, page * limit - 1);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ items: data ?? [], total_items: count ?? 0 });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { data, error } = await supabaseAdmin
    .from('skill_tools')
    .insert({ ...body, created_at: new Date().toISOString() })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
