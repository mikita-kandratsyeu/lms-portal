'use client';

import { useTranslations } from 'next-intl';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { PERSONAL_PIE_COLORS } from '@/constants/ai/analytics';
import { getFallbackName } from '@/lib/utils';

import type { ModelUsage, PersonalAgent } from './types';

type AnalyticsPersonalProps = {
  personalAgents: PersonalAgent[];
  personalUsers: number;
  personalTop: ModelUsage | null;
  personalModelUsage: ModelUsage[];
  hasPersonalUsage: boolean;
};

export const AnalyticsPersonal = ({
  personalAgents,
  personalUsers,
  personalTop,
  personalModelUsage,
  hasPersonalUsage,
}: AnalyticsPersonalProps) => {
  const t = useTranslations('ai-agents.analytics');
  const emptyLabel = t('emptyData');
  const hasPersonalAgents = personalAgents.length > 0 && personalUsers > 0;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>{t('myAgentUsers.title')}</CardTitle>
          <p className="text-xs text-muted-foreground">{t('myAgentUsers.subtitle')}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasPersonalAgents ? (
            personalAgents.map((agent) => (
              <div key={agent.id} className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Avatar className="h-9 w-9 shrink-0 border dark:border-muted-foreground">
                    <AvatarImage src={agent.pictureUrl ?? ''} />
                    <AvatarFallback>{getFallbackName(agent.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{agent.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('myAgentUsers.activeUsers', { count: agent.users })}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 text-xs text-muted-foreground">
                  {Math.round((agent.users / personalUsers) * 100)}%
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">{emptyLabel}</p>
          )}
        </CardContent>
      </Card>
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>{t('popularModelPersonal.title')}</CardTitle>
          {personalTop && hasPersonalUsage ? (
            <p className="text-xs text-muted-foreground">
              {t('popularModelPersonal.uses', { amount: personalTop.uses.toLocaleString() })}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">{emptyLabel}</p>
          )}
        </CardHeader>
        <CardContent>
          {personalTop && hasPersonalUsage ? (
            <>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-lg font-semibold">{personalTop.model}</p>
                  <p className="text-xs text-muted-foreground">
                    {t('popularModelPersonal.subtitle')}
                  </p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={personalModelUsage} dataKey="uses" nameKey="model" innerRadius={50}>
                    {personalModelUsage.map((entry, index) => (
                      <Cell
                        key={entry.model}
                        fill={PERSONAL_PIE_COLORS[index % PERSONAL_PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">{emptyLabel}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
