'use client';

import { parseAsString, useQueryStates } from 'nuqs';
import { Icons } from '@/components/icons';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const REGIONS: { value: string; label: string; flag?: string }[] = [
  { value: 'all', label: '全部地区' },
  { value: 'global', label: '🌐 国际', flag: '🌐' },
  { value: 'cn', label: '🇨🇳 中文', flag: '🇨🇳' }
];

const PLATFORMS: { value: string; label: string }[] = [
  { value: 'all', label: '全部类型' },
  { value: 'official', label: '官方' },
  { value: 'aggregator', label: '聚合导航' },
  { value: 'mirror', label: '镜像站' },
  { value: 'github', label: 'GitHub' },
  { value: 'community', label: '社区' },
  { value: 'tool', label: '工具' }
];

export function SkillFilters() {
  const [params, setParams] = useQueryStates(
    {
      search: parseAsString.withDefault(''),
      region: parseAsString.withDefault('all'),
      platform: parseAsString.withDefault('all')
    },
    { shallow: true }
  );

  const hasActive = params.search !== '' || params.region !== 'all' || params.platform !== 'all';

  return (
    <div className='space-y-3'>
      {/* Search */}
      <div className='relative'>
        <Icons.search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          placeholder='搜索站点名称、描述、标签...'
          value={params.search}
          onChange={(e) => setParams({ ...params, search: e.target.value || '' })}
          className='h-9 pl-9 pr-8'
        />
        {params.search && (
          <button
            onClick={() => setParams({ ...params, search: '' })}
            className='absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:text-foreground transition-colors'
          >
            <Icons.close className='h-3.5 w-3.5' />
          </button>
        )}
      </div>

      {/* Filter row */}
      <div className='flex flex-wrap items-center gap-2'>
        {/* Region tabs */}
        <div className='flex gap-1'>
          {REGIONS.map((r) => (
            <button
              key={r.value}
              onClick={() => setParams({ ...params, region: r.value })}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-all duration-150',
                params.region === r.value
                  ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                  : 'bg-background text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Platform select */}
        <select
          value={params.platform}
          onChange={(e) => setParams({ ...params, platform: e.target.value })}
          className='ml-auto h-7 rounded-md border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring'
        >
          {PLATFORMS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>

        {hasActive && (
          <Button
            variant='ghost'
            size='sm'
            className='h-7 gap-1 px-2 text-xs text-muted-foreground'
            onClick={() => setParams({ search: '', region: 'all', platform: 'all' })}
          >
            <Icons.close className='h-3 w-3' />
            重置
          </Button>
        )}
      </div>
    </div>
  );
}
