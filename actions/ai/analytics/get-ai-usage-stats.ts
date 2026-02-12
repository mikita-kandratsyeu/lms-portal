'use server';

import { MICRO_CENTS_DIVIDER } from '@/actions/ai/pricing/get-ai-pricing';
import db from '@/lib/db';

export type AiUsageStats = {
  totalTokens: number;
  totalCostCents: number;
};

export const getAiUsageStats = async (): Promise<AiUsageStats> => {
  try {
    const [tokensResult, costResult] = await Promise.all([
      db.aiAgentModelUsageCost.aggregate({
        _sum: {
          totalTokens: true,
        },
      }),
      db.aiAgentModelUsageCost.aggregate({
        _sum: {
          costMicroCents: true,
        },
      }),
    ]);

    const totalTokens = tokensResult._sum.totalTokens ?? 0;
    const sumCostMicroCents = Number(costResult._sum.costMicroCents ?? 0n);
    const totalCostCents = sumCostMicroCents / MICRO_CENTS_DIVIDER;

    return {
      totalTokens,
      totalCostCents,
    };
  } catch (error) {
    console.error('[GET_AI_USAGE_STATS_ACTION]', error);
    return {
      totalTokens: 0,
      totalCostCents: 0,
    };
  }
};
