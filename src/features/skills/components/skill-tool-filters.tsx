'use client';

import { parseAsString, useQueryStates } from 'nuqs';
import { Icons } from '@/components/icons';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// 主要分类（按数量降序）
const CATEGORY_TABS = [
  { value: 'all', label: '全部' },
  { value: 'Text', label: '📝 文本' },
  { value: 'Image', label: '🖼️ 图像' },
  { value: 'Code', label: '💻 代码' },
  { value: 'Audio', label: '🎵 音频' },
  { value: 'Video', label: '🎬 视频' },
  { value: 'Web-Based Tools', label: '🌐 Web 工具' },
  { value: 'Developer tools', label: '🔧 开发者工具' },
  { value: 'IDE Extensions', label: '🧩 IDE 插件' },
  { value: 'Autonomous agents', label: '🤖 自主 Agent' },
  { value: 'Coding Assistants', label: '⚡ 编程助手' },
  { value: 'AI-Native IDEs', label: '🚀 AI IDE' },
  { value: 'Other', label: '📦 其他' }
];

export function SkillToolFilters() {
  const [params, setParams] = useQueryStates(
    {
      skill_tool_search: parseAsString.withDefault(''),
      skill_tool_cat: parseAsString.withDefault('all')
    },
    { shallow: true }
  );

  const hasActive = params.skill_tool_search !== '' || params.skill_tool_cat !== 'all';

  return (
    <div className='space-y-3'>
      <div className='relative'>
        <Icons.search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
        <Input
          placeholder='搜索 AI 工具名称、描述...'
          value={params.skill_tool_search}
          onChange={(e) => setParams({ ...params, skill_tool_search: e.target.value || '' })}
          className='h-9 pl-9 pr-8'
        />
        {params.skill_tool_search && (
          <button
            onClick={() => setParams({ ...params, skill_tool_search: '' })}
            className='absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground'
          >
            <Icons.close className='h-3.5 w-3.5' />
          </button>
        )}
      </div>

      <div className='flex flex-wrap items-center gap-2'>
        <div className='flex flex-wrap gap-1.5'>
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setParams({ ...params, skill_tool_cat: tab.value })}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-all duration-150',
                params.skill_tool_cat === tab.value
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
            onClick={() => setParams({ skill_tool_search: '', skill_tool_cat: 'all' })}
          >
            <Icons.close className='h-3 w-3' />
            重置
          </Button>
        )}
      </div>
    </div>
  );
}
