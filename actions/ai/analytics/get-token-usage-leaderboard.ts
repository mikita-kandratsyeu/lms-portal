'use server';

import { startOfDay, subDays } from 'date-fns';

import { Period } from '@/constants/ai/analytics';
import db from '@/lib/db';

export type TokenUsageLeaderboardEntry = {
  model: string;
  modelName: string | null;
  provider: string;
  providerName: string | null;
  providerFromAgent: string | null;
  totalTokens: number;
  changePercent: number | null;
};

export type TokenUsageLeaderboard = TokenUsageLeaderboardEntry[];

const PERIOD_DAYS: Record<Exclude<Period, Period.ALL>, number> = {
  [Period['7D']]: 7,
  [Period['30D']]: 30,
  [Period['90D']]: 90,
};

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

const getPreviousPeriodRange = (period: Period, now: Date) => {
  if (period === Period.ALL) {
    return { start: null, end: null };
  }
  const days = PERIOD_DAYS[period];
  const currentStart = startOfDay(subDays(now, days - 1));
  return {
    start: subDays(currentStart, days),
    end: currentStart,
  };
};

export type TokenUsageLeaderboardByPeriod = Record<Period, TokenUsageLeaderboard>;

export const getTokenUsageLeaderboard = async (
  period: Period = Period['7D'],
): Promise<TokenUsageLeaderboard> => {
  const now = new Date();
  const { start, end } = getPeriodRange(period, now);
  const prevRange = getPreviousPeriodRange(period, now);

  const whereCurrent = start ? { createdAt: { gte: start, lte: end } } : {};

  const [currentRows, previousRows] = await Promise.all([
    db.aiAgentModelUsageCost.groupBy({
      by: ['model', 'provider'],
      where: whereCurrent,
      _sum: { totalTokens: true },
    }),
    prevRange.start && prevRange.end
      ? db.aiAgentModelUsageCost.groupBy({
          by: ['model', 'provider'],
          where: {
            createdAt: { gte: prevRange.start, lt: prevRange.end },
          },
          _sum: { totalTokens: true },
        })
      : Promise.resolve([]),
  ]);

  const prevMap = new Map<string, number>();
  previousRows.forEach((row) => {
    const key = `${row.model}|${row.provider}`;
    prevMap.set(key, Number(row._sum.totalTokens ?? 0));
  });

  const modelProviderPairs = currentRows
    .filter((row) => Number(row._sum.totalTokens ?? 0) > 0)
    .sort((a, b) => Number(b._sum.totalTokens ?? 0) - Number(a._sum.totalTokens ?? 0))
    .slice(0, 10)
    .map((row) => ({ model: row.model, provider: row.provider }));

  const providerNameByModel = new Map<string, string | null>();
  const providerFromAgentByModel = new Map<string, string | null>();
  const modelNameByModel = new Map<string, string | null>();
  if (modelProviderPairs.length > 0) {
    const modelValues = [...new Set(modelProviderPairs.map((p) => p.model))];
    const aiModels = await db.aiModel.findMany({
      where: { value: { in: modelValues } },
      select: {
        value: true,
        name: true,
        provider: true,
        providerName: true,
      },
    });

    for (const pair of modelProviderPairs) {
      const key = `${pair.model}|${pair.provider}`;
      const matched = aiModels.find(
        (m) => m.value === pair.model && m.provider.toLowerCase() === pair.provider.toLowerCase(),
      );
      providerNameByModel.set(key, matched?.providerName ?? null);
      providerFromAgentByModel.set(key, matched?.provider ?? null);
      modelNameByModel.set(key, matched?.name ?? null);
    }
  }

  const rawEntries = currentRows
    .map((row) => {
      const totalTokens = Number(row._sum.totalTokens ?? 0);
      const key = `${row.model}|${row.provider}`;
      const prevTokens = prevMap.get(key) ?? 0;

      let changePercent: number | null = null;
      if (prevTokens > 0) {
        changePercent = Math.round(((totalTokens - prevTokens) / prevTokens) * 100);
      }

      return {
        model: row.model,
        modelName: modelNameByModel.get(key) ?? null,
        provider: row.provider,
        providerName: providerNameByModel.get(key) ?? null,
        providerFromAgent: providerFromAgentByModel.get(key) ?? null,
        totalTokens,
        changePercent,
      };
    })
    .filter((e) => e.totalTokens > 0)
    .sort((a, b) => b.totalTokens - a.totalTokens)
    .slice(0, 10);

  const entries: TokenUsageLeaderboardEntry[] = rawEntries;

  return entries;
};

export const getTokenUsageLeaderboardByPeriod =
  async (): Promise<TokenUsageLeaderboardByPeriod> => {
    const [all, seven, thirty, ninety] = await Promise.all([
      getTokenUsageLeaderboard(Period.ALL),
      getTokenUsageLeaderboard(Period['7D']),
      getTokenUsageLeaderboard(Period['30D']),
      getTokenUsageLeaderboard(Period['90D']),
    ]);

    return {
      [Period.ALL]: all,
      [Period['7D']]: seven,
      [Period['30D']]: thirty,
      [Period['90D']]: ninety,
    };
  };
