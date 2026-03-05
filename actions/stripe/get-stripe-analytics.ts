'use server';

import db from '@/lib/db';
import { stripe } from '@/server/stripe';

export const getStripeAnalytics = async () => {
  try {
    const stripeBalance = await stripe.balance.retrieve();

    const totalCustomers = await db.stripeCustomer.count();
    const totalInstructors = await db.stripeConnectAccount.count();

    const subscriptions = await db.stripeSubscription.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    const subscriptionDescriptions = await db.stripeSubscriptionDescription.findMany();
    const now = new Date();

    const isActiveSubscription = (s: { cancelAt: Date | null }) => !s.cancelAt || s.cancelAt > now;

    const subscriptionsWithTrialStatus = await Promise.all(
      subscriptions.map(async (sub) => {
        let trialEnd: Date | null = sub.trialEnd;
        let stripeStatus: string | null = null;
        if (trialEnd == null) {
          try {
            const stripeSub = await stripe.subscriptions.retrieve(sub.stripeSubscriptionId);
            stripeStatus = stripeSub.status;
            trialEnd = stripeSub.trial_end ? new Date(stripeSub.trial_end * 1000) : null;
          } catch {
            trialEnd = null;
          }
        }
        const isInTrial = stripeStatus === 'trialing' || (trialEnd != null && trialEnd > now);
        return { ...sub, isInTrial, trialEnd };
      }),
    );

    const subscriptionPlans = subscriptionsWithTrialStatus.reduce(
      (acc, sub) => {
        const planName = sub.name;
        const description = subscriptionDescriptions.find((desc) => desc.name === planName);
        const price = description?.price || 0;
        const isActive = isActiveSubscription(sub);
        const contributesRevenue = isActive && !sub.isInTrial;

        if (!acc[planName]) {
          acc[planName] = {
            name: planName,
            count: 0,
            activeCount: 0,
            revenue: 0,
            period: description?.period || 'monthly',
          };
        }

        acc[planName].count += 1;
        if (isActive) {
          acc[planName].activeCount += 1;
        }
        if (contributesRevenue) {
          acc[planName].revenue += price;
        }

        return acc;
      },
      {} as Record<
        string,
        { name: string; count: number; activeCount: number; revenue: number; period: string }
      >,
    );

    const subscriptionRevenueAmount = Object.values(subscriptionPlans).reduce(
      (total, plan) => total + plan.revenue,
      0,
    );

    const trialSubscriptions = subscriptionsWithTrialStatus.filter(
      (s) => isActiveSubscription(s) && s.isInTrial,
    );
    const trialEndDates = trialSubscriptions
      .map((s) => s.trialEnd)
      .filter((d): d is Date => d != null)
      .sort((a, b) => a.getTime() - b.getTime());
    const earliestTrialEnd = trialEndDates[0] ?? null;

    const purchases = await db.purchase.findMany({
      include: {
        details: true,
        course: {
          select: {
            title: true,
            price: true,
          },
        },
      },
    });

    const salesRevenue = purchases.reduce((total, purchase) => {
      return total + (purchase.details?.price || purchase.course?.price || 0);
    }, 0);

    const recentPayoutRequests = await db.payoutRequest.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        connectAccount: {
          include: {
            payoutRequests: true,
          },
        },
      },
    });

    const totalPayoutAmount = await db.payoutRequest.aggregate({
      _sum: {
        amount: true,
      },
      where: {
        status: 'paid',
      },
    });

    const connectAccounts = await db.stripeConnectAccount.findMany({
      select: { stripeAccountId: true },
    });

    let teachersOwed = 0;

    await Promise.all(
      connectAccounts.map(async ({ stripeAccountId }) => {
        try {
          const balance = await stripe.balance.retrieve({
            stripeAccount: stripeAccountId,
          });
          const available = balance?.available?.reduce((acc, cur) => acc + cur.amount, 0) ?? 0;
          teachersOwed += available;
        } catch (error) {
          console.error('[GET_STRIPE_CONNECTED_ACC_ACTION]', error);
        }
      }),
    );

    const totalRevenue = salesRevenue + subscriptionRevenueAmount;
    const totalPaidOut = totalPayoutAmount._sum.amount || 0;
    const netIncome = totalRevenue - totalPaidOut;

    return {
      balances: {
        available: stripeBalance?.available?.reduce((acc, current) => acc + current.amount, 0) ?? 0,
        pending: stripeBalance?.pending?.reduce((acc, current) => acc + current.amount, 0) ?? 0,
      },
      customers: {
        total: totalCustomers,
      },
      instructors: {
        total: totalInstructors,
      },
      revenue: {
        subscriptions: {
          count: subscriptions.length,
          active: subscriptions.filter(isActiveSubscription).length,
          trialCount: trialSubscriptions.length,
          payingCount:
            subscriptions.filter(isActiveSubscription).length - trialSubscriptions.length,
          amount: subscriptionRevenueAmount,
          earliestTrialEnd,
          plans: Object.values(subscriptionPlans).sort((a, b) => b.activeCount - a.activeCount),
          subscribers: subscriptionsWithTrialStatus.map((s) => ({
            name: s.user?.name ?? '',
            email: s.user?.email ?? '',
            planName: s.name,
            isActive: isActiveSubscription(s),
            isInTrial: s.isInTrial,
            cancelAt: s.cancelAt,
            trialEnd: s.trialEnd,
          })),
        },
        sales: {
          amount: salesRevenue,
          count: purchases.length,
        },
        total: salesRevenue + subscriptionRevenueAmount,
      },
      payouts: {
        total: totalPaidOut,
        recent: recentPayoutRequests.length,
      },
      teachersOwed,
      netIncome,
    };
  } catch (error) {
    console.error('[GET_STRIPE_ANALYTICS_ACTION]', error);

    return {
      balances: {
        available: 0,
        pending: 0,
      },
      customers: {
        total: 0,
      },
      instructors: {
        total: 0,
      },
      revenue: {
        subscriptions: {
          count: 0,
          active: 0,
          trialCount: 0,
          payingCount: 0,
          amount: 0,
          earliestTrialEnd: null,
          plans: [],
          subscribers: [],
        },
        sales: {
          amount: 0,
          count: 0,
        },
        total: 0,
      },
      payouts: {
        total: 0,
        recent: 0,
      },
      teachersOwed: 0,
      netIncome: 0,
    };
  }
};
