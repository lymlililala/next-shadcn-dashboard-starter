import { redirect } from 'next/navigation';

type Props = { params: Promise<{ slug: string }> };

export default async function NewsSlugPage({ params }: Props) {
  const { slug } = await params;
  redirect(`/dashboard/news/${slug}`);
}
