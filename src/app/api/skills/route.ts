import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const action = searchParams.get('action');

  // GET /api/skills?action=stats
  if (action === 'stats') {
    const { data, error } = await supabaseAdmin.from('skills').select('*');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const all = data ?? [];
    const total = all.length;
    const featured = all.filter((s) => s.is_featured).length;
    const pending = all.filter((s) => s.status === 'pending').length;
    const rejected = all.filter((s) => s.status === 'rejected').length;
    const byPlatform = all.reduce((acc: Record<string, number>, s) => {
      acc[s.platform] = (acc[s.platform] ?? 0) + 1;
      return acc;
    }, {});
    const byRegion = all.reduce((acc: Record<string, number>, s) => {
      acc[s.region] = (acc[s.region] ?? 0) + 1;
      return acc;
    }, {});
    return NextResponse.json({ total, featured, pending, rejected, byPlatform, byRegion });
  }

  // GET /api/skills?action=featured
  if (action === 'featured') {
    const { data, error } = await supabaseAdmin
      .from('skills')
      .select('*')
      .eq('is_featured', true)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(10);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  }

  // GET /api/skills — list with filters
  const page = Number(searchParams.get('page') ?? 1);
  const limit = Number(searchParams.get('limit') ?? 20);
  const search = searchParams.get('search') ?? undefined;
  const platform = searchParams.get('platform') ?? undefined;
  const region = searchParams.get('region') ?? undefined;
  const status = searchParams.get('status') ?? 'published';
  const sort = searchParams.get('sort') ?? undefined;

  let query = supabaseAdmin.from('skills').select('*', { count: 'exact' });

  if (status && status !== 'all') query = query.eq('status', status);
  if (platform && platform !== 'all') query = query.eq('platform', platform);
  if (region && region !== 'all') query = query.eq('region', region);
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
  const { data, error } = await supabaseAdmin.from('skills').insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
