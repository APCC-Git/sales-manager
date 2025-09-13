'use client';

import { ColumnDef } from '@tanstack/react-table';
import { SalesData } from '@/types/SalesData';

export const columns: ColumnDef<SalesData>[] = [
  {
    accessorKey: 'jst',
    header: '売上時刻',
    cell: ({ row }) =>
      new Date(row.getValue('jst')).toLocaleTimeString('ja-JP', {
        timeZone: 'Asia/Tokyo',
        hour: '2-digit',
        minute: '2-digit',
      }),
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
