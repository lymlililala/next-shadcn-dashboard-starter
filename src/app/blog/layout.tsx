import type { Metadata } from 'next';
import Link from 'next/link';
import { Icons } from '@/components/icons';

export const metadata: Metadata = {
  title: {
    template: '%s | AI Skill Navigation Blog',
    default: 'Blog | AI Skill Navigation'
  },
  description: 'aiskillnav.com · 最新文章、教程与资讯'
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='min-h-screen bg-background'>
      {/* Blog header */}
      <header className='sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
        <div className='mx-auto flex h-14 max-w-4xl items-center justify-between px-4 md:px-6'>
          <Link
            href='/blog'
            className='flex items-center gap-2 text-sm font-semibold hover:text-primary transition-colors'
          >
            <Icons.post className='h-4 w-4' />
            <span>AI Skill Navigation Blog</span>
          </Link>
          <nav className='flex items-center gap-1'>
            <Link
              href='/dashboard/skills'
              className='flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground hover:bg-accent'
            >
              <Icons.skillsHub className='h-3.5 w-3.5' />
              Skills 导航
            </Link>
          </nav>
        </div>
      </header>

      <main className='mx-auto max-w-4xl px-4 py-8 md:px-6 md:py-12'>{children}</main>

      {/* Blog footer */}
      <footer className='border-t py-8'>
        <div className='mx-auto max-w-4xl px-4 text-center md:px-6'>
          <p className='text-xs text-muted-foreground'>
            © {new Date().getFullYear()} AI Skill Navigation · aiskillnav.com
          </p>
        </div>
      </footer>
    </div>
  );
}
