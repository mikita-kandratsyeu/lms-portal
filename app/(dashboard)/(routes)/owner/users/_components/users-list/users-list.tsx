'use client';

import { useTranslations } from 'next-intl';

import { getUsers } from '@/actions/users/get-users';
import { DataTable } from '@/components/data-table/data-table';

import { columns } from './columns';

type UsersListProps = {
  pageCount: number;
  users: Awaited<ReturnType<typeof getUsers>>['users'];
};

export const UsersList = ({ pageCount, users }: UsersListProps) => {
  const t = useTranslations('owner.users');

  return (
    <div className="flex flex-col gap-4 mb-8">
      <div className="flex flex-col gap-1">
        <p className="font-medium text-xl">{t('sections.list.title')}</p>
        <span className="text-xs text-muted-foreground">{t('sections.list.description')}</span>
      </div>
      <DataTable
        columns={columns}
        data={users}
        isUsersPage
        noLabel={t('table.noUsers')}
        pageCount={pageCount}
      />
    </div>
  );
};
