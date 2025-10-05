'use client';

import { StripeSubscription, User, UserSettings } from '@prisma/client';
import { Column, ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';

import { TextBadge } from '@/components/common/text-badge';
import { DateColumn } from '@/components/data-table/columns/date-column';
import { Avatar, AvatarFallback, AvatarImage, Button } from '@/components/ui';
import { getFallbackName } from '@/lib/utils';

import { ColumnActions } from './column-actions';
import { RoleActions } from './role-actions';

type UserWithSubscription = User & {
  settings: UserSettings | null;
  stripeSubscription: StripeSubscription | null;
};

const handleSortingHeader = <T extends Column<UserWithSubscription, unknown>>(
  column: T,
  label: string,
) => {
  return (
    <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
      {label}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );
};

export const columns: ColumnDef<UserWithSubscription>[] = [
  {
    id: 'user',
    header: () => <span>User</span>,
    cell: ({ row }) => {
      const { email, name, pictureUrl } = row.original;

      return (
        <div className="flex items-center gap-2">
          <Avatar className="w-[40px] h-[40px] border dark:border-muted-foreground">
            <AvatarImage src={pictureUrl || ''} />
            <AvatarFallback>{getFallbackName(name as string)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col text-sm">
            <p className="font-medium">{name}</p>
            <p>{email}</p>
          </div>
        </div>
      );
    },
  },
  {
    id: 'userSubscription',
    header: () => <span>Type</span>,
    cell: ({ row }) => {
      const { stripeSubscription } = row.original;

      const isPremium = stripeSubscription?.stripeSubscriptionId;

      return (
        <TextBadge label={isPremium ? 'Premium' : 'Free'} variant={isPremium ? 'indigo' : 'lime'} />
      );
    },
  },
  {
    accessorKey: 'isPublic',
    header: ({ column }) => handleSortingHeader(column, 'Profile status'),
    cell: ({ row }) => {
      const { settings } = row.original;
      const isPublic = settings?.isPublicProfile;

      return (
        <TextBadge
          label={isPublic ? 'Public' : 'Private'}
          variant={isPublic ? 'green' : 'default'}
        />
      );
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
    id: 'roleActions',
    header: () => <span>Change role</span>,
    cell: ({ row }) => {
      const { id, role } = row.original;

      return <RoleActions userId={id} role={role} />;
    },
  },
  {
    id: 'columnActions',
    cell: ({ row }) => {
      const { id } = row.original;

      return <ColumnActions userId={id} />;
    },
  },
];
