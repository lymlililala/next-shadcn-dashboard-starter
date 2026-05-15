'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from '@/components/icons';
import { ThemeSelector } from '@/components/themes/theme-selector';
import { ThemeModeToggle } from '@/components/themes/theme-mode-toggle';

const NAV_LINKS = [
  { label: 'Skills', href: '/skills' },
  { label: 'Agents', href: '/agents' },
  { label: 'MCP', href: '/mcp' },
  { label: '模型', href: '/models' },
  { label: 'News', href: '/news' }
];

export function HomeNavbar() {
  const pathname = usePathname();

  return (
    <nav className='sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-6'>
        <Link
          href='/'
          className='flex items-center gap-2.5 font-semibold hover:opacity-80 transition-opacity'
        >
          <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground'>
            <Icons.skillsHub className='h-4 w-4' />
          </div>
          <span className='text-sm font-semibold'>AI Skill Navigation</span>
        </Link>

        <div className='flex items-center gap-0.5'>
          {NAV_LINKS.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  'relative hidden rounded-md px-3.5 py-1.5 text-sm font-medium transition-all duration-150 sm:block',
                  'after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:-translate-x-1/2 after:rounded-full after:bg-primary after:transition-all after:duration-150',
                  isActive
                    ? 'text-foreground after:w-4/5'
                    : 'text-muted-foreground/80 hover:bg-accent/60 hover:text-foreground after:w-0 hover:after:w-3/5'
                ].join(' ')}
              >
                {item.label}
              </Link>
            );
          })}

          {/* Theme controls */}
          <div className='ml-2 flex items-center gap-1 border-l pl-2'>
            <ThemeModeToggle />
            <div className='hidden sm:block'>
              <ThemeSelector />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
