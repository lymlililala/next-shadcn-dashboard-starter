'use client';

import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { Site, SitePlatform, SiteRegion, SiteStatus } from '../../api/types';
import type { Column, ColumnDef } from '@tanstack/react-table';
import { SkillCellAction } from './skill-cell-action';

const PLATFORM_LABELS: Record<SitePlatform, string> = {
  official: '官方',
  mirror: '镜像',
  github: 'GitHub',
  aggregator: '聚合',
  community: '社区',
  tool: '工具'
};

const REGION_CONFIG: Record<SiteRegion, { label: string; flag: string }> = {
  global: { label: '国际', flag: '🌐' },
  cn: { label: '中文', flag: '🇨🇳' }
};

const STATUS_CONFIG: Record<SiteStatus, { label: string; className: string }> = {
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
  draft: {
    label: '草稿',
    className: 'bg-gray-500/10 text-gray-500 border-gray-500/20'
  }
};

export const PLATFORM_OPTIONS = Object.entries(PLATFORM_LABELS).map(([value, label]) => ({
  value,
  label
}));

export const STATUS_OPTIONS = Object.entries(STATUS_CONFIG).map(([value, config]) => ({
  value,
  label: config.label
}));

export const columns: ColumnDef<Site>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
      />
    ),
    enableSorting: false,
    enableColumnFilter: false
  },
  {
    id: 'name',
    accessorKey: 'name',
    header: ({ column }: { column: Column<Site, unknown> }) => (
      <DataTableColumnHeader column={column} title='站点名称' />
    ),
    cell: ({ row }) => (
      <div className='flex max-w-[240px] flex-col gap-0.5'>
        <span className='truncate font-medium text-sm'>{row.original.name}</span>
        <span className='truncate text-[11px] text-muted-foreground'>
          {row.original.url.replace(/^https?:\/\//, '')}
        </span>
      </div>
    ),
    meta: {
      label: '站点名称',
      placeholder: '搜索站点...',
      variant: 'text',
      icon: Icons.search
    },
    enableColumnFilter: true
  },
  {
    id: 'platform',
    accessorKey: 'platform',
    enableSorting: false,
    header: '平台类型',
    cell: ({ row }) => (
      <Badge variant='outline' className='text-xs font-normal'>
        {PLATFORM_LABELS[row.original.platform]}
      </Badge>
    ),
    meta: {
      label: '平台类型',
      variant: 'multiSelect',
      options: PLATFORM_OPTIONS
    },
    enableColumnFilter: true
  },
  {
    id: 'region',
    accessorKey: 'region',
    enableSorting: false,
    header: '地区',
    cell: ({ row }) => {
      const cfg = REGION_CONFIG[row.original.region];
      return (
        <span className='flex items-center gap-1 text-sm text-muted-foreground'>
          <span>{cfg.flag}</span>
          {cfg.label}
        </span>
      );
    }
  },
  {
    id: 'status',
    accessorKey: 'status',
    enableSorting: false,
    header: ({ column }: { column: Column<Site, unknown> }) => (
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
    meta: {
      label: '状态',
      variant: 'multiSelect',
      options: STATUS_OPTIONS
    },
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
    cell: ({ row }) => <SkillCellAction data={row.original} />
  }
];
