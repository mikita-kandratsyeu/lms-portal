'use client';

import { Notification } from '@prisma/client';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { memo, useState, useTransition } from 'react';

import { useToast } from '@/components/ui/use-toast';
import { useCurrentUser } from '@/hooks/use-current-user';
import { fetcher } from '@/lib/fetcher';
import { cn } from '@/lib/utils';
import { Spinner } from '../ui/spinner';

type NotificationCardsProps = {
  isFetching?: boolean;
  notifications: Omit<Notification, 'userId'>[];
};

type NotificationCardProps = Omit<NotificationCardsProps, 'notifications'> & {
  notification: Omit<Notification, 'userId'>;
  userId?: string;
};

const NotificationCard = ({ isFetching = false, notification, userId }: NotificationCardProps) => {
  const t = useTranslations('notifications');

  const { toast } = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [isLoading, setIsLoading] = useState(false);

  const handleMarkAsRead = async (id: string) => {
    try {
      setIsLoading(true);

      await fetcher.patch(`/api/users/${userId}/notifications`, {
        body: {
          id,
          isRead: true,
        },
      });

      startTransition(() => router.refresh());
    } catch (error) {
      console.error('[NOTIFICATION-CARDS]', error);

      toast({ isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn('py-2 mb-2 flex flex-col', notification.isRead ? 'text-muted-foreground' : '')}
    >
      <p className="text-sm font-medium">
        {!notification.isRead && (
          <div className="bg-green-500 rounded-full w-2 h-2 inline-block mr-1"></div>
        )}
        {notification.title}
      </p>
      <p className="text-xs">{notification.body}</p>
      <div className="text-xs text-muted-foreground mt-2 flex justify-between items-center">
        <p>{formatDistanceToNow(notification.createdAt, { addSuffix: true })}</p>
        {!notification.isRead && (
          <>
            {(isLoading || pending) && <Spinner className="h-4 w-4" />}
            {!isLoading && !pending && (
              <button
                className="hover:underline"
                onClick={() => handleMarkAsRead(notification.id)}
                disabled={isLoading || isFetching}
              >
                {t('markAsRead')}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const NotificationCardsComponent = ({
  isFetching = false,
  notifications,
}: NotificationCardsProps) => {
  const { user } = useCurrentUser();

  return notifications.map((notification) => (
    <NotificationCard
      key={notification.id}
      isFetching={isFetching}
      notification={notification}
      userId={user?.userId}
    />
  ));
};

NotificationCardsComponent.displayName = 'NotificationCards';

export const NotificationCards = memo(NotificationCardsComponent);
