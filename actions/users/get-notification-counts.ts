'use server';

import db from '@/lib/db';

type GetNotificationCounts = {
  userId?: string;
};

export const getNotificationCounts = async ({ userId }: GetNotificationCounts) => {
  if (!userId) {
    return { all: 0, unread: 0, read: 0 };
  }

  try {
    const [allCount, unreadCount, readCount] = await Promise.all([
      db.notification.count({ where: { userId } }),
      db.notification.count({ where: { userId, isRead: false } }),
      db.notification.count({ where: { userId, isRead: true } }),
    ]);

    return {
      all: allCount,
      unread: unreadCount,
      read: readCount,
    };
  } catch (error) {
    console.error('[GET_NOTIFICATION_COUNTS_ACTION]', error);
    return { all: 0, unread: 0, read: 0 };
  }
};
