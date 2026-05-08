import { permanentRedirect } from 'next/navigation';
import type { SearchParams } from 'nuqs/server';

type PageProps = { searchParams: Promise<SearchParams> };

export default async function McpPageRedirect({ searchParams }: PageProps) {
  const params = await searchParams;
  const qs = new URLSearchParams();
  if (params.mcp_cat && typeof params.mcp_cat === 'string') qs.set('mcp_cat', params.mcp_cat);
  const query = qs.toString() ? `?${qs.toString()}` : '';
  permanentRedirect(`/mcp${query}`);
}
