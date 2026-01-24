import { addSeconds, getUnixTime } from 'date-fns';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';
import { getLocale as getAppLocale, getTranslations } from 'next-intl/server';
import Stripe from 'stripe';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import { getIsEmailConfirmed } from '@/actions/auth/get-is-email-confirmed';
import { getAppConfig } from '@/actions/configs/get-app-config';
import { TEN_MINUTE_SEC } from '@/constants/common';
import { fetchCachedData } from '@/lib/cache';
import db from '@/lib/db';
import { getConvertedPrice, getScaledPrice } from '@/lib/format';
import { getLocale } from '@/lib/locale';
import { absoluteUrl } from '@/lib/utils';
import { stripe } from '@/server/stripe';

export const GET = async () => {
  try {
    const subscriptionDescription = await fetchCachedData(
      'subscription-description',
      async () => {
        const subscription = await db.stripeSubscriptionDescription.findMany();

        return subscription ?? [];
      },
      TEN_MINUTE_SEC,
    );

    return NextResponse.json(subscriptionDescription);
  } catch (error) {
    console.error('[PAYMENTS_SUBSCRIPTION]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    const { success, message } = await getIsEmailConfirmed(user.userId);

    if (!success) {
      return NextResponse.json({ message }, { status: StatusCodes.FORBIDDEN });
    }

    const { details, locale, price, rate, recurringInterval, returnUrl, subscriptionName } =
      await req.json();

    const userSubscription = await db.stripeSubscription.findUnique({
      where: { userId: user?.userId },
    });

    if (userSubscription?.stripeCustomerId) {
      const session = await stripe.billingPortal.sessions.create({
        customer: userSubscription.stripeCustomerId,
        return_url: absoluteUrl(returnUrl),
      });

      return NextResponse.json({ url: session.url });
    }

    const appLocale = await getAppLocale();
    const config = await getAppConfig();

    const t = await getTranslations('subscription');

    if (!config?.auth?.allowNewUserSubscriptions) {
      return NextResponse.json({ message: t('block') }, { status: StatusCodes.FORBIDDEN });
    }

    let stripeCustomer = await db.stripeCustomer.findUnique({
      where: { userId: user?.userId },
      select: { stripeCustomerId: true },
    });

    if (!stripeCustomer) {
      const customer = await stripe.customers.create({
        email: user?.email ?? '',
        name: user?.name ?? undefined,
      });

      stripeCustomer = await db.stripeCustomer.create({
        data: { userId: user.userId, stripeCustomerId: customer.id },
      });
    }

    const existingSubscriptions = await stripe.subscriptions.list({
      customer: stripeCustomer.stripeCustomerId,
      status: 'all',
    });
    const trialPeriodDays = existingSubscriptions.data.length === 0 ? 14 : null;

    const session = await stripe.checkout.sessions.create({
      allow_promotion_codes: true,
      customer: stripeCustomer.stripeCustomerId,
      expires_at: getUnixTime(addSeconds(Date.now(), 3600)),
      mode: 'subscription',
      payment_method_types: ['card'],
      locale: getLocale(appLocale, ['be']) as Stripe.Checkout.Session.Locale,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: locale.currency,
            product_data: { name: subscriptionName },
            unit_amount:
              Math.round(getScaledPrice(getConvertedPrice((price / 12) * rate, true))) * 12,
            recurring: { interval: recurringInterval },
          },
        },
      ],
      metadata: {
        ...details,
        isSubscription: true,
        subscriptionName,
        userId: user?.userId,
      },
      success_url: absoluteUrl(`${returnUrl}?success=true`),
      cancel_url: absoluteUrl(returnUrl),
      subscription_data: trialPeriodDays ? { trial_period_days: trialPeriodDays } : {},
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('[PAYMENTS_SUBSCRIPTION_[USER_ID]]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
