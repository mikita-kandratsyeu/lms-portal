'use client';

import { Column, ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';

import { CsmIssueType } from '@/actions/csm/get-csm-issues';
import { TextBadge } from '@/components/common/text-badge';
import { DateColumn } from '@/components/data-table/columns/date-column';
import { Avatar, AvatarFallback, AvatarImage, Button } from '@/components/ui';
import { getStatusLabelStyle } from '@/lib/csm';
import { capitalize, getFallbackName } from '@/lib/utils';

import { ColumnActions } from './column-actions';

const handleSortingHeader = <T extends Column<CsmIssueType, unknown>>(column: T, label: string) => {
  return (
    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
      {label}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
};

export const getColumns = (t: (key: string) => string): ColumnDef<CsmIssueType>[] => [
  {
    accessorKey: 'name',
    header: ({ column }) => handleSortingHeader(column, 'Issue'),
    cell: ({ row }) => {
      const { name } = row.original;

      return <p className="font-semibold text-sm">{name}</p>;
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => handleSortingHeader(column, 'Status'),
    cell: ({ row }) => {
      const { status } = row.original;

      const statusStyle = getStatusLabelStyle(status);

      return <TextBadge label={statusStyle.label} variant={statusStyle.variant} />;
    },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => handleSortingHeader(column, 'User (email)'),
    cell: ({ row }) => {
      const { email, user } = row.original;

      return (
        <div className="flex items-center gap-2">
          <Avatar className="w-[40px] h-[40px] border dark:border-muted-foreground">
            <AvatarImage src={user?.pictureUrl || ''} />
            {user?.name && <AvatarFallback>{getFallbackName(user.name)}</AvatarFallback>}
          </Avatar>
          <div className="flex flex-col text-sm">
            <p className="font-medium">{user?.name ?? 'Unknown'}</p>
            <p>{email}</p>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: 'category.name',
    header: ({ column }) => handleSortingHeader(column, 'Category (name)'),
    cell: ({ row }) => {
      const { category } = row.original;

      return (
        <div className="flex flex-col text-sm">
          <p className="font-medium">{capitalize(category?.name ?? 'Unknown')}</p>
          <p className="line-clamp-2">{t(`categories.${category?.name ?? ''}`)}</p>
        </div>
      );
    },
  },
  {
    id: 'description',
    header: () => <span>Description</span>,
    cell: ({ row }) => {
      const { description } = row.original;

      return <p className="font-medium text-sm line-clamp-2">{description}</p>;
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => handleSortingHeader(column, 'Date of creation'),
    cell: ({ row }) => {
      return <DateColumn date={row.original.createdAt} />;
    },
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => handleSortingHeader(column, 'Last update'),
    cell: ({ row }) => {
      return <DateColumn date={row.original.updatedAt} />;
    },
  },
  {
    id: 'columnActions',
    cell: ({ row }) => {
      const { id } = row.original;

      return <ColumnActions csmId={id} />;
    },
  },
];
