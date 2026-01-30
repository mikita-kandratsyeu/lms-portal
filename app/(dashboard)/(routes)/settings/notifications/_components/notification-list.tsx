'use client';

import { Notification } from '@prisma/client';
import { isThisWeek, isToday, isYesterday, startOfWeek } from 'date-fns';
import { useTranslations } from 'next-intl';

import { NotificationCard } from './notification-card';

type NotificationListProps = {
  notifications: Notification[];
  groupByDate?: boolean;
};

type GroupedNotifications = {
  today: Notification[];
  yesterday: Notification[];
  thisWeek: Notification[];
  older: Notification[];
};

const groupNotificationsByDate = (notifications: Notification[]): GroupedNotifications => {
  const grouped: GroupedNotifications = {
    today: [],
    yesterday: [],
    thisWeek: [],
    older: [],
  };

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });

  notifications.forEach((notification) => {
    const date = new Date(notification.createdAt);

    if (isToday(date)) {
      grouped.today.push(notification);
    } else if (isYesterday(date)) {
      grouped.yesterday.push(notification);
    } else if (isThisWeek(date, { weekStartsOn: 1 }) && date >= weekStart) {
      grouped.thisWeek.push(notification);
    } else {
      grouped.older.push(notification);
    }
  });

  return grouped;
};

export const NotificationList = ({ notifications, groupByDate = true }: NotificationListProps) => {
  const t = useTranslations('notifications');

  if (!groupByDate) {
    return (
      <div className="grid gap-3 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
        {notifications.map((notification) => (
          <NotificationCard key={notification.id} notification={notification} />
        ))}
      </div>
    );
  }

  const grouped = groupNotificationsByDate(notifications);

  const sections = [
    { key: 'today', label: t('today'), notifications: grouped.today },
    { key: 'yesterday', label: t('yesterday'), notifications: grouped.yesterday },
    { key: 'thisWeek', label: t('thisWeek'), notifications: grouped.thisWeek },
    { key: 'older', label: t('older'), notifications: grouped.older },
  ];

  return (
    <div className="space-y-4">
      {sections.map(
        (section) =>
          section.notifications.length > 0 && (
            <div key={section.key}>
              <h2 className="text-sm font-semibold text-muted-foreground mb-2 px-1">
                {section.label}
              </h2>
              <div className="grid gap-3 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
                {section.notifications.map((notification) => (
                  <NotificationCard key={notification.id} notification={notification} />
                ))}
              </div>
            </div>
          ),
      )}
    </div>
  );
};
