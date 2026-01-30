'use client';

import { Notification } from '@prisma/client';
import { formatDistanceToNow } from 'date-fns';
import { CheckCheck, MoreVertical, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/use-toast';
import { fetcher } from '@/lib/fetcher';
import { cn } from '@/lib/utils';

type NotificationCardProps = {
  notification: Notification;
};

export const NotificationCard = ({ notification }: NotificationCardProps) => {
  const t = useTranslations('notifications');
  const { toast } = useToast();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const handleToggleRead = async () => {
    try {
      setIsLoading(true);

      await fetcher.patch(`/api/users/${notification.userId}/notifications`, {
        body: {
          id: notification.id,
          isRead: !notification.isRead,
        },
      });

      router.refresh();
    } catch (error) {
      toast({ isError: true, description: (error as Error)?.message ?? '' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);

      await fetcher.delete(`/api/users/${notification.userId}/notifications?id=${notification.id}`);

      toast({ description: t('notificationDeleted') });
      router.refresh();
    } catch (error) {
      toast({ isError: true, description: (error as Error)?.message ?? '' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={cn(
        'group relative p-4 rounded-lg border transition-all flex flex-col h-full',
        notification.isRead ? 'bg-background' : 'bg-muted/50 border-primary/20',
      )}
    >
      <div className="flex gap-3 flex-1">
        <div className="flex-shrink-0 pt-1">
          {!notification.isRead && (
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3
              className={cn(
                'text-sm font-medium line-clamp-2',
                notification.isRead ? 'text-muted-foreground' : 'text-foreground',
              )}
            >
              {notification.title}
            </h3>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    <MoreVertical className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleToggleRead} className="cursor-pointer">
                  <CheckCheck className="h-4 w-4 mr-2" />
                  {notification.isRead ? t('markAsUnread') : t('markAsRead')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleDelete}
                  className="cursor-pointer text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('remove')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <p
            className={cn(
              'text-sm mb-3 line-clamp-3 flex-1',
              notification.isRead ? 'text-muted-foreground' : 'text-foreground',
            )}
          >
            {notification.body}
          </p>

          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-auto">
            <time dateTime={notification.createdAt.toISOString()}>
              {formatDistanceToNow(notification.createdAt, { addSuffix: true })}
            </time>
          </div>
        </div>
      </div>
      {!notification.isRead && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute bottom-2 right-2 h-7 text-xs md:hidden"
          onClick={handleToggleRead}
          disabled={isLoading}
        >
          {isLoading ? <Spinner className="h-3 w-3 mr-1" /> : null}
          {t('markAsRead')}
        </Button>
      )}
    </div>
  );
};
