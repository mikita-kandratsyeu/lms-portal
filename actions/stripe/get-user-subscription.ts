'use server';

import { StripeSubscriptionPeriod } from '@prisma/client';
import { compareAsc, fromUnixTime } from 'date-fns';
import { StatusCodes } from 'http-status-codes';

import { ONE_DAY_SEC } from '@/constants/common';
import { fetchCachedData } from '@/lib/cache';
import db from '@/lib/db';
import { stripe } from '@/server/stripe';

export const getUserSubscription = async (userId = '', noCache = false) => {
  try {
    const callback = async () => {
      const userSubscription = await db.stripeSubscription.findUnique({
        where: { userId },
      });

      if (!userSubscription) {
        return null;
      }

      const stripeSubscription = await stripe.subscriptions.retrieve(
        userSubscription.stripeSubscriptionId,
      );

      if (!stripeSubscription) {
        return null;
      }

      if (
        stripeSubscription.cancel_at &&
        compareAsc(fromUnixTime(stripeSubscription.cancel_at), Date.now()) < 0
      ) {
        await db.stripeSubscription.delete({
          where: { stripeSubscriptionId: stripeSubscription.id },
        });

        return null;
      }

      const planDescription = await db.stripeSubscriptionDescription.findFirst({
        where: {
          period: `${stripeSubscription.items.data[0].plan.interval}ly` as StripeSubscriptionPeriod,
        },
      });

      return {
        cancelAt: stripeSubscription.cancel_at ? fromUnixTime(stripeSubscription.cancel_at) : null,
        endPeriod: fromUnixTime(stripeSubscription.items.data[0].current_period_end),
        price: {
          currency: stripeSubscription.items.data[0].price.currency,
          unitAmount: stripeSubscription.items.data[0].price.unit_amount,
        },
        plan: stripeSubscription.items.data[0].plan,
        planName: planDescription?.name ?? 'Nova Plus',
        startPeriod: fromUnixTime(stripeSubscription.items.data[0].current_period_start),
      };
    };

    const subscription = noCache
      ? await callback()
      : await fetchCachedData(`user-subscription-[${userId}]`, callback, ONE_DAY_SEC);

    return subscription;
  } catch (error: any) {
    if (error?.statusCode !== StatusCodes.NOT_FOUND) {
      console.error('[GET_USER_SUBSCRIPTION]', error);
    }

    return null;
  }
};
