'use client';

import { useTranslations } from 'next-intl';

import { Leader } from '@/actions/courses/get-leaders';
import { TextBadge } from '@/components/common/text-badge';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';

import { LeaderItem } from './leader-item';

type LeadersTableProps = {
  leaders: Leader[];
  userId?: string;
  currentUserLeader: Leader | null;
  totalUsersCount: number;
};

const MAX_DISPLAYED_USERS = 10;

export const LeadersTable = ({
  leaders,
  userId,
  currentUserLeader,
  totalUsersCount,
}: LeadersTableProps) => {
  const t = useTranslations('leaderboard');

  const displayedLeaders = leaders.slice(0, MAX_DISPLAYED_USERS);
  const displayedCount = currentUserLeader ? displayedLeaders.length + 1 : displayedLeaders.length;

  return (
    <div className="space-y-4">
      <div className="w-full rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table className="w-full">
          {!leaders.length && !currentUserLeader && (
            <TableCaption className="text-center py-8">{t('notFound')}</TableCaption>
          )}
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-[60px] sm:w-[80px] text-xs sm:text-sm uppercase tracking-wide">
                {t('rank')}
              </TableHead>
              <TableHead className="text-xs sm:text-sm uppercase tracking-wide">
                {t('user')}
              </TableHead>
              <TableHead className="text-right w-[80px] sm:w-[100px] text-xs sm:text-sm uppercase tracking-wide">
                {t('points')}
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayedLeaders.map((leader, index) => {
              const rank = index + 1;
              const isCurrentUser = leader.userId === userId;
              return (
                <TableRow
                  key={leader.userId}
                  className={isCurrentUser ? 'bg-primary/5' : undefined}
                >
                  <TableCell className="font-medium text-muted-foreground py-3 sm:py-4">
                    <div className="flex items-center justify-center sm:justify-start">
                      <span className="text-sm sm:text-base">{rank}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 sm:py-4">
                    <LeaderItem leader={leader} userId={isCurrentUser ? userId : undefined} />
                  </TableCell>
                  <TableCell className="text-right py-3 sm:py-4">
                    <div className="flex justify-end">
                      <TextBadge label={String(leader.xp)} variant="yellow" />
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
      {(leaders.length > 0 || currentUserLeader) && (
        <div className="text-center text-sm text-muted-foreground">
          {t('showingCount', { displayed: displayedCount, total: totalUsersCount })}
        </div>
      )}
    </div>
  );
};
