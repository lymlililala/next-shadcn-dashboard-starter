'use client';

import { Suspense, useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icons } from '@/components/icons';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') ?? '/admin/analytics';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    startTransition(async () => {
      try {
        const res = await fetch('/api/admin/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        if (res.ok) {
          router.push(from);
          router.refresh();
        } else {
          const data = (await res.json()) as { error?: string };
          setError(data.error ?? '登录失败，请重试');
        }
      } catch {
        setError('网络错误，请重试');
      }
    });
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-background px-4'>
      <div className='w-full max-w-sm space-y-8'>
        {/* Logo */}
        <div className='text-center space-y-2'>
          <div className='inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground text-xl font-bold mb-2'>
            A
          </div>
          <h1 className='text-2xl font-bold tracking-tight'>管理后台</h1>
          <p className='text-sm text-muted-foreground'>AI Skill Navigation</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <label htmlFor='username' className='text-sm font-medium'>
              账号
            </label>
            <div className='relative'>
              <Icons.user className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <input
                id='username'
                type='text'
                autoComplete='username'
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder='输入管理员账号'
                className='w-full rounded-lg border border-input bg-background pl-9 pr-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 transition-shadow'
              />
            </div>
          </div>

          <div className='space-y-2'>
            <label htmlFor='password' className='text-sm font-medium'>
              密码
            </label>
            <div className='relative'>
              <Icons.lock className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <input
                id='password'
                type={showPassword ? 'text' : 'password'}
                autoComplete='current-password'
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='输入密码'
                className='w-full rounded-lg border border-input bg-background pl-9 pr-10 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 transition-shadow'
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors'
                tabIndex={-1}
              >
                {showPassword ? (
                  <Icons.eyeOff className='h-4 w-4' />
                ) : (
                  <Icons.eye className='h-4 w-4' />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className='flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive'>
              <Icons.warning className='h-4 w-4 shrink-0' />
              {error}
            </div>
          )}

          <button
            type='submit'
            disabled={isPending || !username || !password}
            className='relative w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
          >
            {isPending ? (
              <span className='flex items-center justify-center gap-2'>
                <Icons.spinner className='h-4 w-4 animate-spin' />
                登录中...
              </span>
            ) : (
              '登录'
            )}
          </button>
        </form>

        <p className='text-center text-xs text-muted-foreground'>
          此页面仅供管理员访问，session 有效期 8 小时
        </p>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLoginForm />
    </Suspense>
  );
}
