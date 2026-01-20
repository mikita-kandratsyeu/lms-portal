'use server';

import { startOfDay, startOfWeek } from 'date-fns';

import db from '@/lib/db';

type UpdateAiAnalyticsArgs = {
  agentId: string;
  userId: string;
  model?: string | null;
  occurredAt?: Date;
  uses?: number;
};

const WEEK_STARTS_ON = 1;

const normalizeUses = (uses?: number) => {
  if (!uses || Number.isNaN(uses)) {
    return 1;
  }

  return Math.max(1, Math.floor(uses));
};

const getPeriodStarts = (date: Date) => {
  const dayStart = startOfDay(date);
  const weekStart = startOfWeek(date, { weekStartsOn: WEEK_STARTS_ON });

  return {
    dayStart,
    weekStart,
  };
};

export const updateAiAnalytics = async ({
  agentId,
  userId,
  model,
  occurredAt,
  uses,
}: UpdateAiAnalyticsArgs) => {
  if (!agentId || !userId) {
    return;
  }

  const normalizedUses = normalizeUses(uses);
  const timestamp = occurredAt ?? new Date();
  const { dayStart, weekStart } = getPeriodStarts(timestamp);

  await db.$transaction([
    db.aiAgentUsageBucket.upsert({
      where: {
        agentId_periodType_periodStart: {
          agentId,
          periodType: 'day',
          periodStart: dayStart,
        },
      },
      update: {
        totalUses: { increment: normalizedUses },
      },
      create: {
        agentId,
        periodType: 'day',
        periodStart: dayStart,
        totalUses: normalizedUses,
      },
    }),
    db.aiAgentUsageBucket.upsert({
      where: {
        agentId_periodType_periodStart: {
          agentId,
          periodType: 'week',
          periodStart: weekStart,
        },
      },
      update: {
        totalUses: { increment: normalizedUses },
      },
      create: {
        agentId,
        periodType: 'week',
        periodStart: weekStart,
        totalUses: normalizedUses,
      },
    }),
    db.aiAgentUsageSeen.upsert({
      where: {
        agentId_userId_periodType_periodStart: {
          agentId,
          userId,
          periodType: 'day',
          periodStart: dayStart,
        },
      },
      update: {},
      create: {
        agentId,
        userId,
        periodType: 'day',
        periodStart: dayStart,
      },
    }),
    db.aiAgentUsageSeen.upsert({
      where: {
        agentId_userId_periodType_periodStart: {
          agentId,
          userId,
          periodType: 'week',
          periodStart: weekStart,
        },
      },
      update: {},
      create: {
        agentId,
        userId,
        periodType: 'week',
        periodStart: weekStart,
      },
    }),
  ]);

  if (!model) {
    return;
  }

  await db.$transaction([
    db.aiAgentModelUsageBucket.upsert({
      where: {
        agentId_model_periodType_periodStart: {
          agentId,
          model,
          periodType: 'day',
          periodStart: dayStart,
        },
      },
      update: {
        uses: { increment: normalizedUses },
      },
      create: {
        agentId,
        model,
        periodType: 'day',
        periodStart: dayStart,
        uses: normalizedUses,
      },
    }),
    db.aiAgentModelUsageBucket.upsert({
      where: {
        agentId_model_periodType_periodStart: {
          agentId,
          model,
          periodType: 'week',
          periodStart: weekStart,
        },
      },
      update: {
        uses: { increment: normalizedUses },
      },
      create: {
        agentId,
        model,
        periodType: 'week',
        periodStart: weekStart,
        uses: normalizedUses,
      },
    }),
  ]);
};
