'use client';

import { ColumnDef } from '@tanstack/react-table';
import { SalesData } from '@/types/SalesData';
import { DataTableColumnHeader } from '@/components/table/DataTableColumnHeader';

export const columns: ColumnDef<SalesData>[] = [
  {
    accessorKey: 'jst',
    header: ({ column }) => (
      <div className={'px-2'}>
        <DataTableColumnHeader column={column} title="販売時刻" />
      </div>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue('jst')).toLocaleTimeString('ja-JP', {
        timeZone: 'Asia/Tokyo',
        hour: '2-digit',
        minute: '2-digit',
      });

      return <div className={'px-2'}>{date}</div>;
    },
  },
  {
    accessorKey: 'name',
    header: '商品名',
  },
  {
    accessorKey: 'payment',
    header: '価格',
  },
  {
    accessorKey: 'method',
    header: '支払方法',
  },
];
