'use server';

import { ONE_HOUR_SEC } from '@/constants/common';
import { fetchCachedData } from '@/lib/cache';
import { fetcher } from '@/lib/fetcher';
import { toMicrocentsPer1M } from '@/lib/format';

const OPENROUTER_MODELS_URL = 'https://openrouter.ai/api/v1/models';
const CACHE_KEY = 'openrouter-models-pricing';

type OpenRouterModel = {
  id: string;
  pricing?: {
    prompt?: string;
    completion?: string;
    input_cache_read?: string;
  };
};

type OpenRouterModelsResponse = {
  data?: OpenRouterModel[];
};

export type OpenRouterModelPricing = {
  input_microcents_per_1M: number;
  output_microcents_per_1M: number;
  cached_input_microcents_per_1M?: number;
};

export type OpenRouterModelsPricingMap = Record<string, OpenRouterModelPricing>;

export const getOpenRouterModelsPricing = async (): Promise<OpenRouterModelsPricingMap> => {
  return fetchCachedData(
    CACHE_KEY,
    async () => {
      const response = (await fetcher.get(OPENROUTER_MODELS_URL, {
        cache: 'no-store',
        headers: process.env.OPENROUTER_API_KEY
          ? { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` }
          : undefined,
        responseType: 'json',
      })) as OpenRouterModelsResponse;

      const models = response?.data ?? [];
      const map: OpenRouterModelsPricingMap = {};

      for (const model of models) {
        const pricing = model.pricing;
        if (!pricing) continue;

        const hasTokenPricing = pricing.prompt != null || pricing.completion != null;

        if (hasTokenPricing) {
          map[model.id] = {
            input_microcents_per_1M: toMicrocentsPer1M(pricing.prompt ?? '0'),
            output_microcents_per_1M: toMicrocentsPer1M(pricing.completion ?? '0'),
            ...(pricing.input_cache_read != null && {
              cached_input_microcents_per_1M: toMicrocentsPer1M(pricing.input_cache_read),
            }),
          };
        }
      }

      return map;
    },
    ONE_HOUR_SEC,
  );
};
