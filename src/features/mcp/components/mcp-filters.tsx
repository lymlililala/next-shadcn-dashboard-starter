'use client';

import { parseAsString, useQueryStates } from 'nuqs';
import { Icons } from '@/components/icons';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const CATEGORY_TABS = [
  { value: 'all', label: '全部' },
  { value: 'filesystem', label: '📁 文件系统' },
  { value: 'database', label: '🗄️ 数据库' },
  { value: 'browser', label: '🌐 浏览器' },
  { value: 'devtools', label: '🔧 开发工具' },
  { value: 'productivity', label: '⚡ 效率工具' },
  { value: 'search', label: '🔍 搜索' },
  { value: 'ai', label: '🤖 AI 模型' }
];

export function McpFilters() {
  const [params, setParams] = useQueryStates(
    {
      mcp_search: parseAsString.withDefault(''),
      mcp_cat: parseAsString.withDefault('all')
    },
    { shallow: true }
  );

  const hasActive = params.mcp_search !== '' || params.mcp_cat !== 'all';

  return (
    <div className='space-y-3'>
      {/* Search */}
      <div className='relative'>
        <Icons.search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          placeholder='搜索 MCP Server 名称、描述...'
          value={params.mcp_search}
          onChange={(e) => setParams({ ...params, mcp_search: e.target.value || '' })}
          className='h-9 pl-9 pr-8'
        />
        {params.mcp_search && (
          <button
            onClick={() => setParams({ ...params, mcp_search: '' })}
            className='absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground'
          >
            <Icons.close className='h-3.5 w-3.5' />
          </button>
        )}
      </div>

      {/* Category tabs + reset */}
      <div className='flex flex-wrap items-center gap-2'>
        <div className='flex flex-wrap gap-1.5'>
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setParams({ ...params, mcp_cat: tab.value })}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-all duration-150',
                params.mcp_cat === tab.value
                  ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                  : 'bg-background text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {hasActive && (
          <Button
            variant='ghost'
            size='sm'
            className='h-7 gap-1 px-2 text-xs text-muted-foreground'
            onClick={() => setParams({ mcp_search: '', mcp_cat: 'all' })}
          >
            <Icons.close className='h-3 w-3' />
            重置
          </Button>
        )}
      </div>
    </div>
  );
}
