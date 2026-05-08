'use client';

import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { Agent, AgentType, AgentStatus } from '../../api/types';
import type { Column, ColumnDef } from '@tanstack/react-table';
import { AgentCellAction } from './agent-cell-action';

const TYPE_LABELS: Record<AgentType, string> = {
  general: '通用自主',
  research: '深度研究',
  builder: '构建平台',
  computer: '电脑操控',
  creative: '垂直创意',
  proactive: '主动感知'
};

const STATUS_CONFIG: Record<AgentStatus, { label: string; className: string }> = {
  published: {
    label: '已发布',
    className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
  },
  pending: {
    label: '待审核',
    className: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
  },
  rejected: {
    label: '已拒绝',
    className: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
  },
  draft: { label: '草稿', className: 'bg-gray-500/10 text-gray-500 border-gray-500/20' }
};

export const TYPE_OPTIONS = Object.entries(TYPE_LABELS).map(([value, label]) => ({ value, label }));
export const STATUS_OPTIONS = Object.entries(STATUS_CONFIG).map(([value, { label }]) => ({
  value,
  label
}));

export const columns: ColumnDef<Agent>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
        aria-label='Select all'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(v) => row.toggleSelected(!!v)}
        aria-label='Select row'
      />
    ),
    enableSorting: false,
    enableColumnFilter: false
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }: { column: Column<Agent, unknown> }) => (
      <DataTableColumnHeader column={column} title='Agent 名称' />
    ),
    cell: ({ row }) => (
      <div className='flex max-w-[260px] flex-col gap-0.5'>
        <span className='truncate text-sm font-medium'>{row.original.name}</span>
        <span className='truncate text-[11px] text-muted-foreground'>
          {row.original.url === '#' ? '内测中' : row.original.url.replace(/^https?:\/\//, '')}
        </span>
      </div>
    ),
    meta: {
      label: 'Agent 名称',
      placeholder: '搜索 Agent...',
      variant: 'text',
      icon: Icons.search
    },
    enableColumnFilter: true
  },
  {
    id: 'agent_type',
    accessorKey: 'agent_type',
    enableSorting: false,
    header: '分类',
    cell: ({ row }) => (
      <Badge variant='outline' className='text-xs font-normal'>
        {TYPE_LABELS[row.original.agent_type]}
      </Badge>
    ),
    meta: { label: '分类', variant: 'multiSelect', options: TYPE_OPTIONS },
    enableColumnFilter: true
  },
  {
    id: 'open_source',
    accessorKey: 'open_source',
    enableSorting: false,
    header: '开源',
    cell: ({ row }) => {
      const v = row.original.open_source;
      const cfg = {
        open: { label: '开源', cls: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
        closed: { label: '闭源', cls: 'bg-slate-500/10 text-slate-500 border-slate-500/20' },
        partial: { label: '部分开源', cls: 'bg-amber-500/10 text-amber-600 border-amber-500/20' }
      }[v];
      return (
        <Badge variant='outline' className={cn('text-[10px] font-normal', cfg.cls)}>
          {cfg.label}
        </Badge>
      );
    }
  },
  {
    id: 'status',
    accessorKey: 'status',
    enableSorting: false,
    header: ({ column }: { column: Column<Agent, unknown> }) => (
      <DataTableColumnHeader column={column} title='状态' />
    ),
    cell: ({ row }) => {
      const cfg = STATUS_CONFIG[row.original.status];
      return (
        <Badge variant='outline' className={cn('text-xs font-normal', cfg.className)}>
          {cfg.label}
        </Badge>
      );
    },
    meta: { label: '状态', variant: 'multiSelect', options: STATUS_OPTIONS },
    enableColumnFilter: true
  },
  {
    id: 'is_featured',
    accessorKey: 'is_featured',
    enableSorting: false,
    header: '精选',
    cell: ({ row }) =>
      row.original.is_featured ? (
        <Icons.sparkles className='h-4 w-4 text-violet-500' />
      ) : (
        <span className='text-muted-foreground text-xs'>—</span>
      )
  },
  {
    id: 'actions',
    cell: ({ row }) => <AgentCellAction data={row.original} />
  }
];
