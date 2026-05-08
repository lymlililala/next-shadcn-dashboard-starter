import type { Metadata } from 'next';
import { AdminLayoutWrapper } from '@/components/layout/admin-layout-wrapper';

export const metadata: Metadata = {
  title: {
    default: 'AI Skill Navigation 管理后台',
    template: '%s | AI Skill Navigation 管理后台'
  },
  description: 'AI Skill Navigation 内容管理系统',
  robots: { index: false, follow: false }
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutWrapper>{children}</AdminLayoutWrapper>;
}
