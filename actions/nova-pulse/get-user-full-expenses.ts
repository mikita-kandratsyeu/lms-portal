'use server';

import { DEFAULT_CURRENCY } from '@/constants/locale';
import db from '@/lib/db';

export const getUserFullExpenses = async (userId: string) => {
  try {
    const purchases = await db.purchase.findMany({
      where: { userId },
      include: { details: true },
    });

    const expenseMap: { [currency: string]: number } = {};

    purchases.forEach((purchase) => {
      const currency = purchase.details?.currency ?? DEFAULT_CURRENCY;
      const price = purchase.details?.price ?? 0;
      expenseMap[currency] = (expenseMap[currency] || 0) + price;
    });

    const result: { currency: string; amount: number }[] = Object.entries(expenseMap).map(
      ([currency, amount]) => ({ currency, amount }),
    );

    return result;
  } catch (error) {
    console.error('[GET_USER_FULL_EXPENSES]', error);

    return [];
  }
};
