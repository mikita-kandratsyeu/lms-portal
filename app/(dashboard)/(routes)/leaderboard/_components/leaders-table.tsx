'use client';

import { Coffee } from 'lucide-react';
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
  totalUsersCount: number;
};

const MAX_DISPLAYED_USERS = 10;

export const LeadersTable = ({ leaders, userId, totalUsersCount }: LeadersTableProps) => {
  const t = useTranslations('leaderboard');

  const currentUserIndex = leaders.findIndex((leader) => leader.userId === userId);
  const currentLeader = currentUserIndex !== -1 ? leaders[currentUserIndex] : null;

  let displayedLeaders: Leader[];
  if (currentUserIndex !== -1 && currentUserIndex < MAX_DISPLAYED_USERS) {
    displayedLeaders = leaders
      .filter((leader) => leader.userId !== userId)
      .slice(0, MAX_DISPLAYED_USERS - 1);
  } else {
    displayedLeaders = leaders.slice(0, MAX_DISPLAYED_USERS);
  }

  const displayedCount = currentLeader ? displayedLeaders.length + 1 : displayedLeaders.length;

  return (
    <div className="space-y-4">
      <div className="w-full rounded-xl border bg-card shadow-sm overflow-hidden">
        <Table className="w-full">
          {!leaders.length && (
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
            {currentLeader && (
              <TableRow className="bg-muted/30">
                <TableCell className="font-medium text-muted-foreground py-3 sm:py-4">
                  <div className="flex items-center justify-center sm:justify-start">
                    <Coffee className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                </TableCell>
                <TableCell className="py-3 sm:py-4">
                  <LeaderItem leader={currentLeader} userId={userId} />
                </TableCell>
                <TableCell className="text-right py-3 sm:py-4">
                  <div className="flex justify-end">
                    <TextBadge label={String(currentLeader.xp)} variant="yellow" />
                  </div>
                </TableCell>
              </TableRow>
            )}
            {displayedLeaders.map((leader) => {
              const rank = leaders.findIndex((l) => l.userId === leader.userId) + 1;
              return (
                <TableRow key={leader.userId}>
                  <TableCell className="font-medium text-muted-foreground py-3 sm:py-4">
                    <div className="flex items-center justify-center sm:justify-start">
                      <span className="text-sm sm:text-base">{rank}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 sm:py-4">
                    <LeaderItem leader={leader} />
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
      {leaders.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          {t('showingCount', { displayed: displayedCount, total: totalUsersCount })}
        </div>
      )}
    </div>
  );
};
