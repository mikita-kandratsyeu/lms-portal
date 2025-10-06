'use server';

import { getLocale } from 'next-intl/server';

import { ONE_HOUR_SEC } from '@/constants/common';
import { fetchCachedData } from '@/lib/cache';

import { getGlobalProgress } from '../courses/get-global-progress';
import { getSummary } from './get-summary';
import { getTimeMetric } from './get-time-metric';
import { getUserFullExpenses } from './get-user-full-expenses';

export const getNovaPulse = async (
  userId: string,
): Promise<{
  summary: {
    body: string;
    color: string;
    model: string;
    recommendations: string[];
    strengths: string[];
    title: string;
    weaknesses: string[];
  };
  heatMap: Awaited<ReturnType<typeof getTimeMetric>>['heatMap'];
  totalSpentMoney: Awaited<ReturnType<typeof getUserFullExpenses>>;
  totalSpentTimeInSec: number;
  xp: number;
}> => {
  const locale = await getLocale();

  try {
    const response = await fetchCachedData(
      `nova-pulse_${locale}_${userId}`,
      async () => {
        const globalProgress = await getGlobalProgress(userId);
        const totalSpentMoney = await getUserFullExpenses(userId);
        const { totalSpentTimeInSec, heatMap } = await getTimeMetric(userId);
        const summary = await getSummary(heatMap);

        return {
          heatMap,
          summary,
          totalSpentMoney,
          totalSpentTimeInSec,
          xp: globalProgress?.total ?? 0,
        };
      },
      ONE_HOUR_SEC,
    );

    return response;
  } catch (error) {
    console.error('[GET_NOVA_PULSE]', error);

    return {
      heatMap: {},
      summary: {
        body: '',
        color: '',
        model: '',
        recommendations: [],
        strengths: [],
        title: '',
        weaknesses: [],
      },
      totalSpentMoney: [],
      totalSpentTimeInSec: 0,
      xp: 0,
    };
  }
};
