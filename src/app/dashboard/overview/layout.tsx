import { redirect } from 'next/navigation';

// Overview 页面已合并到管理后台，重定向到 /admin/analytics
// Accept parallel route slots to satisfy Next.js App Router
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function OverViewLayout(_props: {
  children?: React.ReactNode;
  sales?: React.ReactNode;
  pie_stats?: React.ReactNode;
  bar_stats?: React.ReactNode;
  area_stats?: React.ReactNode;
}) {
  redirect('/admin/analytics');
}
