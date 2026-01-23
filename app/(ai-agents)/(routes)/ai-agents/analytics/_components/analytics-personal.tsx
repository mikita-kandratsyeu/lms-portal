'use client';

import { useTranslations } from 'next-intl';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { PERSONAL_PIE_COLORS } from '@/constants/ai/analytics';

import type { ModelUsage, PersonalAgent } from './types';

type AnalyticsPersonalProps = {
  personalAgents: PersonalAgent[];
  personalUsers: number;
  personalTop?: ModelUsage;
  personalModelUsage: ModelUsage[];
};

export const AnalyticsPersonal = ({
  personalAgents,
  personalUsers,
  personalTop,
  personalModelUsage,
}: AnalyticsPersonalProps) => {
  const t = useTranslations('ai-agents.analytics');

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>{t('myAgentUsers.title')}</CardTitle>
          <p className="text-xs text-muted-foreground">{t('myAgentUsers.subtitle')}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {personalAgents.map((agent) => (
            <div key={agent.name} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{agent.name}</p>
                <p className="text-xs text-muted-foreground">
                  {t('myAgentUsers.activeUsers', { count: agent.users })}
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                {Math.round((agent.users / personalUsers) * 100)}%
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>{t('popularModelPersonal.title')}</CardTitle>
          {personalTop && (
            <p className="text-xs text-muted-foreground">
              {t('popularModelPersonal.uses', { amount: personalTop.uses.toLocaleString() })}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {personalTop && (
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-lg font-semibold">{personalTop.model}</p>
                <p className="text-xs text-muted-foreground">
                  {t('popularModelPersonal.subtitle')}
                </p>
              </div>
            </div>
          )}
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
        </CardContent>
      </Card>
    </div>
  );
};
