import { Notification } from '@prisma/client';

import { getUserNotifications } from '@/actions/users/get-user-notifications';
import { pusher } from '@/server/pusher';

import db from './db';

type UserNotification = Awaited<ReturnType<typeof getUserNotifications>>['notifications'][number];
type CreateWebSocketNotification = {
  channel: string;
  data: Pick<Notification, 'body' | 'title' | 'userId'>;
  event: string;
};

export const getNotificationActionName = (
  notifications: UserNotification[],
): { action: 'read' | 'unread'; ids: { id: string; userId: string }[] } => {
  return {
    action: notifications.some((nt) => !nt.isRead) ? 'read' : 'unread',
    ids: notifications.map((nt) => ({
      id: nt.id,
      userId: nt.userId,
    })),
  };
};

export const createWebSocketNotification = async ({
  channel,
  data,
  event,
}: CreateWebSocketNotification) => {
  await db.notification.create({
    data,
  });

  await pusher.trigger(channel, event, {
    trigger: true,
  });
};
