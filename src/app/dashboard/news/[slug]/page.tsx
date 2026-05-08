import { permanentRedirect } from 'next/navigation';

type Props = { params: Promise<{ slug: string }> };

export default async function NewsDetailRedirect({ params }: Props) {
  const { slug } = await params;
  permanentRedirect(`/news/${slug}`);
}
