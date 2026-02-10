'use client';

import { Course } from '@prisma/client';
import { Column, ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';

import { TextBadge } from '@/components/common/text-badge';
import { Button } from '@/components/ui';
import { formatPrice, getConvertedPrice } from '@/lib/format';

import { ColumnActions } from './column-actions';

const handleSortingHeader = <T extends Column<Course, unknown>>(column: T, label: string) => {
  return (
    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
      {label}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
};

export const columns: ColumnDef<Course>[] = [
  {
    accessorKey: 'title',
    header: ({ column }) => handleSortingHeader(column, 'Title'),
  },
  {
    accessorKey: 'price',
    header: ({ column }) => handleSortingHeader(column, 'Price'),
    cell: ({ row }) => {
      const price = getConvertedPrice(row.getValue('price') || 0);
      const formatted = formatPrice(price);

      return price ? formatted : <TextBadge variant="lime" label="Free" />;
    },
  },
  {
    accessorKey: 'isPublished',
    header: ({ column }) => handleSortingHeader(column, 'Published'),
    cell: ({ row }) => {
      const isPublished = row.getValue('isPublished') || false;

      return (
        <TextBadge
          variant={isPublished ? 'yellow' : 'default'}
          label={isPublished ? 'Published' : 'Draft'}
        />
      );
    },
  },
  {
    accessorKey: 'isPremium',
    header: ({ column }) => handleSortingHeader(column, 'Level'),
    cell: ({ row }) => {
      const isPremium = row.getValue('isPremium') || false;

      return (
        <TextBadge
          variant={isPremium ? 'indigo' : 'default'}
          label={isPremium ? 'Premium' : 'Basic'}
        />
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const { id } = row.original;

      return <ColumnActions courseId={id} />;
    },
  },
];
