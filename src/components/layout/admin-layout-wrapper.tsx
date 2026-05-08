'use client';

import { usePathname } from 'next/navigation';
import { AdminSidebar } from './admin-sidebar';

/** 管理后台布局包裹器：登录页不渲染侧边栏 */
export function AdminLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === '/admin/login';

  if (isLoginPage) {
    return <div className='min-h-screen bg-background'>{children}</div>;
  }

  return (
    <div className='flex min-h-screen bg-background'>
      <AdminSidebar />
      <div className='flex flex-1 flex-col min-w-0'>{children}</div>
    </div>
  );
}
