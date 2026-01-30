'use client';

import { Notification } from '@prisma/client';

import { NotificationEmpty } from './notification-empty';
import { NotificationFilters } from './notification-filters';
import { NotificationHeader } from './notification-header';
import { NotificationList } from './notification-list';
import { NotificationPagination } from './notification-pagination';

type NotificationsPageClientProps = {
  notifications: Notification[];
  userId?: string;
  pageCount: number;
  currentPage: number;
  pageSize: number;
  activeFilter: 'all' | 'unread' | 'read';
  counts: {
    all: number;
    unread: number;
    read: number;
  };
};

export const NotificationsPageClient = ({
  notifications,
  userId,
  pageCount,
  currentPage,
  pageSize,
  activeFilter,
  counts,
}: NotificationsPageClientProps) => {
  return (
    <div>
      <NotificationHeader totalCount={counts.all} unreadCount={counts.unread} userId={userId} />
      <div className="mt-4">
        <NotificationFilters activeFilter={activeFilter} counts={counts} />
      </div>
      <div className="mt-4">
        {notifications.length > 0 ? (
          <NotificationList notifications={notifications} groupByDate={false} />
        ) : (
          <NotificationEmpty filter={activeFilter} />
        )}
      </div>
      <NotificationPagination currentPage={currentPage} pageSize={pageSize} pageCount={pageCount} />
    </div>
  );
};
