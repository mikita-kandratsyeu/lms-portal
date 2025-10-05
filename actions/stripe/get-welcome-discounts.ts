'use server';

import db from '@/lib/db';

export const getWelcomeDiscounts = async (userId: string) => {
  const purchases = await db.purchase.count({ where: { userId } });
  const subscription = await db.stripeSubscription.count({ where: { userId } });

  if (purchases > 0 || subscription > 0) {
    return [];
  }

  return [
    {
      coupon: process.env.STRIPE_COUPON_ID as string,
    },
  ];
};
