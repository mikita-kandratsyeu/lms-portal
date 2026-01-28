import { getTranslations } from 'next-intl/server';

import { getUsers } from '@/actions/users/get-users';
import { getUsersStats } from '@/actions/users/get-users-stats';

import { UsersList } from './_components/users-list/users-list';
import { UsersOverview } from './_components/users-overview';

type UsersPageProps = {
  searchParams: Promise<{ pageIndex: string; pageSize: string; search?: string }>;
};

const UsersPage = async (props: UsersPageProps) => {
  const searchParams = await props.searchParams;

  const { pageCount, users } = await getUsers(searchParams);
  const stats = await getUsersStats();
  const t = await getTranslations('owner.users');

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-medium">{t('page.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('page.description')}</p>
        </div>
      </div>
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col gap-1">
          <p className="font-medium text-xl">{t('sections.overview.title')}</p>
          <span className="text-xs text-muted-foreground">
            {t('sections.overview.description')}
          </span>
        </div>
        <UsersOverview stats={stats} />
      </div>
      <UsersList pageCount={pageCount} users={users} />
    </div>
  );
};

export default UsersPage;
