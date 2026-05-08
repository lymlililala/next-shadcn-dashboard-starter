'use client';

import Link from 'next/link';
import { Icons } from '@/components/icons';
import { ThemeSelector } from '@/components/themes/theme-selector';
import { ThemeModeToggle } from '@/components/themes/theme-mode-toggle';

const NAV_LINKS = [
  { label: 'Skills', href: '/dashboard/skills' },
  { label: 'Agents', href: '/dashboard/agents' },
  { label: 'MCP', href: '/dashboard/mcp' },
  { label: '模型', href: '/dashboard/models' },
  { label: 'News', href: '/news' }
];

export function HomeNavbar() {
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
          <span className='text-sm'>AI Skill Navigation</span>
        </Link>

        <div className='flex items-center gap-1'>
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className='hidden rounded-md px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground sm:block'
            >
              {item.label}
            </Link>
          ))}

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
