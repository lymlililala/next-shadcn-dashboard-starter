import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const action = searchParams.get('action');

  if (action === 'stats') {
    const { data, error } = await supabaseAdmin.from('ai_models').select('*');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const all = data ?? [];
    const total = all.length;
    const openSource = all.filter((m) => m.is_open_source).length;
    const multimodal = all.filter((m) => m.multimodal).length;
    const vendors = new Set(all.map((m: { vendor: string }) => m.vendor)).size;
    return NextResponse.json({ total, openSource, multimodal, vendors });
  }

  if (action === 'benchmarks') {
    const { data, error } = await supabaseAdmin.from('benchmarks').select('*').order('id');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  }

  const search = searchParams.get('search') ?? undefined;
  const vendor = searchParams.get('vendor') ?? undefined;
  const is_open_source = searchParams.get('is_open_source');

  let query = supabaseAdmin.from('ai_models').select('*');

  if (vendor && vendor !== 'all') query = query.eq('vendor', vendor);
  if (is_open_source !== null) query = query.eq('is_open_source', is_open_source === 'true');
  if (search)
    query = query.or(
      `name.ilike.%${search}%,description.ilike.%${search}%,vendor.ilike.%${search}%`
    );

  query = query
    .order('is_featured', { ascending: false })
    .order('release_date', { ascending: false });

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { data, error } = await supabaseAdmin.from('ai_models').insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
