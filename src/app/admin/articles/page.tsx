import { redirect } from 'next/navigation';

// /admin/articles has been replaced by /admin/news
export default function AdminArticlesPage() {
  redirect('/admin/news');
}
