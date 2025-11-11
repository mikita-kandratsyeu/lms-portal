'use client';

import { CheckCircle, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { IconBadge } from '@/components/common/icon-badge';
import { FilterStatus } from '@/constants/courses';

type InfoCardProps = {
  courseStatus: FilterStatus;
  numberOfItems: number;
};

const filterMap = {
  [FilterStatus.PROGRESS]: {
    filter: FilterStatus.PROGRESS,
    icon: Clock,
    key: 'inProgress',
    variant: 'default',
  },
  [FilterStatus.COMPLETED]: {
    filter: FilterStatus.COMPLETED,
    icon: CheckCircle,
    key: 'completed',
    variant: 'success',
  },
};

export const InfoCard = ({ courseStatus, numberOfItems }: InfoCardProps) => {
  const t = useTranslations('courses.info-card');

  const filterInfo = filterMap[courseStatus];

  return (
    <div className="border rounded-lg flex items-center gap-x-2 p-3 hover:text-accent-foreground">
      <IconBadge icon={filterInfo.icon} variant={filterInfo.variant as 'default' | 'success'} />
      <div>
        <p className="font-medium">{t(filterInfo.key)}</p>
        <p className="text-muted-foreground text-xs text-left">
          {t('course', { amount: numberOfItems })}
        </p>
      </div>
    </div>
  );
};
