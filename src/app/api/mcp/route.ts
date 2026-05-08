import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const action = searchParams.get('action');

  if (action === 'stats') {
    const { data, error } = await supabaseAdmin.from('mcp_servers').select('*');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const all = data ?? [];
    const total = all.length;
    const official = all.filter((m) => m.is_official).length;
    const featured = all.filter((m) => m.is_featured).length;
    const byCategory = all.reduce((acc: Record<string, number>, m) => {
      acc[m.category] = (acc[m.category] ?? 0) + 1;
      return acc;
    }, {});
    return NextResponse.json({ total, official, featured, byCategory });
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
  if (is_official !== null) query = query.eq('is_official', is_official === 'true');
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
