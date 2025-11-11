import { User } from '@prisma/client';
import { format } from 'date-fns/format';
import { CalendarDays } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { TEN_MINUTE_SEC, TIMESTAMP_PREVIEW_TEMPLATE } from '@/constants/common';
import { fetchCachedData } from '@/lib/cache';
import { fetcher } from '@/lib/fetcher';
import { getFallbackName } from '@/lib/utils';

import { UserHoverSkeleton } from '../loaders/user-hover-skeleton';
import { useToast } from '../ui/use-toast';
import { TextBadge } from './text-badge';

type UserHoverCardProps = {
  children: React.ReactNode;
  userId: string;
};

export const UserHoverCard = ({ children, userId }: UserHoverCardProps) => {
  const t = useTranslations('profileButton');

  const { toast } = useToast();

  const [user, setUser] = useState<(User & { hasSubscription?: boolean }) | null>(null);

  const fetchUserData = async () => {
    try {
      const userData = await fetchCachedData(
        `user-hover-card_${userId}`,
        async () => {
          const response = await fetcher.get(`/api/users/${userId}`, {
            responseType: 'json',
          });

          return response;
        },
        TEN_MINUTE_SEC,
      );

      setUser(userData);
    } catch (error) {
      console.error('[USER_HOVER_CARD]', error);

      setUser(null);
      toast({ isError: true });
    }
  };

  return (
    <HoverCard>
      <HoverCardTrigger asChild onMouseEnter={fetchUserData}>
        {children}
      </HoverCardTrigger>
      <HoverCardContent className="w-70">
        {user && (
          <div className="flex space-x-4 items-center mb-4">
            <Avatar className="border dark:border-muted-foreground w-10 h-10">
              <AvatarImage src={user.pictureUrl ?? ''} />
              <AvatarFallback>{getFallbackName(user.name ?? '')}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="flex gap-1 items-center">
                <p className="text-sm font-semibold truncate">{user.name}</p>
                <div className="ml-1">
                  {user.hasSubscription && <TextBadge label={t('premium')} variant="lime" />}
                </div>
              </div>
              <p className="text-xs leading-none text-muted-foreground">{t(user?.role)}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
              <div className="flex items-center pt-2">
                <CalendarDays className="mr-1 h-4 w-4 text-neutral-500" />
                <span className="text-xs text-muted-foreground">
                  {t('joined', { date: format(user.createdAt, TIMESTAMP_PREVIEW_TEMPLATE) })}
                </span>
              </div>
            </div>
          </div>
        )}
        {!user && <UserHoverSkeleton />}
      </HoverCardContent>
    </HoverCard>
  );
};
