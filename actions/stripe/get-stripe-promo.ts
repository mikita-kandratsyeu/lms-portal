'use server';

import Stripe from 'stripe';

import { ONE_MINUTE_SEC } from '@/constants/common';
import { DEFAULT_LOCALE } from '@/constants/locale';
import { DELAY_MS, PAGE_SIZES } from '@/constants/paginations';
import { fetchCachedData } from '@/lib/cache';
import db from '@/lib/db';
import { formatPrice, getConvertedPrice } from '@/lib/format';
import { getBatchedItems, sleep } from '@/lib/utils';
import { stripe } from '@/server/stripe';

type StripePromotionCodes = Stripe.Response<Stripe.ApiList<Stripe.PromotionCode>>['data'];
type StripeCoupons = Stripe.Response<Stripe.ApiList<Stripe.Coupon>>['data'];
type StripeCustomers = Stripe.Response<Stripe.ApiList<Stripe.Customer>>['data'];

type GetStripePromo = {
  pageIndex?: string | number;
  pageSize?: string | number;
  search?: string;
};

const getCoupons = (coupons: StripeCoupons) => {
  return coupons.map((cp) => {
    const description = (() => {
      if (cp.percent_off) {
        return `${cp.percent_off}% off ${cp.duration_in_months ? `for ${cp.duration_in_months} months` : 'forever'}`;
      }

      return cp.amount_off && cp.currency
        ? formatPrice(getConvertedPrice(cp.amount_off), {
            locale: DEFAULT_LOCALE,
            currency: cp.currency,
          })
        : '';
    })();

    return {
      description,
      id: cp.id,
      name: cp.name,
    };
  });
};

const getPromos = (promos: StripePromotionCodes, customers: StripeCustomers) => {
  return promos.map((pc) => {
    const customer = customers.find((cs) => cs?.id === pc.customer);
    const restrictions = (() => {
      let result = '';

      if (pc.restrictions.first_time_transaction) {
        result += 'Only for first purchase. ';
      }

      if (pc.restrictions.minimum_amount && pc.restrictions.minimum_amount_currency) {
        result += `Min amount is ${formatPrice(getConvertedPrice(pc.restrictions.minimum_amount), { locale: DEFAULT_LOCALE, currency: pc.restrictions.minimum_amount_currency })}.`;
      }

      return result;
    })();

    return {
      active: pc.active,
      code: pc.code,
      coupon: getCoupons([pc.coupon])[0],
      customer: customer
        ? {
            email: customer.email,
            name: customer.name,
          }
        : null,
      created: pc.created,
      id: pc.id,
      maxRedemptions: pc.max_redemptions ?? 0,
      timesRedeemed: pc.times_redeemed,
      restrictions,
    };
  });
};

const getCustomers = (customers: StripeCustomers) => {
  return customers.map((cs) => ({
    email: cs.email,
    id: cs.id,
    name: cs.name,
  }));
};

export const getStripePromo = async ({
  pageIndex = 0,
  pageSize = PAGE_SIZES[0],
  search,
}: GetStripePromo) => {
  const index = Number(pageIndex);
  const size = Number(pageSize);

  try {
    const promos = await db.stripePromo.findMany({
      where: { code: { contains: search, mode: 'insensitive' } },
      orderBy: { createdAt: 'desc' },
      skip: index * size,
      take: size,
    });
    const count = await db.stripePromo.count({
      where: { code: { contains: search, mode: 'insensitive' } },
    });

    const customers = await db.stripeCustomer.findMany();

    const coupons = await stripe.coupons.list({ limit: 10 });

    const batchedStripePromos = getBatchedItems(promos);
    const batchedStripeCustomers = getBatchedItems(customers);

    const stripePromos = await batchedStripePromos.reduce(
      async (previousStripePromosPromise: Promise<any[]>, batch: any[], batchIndex: number) => {
        const previousStripePromos = await previousStripePromosPromise;

        if (batchIndex > 0) {
          await sleep(DELAY_MS);
        }

        const currentBatchStripePromos = await Promise.all(
          batch.map(async (code) => {
            const data = await fetchCachedData(
              `${code.id}-${code.stripePromoId}`,
              async () => {
                const res = await stripe.promotionCodes.retrieve(code.stripePromoId);

                return res;
              },
              ONE_MINUTE_SEC,
            );

            return data;
          }),
        );

        return previousStripePromos.concat(currentBatchStripePromos);
      },
      Promise.resolve([] as any[]),
    );

    const stripeCustomers = await batchedStripeCustomers.reduce(
      async (previousStripeCustomersPromise: Promise<any[]>, batch: any[], batchIndex: number) => {
        const previousStripeCustomers = await previousStripeCustomersPromise;

        if (batchIndex > 0) {
          await sleep(DELAY_MS);
        }

        const currentBatchStripeCustomers = await Promise.all(
          batch.map(async (cs) => {
            const data = await fetchCachedData(
              `${cs.stripeCustomerId}`,
              async () => {
                const res = await stripe.customers.retrieve(cs.stripeCustomerId);

                return res;
              },
              ONE_MINUTE_SEC,
            );

            return data;
          }),
        );

        return previousStripeCustomers.concat(currentBatchStripeCustomers);
      },
      Promise.resolve([] as any[]),
    );

    return {
      coupons: getCoupons(coupons.data),
      customers: getCustomers(stripeCustomers),
      pageCount: Math.ceil(count / size),
      promos: getPromos(stripePromos, stripeCustomers),
    };
  } catch (error) {
    console.error('[GET_STRIPE_PROMO_ACTION]', error);

    return {
      coupons: [] as ReturnType<typeof getCoupons>,
      customers: [] as ReturnType<typeof getCustomers>,
      pageCount: 0,
      promos: [] as ReturnType<typeof getPromos>,
    };
  }
};
