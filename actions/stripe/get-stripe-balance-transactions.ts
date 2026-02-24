'use server';

import { stripe } from '@/server/stripe';

const BALANCE_TRANSACTIONS_LIMIT = 20;

export type BalanceTransactionItem = {
  amount: number;
  availableOn: number;
  created: number;
  currency: string;
  description: string | null;
  fee: number;
  id: string;
  net: number;
  reportingCategory: string;
  source: string | null;
  status: string;
  type: string;
};

export const getStripeBalanceTransactions = async () => {
  try {
    const { data } = await stripe.balanceTransactions.list({
      limit: BALANCE_TRANSACTIONS_LIMIT,
    });

    return data.map((tx) => ({
      amount: tx.amount,
      availableOn: tx.available_on,
      created: tx.created,
      currency: tx.currency,
      description: tx.description ?? null,
      fee: tx.fee,
      id: tx.id,
      net: tx.net,
      reportingCategory: tx.reporting_category ?? tx.type,
      source: tx.source ?? null,
      status: tx.status,
      type: tx.type,
    })) as BalanceTransactionItem[];
  } catch (error) {
    console.error('[GET_STRIPE_BALANCE_TRANSACTIONS_ACTION]', error);

    return [];
  }
};
