import { permanentRedirect } from 'next/navigation';

type Props = { params: Promise<{ slug: string }> };

export default async function TutorialDetailRedirect({ params }: Props) {
  const { slug } = await params;
  permanentRedirect(`/tutorials/${slug}`);
}
