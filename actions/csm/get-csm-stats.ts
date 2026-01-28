'use server';

import { CsmStatus } from '@prisma/client';

import db from '@/lib/db';

export type CsmStats = {
  totalIssues: number;
  newIssues: number;
  inProgressIssues: number;
  resolvedIssues: number;
  issuesThisMonth: number;
  issuesByCategory: Array<{ name: string; count: number }>;
};

type GetCsmStatsParams = {
  search?: string;
};

export const getCsmStats = async ({ search }: GetCsmStatsParams = {}): Promise<CsmStats> => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const searchFilter = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { description: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [
      totalIssues,
      newIssues,
      inProgressIssues,
      resolvedIssues,
      issuesThisMonth,
      issuesByCategory,
    ] = await Promise.all([
      db.csmIssue.count({ where: searchFilter }),
      db.csmIssue.count({ where: { ...searchFilter, status: CsmStatus.new } }),
      db.csmIssue.count({ where: { ...searchFilter, status: CsmStatus.progress } }),
      db.csmIssue.count({ where: { ...searchFilter, status: CsmStatus.done } }),
      db.csmIssue.count({
        where: {
          ...searchFilter,
          createdAt: {
            gte: startOfMonth,
          },
        },
      }),
      db.csmIssue.groupBy({
        by: ['categoryId'],
        where: searchFilter,
        _count: {
          categoryId: true,
        },
        orderBy: {
          _count: {
            categoryId: 'desc',
          },
        },
      }),
    ]);

    const categoryIds = issuesByCategory.map((item) => item.categoryId).filter(Boolean);
    const categories = await db.csmCategory.findMany({
      where: {
        id: {
          in: categoryIds as string[],
        },
      },
    });

    const categoryMap = new Map(categories.map((cat) => [cat.id, cat.name]));

    const issuesByCategoryWithNames = issuesByCategory.map((item) => ({
      name: item.categoryId ? categoryMap.get(item.categoryId) || 'Unknown' : 'Uncategorized',
      count: item._count.categoryId,
    }));

    return {
      totalIssues,
      newIssues,
      inProgressIssues,
      resolvedIssues,
      issuesThisMonth,
      issuesByCategory: issuesByCategoryWithNames,
    };
  } catch (error) {
    console.error('[GET_CSM_STATS]', error);

    return {
      totalIssues: 0,
      newIssues: 0,
      inProgressIssues: 0,
      resolvedIssues: 0,
      issuesThisMonth: 0,
      issuesByCategory: [],
    };
  }
};
