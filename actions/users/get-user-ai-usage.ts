'use server';

import { getAiPricingCsvDataForUser } from '@/actions/ai/pricing/get-ai-pricing';

export type UserAiUsageSummary = {
  requestCount: number;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  totalCostCents: number;
  rows: Array<{
    createdAt: string;
    model: string;
    provider: string;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    costCents: number;
  }>;
  byModel: Array<{
    model: string;
    provider: string;
    requestCount: number;
    totalTokens: number;
    costCents: number;
  }>;
};

export const getUserAiUsage = async (
  userId: string,
  userEmail: string,
  periodDays = 90,
): Promise<UserAiUsageSummary> => {
  const rows = await getAiPricingCsvDataForUser(userId, userEmail, periodDays);

  const requestCount = rows.length;
  const totalTokens = rows.reduce((sum, r) => sum + r.totalTokens, 0);
  const inputTokens = rows.reduce((sum, r) => sum + r.inputTokens, 0);
  const outputTokens = rows.reduce((sum, r) => sum + r.outputTokens, 0);
  const totalCostCents = rows.reduce((sum, r) => sum + r.costCents, 0);

  const byModelMap = new Map<
    string,
    { requestCount: number; totalTokens: number; costCents: number }
  >();

  for (const row of rows) {
    const key = `${row.model}|${row.provider}`;
    const existing = byModelMap.get(key);

    if (existing) {
      existing.requestCount += 1;
      existing.totalTokens += row.totalTokens;
      existing.costCents += row.costCents;
    } else {
      byModelMap.set(key, {
        requestCount: 1,
        totalTokens: row.totalTokens,
        costCents: row.costCents,
      });
    }
  }

  const byModel = Array.from(byModelMap.entries())
    .map(([key, data]) => {
      const [model, provider] = key.split('|');
      return { model, provider, ...data };
    })
    .sort((a, b) => b.costCents - a.costCents);

  const rowsForTable = rows.slice(0, 100).map((r) => ({
    createdAt: r.createdAt,
    model: r.model,
    provider: r.provider,
    inputTokens: r.inputTokens,
    outputTokens: r.outputTokens,
    totalTokens: r.totalTokens,
    costCents: r.costCents,
  }));

  return {
    requestCount,
    totalTokens,
    inputTokens,
    outputTokens,
    totalCostCents,
    rows: rowsForTable,
    byModel,
  };
};
