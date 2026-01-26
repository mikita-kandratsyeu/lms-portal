'use client';

import { Info } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { getNovaPulse } from '@/actions/nova-pulse/get-nova-pulse';
import { TextBadge, TextVariantsProps } from '@/components/common/text-badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui';
import { useCurrentUser } from '@/hooks/use-current-user';
import { getTimeGreeting } from '@/lib/date';

import { Heatmap } from './heat-map';
import { TotalCard } from './total-card';

type NovaPulseProps = {
  info: Awaited<ReturnType<typeof getNovaPulse>>;
};

export const NovaPulse = ({ info }: NovaPulseProps) => {
  const t = useTranslations('nova-pulse');

  const { user } = useCurrentUser();

  const greeting = getTimeGreeting();

  return (
    <div className="flex flex-col gap-y-2">
      <div className="mb-4 px-2">
        <div className="flex justify-between items-center mb-2">
          <h2 className="font-medium mb-2 text-xl">
            {t(`greeting.${greeting}`, { name: user?.name ?? '' })}
          </h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="hidden sm:block">
                <p className="flex gap-x-2 text-muted-foreground items-center text-xs">
                  {t('about.title')}
                  <Info className="h-4 w-4" />
                </p>
              </TooltipTrigger>
              <TooltipContent>{t('about.body')}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="gap-x-2 hidden sm:flex">
          <TextBadge
            label={info.summary.title}
            variant={
              ['green', 'indigo', 'lime', 'red', 'yellow'].includes(info.summary.color as string)
                ? (info.summary.color as TextVariantsProps['variant'])
                : 'default'
            }
          />
          <TextBadge label={String(info.xp) + ' Points'} variant="yellow" />
        </div>
      </div>
      <div className="flex gap-4 flex-col">
        <Heatmap data={info.heatMap} summary={info.summary} />
        <div className="flex gap-4 flex-col md:flex-row">
          <TotalCard info={info} type="time" />
          <TotalCard info={info} type="money" />
        </div>
      </div>
    </div>
  );
};
