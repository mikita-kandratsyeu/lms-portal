'use server';

import { getLocale } from 'next-intl/server';

import { BLOCK_CHANNEL_PREFIX, BLOCK_EVENT_PREFIX } from '@/constants/block';
import { removeValueFromMemoryCache } from '@/lib/cache';
import db from '@/lib/db';
import { absoluteUrl } from '@/lib/utils';
import { pusher } from '@/server/pusher';
import { stripe } from '@/server/stripe';

import { sentEmailByTemplate } from '../mailer/sent-email-by-template';

type BlockUserParams = {
  userId: string;
  reason: string;
  blockedUntil?: Date | null;
};

export const blockUser = async ({ userId, reason, blockedUntil }: BlockUserParams) => {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { stripeSubscription: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  await db.user.update({
    where: { id: userId },
    data: {
      isBlocked: true,
      blockedReason: reason,
      blockedUntil: blockedUntil ?? null,
    },
  });

  await removeValueFromMemoryCache(`updated-user_${userId}`);

  if (user.stripeSubscription?.stripeSubscriptionId) {
    try {
      await stripe.subscriptions.update(user.stripeSubscription.stripeSubscriptionId, {
        pause_collection: { behavior: 'void' },
      });
    } catch (error) {
      console.error('[BLOCK_USER_STRIPE_PAUSE]', error);
    }
  }

  try {
    await pusher.trigger(`${BLOCK_CHANNEL_PREFIX}${userId}`, `${BLOCK_EVENT_PREFIX}${userId}`, {
      blockedReason: reason,
      blockedUntil: blockedUntil ? blockedUntil.toISOString() : null,
    });
  } catch (error) {
    console.error('[BLOCK_USER_PUSHER]', error);
  }

  const locale = await getLocale();

  await sentEmailByTemplate({
    emails: [user.email],
    locale,
    params: {
      username: user.name ?? user.email,
      blockedReason: reason,
      blockedUntil: blockedUntil ? new Date(blockedUntil).toLocaleDateString() : '',
      supportLink: absoluteUrl('/'),
    },
    template: 'user-blocked',
  });
};

export const unblockUser = async (userId: string) => {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { stripeSubscription: true },
  });

  if (!user) {
    throw new Error('User not found');
  }

  await db.user.update({
    where: { id: userId },
    data: {
      isBlocked: false,
      blockedReason: null,
      blockedUntil: null,
    },
  });

  await removeValueFromMemoryCache(`updated-user_${userId}`);

  if (user.stripeSubscription?.stripeSubscriptionId) {
    try {
      await stripe.subscriptions.update(user.stripeSubscription.stripeSubscriptionId, {
        pause_collection: '',
      });
    } catch (error) {
      console.error('[UNBLOCK_USER_STRIPE_RESUME]', error);
    }
  }
};
