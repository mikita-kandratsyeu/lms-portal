import { addWeeks, startOfDay, startOfWeek, subDays } from 'date-fns';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import { LIMIT_REQUESTS_PER_WEEK } from '@/constants/ai/general';
import db from '@/lib/db';

const MICRO_CENTS_DIVIDER = 1_000_000;
const WEEK_STARTS_ON = 1;

export type UsageRow = {
  id: string;
  createdAt: string;
  email: string;
  model: string;
  provider: string;
  referer: string | null;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cachedTokens: number;
  costCents: number;
};

export type UsageSummary = {
  totalCostCents: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  requestCount: number;
  freeRequestsUsed: number;
  freeRequestsLimit: number;
  nextResetDate: string | null;
  hasSubscription: boolean;
};

export type UsagePageData = {
  rows: UsageRow[];
  totalCount: number;
  summary: UsageSummary;
};

type GetAiPricingArgs = {
  periodDays?: number | null;
  page?: number;
  pageSize?: number;
};

const getPeriodStart = (periodDays: number | null) => {
  if (!periodDays) return undefined;

  return startOfDay(subDays(new Date(), periodDays - 1));
};

const EMPTY_RESULT: UsagePageData = {
  rows: [],
  totalCount: 0,
  summary: {
    totalCostCents: 0,
    totalInputTokens: 0,
    totalOutputTokens: 0,
    totalTokens: 0,
    requestCount: 0,
    freeRequestsUsed: 0,
    freeRequestsLimit: LIMIT_REQUESTS_PER_WEEK,
    nextResetDate: null,
    hasSubscription: false,
  },
};

const extractPath = (referer: string | null): string | null => {
  if (!referer) return null;

  try {
    return new URL(referer).pathname;
  } catch {
    return referer.startsWith('/') ? referer : `/${referer}`;
  }
};

const mapRow = (row: {
  id: string;
  createdAt: Date;
  email: string;
  model: string;
  provider: string;
  referer: string | null;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cachedTokens: number | null;
  costMicroCents: bigint;
}): UsageRow => ({
  id: row.id,
  createdAt: row.createdAt.toISOString(),
  email: row.email,
  model: row.model,
  provider: row.provider,
  referer: extractPath(row.referer),
  inputTokens: Number(row.inputTokens),
  outputTokens: Number(row.outputTokens),
  totalTokens: Number(row.totalTokens),
  cachedTokens: Number(row.cachedTokens ?? 0),
  costCents: Number(row.costMicroCents) / MICRO_CENTS_DIVIDER,
});

const SELECT_FIELDS = {
  id: true,
  createdAt: true,
  email: true,
  model: true,
  provider: true,
  referer: true,
  inputTokens: true,
  outputTokens: true,
  totalTokens: true,
  cachedTokens: true,
  costMicroCents: true,
} as const;

export const getAiPricing = async ({
  periodDays = 30,
  page = 0,
  pageSize = 10,
}: GetAiPricingArgs = {}): Promise<UsagePageData> => {
  const user = await getCurrentUser();

  if (!user?.userId) {
    return EMPTY_RESULT;
  }

  const periodStart = getPeriodStart(periodDays);
  const hasSubscription = user.hasSubscription ?? false;

  const where = {
    userId: user.userId,
    ...(periodStart ? { createdAt: { gte: periodStart } } : {}),
  };

  const now = new Date();
  const weekStartDate = startOfWeek(now, { weekStartsOn: WEEK_STARTS_ON });

  const [rawRows, totalCount, aggregation, weeklyCount] = await Promise.all([
    db.aiAgentModelUsageCost.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: page * pageSize,
      take: pageSize,
      select: SELECT_FIELDS,
    }),
    db.aiAgentModelUsageCost.count({ where }),
    db.aiAgentModelUsageCost.aggregate({
      where,
      _sum: {
        inputTokens: true,
        outputTokens: true,
        totalTokens: true,
        costMicroCents: true,
      },
      _count: true,
    }),
    db.aiAgentModelUsageCost.count({
      where: {
        userId: user.userId,
        createdAt: { gte: weekStartDate },
      },
    }),
  ]);

  const nextResetDate = addWeeks(weekStartDate, 1).toISOString();

  const sumCostMicroCents = Number(aggregation._sum.costMicroCents ?? 0n);
  const sumInputTokens = Number(aggregation._sum.inputTokens ?? 0);
  const sumOutputTokens = Number(aggregation._sum.outputTokens ?? 0);
  const sumTotalTokens = Number(aggregation._sum.totalTokens ?? 0);
  const requestCount = Number(aggregation._count);

  const rows: UsageRow[] = rawRows.map(mapRow);

  const summary: UsageSummary = {
    totalCostCents: sumCostMicroCents / MICRO_CENTS_DIVIDER,
    totalInputTokens: sumInputTokens,
    totalOutputTokens: sumOutputTokens,
    totalTokens: sumTotalTokens,
    requestCount,
    freeRequestsUsed: weeklyCount,
    freeRequestsLimit: LIMIT_REQUESTS_PER_WEEK,
    nextResetDate,
    hasSubscription,
  };

  return { rows, totalCount, summary };
};

export const getAiPricingCsvData = async ({
  periodDays = 30,
}: {
  periodDays?: number | null;
} = {}): Promise<UsageRow[]> => {
  const user = await getCurrentUser();

  if (!user?.userId) return [];

  const periodStart = getPeriodStart(periodDays);

  const rows = await db.aiAgentModelUsageCost.findMany({
    where: {
      userId: user.userId,
      ...(periodStart ? { createdAt: { gte: periodStart } } : {}),
    },
    orderBy: { createdAt: 'desc' },
    select: SELECT_FIELDS,
  });

  return rows.map(mapRow);
};
