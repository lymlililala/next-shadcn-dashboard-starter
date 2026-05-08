import { redirect } from 'next/navigation';

type Props = { params: Promise<{ slug: string }> };

// /blog/[slug] has been replaced by /news/[slug]
export default async function BlogSlugPage({ params }: Props) {
  const { slug } = await params;
  redirect(`/news/${slug}`);
}
