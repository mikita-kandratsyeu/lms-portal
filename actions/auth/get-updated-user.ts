'use server';

import { TEN_MINUTE_SEC } from '@/constants/common';
import { fetchCachedData } from '@/lib/cache';
import db from '@/lib/db';

export const getUpdatedUser = async (userId = '') => {
  const updatedUser = await fetchCachedData(
    `updated-user-[${userId}]`,
    async () => {
      const updatedUser = await db.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      return { role: updatedUser?.role };
    },
    TEN_MINUTE_SEC,
  );

  return updatedUser;
};
