'use server';

import { User, UserSettings } from '@prisma/client';

import { getValueFromMemoryCache, removeValueFromMemoryCache } from '@/lib/cache';
import db from '@/lib/db';
import { decrypt } from '@/lib/utils';

type VerifyUserEmail = {
  user: (User & { settings: UserSettings | null }) | null;
  code?: string;
};

export const verifyUserEmail = async ({
  user,
  code,
}: VerifyUserEmail): Promise<{ label: string; variant: string }> => {
  if (!user || !user.id) {
    return { label: 'failed', variant: 'red' };
  }

  if (user.isEmailConfirmed) {
    return { label: 'success', variant: 'green' };
  }

  const cacheKey = `${user.id}-email_confirmation_token`;
  const cachedToken = await getValueFromMemoryCache(cacheKey);

  if (cachedToken && !code) {
    return { label: 'pending', variant: 'default' };
  }

  if (code) {
    try {
      const decrypted = JSON.parse(
        decrypt(decodeURIComponent(code), process.env.EMAIl_CONFIRMATION_SECRET as string),
      );

      if (!decrypted || decrypted.secret !== cachedToken) {
        return { label: 'failed', variant: 'red' };
      }

      await db.user.update({
        where: { id: user.id },
        data: { isEmailConfirmed: true },
      });

      await removeValueFromMemoryCache(cacheKey);

      return { label: 'success', variant: 'green' };
    } catch (error) {
      console.error('[VERIFY_USER_EMAIL_ACTION]', error);

      return { label: 'failed', variant: 'red' };
    }
  }

  return { label: 'failed', variant: 'red' };
};
