'use client';

import { CheckCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui';
import { useToast } from '@/components/ui/use-toast';
import { fetcher } from '@/lib/fetcher';
import { getNotificationActionName } from '@/lib/notifications';

type MarkAllButtonProps = {
  action: ReturnType<typeof getNotificationActionName>['action'];
  amount: number;
  ids: ReturnType<typeof getNotificationActionName>['ids'];
  reset?: () => void;
};

export const MarkAllButton = ({ action, amount, ids, reset }: MarkAllButtonProps) => {
  const t = useTranslations('notifications');

  const { toast } = useToast();
  const router = useRouter();

  const [isFetching, setIsFetching] = useState(false);

  const handleAction = async () => {
    try {
      setIsFetching(true);

      await fetcher.patch(`/api/users/${ids[0].userId}/notifications?all=true`, {
        body: {
          ids,
          isRead: action === 'read',
        },
      });

      router.refresh();
      reset?.();
    } catch (error) {
      toast({ isError: true, description: (error as Error)?.message ?? '' });
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <Button disabled={isFetching} isLoading={isFetching} onClick={handleAction}>
      {!isFetching && <CheckCheck className="h-4 w-4 mr-2" />}
      {t('markSelected', { amount, action: t(action).toLowerCase() })}
    </Button>
  );
};
