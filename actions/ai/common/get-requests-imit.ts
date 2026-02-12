'use server';

import { addWeeks, format, startOfWeek } from 'date-fns';
import { ReasonPhrases } from 'http-status-codes';
import { getLocale, getTranslations } from 'next-intl/server';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import { LIMIT_REQUESTS_PER_WEEK, REQUEST_STATUS } from '@/constants/ai/general';
import { TIMESTAMP_REQUESTS_LIMIT_TEMPLATE } from '@/constants/common';
import db from '@/lib/db';
import { getFormatLocale } from '@/lib/locale';

export const getRequestsLimit = async (user: Awaited<ReturnType<typeof getCurrentUser>>) => {
  if (user?.hasSubscription) {
    return { message: ReasonPhrases.OK, status: REQUEST_STATUS.ALLOW };
  }

  const locale = await getLocale();
  const t = await getTranslations('ai-limit');

  const userId = user!.userId;
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });

  const requestsThisWeek = await db.aiAgentModelUsageCost.count({
    where: {
      OR: [{ userId }, { email: user?.email ?? '' }],
      createdAt: { gte: weekStart },
    },
  });

  if (requestsThisWeek >= LIMIT_REQUESTS_PER_WEEK) {
    const nextWeekStart = addWeeks(weekStart, 1);
    return {
      message: t('title', {
        date: format(nextWeekStart, TIMESTAMP_REQUESTS_LIMIT_TEMPLATE, {
          locale: getFormatLocale(locale),
        }),
      }),
      status: REQUEST_STATUS.FORBIDDEN,
    };
  }

  return { message: ReasonPhrases.OK, status: REQUEST_STATUS.ALLOW };
};
