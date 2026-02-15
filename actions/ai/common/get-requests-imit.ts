'use server';

import { addWeeks, format, startOfWeek } from 'date-fns';
import { ReasonPhrases } from 'http-status-codes';
import { getLocale, getTranslations } from 'next-intl/server';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import {
  LIMIT_REQUESTS_PER_WEEK_FREE_TIER,
  LIMIT_REQUESTS_PER_WEEK_PAID_TIER,
  REQUEST_STATUS,
} from '@/constants/ai/general';
import { TIMESTAMP_REQUESTS_LIMIT_TEMPLATE } from '@/constants/common';
import db from '@/lib/db';
import { getFormatLocale } from '@/lib/locale';

const CHAT_REFERER_FILTER = { referer: { contains: 'chat' } } as const;

const isChatReferer = (referer: string | null | undefined): boolean => {
  if (!referer) return false;

  try {
    const pathname = referer.startsWith('/') ? referer : new URL(referer).pathname;
    return pathname.includes('/chat');
  } catch {
    return referer.includes('/chat');
  }
};

export const getRequestsLimit = async (
  user: Awaited<ReturnType<typeof getCurrentUser>>,
  referer?: string | null,
) => {
  if (!isChatReferer(referer)) {
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
      ...CHAT_REFERER_FILTER,
    },
  });

  const limit = user?.hasSubscription
    ? LIMIT_REQUESTS_PER_WEEK_PAID_TIER
    : LIMIT_REQUESTS_PER_WEEK_FREE_TIER;

  if (requestsThisWeek >= limit) {
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
