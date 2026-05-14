import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const action = searchParams.get('action');

  if (action === 'stats') {
    const { data, error } = await supabaseAdmin.from('agents').select('*');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const all = data ?? [];
    const total = all.length;
    const featured = all.filter((a) => a.is_featured).length;
    const pending = all.filter((a) => a.status === 'pending').length;
    const rejected = all.filter((a) => a.status === 'rejected').length;
    const openCount = all.filter((a) => a.open_source === 'open').length;
    const byType = all.reduce((acc: Record<string, number>, a) => {
      acc[a.agent_type] = (acc[a.agent_type] ?? 0) + 1;
      return acc;
    }, {});
    return NextResponse.json({ total, featured, pending, rejected, openCount, byType });
  }

  if (action === 'featured') {
    const { data, error } = await supabaseAdmin
      .from('agents')
      .select('*')
      .eq('is_featured', true)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(8);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  }

  const page = Number(searchParams.get('page') ?? 1);
  const limit = Number(searchParams.get('limit') ?? 20);
  const search = searchParams.get('search') ?? undefined;
  const agent_type = searchParams.get('agent_type') ?? undefined;
  const open_source = searchParams.get('open_source') ?? undefined;
  const url_group = searchParams.get('url_group') ?? undefined;
  const status = searchParams.get('status') ?? 'published';
  const sort = searchParams.get('sort') ?? undefined;

  let query = supabaseAdmin.from('agents').select('*', { count: 'exact' });

  if (status && status !== 'all') query = query.eq('status', status);
  if (agent_type && agent_type !== 'all') query = query.eq('agent_type', agent_type);
  if (open_source && open_source !== 'all') query = query.eq('open_source', open_source);
  if (url_group) query = query.eq('url_group', Number(url_group));
  if (search) query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);

  if (sort) {
    try {
      const s = JSON.parse(sort) as { id: string; desc: boolean }[];
      if (s.length > 0) query = query.order(s[0].id, { ascending: !s[0].desc });
    } catch {
      /* ignore */
    }
  } else {
    // 先按 url_group 分组（1=应用产品 2=开源项目 3=内测），再按精选和时间排序
    // url_group 是数据库生成列，需先在 Supabase SQL Editor 执行：
    //   ALTER TABLE agents ADD COLUMN IF NOT EXISTS url_group integer
    //     GENERATED ALWAYS AS (
    //       CASE WHEN url = '#' THEN 3
    //            WHEN url LIKE '%github.com%' THEN 2
    //            ELSE 1 END
    //     ) STORED;
    query = query
      .order('url_group', { ascending: true })
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });
  }

  const { data, count, error } = await query.range((page - 1) * limit, page * limit - 1);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 统计各分组真实总数（与筛选条件一致，但不受分页影响）
  // 应用产品 = url 不含 github.com 且不为 #
  // 开源项目 = url 含 github.com
  // 内测中   = url = '#'
  const allItems = data ?? [];
  const appCount = allItems.filter(
    (a: { url: string }) => !a.url.includes('github.com') && a.url !== '#'
  ).length;
  const githubCount = allItems.filter((a: { url: string }) => a.url.includes('github.com')).length;
  const innerCount = allItems.filter((a: { url: string }) => a.url === '#').length;

  // 如果当前页包含全部数据（total_items <= limit），直接用本页统计
  // 否则需要全量查询（仅在非分组筛选时才有意义）
  let group_counts = { app: appCount, github: githubCount, inner: innerCount };

  if ((count ?? 0) > limit) {
    // 全量查询，只取 url 字段以节省带宽
    let countQuery = supabaseAdmin.from('agents').select('url', { count: 'exact', head: false });
    if (status && status !== 'all') countQuery = countQuery.eq('status', status);
    if (agent_type && agent_type !== 'all') countQuery = countQuery.eq('agent_type', agent_type);
    if (open_source && open_source !== 'all')
      countQuery = countQuery.eq('open_source', open_source);
    if (search) countQuery = countQuery.or(`name.ilike.%${search}%,description.ilike.%${search}%`);

    const { data: allData } = await countQuery;
    if (allData) {
      group_counts = {
        app: allData.filter((a: { url: string }) => !a.url.includes('github.com') && a.url !== '#')
          .length,
        github: allData.filter((a: { url: string }) => a.url.includes('github.com')).length,
        inner: allData.filter((a: { url: string }) => a.url === '#').length
      };
    }
  }

  return NextResponse.json({ items: data ?? [], total_items: count ?? 0, group_counts });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { data, error } = await supabaseAdmin.from('agents').insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
