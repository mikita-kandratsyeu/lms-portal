import { fromUnixTime } from 'date-fns';
import { StatusCodes } from 'http-status-codes';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

import { sentEmailByTemplate } from '@/actions/mailer/sent-email-by-template';
import { DEFAULT_LANGUAGE } from '@/constants/locale';
import { removeValueFromMemoryCache } from '@/lib/cache';
import db from '@/lib/db';
import { fetcher } from '@/lib/fetcher';
import { isObject, isString } from '@/lib/guard';
import { stripe } from '@/server/stripe';

export const POST = async (req: NextRequest) => {
  const body = await req.text();
  const headersList = await headers();

  const signature = headersList.get('Stripe-Signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string,
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error?.message}`, {
      status: StatusCodes.BAD_REQUEST,
    });
  }

  const session = event.data.object as Stripe.Checkout.Session;
  const userId = session?.metadata?.userId;
  const courseId = session?.metadata?.courseId;
  const isSubscription = session.metadata?.isSubscription;
  const locale = session?.metadata?.locale ?? DEFAULT_LANGUAGE;

  if (event.type === 'checkout.session.completed') {
    if (!userId || (!isSubscription && !courseId)) {
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
          userId,
        },
      });

      await removeValueFromMemoryCache(`user-subscription_${userId}`);

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

      return new NextResponse(JSON.stringify(response));
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

  return new NextResponse(`Webhook Error: Unhandled event type ${event.type}`);
};
