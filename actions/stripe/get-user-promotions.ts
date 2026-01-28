'use server';

import { StripePromo } from '@prisma/client';
import { getTranslations } from 'next-intl/server';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import { ONE_MINUTE_SEC } from '@/constants/common';
import { DEFAULT_LOCALE } from '@/constants/locale';
import { DELAY_MS } from '@/constants/paginations';
import { fetchCachedData } from '@/lib/cache';
import db from '@/lib/db';
import { formatPrice, getConvertedPrice } from '@/lib/format';
import { getBatchedItems, sleep } from '@/lib/utils';
import { stripe } from '@/server/stripe';

type TranslationFunction = Awaited<ReturnType<typeof getTranslations>>;

const formatCouponDescription = (promo: StripePromo, t: TranslationFunction) => {
  if (promo.percentOff) {
    const duration = promo.durationInMonths
      ? t('format.forMonths', { months: promo.durationInMonths })
      : t('format.forever');
    return t('format.percentOff', { percent: promo.percentOff, duration });
  }

  if (promo.amountOff && promo.currency) {
    return formatPrice(getConvertedPrice(promo.amountOff), {
      locale: DEFAULT_LOCALE,
      currency: promo.currency,
    });
  }

  return '';
};

const formatRestrictions = (promo: StripePromo, t: TranslationFunction) => {
  let result = '';

  if (promo.firstTimeTransaction) {
    result += t('restrictionTexts.firstPurchase') + ' ';
  }

  if (promo.minimumAmount && promo.minimumAmountCurrency) {
    const minAmountFormatted = formatPrice(getConvertedPrice(promo.minimumAmount), {
      locale: DEFAULT_LOCALE,
      currency: promo.minimumAmountCurrency,
    });
    result += t('restrictionTexts.minAmount', { amount: minAmountFormatted });
  }

  return result;
};

const formatPromotionCode = (
  promo: StripePromo,
  isPersonal: boolean,
  timesRedeemed: number,
  t: TranslationFunction,
) => {
  return {
    id: promo.stripePromoId,
    code: promo.code,
    name: promo.couponName,
    description: formatCouponDescription(promo, t),
    restrictions: formatRestrictions(promo, t),
    active: promo.isActive,
    isPersonal,
    maxRedemptions: promo.maxRedemptions ?? 0,
    timesRedeemed,
    expiresAt: promo.expiresAt,
  };
};

export const getUserPromotions = async () => {
  try {
    const user = await getCurrentUser();

    if (!user?.userId) {
      return { promotions: [] };
    }

    const [stripeCustomer, userDetails, t] = await Promise.all([
      db.stripeCustomer.findUnique({
        where: { userId: user.userId },
      }),
      db.user.findUnique({
        where: { id: user.userId },
        select: { createdAt: true },
      }),
      getTranslations('promotions'),
    ]);

    if (!userDetails) {
      return { promotions: [] };
    }

    const dbPromos = await db.stripePromo.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    if (dbPromos.length === 0) {
      return { promotions: [] };
    }

    const now = new Date();
    const availablePromos = dbPromos.filter((promo) => {
      if (!promo.isActive) return false;

      if (promo.expiresAt && promo.expiresAt < now) return false;

      if (!promo.stripeCustomerId) return true;

      if (stripeCustomer && promo.stripeCustomerId === stripeCustomer.stripeCustomerId) {
        if (promo.createdAt < userDetails.createdAt) return false;
        return true;
      }

      return false;
    });

    const batchedPromos = getBatchedItems(availablePromos);

    const promosWithUpdatedRedemptions = await batchedPromos.reduce(
      async (
        previousPromise: Promise<Array<StripePromo & { currentTimesRedeemed: number }>>,
        batch,
        batchIndex,
      ) => {
        const previous = await previousPromise;

        if (batchIndex > 0) {
          await sleep(DELAY_MS);
        }

        const currentBatch = await Promise.all(
          batch.map(async (promo) => {
            const timesRedeemed = await fetchCachedData(
              `user-promo-redeemed_${promo.id}_${promo.stripePromoId}`,
              async () => {
                try {
                  const stripePromo = await stripe.promotionCodes.retrieve(promo.stripePromoId);

                  if (stripePromo.times_redeemed !== promo.timesRedeemed) {
                    await db.stripePromo.update({
                      where: { id: promo.id },
                      data: { timesRedeemed: stripePromo.times_redeemed },
                    });
                  }

                  return stripePromo.times_redeemed;
                } catch (error) {
                  console.error(
                    `[GET_USER_PROMOTIONS] Failed to fetch times_redeemed for ${promo.stripePromoId}`,
                    error,
                  );
                  return promo.timesRedeemed;
                }
              },
              ONE_MINUTE_SEC * 5,
            );

            return {
              ...promo,
              currentTimesRedeemed: timesRedeemed,
            };
          }),
        );

        return previous.concat(currentBatch);
      },
      Promise.resolve([]),
    );

    const promotions = promosWithUpdatedRedemptions.map((promo) => {
      const isPersonal = !!promo.stripeCustomerId;
      return formatPromotionCode(promo, isPersonal, promo.currentTimesRedeemed, t);
    });

    return { promotions };
  } catch (error) {
    console.error('[GET_USER_PROMOTIONS_ACTION]', error);
    return { promotions: [] };
  }
};
