'use server';

import db from '@/lib/db';

export type SubscriptionByType = {
  name: string;
  count: number;
};

export type UsersStats = {
  totalUsers: number;
  verifiedUsers: number;
  premiumUsers: number;
  publicProfiles: number;
  usersWithCourses: number;
  newUsersThisMonth: number;
  subscriptionsByType: SubscriptionByType[];
};

export const getUsersStats = async (): Promise<UsersStats> => {
  try {
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const totalUsers = await db.user.count();

    const verifiedUsers = await db.user.count({
      where: { isEmailConfirmed: true },
    });

    const premiumUsers = await db.user.count({
      where: {
        stripeSubscription: {
          isNot: null,
        },
      },
    });

    const publicProfiles = await db.user.count({
      where: {
        settings: {
          isPublicProfile: true,
        },
      },
    });

    const usersWithCourses = await db.user.count({
      where: {
        courses: {
          some: {},
        },
      },
    });

    const newUsersThisMonth = await db.user.count({
      where: {
        createdAt: { gte: thisMonth },
      },
    });

    const subscriptions = await db.stripeSubscription.groupBy({
      by: ['name'],
      _count: {
        _all: true,
      },
    });

    const subscriptionsByType: SubscriptionByType[] = subscriptions.map((sub) => ({
      name: sub.name,
      count: sub._count._all,
    }));

    return {
      totalUsers,
      verifiedUsers,
      premiumUsers,
      publicProfiles,
      usersWithCourses,
      newUsersThisMonth,
      subscriptionsByType,
    };
  } catch (error) {
    console.error('[GET_USERS_STATS_ACTION]', error);

    return {
      totalUsers: 0,
      verifiedUsers: 0,
      premiumUsers: 0,
      publicProfiles: 0,
      usersWithCourses: 0,
      newUsersThisMonth: 0,
      subscriptionsByType: [],
    };
  }
};
