'use client';

import {
  ChatSharedConversation,
  Course,
  CsmIssue,
  StripeSubscription,
  User,
  UserSettings,
} from '@prisma/client';
import { Column, ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, BadgeCheckIcon, BookOpen, MessageSquare } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { TextBadge } from '@/components/common/text-badge';
import { DateColumn } from '@/components/data-table/columns/date-column';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui';
import { getFallbackName } from '@/lib/utils';

import { ColumnActions } from './column-actions';
import { RoleActions } from './role-actions';

type UserWithSubscription = User & {
  courses: Course[];
  csmIssues: CsmIssue[];
  settings: UserSettings | null;
  sharedConversations: ChatSharedConversation[];
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

const UserActivityCell = ({ row }: { row: { original: UserWithSubscription } }) => {
  const { courses, sharedConversations } = row.original;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{courses.length}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Enrolled courses</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="flex items-center gap-1.5">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">{sharedConversations.length}</span>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Shared conversations</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};

export const useColumns = (): ColumnDef<UserWithSubscription>[] => {
  const t = useTranslations('owner.users.table');

  return [
    {
      id: 'user',
      header: () => <span>{t('columns.user')}</span>,
      cell: ({ row }) => {
        const { email, name, pictureUrl, isEmailConfirmed } = row.original;

        return (
          <div className="flex items-center gap-2 min-w-[200px]">
            <Avatar className="w-[40px] h-[40px] border dark:border-muted-foreground shrink-0">
              <AvatarImage src={pictureUrl || ''} />
              <AvatarFallback>{getFallbackName(name as string)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-sm min-w-0">
              <div className="flex items-center gap-x-1">
                <p className="font-medium truncate">{name}</p>
                {isEmailConfirmed && <BadgeCheckIcon className="w-4 h-4 text-green-500 shrink-0" />}
              </div>
              <p className="text-muted-foreground truncate">{email}</p>
            </div>
          </div>
        );
      },
    },
    {
      id: 'userSubscription',
      header: () => <span>{t('columns.type')}</span>,
      cell: ({ row }) => {
        const { stripeSubscription } = row.original;

        const isPremium = stripeSubscription?.stripeSubscriptionId;

        return (
          <TextBadge
            label={isPremium ? t('premium') : t('free')}
            variant={isPremium ? 'indigo' : 'lime'}
          />
        );
      },
    },
    {
      id: 'activity',
      header: () => <span>{t('columns.activity')}</span>,
      cell: UserActivityCell,
    },
    {
      accessorKey: 'isPublic',
      header: ({ column }) => handleSortingHeader(column, t('columns.profileStatus')),
      cell: ({ row }) => {
        const { settings } = row.original;
        const isPublic = settings?.isPublicProfile;

        return (
          <TextBadge
            label={isPublic ? t('public') : t('private')}
            variant={isPublic ? 'green' : 'default'}
          />
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => handleSortingHeader(column, t('columns.dateOfCreation')),
      cell: ({ row }) => {
        return <DateColumn date={row.original.createdAt} />;
      },
    },
    {
      accessorKey: 'updatedAt',
      header: ({ column }) => handleSortingHeader(column, t('columns.lastUpdate')),
      cell: ({ row }) => {
        return <DateColumn date={row.original.updatedAt} />;
      },
    },
    {
      id: 'roleActions',
      header: () => <span>{t('columns.changeRole')}</span>,
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
};

export const columns: ColumnDef<UserWithSubscription>[] = [
  {
    id: 'user',
    header: () => <span>User</span>,
    cell: ({ row }) => {
      const { email, name, pictureUrl, isEmailConfirmed } = row.original;

      return (
        <div className="flex items-center gap-2 min-w-[200px]">
          <Avatar className="w-[40px] h-[40px] border dark:border-muted-foreground shrink-0">
            <AvatarImage src={pictureUrl || ''} />
            <AvatarFallback>{getFallbackName(name as string)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col text-sm min-w-0">
            <div className="flex items-center gap-x-1">
              <p className="font-medium truncate">{name}</p>
              {isEmailConfirmed && <BadgeCheckIcon className="w-4 h-4 text-green-500 shrink-0" />}
            </div>
            <p className="text-muted-foreground truncate">{email}</p>
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
    id: 'activity',
    header: () => <span>Activity</span>,
    cell: UserActivityCell,
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
