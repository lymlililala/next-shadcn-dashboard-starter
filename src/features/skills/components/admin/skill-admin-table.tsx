'use client';

import { useState } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';
import { DataTable } from '@/components/ui/table/data-table';
import { DataTableToolbar } from '@/components/ui/table/data-table-toolbar';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useDataTable } from '@/hooks/use-data-table';
import { getSortingStateParser } from '@/lib/parsers';
import { sitesQueryOptions } from '../../api/queries';
import { columns } from './skill-table-columns';
import { SkillFormSheet } from './skill-form-sheet';

const columnIds = columns.map((c) => c.id).filter(Boolean) as string[];

export function SkillAdminTable() {
  const [createOpen, setCreateOpen] = useState(false);

  const [params] = useQueryStates({
    page: parseAsInteger.withDefault(1),
    perPage: parseAsInteger.withDefault(10),
    name: parseAsString,
    platform: parseAsString,
    status: parseAsString,
    sort: getSortingStateParser(columnIds).withDefault([])
  });

  const filters = {
    page: params.page,
    limit: params.perPage,
    ...(params.name && { search: params.name }),
    ...(params.platform && { platform: params.platform }),
    ...(params.status && { status: params.status }),
    ...(params.sort.length > 0 && { sort: JSON.stringify(params.sort) })
  };

  const { data } = useSuspenseQuery(sitesQueryOptions(filters));

  const pageCount = Math.ceil(data.total_items / params.perPage);

  const { table } = useDataTable({
    data: data.items,
    columns,
    pageCount,
    shallow: true,
    debounceMs: 500,
    initialState: {
      columnPinning: { right: ['actions'] }
    }
  });

  return (
    <>
      <SkillFormSheet open={createOpen} onOpenChange={setCreateOpen} />
      <DataTable table={table}>
        <DataTableToolbar table={table}>
          <Button size='sm' onClick={() => setCreateOpen(true)}>
            <Icons.add className='mr-1.5 h-4 w-4' />
            添加站点
          </Button>
        </DataTableToolbar>
      </DataTable>
    </>
  );
}
