'use server';

import { Course, Purchase, PurchaseDetails } from '@prisma/client';

import { TEN_MINUTE_SEC } from '@/constants/common';
import { DELAY_MS } from '@/constants/paginations';
import { fetchCachedData } from '@/lib/cache';
import db from '@/lib/db';
import { getBatchedItems, sleep } from '@/lib/utils';
import { stripe } from '@/server/stripe';

type PurchaseType = Purchase & { course: Course | null; details: PurchaseDetails | null };

type GetStripeData = {
  purchases: PurchaseType[];
  userId: string;
};

export const getStripeData = async ({ purchases, userId }: GetStripeData) => {
  const accountId = await db.stripeConnectAccount.findUnique({ where: { userId } });
  const account = accountId?.stripeAccountId
    ? await stripe.accounts.retrieve(accountId.stripeAccountId)
    : null;

  const accountBalance = accountId?.stripeAccountId
    ? await stripe.balance.retrieve({ stripeAccount: accountId.stripeAccountId })
    : null;

  const accountBalanceTransactions = account?.id
    ? await stripe.balanceTransactions.list({ limit: 5 }, { stripeAccount: account.id })
    : null;

  const paymentIntents = [...new Set(purchases.map((ps) => ps.details?.paymentIntent))].filter(
    (pi) => pi,
  );

  const batchedPaymentIntents = getBatchedItems(paymentIntents);

  const charges = (
    await batchedPaymentIntents.reduce(
      async (previousChargesPromise, batch, batchIndex) => {
        const previousCharges = await previousChargesPromise;

        if (batchIndex > 0) {
          await sleep(DELAY_MS);
        }

        const currentBatchCharges = await Promise.all(
          batch.map(async (pi) => {
            const data = await fetchCachedData(
              `${userId}-${pi}`,
              async () => {
                const res = await stripe.charges.list({ payment_intent: pi as string });

                return res.data.filter((ch) =>
                  purchases.find((pc) => pc.details?.paymentIntent === ch.payment_intent),
                );
              },
              TEN_MINUTE_SEC,
            );

            return data;
          }),
        );

        return previousCharges.concat(currentBatchCharges.flat());
      },
      Promise.resolve([] as any[]),
    )
  ).filter((sc) => sc?.balance_transaction);

  const batchedCharges = getBatchedItems(charges);

  const balanceTransactions = await batchedCharges.reduce(
    async (previousTransactionsPromise: Promise<any[]>, batch: any[], batchIndex: number) => {
      const previousTransactions = await previousTransactionsPromise;

      if (batchIndex > 0) {
        await sleep(DELAY_MS);
      }

      const currentBatchTransactions = await Promise.all(
        batch.map(async (sc: any) => {
          const data = await fetchCachedData(
            `${userId}-${sc.id}`,
            async () => {
              const res = await stripe.balanceTransactions.retrieve(sc.balance_transaction);

              return res;
            },
            TEN_MINUTE_SEC,
          );

          return data;
        }),
      );

      return previousTransactions.concat(currentBatchTransactions);
    },
    Promise.resolve([] as any[]),
  );

  return {
    account,
    accountBalance,
    accountBalanceTransactions,
    balanceTransactions,
    charges,
  };
};
