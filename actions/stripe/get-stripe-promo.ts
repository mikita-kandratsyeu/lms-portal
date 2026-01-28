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

const formatCouponDescription = (cp: Stripe.Coupon) => {
  if (cp.percent_off) {
    return `${cp.percent_off}% off ${cp.duration_in_months ? `for ${cp.duration_in_months} months` : 'forever'}`;
  }

  if (cp.amount_off && cp.currency) {
    return formatPrice(getConvertedPrice(cp.amount_off), {
      locale: DEFAULT_LOCALE,
      currency: cp.currency,
    });
  }

  return '';
};

const getCoupons = (coupons: StripeCoupons) => {
  return coupons.map((cp) => ({
    description: formatCouponDescription(cp),
    id: cp.id,
    name: cp.name,
  }));
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

const getPromos = (promos: StripePromotionCodes, customers: StripeCustomers) => {
  return promos.map((pc) => {
    const customer = customers.find((cs) => cs?.id === pc.customer);

    return {
      active: pc.active,
      code: pc.code,
      coupon: {
        description: formatCouponDescription(pc.coupon as Stripe.Coupon),
        id: pc.coupon.id,
        name: pc.coupon.name,
      },
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
      restrictions: formatRestrictions(pc.restrictions),
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
      async (previousPromise: Promise<Stripe.PromotionCode[]>, batch, batchIndex) => {
        const previous = await previousPromise;

        if (batchIndex > 0) {
          await sleep(DELAY_MS);
        }

        const currentBatch = await Promise.all(
          batch.map(async (code) => {
            const data = await fetchCachedData(
              `promo_${code.id}_${code.stripePromoId}`,
              async () => stripe.promotionCodes.retrieve(code.stripePromoId),
              ONE_MINUTE_SEC,
            );

            return data;
          }),
        );

        return previous.concat(currentBatch);
      },
      Promise.resolve([]),
    );

    const stripeCustomers = await batchedStripeCustomers.reduce(
      async (previousPromise: Promise<Stripe.Customer[]>, batch, batchIndex) => {
        const previous = await previousPromise;

        if (batchIndex > 0) {
          await sleep(DELAY_MS);
        }

        const currentBatch = await Promise.all(
          batch.map(async (cs) => {
            const data = await fetchCachedData(
              `customer_${cs.stripeCustomerId}`,
              async () => stripe.customers.retrieve(cs.stripeCustomerId),
              ONE_MINUTE_SEC,
            );

            return data as Stripe.Customer;
          }),
        );

        return previous.concat(currentBatch);
      },
      Promise.resolve([]),
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
