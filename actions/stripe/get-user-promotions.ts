'use server';

import Stripe from 'stripe';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import { ONE_MINUTE_SEC } from '@/constants/common';
import { DEFAULT_LOCALE } from '@/constants/locale';
import { DELAY_MS } from '@/constants/paginations';
import { fetchCachedData } from '@/lib/cache';
import db from '@/lib/db';
import { formatPrice, getConvertedPrice } from '@/lib/format';
import { getBatchedItems, sleep } from '@/lib/utils';
import { stripe } from '@/server/stripe';

type StripePromotionCode = Stripe.PromotionCode;

const formatCouponDescription = (coupon: Stripe.Coupon) => {
  if (coupon.percent_off) {
    return `${coupon.percent_off}% off ${coupon.duration_in_months ? `for ${coupon.duration_in_months} months` : 'forever'}`;
  }

  if (coupon.amount_off && coupon.currency) {
    return formatPrice(getConvertedPrice(coupon.amount_off), {
      locale: DEFAULT_LOCALE,
      currency: coupon.currency,
    });
  }

  return '';
};

const formatRestrictions = (restrictions: Stripe.PromotionCode.Restrictions) => {
  let result = '';

  if (restrictions.first_time_transaction) {
    result += 'Only for first purchase. ';
  }

  if (restrictions.minimum_amount && restrictions.minimum_amount_currency) {
    result += `Min amount is ${formatPrice(getConvertedPrice(restrictions.minimum_amount), { locale: DEFAULT_LOCALE, currency: restrictions.minimum_amount_currency })}.`;
  }

  return result;
};

const formatPromotionCode = (pc: StripePromotionCode, isPersonal: boolean) => {
  const coupon = pc.coupon as Stripe.Coupon;
  return {
    id: pc.id,
    code: pc.code,
    name: coupon.name || null,
    description: formatCouponDescription(coupon),
    restrictions: formatRestrictions(pc.restrictions),
    active: pc.active,
    isPersonal,
    maxRedemptions: pc.max_redemptions ?? 0,
    timesRedeemed: pc.times_redeemed,
  };
};

export const getUserPromotions = async () => {
  try {
    const user = await getCurrentUser();
    if (!user?.userId) {
      return { promotions: [] };
    }

    const stripeCustomer = await db.stripeCustomer.findUnique({
      where: { userId: user.userId },
    });

    const dbPromos = await db.stripePromo.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    if (dbPromos.length === 0) {
      return { promotions: [] };
    }

    const batchedPromos = getBatchedItems(dbPromos);

    const stripePromos = await batchedPromos.reduce(
      async (previousPromise: Promise<StripePromotionCode[]>, batch, batchIndex) => {
        const previous = await previousPromise;

        if (batchIndex > 0) {
          await sleep(DELAY_MS);
        }

        const currentBatch = await Promise.all(
          batch.map(async (promo) => {
            const data = await fetchCachedData(
              `user-promo_${promo.id}_${promo.stripePromoId}`,
              async () => {
                const res = await stripe.promotionCodes.retrieve(promo.stripePromoId);
                return res;
              },
              ONE_MINUTE_SEC * 5,
            );

            return data;
          }),
        );

        return previous.concat(currentBatch);
      },
      Promise.resolve([]),
    );

    const availablePromos = stripePromos.filter((pc) => {
      if (!pc.active) return true;

      if (!pc.customer) return true;

      if (stripeCustomer && pc.customer === stripeCustomer.stripeCustomerId) return true;

      return false;
    });

    const promotions = availablePromos.map((pc) => {
      const isPersonal = !!pc.customer;
      return formatPromotionCode(pc, isPersonal);
    });

    return { promotions };
  } catch (error) {
    console.error('[GET_USER_PROMOTIONS_ACTION]', error);
    return { promotions: [] };
  }
};
