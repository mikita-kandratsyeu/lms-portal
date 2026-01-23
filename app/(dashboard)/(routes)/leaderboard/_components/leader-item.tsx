'use client';

import { useTranslations } from 'next-intl';

import { Leader } from '@/actions/courses/get-leaders';
import { TextBadge } from '@/components/common/text-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui';
import { getFallbackName } from '@/lib/utils';

type LeaderItemProps = { leader: Leader; userId?: string };

export const LeaderItem = ({ leader, userId }: LeaderItemProps) => {
  const t = useTranslations('leaderboard');

  return (
    <div className="flex items-center gap-3 min-w-0">
      <Avatar className="h-8 w-8 sm:h-9 sm:w-9 border dark:border-muted-foreground">
        <AvatarImage src={leader.picture ?? ''} />
        <AvatarFallback>{getFallbackName(leader.name as string)}</AvatarFallback>
      </Avatar>
      <div className="flex flex-wrap items-center gap-2 min-w-0">
        <p className="text-sm font-semibold truncate max-w-[160px] sm:max-w-none">{leader.name}</p>
        {leader.userId === userId && <TextBadge label={t('you')} variant="indigo" />}
        {leader.hasSubscription && !leader.isOwner && (
          <TextBadge label="Nova&nbsp;Plus" variant="lime" />
        )}
        {leader.isOwner && <TextBadge label="Owner" variant="indigo" />}
      </div>
    </div>
  );
};
