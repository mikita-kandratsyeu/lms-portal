'use server';

import { headers } from 'next/headers';

import { getAppConfig } from '@/actions/configs/get-app-config';
import db from '@/lib/db';

const TOKENS_DIVIDER = 1_000_000n;

type UsageAiModelData = {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  prompt_tokens_details?: {
    cached_tokens?: number;
  };
};

type LogAiModelPricingOptions = {
  email: string;
  model: string;
  providerName: string;
  referer?: string;
  usage: UsageAiModelData;
  userId?: string;
};

export const calculateModelCostMicroCents = async (
  model: string,
  input: number,
  output: number,
  cached: number,
): Promise<bigint> => {
  const config = await getAppConfig();
  const modelPrices = config?.ai?.cost?.models?.[model];

  if (!modelPrices) {
    console.warn(`Price not found for model: ${model}`);

    return 0n;
  }

  if (modelPrices.pricing_type === 'per_image') {
    const microcents = modelPrices?.hd?.['1024x1024_microcents'];

    return microcents != null ? BigInt(microcents) : 0n;
  }

  const inputN = BigInt(input);
  const outputN = BigInt(output);
  const cachedN = BigInt(cached);

  const uncachedInputN = inputN - cachedN;
  let costMicroCents = 0n;

  const cachedRate = modelPrices.cached_input_microcents_per_1M;
  if (cachedN > 0n && cachedRate != null) {
    costMicroCents += (cachedN * BigInt(cachedRate)) / TOKENS_DIVIDER;
  }

  const inputRate = modelPrices.input_microcents_per_1M;
  if (inputRate != null) {
    costMicroCents += (uncachedInputN * BigInt(inputRate)) / TOKENS_DIVIDER;
  }

  const outputRate = modelPrices.output_microcents_per_1M;
  if (outputRate != null) {
    costMicroCents += (outputN * BigInt(outputRate)) / TOKENS_DIVIDER;
  }

  return costMicroCents;
};

export const logAiModelPricingUsage = async (options: LogAiModelPricingOptions) => {
  const headersList = await headers();

  const { providerName, referer, model, usage, userId, email } = options;

  const cachedTokens = usage.prompt_tokens_details?.cached_tokens || 0;
  const inputTokens = usage.prompt_tokens;
  const outputTokens = usage.completion_tokens;
  const totalTokens = usage.total_tokens;

  const costMicroCents = await calculateModelCostMicroCents(
    model,
    inputTokens,
    outputTokens,
    cachedTokens,
  );

  const row = await db.aiAgentModelUsageCost.create({
    data: {
      cachedTokens,
      costMicroCents,
      email,
      inputTokens,
      model,
      outputTokens,
      provider: providerName,
      referer: referer ?? headersList.get('referer'),
      totalTokens,
      userId,
    },
  });

  const costCents = Number(costMicroCents) / 1_000_000;

  return {
    id: row.id,
    costMicroCents: costMicroCents.toString(),
    costCents,
  };
};
