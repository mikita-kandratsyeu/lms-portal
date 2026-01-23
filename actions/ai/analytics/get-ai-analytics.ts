'use server';

import { startOfDay, startOfWeek, subDays } from 'date-fns';

import { Period, PeriodType } from '@/constants/ai/analytics';
import db from '@/lib/db';

export type ModelUsage = {
  model: string;
  uses: number;
};

export type WeeklyUsage = {
  week: string;
  global: number;
  personal: number;
};

export type PersonalAgentUsage = {
  id: string;
  name: string;
  users: number;
};

export type PeriodAnalytics = {
  globalModelUsage: ModelUsage[];
  personalModelUsage: ModelUsage[];
  weeklyUsage: WeeklyUsage[];
  globalUsers: number;
  personalUsers: number;
  personalAgents: PersonalAgentUsage[];
};

export type AiAnalyticsResponse = Record<Period, PeriodAnalytics>;

type GetAiAnalyticsArgs = {
  userId?: string;
};

const PERIOD_DAYS: Record<Exclude<Period, Period.ALL>, number> = {
  [Period['7D']]: 7,
  [Period['30D']]: 30,
  [Period['90D']]: 90,
};

const WEEK_STARTS_ON = 1;
const DEFAULT_WEEK_POINTS = 6;

const getPeriodRange = (period: Period, now: Date) => {
  if (period === Period.ALL) {
    return { start: null, end: now };
  }

  const days = PERIOD_DAYS[period];

  return {
    start: startOfDay(subDays(now, days - 1)),
    end: now,
  };
};

const getWeekRange = (period: Period, now: Date) => {
  if (period === Period.ALL) {
    const start = startOfWeek(subDays(now, DEFAULT_WEEK_POINTS * 7 - 1), {
      weekStartsOn: WEEK_STARTS_ON,
    });

    return { start, end: now };
  }

  const { start } = getPeriodRange(period, now);

  return {
    start: start ? startOfWeek(start, { weekStartsOn: WEEK_STARTS_ON }) : null,
    end: now,
  };
};

const aggregateModelUsage = async (
  agentIds: string[],
  start: Date | null,
  end: Date,
): Promise<ModelUsage[]> => {
  if (!agentIds.length) {
    return [];
  }

  const usageRows = await db.aiAgentModelUsageBucket.findMany({
    where: {
      agentId: { in: agentIds },
      periodType: PeriodType.DAY,
      ...(start
        ? {
            periodStart: {
              gte: start,
              lte: end,
            },
          }
        : {}),
    },
    select: {
      model: true,
      uses: true,
    },
  });

  const aggregated = new Map<string, number>();

  usageRows.forEach((row) => {
    aggregated.set(row.model, (aggregated.get(row.model) ?? 0) + row.uses);
  });

  return [...aggregated.entries()]
    .map(([model, uses]) => ({ model, uses }))
    .sort((a, b) => b.uses - a.uses);
};

const aggregateUniqueUsers = async (agentIds: string[], start: Date | null, end: Date) => {
  if (!agentIds.length) {
    return { totalUsers: 0, perAgent: new Map<string, Set<string>>() };
  }

  const usageSeen = await db.aiAgentUsageSeen.findMany({
    where: {
      agentId: { in: agentIds },
      periodType: PeriodType.DAY,
      ...(start
        ? {
            periodStart: {
              gte: start,
              lte: end,
            },
          }
        : {}),
    },
    select: {
      agentId: true,
      userId: true,
    },
  });

  const userSet = new Set<string>();
  const perAgent = new Map<string, Set<string>>();

  usageSeen.forEach((row) => {
    userSet.add(row.userId);
    if (!perAgent.has(row.agentId)) {
      perAgent.set(row.agentId, new Set<string>());
    }
    perAgent.get(row.agentId)?.add(row.userId);
  });

  return { totalUsers: userSet.size, perAgent };
};

const aggregateWeeklyUsage = async (
  globalAgentIds: string[],
  personalAgentIds: string[],
  start: Date | null,
  end: Date,
) => {
  const [globalRows, personalRows] = await Promise.all([
    globalAgentIds.length
      ? db.aiAgentUsageBucket.findMany({
          where: {
            agentId: { in: globalAgentIds },
            periodType: PeriodType.WEEK,
            ...(start
              ? {
                  periodStart: {
                    gte: start,
                    lte: end,
                  },
                }
              : {}),
          },
          select: {
            periodStart: true,
            totalUses: true,
          },
        })
      : Promise.resolve([]),
    personalAgentIds.length
      ? db.aiAgentUsageBucket.findMany({
          where: {
            agentId: { in: personalAgentIds },
            periodType: PeriodType.WEEK,
            ...(start
              ? {
                  periodStart: {
                    gte: start,
                    lte: end,
                  },
                }
              : {}),
          },
          select: {
            periodStart: true,
            totalUses: true,
          },
        })
      : Promise.resolve([]),
  ]);

  const globalMap = new Map<string, number>();
  const personalMap = new Map<string, number>();

  globalRows.forEach((row) => {
    const key = row.periodStart.toISOString();
    globalMap.set(key, (globalMap.get(key) ?? 0) + row.totalUses);
  });

  personalRows.forEach((row) => {
    const key = row.periodStart.toISOString();
    personalMap.set(key, (personalMap.get(key) ?? 0) + row.totalUses);
  });

  const allKeys = new Set([...globalMap.keys(), ...personalMap.keys()]);
  const sortedKeys = [...allKeys].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

  return sortedKeys.map((key, index) => ({
    week: `W${index + 1}`,
    global: globalMap.get(key) ?? 0,
    personal: personalMap.get(key) ?? 0,
  }));
};

export const getAiAnalytics = async ({
  userId,
}: GetAiAnalyticsArgs): Promise<AiAnalyticsResponse> => {
  const now = new Date();

  const [globalAgents, personalAgents] = await Promise.all([
    db.aiAgent.findMany({
      where: {
        OR: [{ isPublic: true }, { isSystem: true }],
      },
      select: { id: true },
    }),
    db.aiAgent.findMany({
      where: { userId },
      select: { id: true, name: true },
    }),
  ]);

  const globalAgentIds = globalAgents.map((agent) => agent.id);
  const personalAgentIds = personalAgents.map((agent) => agent.id);

  const buildPeriodAnalytics = async (period: Period): Promise<PeriodAnalytics> => {
    const { start, end } = getPeriodRange(period, now);
    const weekRange = getWeekRange(period, now);

    const [globalModelUsage, personalModelUsage, globalUsersData, personalUsersData, weeklyUsage] =
      await Promise.all([
        aggregateModelUsage(globalAgentIds, start, end),
        aggregateModelUsage(personalAgentIds, start, end),
        aggregateUniqueUsers(globalAgentIds, start, end),
        aggregateUniqueUsers(personalAgentIds, start, end),
        aggregateWeeklyUsage(globalAgentIds, personalAgentIds, weekRange.start, weekRange.end),
      ]);

    const personalAgentsUsage = personalAgents
      .map((agent) => {
        const users = personalUsersData.perAgent.get(agent.id)?.size ?? 0;
        return {
          id: agent.id,
          name: agent.name,
          users,
        };
      })
      .sort((a, b) => b.users - a.users || a.name.localeCompare(b.name))
      .slice(0, 6);

    return {
      globalModelUsage,
      personalModelUsage,
      weeklyUsage,
      globalUsers: globalUsersData.totalUsers,
      personalUsers: personalUsersData.totalUsers,
      personalAgents: personalAgentsUsage,
    };
  };

  const [all, seven, thirty, ninety] = await Promise.all([
    buildPeriodAnalytics(Period.ALL),
    buildPeriodAnalytics(Period['7D']),
    buildPeriodAnalytics(Period['30D']),
    buildPeriodAnalytics(Period['90D']),
  ]);

  return {
    all,
    [Period['7D']]: seven,
    [Period['30D']]: thirty,
    [Period['90D']]: ninety,
  };
};
