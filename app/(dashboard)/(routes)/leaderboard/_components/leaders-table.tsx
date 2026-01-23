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
};

export const LeadersTable = ({ leaders, userId }: LeadersTableProps) => {
  const t = useTranslations('leaderboard');

  const [filteredLeaders, currentLeader] = leaders.reduce<[Leader[], Leader | null]>(
    ([filteredLeaders, currentLeader], leader) => {
      if (leader.userId !== userId) {
        filteredLeaders.push(leader);
      } else {
        currentLeader = leader;
      }

      return [filteredLeaders, currentLeader];
    },
    [[], null],
  );

  return (
    <div className="w-full rounded-xl border bg-card shadow-sm overflow-hidden">
      <Table className="w-full text-xs sm:text-sm">
        {!leaders.length && <TableCaption className="text-center">{t('notFound')}</TableCaption>}
        <TableHeader className="bg-muted/40">
          <TableRow>
            <TableHead className="w-[72px] sm:w-[100px] text-xs uppercase tracking-wide">
              {t('rank')}
            </TableHead>
            <TableHead className="text-xs uppercase tracking-wide">{t('user')}</TableHead>
            <TableHead className="text-right text-xs uppercase tracking-wide">
              {t('points')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentLeader && (
            <TableRow className="bg-muted/30">
              <TableCell className="font-medium text-muted-foreground">
                <Coffee className="h-4 w-4" />
              </TableCell>
              <TableCell>
                <LeaderItem leader={currentLeader} userId={userId} />
              </TableCell>
              <TableCell className="text-right">
                <TextBadge label={String(currentLeader.xp)} variant="yellow" />
              </TableCell>
            </TableRow>
          )}
          {filteredLeaders.map((leader, index) => (
            <TableRow key={leader.userId}>
              <TableCell className="font-medium text-muted-foreground">{index + 1}</TableCell>
              <TableCell>
                <LeaderItem leader={leader} />
              </TableCell>
              <TableCell className="text-right">
                <TextBadge label={String(leader.xp)} variant="yellow" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
