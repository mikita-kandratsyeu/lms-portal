'use client';

import { CheckCheck, MoreHorizontal, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/use-toast';
import { fetcher } from '@/lib/fetcher';

type ColumnActionsProps = {
  id: string;
  isRead: boolean;
  userId: string;
};

export const ColumnActions = ({ id, isRead, userId }: ColumnActionsProps) => {
  const t = useTranslations('notifications');

  const { toast } = useToast();
  const router = useRouter();

  const [isFetching, setIsFetching] = useState(false);

  const handleAction = (action: 'update' | 'remove') => async () => {
    try {
      setIsFetching(true);

      if (action === 'update') {
        await fetcher.patch(`/api/users/${userId}/notifications`, {
          body: {
            id,
            isRead: !isRead,
          },
        });
      }

      if (action === 'remove') {
        await fetcher.delete(`/api/users/${userId}/notifications?id=${id}`);
      }

      router.refresh();
    } catch (error) {
      toast({ isError: true });
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="h-4 w-8 p-0" variant="ghost" disabled={isFetching}>
          {isFetching && <Spinner className="h-4 w-4" />}
          {!isFetching && (
            <>
              <span className="sr-only">{t('openMenu')}</span>
              <MoreHorizontal className="h-4 w-4" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="hover:cursor-pointer" onClick={handleAction('update')}>
          <CheckCheck className="h-4 w-4  mr-2" />
          {t(isRead ? 'markAsUnread' : 'markAsRead')}
        </DropdownMenuItem>
        <DropdownMenuItem
          className="hover:cursor-pointer text-red-500"
          onClick={handleAction('remove')}
        >
          <XCircle className="h-4 w-4  mr-2" />
          {t('remove')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
