import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const action = searchParams.get('action');

  if (action === 'stats') {
    const { data, error } = await supabaseAdmin.from('news').select('*');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const all = data ?? [];
    const published = all.filter((n) => n.status === 'published').length;
    const draft = all.filter((n) => n.status === 'draft').length;
    const featured = all.filter((n) => n.is_featured && n.status === 'published').length;
    const byCategory = all
      .filter((n) => n.status === 'published')
      .reduce((acc: Record<string, number>, n) => {
        acc[n.category] = (acc[n.category] ?? 0) + 1;
        return acc;
      }, {});
    return NextResponse.json({ published, draft, featured, byCategory });
  }

  if (action === 'featured') {
    const { data, error } = await supabaseAdmin
      .from('news')
      .select('*')
      .eq('is_featured', true)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(6);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  }

  if (action === 'categories') {
    const { data, error } = await supabaseAdmin
      .from('news')
      .select('category')
      .eq('status', 'published');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const cats = Array.from(
      new Set((data ?? []).map((r: { category: string }) => r.category))
    ).sort();
    return NextResponse.json(cats);
  }

  const page = Number(searchParams.get('page') ?? 1);
  const limit = Number(searchParams.get('limit') ?? 10);
  const search = searchParams.get('search') ?? undefined;
  const category = searchParams.get('category') ?? undefined;
  const status = searchParams.get('status') ?? undefined;
  const sort = searchParams.get('sort') ?? undefined;

  let query = supabaseAdmin.from('news').select('*', { count: 'exact' });

  if (status && status !== 'all') query = query.eq('status', status);
  if (category && category !== 'all') query = query.eq('category', category);
  if (search)
    query = query.or(
      `title.ilike.%${search}%,summary.ilike.%${search}%,source_name.ilike.%${search}%`
    );

  if (sort) {
    try {
      const s = JSON.parse(sort) as { id: string; desc: boolean }[];
      if (s.length > 0) query = query.order(s[0].id, { ascending: !s[0].desc });
    } catch {
      /* ignore */
    }
  } else {
    query = query.order('published_at', { ascending: false });
  }

  const { data, count, error } = await query.range((page - 1) * limit, page * limit - 1);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ items: data ?? [], total_items: count ?? 0 });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const now = new Date().toISOString();
  const { data, error } = await supabaseAdmin
    .from('news')
    .insert({ ...body, created_at: now, updated_at: now })
    .select()
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
