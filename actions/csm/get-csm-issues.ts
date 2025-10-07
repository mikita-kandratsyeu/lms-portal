'use server';

import { CsmAttachment, CsmCategory, CsmIssue, User } from '@prisma/client';

import { PAGE_SIZES } from '@/constants/paginations';
import db from '@/lib/db';

type GetCsmIssues = {
  pageIndex?: string | number;
  pageSize?: string | number;
  search?: string;
};

export type CsmIssueType = CsmIssue & {
  attachments: CsmAttachment[];
  category: CsmCategory | null;
  user: User | null;
};

export const getCsmIssue = async ({
  pageIndex = 0,
  pageSize = PAGE_SIZES[0],
  search,
}: GetCsmIssues): Promise<{ pageCount: number; issues: CsmIssueType[] }> => {
  const index = Number(pageIndex);
  const size = Number(pageSize);

  try {
    const issues = await db.csmIssue.findMany({
      where: { name: { contains: search, mode: 'insensitive' } },
      include: {
        category: true,
        attachments: true,
        user: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: index * size,
      take: size,
    });

    const count = await db.user.count({
      where: { name: { contains: search, mode: 'insensitive' } },
    });

    return { pageCount: Math.ceil(count / size), issues };
  } catch (error) {
    console.error('[GET_CSM_ISSUES_ACTION]', error);

    return { pageCount: 0, issues: [] };
  }
};
