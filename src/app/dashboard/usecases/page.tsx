import { permanentRedirect } from 'next/navigation';
import type { SearchParams } from 'nuqs/server';

type PageProps = { searchParams: Promise<SearchParams> };

export default async function UsecasesPageRedirect({ searchParams }: PageProps) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  if (params.industry && typeof params.industry === 'string') qs.set('industry', params.industry);
  if (params.diff && typeof params.diff === 'string') qs.set('diff', params.diff);
  const query = qs.toString() ? `?${qs.toString()}` : '';
  permanentRedirect(`/usecases${query}`);
}
