'use server';

import { getUnixTime } from 'date-fns';

import { DEFAULT_CURRENCY } from '@/constants/locale';
import db from '@/lib/db';
import { stripe } from '@/server/stripe';

export const getUserBilling = async (userId?: string) => {
  try {
    const stripeCustomer = await db.stripeCustomer.findUnique({
      where: { userId },
      select: { stripeCustomerId: true },
    });

    if (!stripeCustomer) {
      return [];
    }

    const purchases = await db.purchase.findMany({
      where: { userId },
      include: {
        course: { select: { id: true, title: true } },
        details: { select: { invoiceId: true, price: true } },
      },
    });

    const { data: invoices } = await stripe.invoices.list({
      customer: stripeCustomer?.stripeCustomerId,
      limit: 50,
      status: 'paid',
    });

    const freePurchases = purchases
      .filter((purchase) => !purchase.details?.invoiceId && purchase.details?.price === 0)
      .map((purchase) => ({
        amount: 0,
        currency: DEFAULT_CURRENCY,
        id: purchase.id,
        products: [
          {
            amount: 0,
            courseUrl: `/preview-course/${purchase.course.id}`,
            description: purchase.course.title,
            discount: null,
          },
        ],
        timestamp: getUnixTime(purchase.createdAt),
        url: null,
      }));

    const paidPurchases = invoices.map((invoice) => ({
      amount: invoice.amount_paid,
      currency: invoice.currency.toUpperCase(),
      id: invoice.id,
      timestamp: invoice.created,
      url: invoice.hosted_invoice_url,
      products: invoice.lines.data.map((dt) => {
        const courseId =
          purchases.find((ps) => ps.details?.invoiceId === invoice.id)?.courseId ?? null;

        return {
          amount: dt.amount,
          courseUrl: courseId ? `/preview-course/${courseId}` : null,
          description: dt.description,
          discount: dt.discount_amounts,
        };
      }),
    }));

    return [...freePurchases, ...paidPurchases].toSorted((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    console.error('[GET_USER_BILLING_ACTION]', error);

    return [];
  }
};
