'use client';

import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTableColumnHeader } from '@/components/ui/table/data-table-column-header';
import { Icons } from '@/components/icons';
import { cn } from '@/lib/utils';
import type { Article, ArticleStatus } from '../../api/types';
import type { Column, ColumnDef } from '@tanstack/react-table';
import { ArticleCellAction } from './article-cell-action';

const STATUS_CONFIG: Record<ArticleStatus, { label: string; className: string }> = {
  published: {
    label: '已发布',
    className: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
  },
  draft: {
    label: '草稿',
    className: 'bg-gray-500/10 text-gray-500 border-gray-500/20'
  },
  archived: {
    label: '已归档',
    className: 'bg-slate-500/10 text-slate-500 border-slate-500/20'
  }
};

export const STATUS_OPTIONS = Object.entries(STATUS_CONFIG).map(([value, config]) => ({
  value,
  label: config.label
}));

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    month: 'short',
    day: 'numeric',
    year: '2-digit'
  });
}

export const columns: ColumnDef<Article>[] = [
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
    id: 'title',
    accessorKey: 'title',
    header: ({ column }: { column: Column<Article, unknown> }) => (
      <DataTableColumnHeader column={column} title='文章标题' />
    ),
    cell: ({ row }) => (
      <div className='flex max-w-[320px] flex-col gap-0.5'>
        <Link
          href={`/admin/articles/${row.original.id}`}
          className='truncate text-sm font-medium hover:text-primary transition-colors'
        >
          {row.original.title}
        </Link>
        <span className='truncate text-[11px] text-muted-foreground'>
          /blog/{row.original.slug}
        </span>
      </div>
    ),
    meta: {
      label: '文章标题',
      placeholder: '搜索文章...',
      variant: 'text',
      icon: Icons.search
    },
    enableColumnFilter: true
  },
  {
    id: 'status',
    accessorKey: 'status',
    enableSorting: false,
    header: ({ column }: { column: Column<Article, unknown> }) => (
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
    id: 'tags',
    accessorKey: 'tags',
    enableSorting: false,
    header: '标签',
    cell: ({ row }) => (
      <div className='flex flex-wrap gap-1'>
        {row.original.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className='rounded-md border bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground'
          >
            {tag}
          </span>
        ))}
      </div>
    )
  },
  {
    id: 'published_at',
    accessorKey: 'published_at',
    header: ({ column }: { column: Column<Article, unknown> }) => (
      <DataTableColumnHeader column={column} title='发布时间' />
    ),
    cell: ({ row }) => (
      <span className='text-xs text-muted-foreground'>{formatDate(row.original.published_at)}</span>
    )
  },
  {
    id: 'actions',
    cell: ({ row }) => <ArticleCellAction data={row.original} />
  }
];
