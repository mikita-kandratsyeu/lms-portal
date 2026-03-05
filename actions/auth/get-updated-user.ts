'use server';

import { TEN_MINUTE_SEC } from '@/constants/common';
import { fetchCachedData } from '@/lib/cache';
import db from '@/lib/db';

export const getUpdatedUser = async (userId = '') => {
  const updatedUser = await fetchCachedData(
    `updated-user_${userId}`,
    async () => {
      const updatedUser = await db.user.findUnique({
        where: { id: userId },
        select: { blockedReason: true, blockedUntil: true, isBlocked: true, role: true },
      });

      return {
        blockedReason: updatedUser?.blockedReason ?? null,
        blockedUntil: updatedUser?.blockedUntil ?? null,
        isBlocked: updatedUser?.isBlocked ?? false,
        role: updatedUser?.role,
      };
    },
    TEN_MINUTE_SEC,
  );

  return updatedUser;
};
