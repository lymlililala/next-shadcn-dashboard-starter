import { redirect } from 'next/navigation';

// /blog has been replaced by /news
export default function BlogPage() {
  redirect('/news');
}
