'use server';

import { getLocale } from 'next-intl/server';

import db from '@/lib/db';
import { getEmailTranslations } from '@/lib/translations/email';

export const getIsEmailConfirmed = async (userId: string) => {
  const locale = await getLocale();

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isEmailConfirmed: true },
  });

  if (user?.isEmailConfirmed) {
    return { success: true };
  }

  const translations = getEmailTranslations(locale)['confirmation-email'];

  return {
    success: false,
    message: translations?.warning,
  };
};
