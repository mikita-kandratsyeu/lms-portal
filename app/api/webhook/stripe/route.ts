import { fromUnixTime } from 'date-fns';
import { StatusCodes } from 'http-status-codes';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

import { sentEmailByTemplate } from '@/actions/mailer/sent-email-by-template';
import { DEFAULT_LANGUAGE } from '@/constants/locale';
import { removeValueFromMemoryCache } from '@/lib/cache';
import db from '@/lib/db';
import { fetcher } from '@/lib/fetcher';
import { isObject, isString } from '@/lib/guard';
import { stripe } from '@/server/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export const POST = async (req: Request) => {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!body || !signature) {
    console.error('[Stripe Webhook] Missing body or stripe-signature header');
    return new NextResponse('Webhook Error: Missing body or signature', {
      status: StatusCodes.BAD_REQUEST,
    });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[Stripe Webhook] STRIPE_WEBHOOK_SECRET is not set');
    return new NextResponse('Webhook Error: Server misconfiguration', {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Stripe Webhook] Signature verification failed:', message);
    return new NextResponse(`Webhook Error: ${message}`, {
      status: StatusCodes.BAD_REQUEST,
    });
  }

  console.warn(`[Stripe Webhook] Received event: ${event.type} (${event.id})`);

  const session = event.data.object as Stripe.Checkout.Session;
  const userId = session?.metadata?.userId;
  const courseId = session?.metadata?.courseId;
  const isSubscription = session?.metadata?.isSubscription;
  const locale = session?.metadata?.locale ?? DEFAULT_LANGUAGE;

  if (event.type === 'checkout.session.completed') {
    console.warn('[Stripe Webhook] Processing checkout.session.completed', {
      sessionId: session?.id,
      userId,
      courseId,
      isSubscription,
    });

    try {
      if (session.total_details?.amount_discount) {
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
          expand: ['data.discounts'],
        });

        for (const item of lineItems.data) {
          if (item.discounts && item.discounts.length > 0) {
            for (const discount of item.discounts) {
              if (discount.discount && isObject(discount.discount)) {
                const promotionCodeId = discount.discount.promotion_code;

                if (isString(promotionCodeId)) {
                  const promoCode = await stripe.promotionCodes.retrieve(promotionCodeId);

                  const existingPromo = await db.stripePromo.findUnique({
                    where: { stripePromoId: promoCode.id },
                  });

                  if (existingPromo) {
                    const shouldDeactivate =
                      promoCode.max_redemptions &&
                      promoCode.times_redeemed >= promoCode.max_redemptions;

                    await db.stripePromo.update({
                      where: { stripePromoId: promoCode.id },
                      data: {
                        timesRedeemed: promoCode.times_redeemed,
                        isActive: shouldDeactivate ? false : promoCode.active,
                      },
                    });

                    await removeValueFromMemoryCache(
                      `user-promo-redeemed_${existingPromo.id}_${promoCode.id}`,
                    );
                  }
                }
              }
            }
          }
        }
      }

      if (!userId || (!isSubscription && !courseId)) {
        console.error('[Stripe Webhook] Missing metadata', { userId, courseId, isSubscription });
        return new NextResponse('Webhook Error: Missing metadata', {
          status: StatusCodes.BAD_REQUEST,
        });
      }

      if (isSubscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

        const response = await db.stripeSubscription.create({
          data: {
            endDate: new Date(subscription.items.data[0].current_period_end * 1000),
            name: session?.metadata?.subscriptionName ?? '',
            startDate: new Date(subscription.items.data[0].current_period_start * 1000),
            stripeCustomerId: subscription.customer as string,
            stripePriceId: subscription.items.data[0].price.id,
            stripeSubscriptionId: subscription.id,
            trialEnd: subscription.trial_end ? fromUnixTime(subscription.trial_end) : null,
            userId,
          },
        });

        await removeValueFromMemoryCache(`user-subscription_${userId}`);

        console.warn('[Stripe Webhook] checkout.session.completed success (subscription)', {
          subscriptionId: response.stripeSubscriptionId,
        });
        return new NextResponse(JSON.stringify(response));
      } else {
        const response = await db.$transaction(async (prisma) => {
          const purchase = await prisma.purchase.create({
            data: {
              courseId: courseId!,
              userId,
            },
          });

          const invoiceId = (() => {
            if (isString(session.invoice)) {
              return session.invoice;
            }

            if (isObject(session.invoice)) {
              return session.invoice?.id;
            }
            return null;
          })();

          const transaction = await prisma.purchaseDetails.create({
            data: {
              city: session?.metadata?.city,
              country: session?.metadata?.country,
              countryCode: session?.metadata?.countryCode,
              currency: session.currency?.toUpperCase(),
              invoiceId,
              latitude: Number(session?.metadata?.latitude),
              longitude: Number(session?.metadata?.longitude),
              paymentIntent: session.payment_intent?.toString(),
              price: session.amount_total ?? 0,
              purchaseId: purchase.id,
            },
          });

          return transaction;
        });

        let pdfBuffer = null;
        const invoiceId = response?.invoiceId;

        if (invoiceId) {
          const stripeInvoice = await stripe.invoices.retrieve(invoiceId);
          const invoicePdf = stripeInvoice?.invoice_pdf;

          if (invoicePdf) {
            pdfBuffer = await fetcher.get(invoicePdf, { responseType: 'arrayBuffer' });
          }

          const emailParams = {
            courseLink: session.success_url ?? '',
            courseName: session?.metadata?.courseName ?? '',
            username: session?.metadata?.username ?? '',
          };

          await sentEmailByTemplate({
            attachments: pdfBuffer
              ? [
                  {
                    content: Buffer.from(pdfBuffer),
                    contentType: 'application/pdf',
                    filename: `${invoiceId}_invoice.pdf`,
                  },
                ]
              : [],
            emails: [session?.metadata?.email ?? ''],
            locale,
            params: emailParams,
            template: 'course-purchase',
          });
        }

        console.warn('[Stripe Webhook] checkout.session.completed success', {
          purchaseId: response?.purchaseId ?? response?.id,
        });
        return new NextResponse(JSON.stringify(response));
      }
    } catch (error) {
      console.error('[Stripe Webhook] checkout.session.completed failed:', error);
      return new NextResponse(
        `Webhook Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        { status: StatusCodes.INTERNAL_SERVER_ERROR },
      );
    }
  }

  if (event.type === 'customer.subscription.updated') {
    const subscription: Stripe.Subscription = event.data.object;

    const isSubscriptionExist = await db.stripeSubscription.findUnique({
      where: { stripeSubscriptionId: subscription.id },
      select: { id: true },
    });

    if (isSubscriptionExist) {
      const response = await db.stripeSubscription.update({
        where: { stripeSubscriptionId: subscription.id },
        data: {
          cancelAt: subscription.cancel_at ? fromUnixTime(subscription.cancel_at) : null,
          trialEnd: subscription.trial_end ? fromUnixTime(subscription.trial_end) : null,
        },
      });

      return new NextResponse(JSON.stringify(response));
    }

    return new NextResponse(null);
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;

    const response = await db.stripeSubscription.delete({
      where: { stripeSubscriptionId: subscription.id },
    });

    return new NextResponse(JSON.stringify(response));
  }

  if (event.type === 'promotion_code.updated') {
    const promotionCode = event.data.object as Stripe.PromotionCode;

    const existingPromo = await db.stripePromo.findUnique({
      where: { stripePromoId: promotionCode.id },
    });

    if (existingPromo) {
      const shouldDeactivate =
        promotionCode.max_redemptions &&
        promotionCode.times_redeemed >= promotionCode.max_redemptions;

      const response = await db.stripePromo.update({
        where: { stripePromoId: promotionCode.id },
        data: {
          timesRedeemed: promotionCode.times_redeemed,
          isActive: shouldDeactivate ? false : promotionCode.active,
        },
      });

      await removeValueFromMemoryCache(
        `user-promo-redeemed_${existingPromo.id}_${promotionCode.id}`,
      );

      return new NextResponse(JSON.stringify(response));
    }

    return new NextResponse(null);
  }

  console.warn(`[Stripe Webhook] Unhandled event type: ${event.type}`);
  return new NextResponse(JSON.stringify({ received: true }), { status: 200 });
};
