'use server';

import db from '@/lib/db';

import { getCurrentUser } from '../auth/get-current-user';

export const getUserSettings = async () => {
  const currentUser = await getCurrentUser();

  if (currentUser) {
    const settings = await db.userSettings.findUnique({ where: { userId: currentUser.userId } });

    return settings;
  }

  return null;
};
