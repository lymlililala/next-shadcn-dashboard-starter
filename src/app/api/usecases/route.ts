import { supabaseAdmin } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const action = searchParams.get('action');

  if (action === 'stats') {
    const { data, error } = await supabaseAdmin.from('use_cases').select('*');
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    const all = data ?? [];
    const total = all.length;
    const featured = all.filter((u) => u.is_featured).length;
    const byIndustry = all.reduce((acc: Record<string, number>, u) => {
      acc[u.industry] = (acc[u.industry] ?? 0) + 1;
      return acc;
    }, {});
    return NextResponse.json({ total, featured, byIndustry });
  }

  if (action === 'featured') {
    const { data, error } = await supabaseAdmin
      .from('use_cases')
      .select('*')
      .eq('is_featured', true)
      .order('id')
      .limit(6);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  }

  const search = searchParams.get('search') ?? undefined;
  const industry = searchParams.get('industry') ?? undefined;
  const difficulty = searchParams.get('difficulty') ?? undefined;

  let query = supabaseAdmin.from('use_cases').select('*');

  if (industry && industry !== 'all') query = query.eq('industry', industry);
  if (difficulty && Number(difficulty) > 0) query = query.eq('difficulty', Number(difficulty));
  if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);

  query = query.order('is_featured', { ascending: false }).order('id', { ascending: true });

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { data, error } = await supabaseAdmin.from('use_cases').insert(body).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
