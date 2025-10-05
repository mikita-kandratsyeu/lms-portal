'use server';

import { PayoutRequest, PurchaseDetails, User } from '@prisma/client';
import groupBy from 'lodash.groupby';

import { PayoutRequestStatus } from '@/constants/payments';
import db from '@/lib/db';

import { getStripeConnect, getStripeConnectPayouts } from './get-stripe-connect';
import { getStripeData } from './get-stripe-data';
import { getTotalProfit } from './get-total-profit';
import { getTotalRevenueData } from './get-total-revenue-data';
import { getTransactions, PurchaseWithCourse, Transaction } from './get-transactions';

type Sales = (ReturnType<typeof groupByCourse>[number][number]['details'] & { title: string })[];
type StripeConnectPayouts = Awaited<ReturnType<typeof getStripeConnectPayouts>>;

const groupByCourse = (purchases: PurchaseWithCourse[], users: User[]) => {
  const grouped: { [courseTitle: string]: { user?: User; details: PurchaseDetails }[] } = {};

  purchases.forEach((purchase) => {
    const courseTitle = purchase.course.title;

    if (!grouped[courseTitle]) {
      grouped[courseTitle] = [];
    }

    if (purchase.details) {
      grouped[courseTitle].push({
        user: users.find((user) => user.id === purchase.userId),
        details: purchase.details,
      });
    }
  });

  return grouped;
};

const getMap = (sales: Sales) => {
  const groupedByPosition = groupBy(
    sales,
    (item: (typeof sales)[number]) => `${item.latitude}*${item.longitude}`,
  );

  return Object.keys(groupedByPosition).map((key) => {
    const [lt, lg] = key.split('*');
    return {
      city: groupedByPosition[key][0].city || 'Unknown',
      country: groupedByPosition[key][0].country || 'Unknown',
      currency: groupedByPosition[key][0].currency,
      position: [Number(lt) || 0, Number(lg) || 0],
      totalAmount: groupedByPosition[key].reduce(
        (total, current) => total + (current.price ?? 0),
        0,
      ),
      totalSales: groupedByPosition[key].length,
    };
  });
};

export const getAnalytics = async (userId: string) => {
  try {
    const purchases = await db.purchase.findMany({
      where: { course: { userId } },
      orderBy: { updatedAt: 'desc' },
      include: {
        course: true,
        details: true,
      },
    });

    const userIds = [...new Set(purchases.map((ps) => ps.userId))];
    const users = await db.user.findMany({ where: { id: { in: userIds } } });

    const { account, accountBalance, accountBalanceTransactions, balanceTransactions, charges } =
      await getStripeData({ purchases, userId });

    const payouts = account?.id
      ? await db.payoutRequest.findMany({
          where: {
            connectAccount: { stripeAccountId: account.id },
          },
          select: {
            amount: true,
            currency: true,
            id: true,
            status: true,
            transactionId: true,
            updatedAt: true,
          },
          orderBy: {
            updatedAt: 'desc',
          },
        })
      : [];

    const activePayouts = payouts.filter((py) => py.status === PayoutRequestStatus.PENDING);
    const declinedPayouts = payouts
      .filter((py) => py.status === PayoutRequestStatus.DECLINED)
      .slice(0, 5);
    const successfulPayouts = payouts.filter((py) => py.status === PayoutRequestStatus.PAID);

    const fees = await db.fee.findMany();

    const groupedEarnings = groupByCourse(purchases, users);
    const sales = Object.entries(groupedEarnings).flatMap(([title, others]) =>
      others.map((other) => ({ ...other.details, title })),
    );

    const chart = Object.entries(groupedEarnings).map(([title, others]) => ({
      title,
      qty: others.length,
    }));
    const map = getMap(sales);
    const totalRevenue = balanceTransactions.reduce(
      (revenue: number, current: { amount: number }) => revenue + current.amount,
      0,
    );
    const totalRevenueData = await getTotalRevenueData(balanceTransactions);

    const totalProfit = await getTotalProfit(
      balanceTransactions,
      totalRevenue,
      fees,
      successfulPayouts,
    );
    const transactions = await getTransactions(charges, purchases, users);
    const stripeConnect = await getStripeConnect(account, accountBalance);
    const stripeConnectPayouts = await getStripeConnectPayouts(
      accountBalanceTransactions,
      declinedPayouts as PayoutRequest[],
    );

    return {
      activePayouts,
      chart,
      isError: false,
      map,
      stripeConnect,
      stripeConnectPayouts,
      totalProfit,
      totalRevenue,
      totalRevenueData,
      transactions,
    };
  } catch (error) {
    console.error('[GET_ANALYTICS_ACTION]', error);

    return {
      activePayouts: [] as PayoutRequest[],
      chart: [],
      isError: true,
      map: [],
      stripeConnect: null,
      stripeConnectPayouts: [] as StripeConnectPayouts,
      totalProfit: null,
      totalRevenue: 0,
      totalRevenueData: [],
      transactions: [] as Transaction[],
    };
  }
};
