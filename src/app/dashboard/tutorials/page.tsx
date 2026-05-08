import { permanentRedirect } from 'next/navigation';
import type { SearchParams } from 'nuqs/server';

type PageProps = { searchParams: Promise<SearchParams> };

export default async function TutorialsPageRedirect({ searchParams }: PageProps) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  if (params.level && typeof params.level === 'string') qs.set('level', params.level);
  if (params.tut_cat && typeof params.tut_cat === 'string') qs.set('tut_cat', params.tut_cat);
  const query = qs.toString() ? `?${qs.toString()}` : '';
  permanentRedirect(`/tutorials${query}`);
}
