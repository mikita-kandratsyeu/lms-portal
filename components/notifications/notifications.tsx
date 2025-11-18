'use client';

import { Notification } from '@prisma/client';
import { Inbox } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Pusher from 'pusher-js';
import { memo, useCallback, useEffect, useMemo, useState, useTransition } from 'react';

import { useCurrentUser } from '@/hooks/use-current-user';
import { cn } from '@/lib/utils';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  ScrollArea,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../ui';
import { NotificationCards } from './notification-cards';

if (process.env.NODE_ENV === 'development') {
  Pusher.logToConsole = true;
}

type NotificationsProps = {
  userNotifications?: Omit<Notification, 'userId'>[];
};

const EmptyStateComponent = memo(({ t, isUnread }: { t: any; isUnread: boolean }) => (
  <div className="my-16 text-center flex flex-col gap-2">
    <p className="text-sm font-semibold">{t('upToDate')}</p>
    <p className="text-sm text-muted-foreground">
      {isUnread ? t('notFoundAtTheMoment') : t('notFound')}
    </p>
  </div>
));

export const NotificationsComponent = ({ userNotifications = [] }: NotificationsProps) => {
  const t = useTranslations('notifications');
  const { user } = useCurrentUser();
  const router = useRouter();
  const [isFetching] = useTransition();
  const [open, setOpen] = useState(false);

  const unreadNotifications = useMemo(
    () => userNotifications.filter((un) => !un.isRead),
    [userNotifications],
  );

  const amountOfNotifications = userNotifications.length;

  const handleOpenChange = useCallback((value: boolean) => {
    setOpen(value);
  }, []);

  const handleViewAllClick = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY as string, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string,
    });

    const channelName = `notification_channel_${user?.userId}`;
    const channel = pusher.subscribe(channelName);

    const handleNotification = (data: { trigger: boolean }) => {
      const trigger = data?.trigger;
      if (trigger) {
        router.refresh();
      }
    };

    channel.bind(`private_event_${user?.userId}`, handleNotification);

    return () => {
      channel.unbind(`private_event_${user?.userId}`, handleNotification);
      pusher.unsubscribe(channelName);
    };
  }, [user?.userId, router]);

  const buttonClassName = useMemo(
    () =>
      cn(
        'group flex text-sm text-muted-foreground items-center p-2 hover:bg-muted rounded-lg transition-background group duration-300 ease-in-out border hover:text-primary dark:border-muted-foreground',
        open && 'bg-muted text-primary font-medium',
      ),
    [open],
  );

  const inboxClassName = useMemo(
    () => cn('h-5 w-5 font-medium', open && 'text-primary font-medium animate-spin-once'),
    [open],
  );

  const notificationDotClassName = useMemo(
    () =>
      cn(
        'absolute w-[10px] h-[10px] rounded-full bg-red-400 group-hover:bg-red-500 top-1.5 right-1.5 flex items-center justify-center truncate',
        open && 'bg-red-500',
      ),
    [open],
  );

  return (
    <DropdownMenu open={open} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild className="relative block hover:cursor-pointer">
        <button className={buttonClassName}>
          <Inbox className={inboxClassName} />
          {Boolean(unreadNotifications.length) && <div className={notificationDotClassName}></div>}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[340px] sm:mr-16 mr-4 mt-1">
        <div className="px-2 pt-4">
          <Tabs defaultValue="unread" className="w-full">
            <TabsList className="w-full">
              <TabsTrigger className="w-full" value="unread">
                {t('unread')}
              </TabsTrigger>
              <TabsTrigger className="w-full" value="all">
                {t('all')}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="w-[340px] ml-[-1em] pt-2">
              <ScrollArea className="pl-4 pr-2.5 w-full max-h-[200px] overflow-auto">
                <NotificationCards notifications={userNotifications} isFetching={isFetching} />
                {!amountOfNotifications && <EmptyStateComponent t={t} isUnread={false} />}
              </ScrollArea>
            </TabsContent>
            <TabsContent value="unread" className="w-[340px] ml-[-1em] pt-2">
              <ScrollArea className="pl-4 pr-2.5 w-full max-h-[200px] overflow-auto">
                <NotificationCards notifications={unreadNotifications} isFetching={isFetching} />
                {!unreadNotifications.length && <EmptyStateComponent t={t} isUnread={true} />}
              </ScrollArea>
            </TabsContent>
          </Tabs>
          <div className="flex justify-center items-center border-t py-2 font-semibold">
            <Link href="/settings/notifications">
              <Button variant="ghost" size="sm" onClick={handleViewAllClick}>
                {t('viewAll')}
              </Button>
            </Link>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

EmptyStateComponent.displayName = 'EmptyStateComponent';
NotificationsComponent.displayName = 'Notifications';

export const Notifications = memo(NotificationsComponent);
