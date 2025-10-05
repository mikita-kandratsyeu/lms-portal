'use server';

import { getLocale } from 'next-intl/server';

import db from '@/lib/db';

export const getIsEmailConfirmed = async (userId: string) => {
  const locale = await getLocale();

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isEmailConfirmed: true },
  });

  if (user?.isEmailConfirmed) {
    return { success: true };
  }

  const translations = (await import(`/messages/email/${locale}.json`)).default[
    'confirmation-email'
  ];

  return {
    success: false,
    message: translations?.warning,
  };
};
