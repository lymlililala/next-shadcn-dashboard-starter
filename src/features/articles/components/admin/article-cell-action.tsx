'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertModal } from '@/components/modal/alert-modal';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Icons } from '@/components/icons';
import { deleteArticle } from '../../api/service';
import { articleKeys } from '../../api/queries';
import type { Article } from '../../api/types';

interface ArticleCellActionProps {
  data: Article;
}

export function ArticleCellAction({ data }: ArticleCellActionProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => deleteArticle(data.id),
    onSuccess: () => {
      toast.success(`"${data.title}" 已删除`);
      setDeleteOpen(false);
      void queryClient.invalidateQueries({ queryKey: articleKeys.all });
    },
    onError: () => {
      toast.error('删除失败，请重试');
    }
  });

  return (
    <>
      <AlertModal
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        loading={deleteMutation.isPending}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant='ghost' className='h-8 w-8 p-0'>
            <span className='sr-only'>打开菜单</span>
            <Icons.ellipsis className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>操作</DropdownMenuLabel>
          <DropdownMenuItem asChild>
            <Link href={`/admin/articles/${data.id}`}>
              <Icons.edit className='mr-2 h-4 w-4' />
              编辑
            </Link>
          </DropdownMenuItem>
          {data.status === 'published' && (
            <DropdownMenuItem asChild>
              <Link href={`/blog/${data.slug}`} target='_blank' rel='noopener noreferrer'>
                <Icons.externalLink className='mr-2 h-4 w-4' />
                查看文章
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className='text-destructive focus:text-destructive'
          >
            <Icons.trash className='mr-2 h-4 w-4' />
            删除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
