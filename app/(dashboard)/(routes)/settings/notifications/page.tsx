import { getTranslations } from 'next-intl/server';
import { Suspense } from 'react';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import { getNotificationCounts } from '@/actions/users/get-notification-counts';
import { getUserNotifications } from '@/actions/users/get-user-notifications';

import { NotificationSkeleton } from './_components/notification-skeleton';
import { NotificationsPageClient } from './_components/notifications-page-client';

type NotificationsPageProps = {
  searchParams: Promise<{ pageIndex?: string; pageSize?: string; filter?: string }>;
};

const NotificationsPage = async (props: NotificationsPageProps) => {
  const searchParams = await props.searchParams;
  const t = await getTranslations('notifications');

  const user = await getCurrentUser();
  const filter = (searchParams.filter as 'all' | 'unread' | 'read') || 'all';

  const [{ notifications: userNotifications, pageCount }, counts] = await Promise.all([
    getUserNotifications({
      userId: user?.userId,
      pageIndex: searchParams.pageIndex,
      pageSize: searchParams.pageSize,
      filter,
    }),
    getNotificationCounts({ userId: user?.userId }),
  ]);

  return (
    <div className="p-6 flex flex-col mb-6">
      <div className="mb-6">
        <h1 className="text-2xl font-medium">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">{t('pageDescription')}</p>
      </div>
      <Suspense fallback={<NotificationSkeleton />}>
        <NotificationsPageClient
          notifications={userNotifications}
          userId={user?.userId}
          pageCount={pageCount}
          currentPage={Number(searchParams.pageIndex || 0)}
          pageSize={Number(searchParams.pageSize || 10)}
          activeFilter={filter}
          counts={counts}
        />
      </Suspense>
    </div>
  );
};

export default NotificationsPage;
