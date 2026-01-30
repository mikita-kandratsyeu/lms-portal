'use client';

import { Bell, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { fetcher } from '@/lib/fetcher';

type NotificationHeaderProps = {
  totalCount: number;
  unreadCount: number;
  userId?: string;
};

export const NotificationHeader = ({
  totalCount,
  unreadCount,
  userId,
}: NotificationHeaderProps) => {
  const t = useTranslations('notifications');
  const { toast } = useToast();
  const router = useRouter();

  const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
  const [isDeletingRead, setIsDeletingRead] = useState(false);

  const handleMarkAllAsRead = async () => {
    if (!userId || unreadCount === 0) return;

    try {
      setIsMarkingAllRead(true);

      await fetcher.patch(`/api/users/${userId}/notifications?markAllRead=true`, {
        body: { isRead: true },
      });

      toast({ description: t('allMarkedAsRead') });
      router.refresh();
    } catch (error) {
      toast({ isError: true, description: (error as Error)?.message ?? '' });
    } finally {
      setIsMarkingAllRead(false);
    }
  };

  const handleDeleteAllRead = async () => {
    if (!userId) return;

    try {
      setIsDeletingRead(true);

      await fetcher.delete(`/api/users/${userId}/notifications?deleteAllRead=true`);

      toast({ description: t('readDeleted') });
      router.refresh();
    } catch (error) {
      toast({ isError: true, description: (error as Error)?.message ?? '' });
    } finally {
      setIsDeletingRead(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {unreadCount > 0 && (
          <p className="text-sm text-muted-foreground">
            {t('unreadCount', { count: unreadCount })}
          </p>
        )}
      </div>

      {(unreadCount > 0 || totalCount > unreadCount) && totalCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAllRead}
              isLoading={isMarkingAllRead}
            >
              {!isMarkingAllRead && <Bell className="h-4 w-4 mr-2" />}
              {t('markAllAsRead')}
            </Button>
          )}
          {totalCount > unreadCount && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDeleteAllRead}
              disabled={isDeletingRead}
              isLoading={isDeletingRead}
            >
              {!isDeletingRead && <Trash2 className="h-4 w-4 mr-2" />}
              {t('deleteAllRead')}
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
