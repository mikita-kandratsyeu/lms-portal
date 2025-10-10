'use server';

import { getLocale, getTranslations } from 'next-intl/server';

import db from '@/lib/db';
import { createWebSocketNotification } from '@/lib/notifications';

import packageJson from '../../package.json';

type CreateCsmIssue = {
  categoryId: string;
  description: string;
  email?: string | null;
  files?: { url: string; name: string }[];
  userId?: string;
};

export const createCsmIssue = async ({
  categoryId,
  description,
  email = '',
  files = [],
  userId,
}: CreateCsmIssue) => {
  const locale = await getLocale();
  const t = await getTranslations('csm-modal.notifications');

  const lastIssueInDb = await db.csmIssue.findMany({ orderBy: { createdAt: 'desc' }, take: 1 });
  const issueNumber = `CSM-${lastIssueInDb.length ? Number(lastIssueInDb[0].name.split('-')[1]) + 1 : 1}`;

  const issue = await db.csmIssue.create({
    data: {
      categoryId,
      description,
      email,
      locale,
      name: issueNumber,
      releaseVersion: `${packageJson?.name}:${packageJson?.version}`,
      userId,
    },
  });

  await db.csmAttachment.createMany({
    data: files.map((file: { url: string; name: string }) => ({
      csmIssueId: issue.id,
      name: file.name,
      url: file.url,
    })),
  });

  if (userId) {
    await createWebSocketNotification({
      channel: `notification_channel_${userId}`,
      data: {
        body: t('success'),
        title: `${issue.name}`.toUpperCase(),
        userId,
      },
      event: `private_event_${userId}`,
    });
  }

  const ownerId = process.env.NEXT_PUBLIC_OWNER_ID as string;

  await createWebSocketNotification({
    channel: `notification_channel_${ownerId}`,
    data: {
      body: t('ownerSuccess', { user: email ?? '' }),
      title: `${issue.name}`.toUpperCase(),
      userId: ownerId,
    },
    event: `private_event_${ownerId}`,
  });

  return { issueNumber: issue.name };
};
