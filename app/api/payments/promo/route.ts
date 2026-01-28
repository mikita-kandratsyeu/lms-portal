import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';
import { getTranslations } from 'next-intl/server';
import Stripe from 'stripe';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import { PromoStatus } from '@/constants/payments';
import db from '@/lib/db';
import { createWebSocketNotification } from '@/lib/notifications';
import { isBusinessOwner } from '@/lib/owner';
import { stripe } from '@/server/stripe';

export const POST = async (req: NextRequest) => {
  try {
    const user = await getCurrentUser();

    if (!user || !isBusinessOwner(user.userId)) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    const { promoId, ...other } = await req.json();

    const action = req.nextUrl.searchParams.get('action');

    const t = await getTranslations('payments.promo');

    if (action === PromoStatus.DECLINED && promoId) {
      const stripePromotion = await stripe.promotionCodes.update(promoId, { active: false });

      const promotionCode = await db.stripePromo.update({
        where: { stripePromoId: stripePromotion.id },
        data: {
          isActive: false,
        },
      });

      return NextResponse.json(promotionCode);
    }

    if (action === PromoStatus.NEW) {
      const payload = {
        coupon: other.couponId,
        code: other.code,
        max_redemptions: other?.limitNumberOfRedeemed ? other.numberOfRedeemed : undefined,
        customer: other.limitToSpecificCustomer && other.customerId ? other.customerId : undefined,
        restrictions: {
          first_time_transaction: other.firstTimePurchase,
          ...(other.requireMinimumAmount && {
            minimum_amount: other.minAmount,
            minimum_amount_currency: other.minAmountCurrency,
          }),
        },
      } as Stripe.PromotionCodeCreateParams;

      const stripePromotion = await stripe.promotionCodes.create(payload);

      const promotionCode = await db.stripePromo.create({
        data: {
          code: other.code,
          stripeCouponId: other.couponId,
          stripePromoId: stripePromotion.id,
        },
      });

      if (other.customerId) {
        const stripeCustomer = await db.stripeCustomer.findUnique({
          where: { stripeCustomerId: other.customerId },
        });

        if (stripeCustomer?.userId) {
          const userExists = await db.user.findUnique({
            where: { id: stripeCustomer.userId },
          });

          if (userExists) {
            await createWebSocketNotification({
              channel: `notification_channel_${stripeCustomer.userId}`,
              data: {
                body: t('new.body', { code: promotionCode.code }),
                title: t('new.title'),
                userId: stripeCustomer.userId,
              },
              event: `private_event_${stripeCustomer.userId}`,
            });
          }
        }
      }

      return NextResponse.json(promotionCode);
    }

    return new NextResponse(ReasonPhrases.BAD_REQUEST, { status: StatusCodes.BAD_REQUEST });
  } catch (error) {
    console.error('[PAYMENTS_PROMO]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
