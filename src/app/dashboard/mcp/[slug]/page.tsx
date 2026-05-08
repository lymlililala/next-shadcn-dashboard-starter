import { permanentRedirect } from 'next/navigation';

type Props = { params: Promise<{ slug: string }> };

export default async function McpDetailRedirect({ params }: Props) {
  const { slug } = await params;
  permanentRedirect(`/mcp/${slug}`);
}
