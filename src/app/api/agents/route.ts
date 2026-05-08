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
  const status = searchParams.get('status') ?? 'published';
  const sort = searchParams.get('sort') ?? undefined;

  let query = supabaseAdmin.from('agents').select('*', { count: 'exact' });

  if (status && status !== 'all') query = query.eq('status', status);
  if (agent_type && agent_type !== 'all') query = query.eq('agent_type', agent_type);
  if (open_source && open_source !== 'all') query = query.eq('open_source', open_source);
  if (search) query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);

  if (sort) {
    try {
      const s = JSON.parse(sort) as { id: string; desc: boolean }[];
      if (s.length > 0) query = query.order(s[0].id, { ascending: !s[0].desc });
    } catch {
      /* ignore */
    }
  } else {
    query = query
      .order('is_featured', { ascending: false })
      .order('created_at', { ascending: false });
  }

  const { data, count, error } = await query.range((page - 1) * limit, page * limit - 1);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ items: data ?? [], total_items: count ?? 0 });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { data, error } = await supabaseAdmin.from('agents').insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
