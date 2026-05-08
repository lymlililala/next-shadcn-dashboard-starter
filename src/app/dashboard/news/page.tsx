import { permanentRedirect } from 'next/navigation';
import type { SearchParams } from 'nuqs/server';

type PageProps = { searchParams: Promise<SearchParams> };

export default async function NewsPageRedirect({ searchParams }: PageProps) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  if (params.category && typeof params.category === 'string') qs.set('category', params.category);
  if (params.page && typeof params.page === 'string') qs.set('page', params.page);
  const query = qs.toString() ? `?${qs.toString()}` : '';
  permanentRedirect(`/news${query}`);
}
