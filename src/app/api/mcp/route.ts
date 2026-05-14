import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const action = searchParams.get('action');

  if (action === 'stats') {
    const KNOWN_CATEGORIES = [
      'utility',
      'devtools',
      'productivity',
      'data',
      'database',
      'cloud',
      'automation',
      'browser',
      'monitoring',
      'location',
      'filesystem',
      'search',
      'ai',
      'knowledge',
      'finance',
      'memory',
      'reasoning'
    ];

    // 所有 count 查询并发执行，避免 select('*') 被 Supabase 默认 1000 行截断
    const [totalRes, officialRes, featuredRes, ...catResults] = await Promise.all([
      supabaseAdmin.from('mcp_servers').select('*', { count: 'exact', head: true }),
      supabaseAdmin
        .from('mcp_servers')
        .select('*', { count: 'exact', head: true })
        .eq('is_official', true),
      supabaseAdmin
        .from('mcp_servers')
        .select('*', { count: 'exact', head: true })
        .eq('is_featured', true),
      ...KNOWN_CATEGORIES.map((cat) =>
        supabaseAdmin
          .from('mcp_servers')
          .select('*', { count: 'exact', head: true })
          .eq('category', cat)
      )
    ]);

    if (totalRes.error)
      return NextResponse.json({ error: totalRes.error.message }, { status: 500 });

    const byCategory = Object.fromEntries(
      KNOWN_CATEGORIES.map((cat, i) => [cat, catResults[i].count ?? 0])
    );

    return NextResponse.json({
      total: totalRes.count ?? 0,
      official: officialRes.count ?? 0,
      featured: featuredRes.count ?? 0,
      byCategory
    });
  }

  // 调试：分页聚合查询数据库中所有 category 值及数量（绕过 1000 行限制）
  if (action === 'categories') {
    const PAGE = 1000;
    const counts: Record<string, number> = {};
    let offset = 0;
    let total = Infinity;
    while (offset < total) {
      const { data, count, error } = await supabaseAdmin
        .from('mcp_servers')
        .select('category', { count: 'exact' })
        .range(offset, offset + PAGE - 1);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      total = count ?? 0;
      for (const row of data ?? []) {
        const key = (row.category as string | null) ?? '__null__';
        counts[key] = (counts[key] ?? 0) + 1;
      }
      offset += PAGE;
    }
    return NextResponse.json({
      total,
      distribution: Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .map(([cat, n]) => ({ category: cat, count: n }))
    });
  }

  if (action === 'featured') {
    const { data, error } = await supabaseAdmin
      .from('mcp_servers')
      .select('*')
      .eq('is_featured', true)
      .order('stars', { ascending: false })
      .limit(8);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  }

  // slug lookup
  const slug = searchParams.get('slug');
  if (slug) {
    const { data, error } = await supabaseAdmin
      .from('mcp_servers')
      .select('*')
      .eq('slug', slug)
      .single();
    if (error) return NextResponse.json(null, { status: 404 });
    return NextResponse.json(data);
  }

  const page = Number(searchParams.get('page') ?? 1);
  const limit = Number(searchParams.get('limit') ?? 50);
  const search = searchParams.get('search') ?? undefined;
  const category = searchParams.get('category') ?? undefined;
  const is_official = searchParams.get('is_official');

  let query = supabaseAdmin.from('mcp_servers').select('*', { count: 'exact' });

  if (category && category !== 'all') query = query.eq('category', category);
  if (is_official !== null && is_official !== undefined)
    query = query.eq('is_official', is_official === 'true');
  if (search) query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);

  query = query.order('is_featured', { ascending: false }).order('stars', { ascending: false });

  const { data, count, error } = await query.range((page - 1) * limit, page * limit - 1);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ items: data ?? [], total_items: count ?? 0 });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { data, error } = await supabaseAdmin
    .from('mcp_servers')
    .insert({ ...body, created_at: new Date().toISOString() })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
