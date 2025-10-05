'use server';

import { PayoutRequest, User } from '@prisma/client';

import { PAGE_SIZES } from '@/constants/paginations';
import db from '@/lib/db';
import { stripe } from '@/server/stripe';

type PayoutRequests = (Omit<PayoutRequest, 'connectAccount' | 'connectAccountId'> & {
  stripeAccountId: string;
  teacher: User;
})[];

type GetStripeDetails = {
  pageIndex?: string | number;
  pageSize?: string | number;
};

export const getStripeDetails = async ({
  pageIndex = 0,
  pageSize = PAGE_SIZES[0],
}: GetStripeDetails) => {
  const index = Number(pageIndex);
  const size = Number(pageSize);

  try {
    const stripeBalance = await stripe.balance.retrieve();

    const payoutRequests = await db.payoutRequest.findMany({
      include: { connectAccount: true },
      orderBy: { createdAt: 'desc' },
      skip: index * size,
      take: size,
    });
    const count = await db.payoutRequest.count();

    const ownerAccount = await stripe.accounts.retrieve(process.env.STRIPE_OWNER_ACC as string);

    const userIds = payoutRequests.map((pr) => pr.connectAccount.userId);
    const users = await db.user.findMany({ where: { id: { in: userIds } } });

    return {
      balances: {
        available: stripeBalance?.available?.reduce((acc, current) => acc + current.amount, 0) ?? 0,
        pending: stripeBalance?.pending?.reduce((acc, current) => acc + current.amount, 0) ?? 0,
      },
      pageCount: Math.ceil(count / size),
      payoutRequests: payoutRequests.reduce<PayoutRequests>((pr, current) => {
        const teacher = users.find((user) => user.id === current.connectAccount.userId);

        if (teacher) {
          pr.push({
            amount: current.amount,
            createdAt: current.createdAt,
            currency: current.currency,
            destinationPaymentId: current.destinationPaymentId,
            id: current.id,
            status: current.status,
            stripeAccountId: current.connectAccount.stripeAccountId,
            teacher,
            transactionId: current.transactionId,
            updatedAt: current.updatedAt,
          });
        }

        return pr;
      }, []),
      owner: {
        dashboard: ownerAccount.settings?.dashboard,
      },
    };
  } catch (error) {
    console.error('[GET_STRIPE_DETAILS_ACTION]', error);

    return {
      balances: {
        available: 0,
        pending: 0,
      },
      pageCount: 0,
      payoutRequests: [] as PayoutRequests,
      owner: null,
    };
  }
};
