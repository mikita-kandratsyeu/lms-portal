'use server';

import { Notification } from '@prisma/client';

import { PAGE_SIZES } from '@/constants/paginations';
import db from '@/lib/db';

type GetUserNotifications = {
  filter?: 'all' | 'unread' | 'read';
  pageIndex?: string | number;
  pageSize?: string | number;
  search?: string;
  take?: number;
  userId?: string;
};

export const getUserNotifications = async ({
  filter = 'all',
  pageIndex = 0,
  pageSize = PAGE_SIZES[0],
  search,
  take,
  userId,
}: GetUserNotifications): Promise<{ notifications: Notification[]; pageCount: number }> => {
  if (!userId) {
    return { notifications: [], pageCount: 0 };
  }

  const index = Number(pageIndex);
  const size = Number(pageSize);

  const whereClause: any = {
    userId,
    title: { contains: search, mode: 'insensitive' },
  };

  if (filter === 'unread') {
    whereClause.isRead = false;
  } else if (filter === 'read') {
    whereClause.isRead = true;
  }

  try {
    const userNotifications = await db.notification.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      select: {
        body: true,
        createdAt: true,
        id: true,
        isRead: true,
        title: true,
        updatedAt: true,
        userId: true,
      },
      skip: index * size,
      take: take ?? size,
    });

    const count = await db.notification.count({
      where: whereClause,
    });

    return { notifications: userNotifications, pageCount: Math.ceil(count / size) };
  } catch (error) {
    console.error('[GET_USER_NOTIFICATION_ACTION]', error);

    return { notifications: [], pageCount: 0 };
  }
};
