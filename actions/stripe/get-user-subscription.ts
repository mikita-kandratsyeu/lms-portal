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
        {
          expand: ['default_payment_method'],
        },
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

      let paymentMethod = null;
      if (
        stripeSubscription.default_payment_method &&
        typeof stripeSubscription.default_payment_method === 'object'
      ) {
        const pm = stripeSubscription.default_payment_method;
        if (pm.type === 'card' && pm.card) {
          paymentMethod = {
            brand: pm.card.brand,
            last4: pm.card.last4,
            expMonth: pm.card.exp_month,
            expYear: pm.card.exp_year,
          };
        }
      }

      return {
        cancelAt: stripeSubscription.cancel_at ? fromUnixTime(stripeSubscription.cancel_at) : null,
        cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
        endPeriod: fromUnixTime(stripeSubscription.items.data[0].current_period_end),
        price: {
          currency: stripeSubscription.items.data[0].price.currency,
          unitAmount: stripeSubscription.items.data[0].price.unit_amount,
        },
        plan: stripeSubscription.items.data[0].plan,
        planName: planDescription?.name ?? 'Nova Plus',
        startPeriod: fromUnixTime(stripeSubscription.items.data[0].current_period_start),
        paymentMethod,
        status: stripeSubscription.status,
        trialEnd: stripeSubscription.trial_end ? fromUnixTime(stripeSubscription.trial_end) : null,
        trialStart: stripeSubscription.trial_start
          ? fromUnixTime(stripeSubscription.trial_start)
          : null,
      };
    };

    const subscription = noCache
      ? await callback()
      : await fetchCachedData(`user-subscription_${userId}`, callback, ONE_DAY_SEC);

    return subscription;
  } catch (error: any) {
    if (error?.statusCode !== StatusCodes.NOT_FOUND) {
      console.error('[GET_USER_SUBSCRIPTION]', error);
    }

    return null;
  }
};
