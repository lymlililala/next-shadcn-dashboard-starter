import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const action = searchParams.get('action');

  if (action === 'stats') {
    const { data, error } = await supabaseAdmin.from('tutorials').select('*');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const all = data ?? [];
    const total = all.length;
    const featured = all.filter((t) => t.is_featured).length;
    const byLevel = all.reduce((acc: Record<string, number>, t) => {
      acc[t.level] = (acc[t.level] ?? 0) + 1;
      return acc;
    }, {});
    const byCategory = all.reduce((acc: Record<string, number>, t) => {
      acc[t.category] = (acc[t.category] ?? 0) + 1;
      return acc;
    }, {});
    return NextResponse.json({ total, featured, byLevel, byCategory });
  }

  if (action === 'featured') {
    const { data, error } = await supabaseAdmin
      .from('tutorials')
      .select('*')
      .eq('is_featured', true)
      .order('published_at', { ascending: false })
      .limit(6);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  }

  const search = searchParams.get('search') ?? undefined;
  const level = searchParams.get('level') ?? undefined;
  const category = searchParams.get('category') ?? undefined;
  const slug = searchParams.get('slug') ?? undefined;

  if (slug) {
    const { data, error } = await supabaseAdmin
      .from('tutorials')
      .select('*')
      .eq('slug', slug)
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 404 });
    return NextResponse.json(data);
  }

  let query = supabaseAdmin.from('tutorials').select('*');

  if (level && level !== 'all') query = query.eq('level', level);
  if (category && category !== 'all') query = query.eq('category', category);
  if (search) query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%`);

  query = query
    .order('is_featured', { ascending: false })
    .order('published_at', { ascending: false });

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { data, error } = await supabaseAdmin.from('tutorials').insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
