'use server';

import { addWeeks, compareAsc, format } from 'date-fns';
import { ReasonPhrases } from 'http-status-codes';
import { getLocale, getTranslations } from 'next-intl/server';

import { LIMIT_REQUESTS_PER_WEEK, REQUEST_STATUS } from '@/constants/ai';
import { TIMESTAMP_REQUESTS_LIMIT_TEMPLATE } from '@/constants/common';
import db from '@/lib/db';
import { getFormatLocale } from '@/lib/locale';

import { getCurrentUser } from '../auth/get-current-user';

const handleRequestLimitExceeded = async (copilotRequests: any, userId: string) => {
  if (!copilotRequests.expiredAt) {
    return await db.copilotRequestLimit.update({
      where: { userId },
      data: { expiredAt: addWeeks(Date.now(), 1) },
    });
  }
  return copilotRequests;
};

const resetRequestLimit = async (id: string) => {
  await db.copilotRequestLimit.update({
    where: { id },
    data: { requests: 0, expiredAt: null },
  });
};

export const getRequestsLimit = async (user: Awaited<ReturnType<typeof getCurrentUser>>) => {
  if (user?.hasSubscription) {
    return { message: ReasonPhrases.OK, status: REQUEST_STATUS.ALLOW };
  }

  const locale = await getLocale();
  const t = await getTranslations('ai-limit');

  const userId = user!.userId;

  let copilotRequests = await db.copilotRequestLimit.upsert({
    where: { userId },
    update: { requests: { increment: 1 } },
    create: { requests: 0, userId },
  });

  if (copilotRequests.requests >= LIMIT_REQUESTS_PER_WEEK) {
    copilotRequests = await handleRequestLimitExceeded(copilotRequests, userId);
  }

  if (copilotRequests.expiredAt) {
    const isExpired = compareAsc(copilotRequests.expiredAt, Date.now()) < 0;

    if (isExpired) {
      await resetRequestLimit(copilotRequests.id);
    } else {
      return {
        message: t('title', {
          date: format(copilotRequests.expiredAt, TIMESTAMP_REQUESTS_LIMIT_TEMPLATE, {
            locale: getFormatLocale(locale),
          }),
        }),
        status: REQUEST_STATUS.FORBIDDEN,
      };
    }
  }

  return { message: ReasonPhrases.OK, status: REQUEST_STATUS.ALLOW };
};
