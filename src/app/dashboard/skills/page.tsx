import { permanentRedirect } from 'next/navigation';
import type { SearchParams } from 'nuqs/server';

type PageProps = { searchParams: Promise<SearchParams> };

export default async function SkillsPageRedirect({ searchParams }: PageProps) {
  const params = await searchParams;
  const qs = new URLSearchParams(
    Object.fromEntries(
      Object.entries(params).filter(([, v]) => typeof v === 'string') as [string, string][]
    )
  );
  const query = qs.toString() ? `?${qs.toString()}` : '';
  permanentRedirect(`/skills${query}`);
}
