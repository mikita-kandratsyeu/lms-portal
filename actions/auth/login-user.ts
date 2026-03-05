'use server';

import { differenceInMilliseconds } from 'date-fns/differenceInMilliseconds';
import { v4 as uuidv4 } from 'uuid';

import { OAUTH } from '@/constants/auth';
import { ONE_HOUR_SEC, ONE_MIN_MS } from '@/constants/common';
import { setValueToMemoryCache } from '@/lib/cache';
import db from '@/lib/db';
import { absoluteUrl, encrypt } from '@/lib/utils';
import { stripe } from '@/server/stripe';

import { getAppConfig } from '../configs/get-app-config';
import { sentEmailByTemplate } from '../mailer/sent-email-by-template';

type OAuth = { email?: string; provider?: string; providerId?: string; type?: string };

const createUserOauth = async (userId: string, oauth?: OAuth) => {
  if (oauth?.type === OAUTH && oauth?.provider && oauth?.providerId) {
    const userProvider = {
      email: oauth.email,
      provider: oauth.provider,
      providerId: oauth.providerId,
      userId,
    };

    await db.userOAuth.upsert({
      where: { providerId: oauth.providerId },
      update: userProvider,
      create: userProvider,
    });
  }
};

export const loginUser = async (
  email: string,
  name?: string | null,
  pictureUrl?: string | null,
  password?: string | null,
  oauth?: OAuth,
) => {
  const config = await getAppConfig();

  const existingUser = await db.user.findUnique({
    where: { email },
    include: { stripeSubscription: true, settings: true },
  });

  if (existingUser) {
    await createUserOauth(existingUser.id, oauth);

    const isCurrentlyBlocked =
      existingUser.isBlocked &&
      (!existingUser.blockedUntil || new Date(existingUser.blockedUntil) > new Date());

    if (isCurrentlyBlocked) {
      return {
        blocked: true,
        blockedReason: existingUser.blockedReason,
        blockedUntil: existingUser.blockedUntil,
        hasSubscription: false,
        id: existingUser.id,
        image: existingUser.pictureUrl,
        isPublic: existingUser.settings?.isPublicProfile,
        name: existingUser.name,
        otpSecret: null,
        role: existingUser.role,
      };
    }

    if (
      existingUser.isBlocked &&
      existingUser.blockedUntil &&
      new Date(existingUser.blockedUntil) <= new Date()
    ) {
      await db.user.update({
        where: { id: existingUser.id },
        data: { isBlocked: false, blockedReason: null, blockedUntil: null },
      });
    }

    return {
      hasSubscription: Boolean(existingUser.stripeSubscription),
      id: existingUser.id,
      image: existingUser.pictureUrl,
      isPublic: existingUser.settings?.isPublicProfile,
      name: existingUser.name,
      otpSecret: existingUser.otpSecret,
      role: existingUser.role,
    };
  }

  if (!config?.auth?.allowNewUsers) {
    return null;
  }

  const user = await db.user.upsert({
    where: {
      email,
    },
    update: {},
    create: {
      email,
      name,
      password,
      pictureUrl,
    },
  });

  const stripeCustomer = await db.stripeCustomer.findUnique({
    where: { userId: user.id },
    select: { stripeCustomerId: true },
  });

  if (!stripeCustomer) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user?.name ?? undefined,
    });

    await db.stripeCustomer.create({
      data: { userId: user.id, stripeCustomerId: customer.id },
    });
  }

  await createUserOauth(user.id, oauth);

  if (
    !user.isEmailConfirmed &&
    differenceInMilliseconds(new Date(), new Date(user.createdAt)) <= ONE_MIN_MS
  ) {
    const secret = uuidv4();
    const key = `${user.id}-email_confirmation_token`;

    await setValueToMemoryCache(key, secret, ONE_HOUR_SEC);

    const emailParams = {
      username: user?.name ?? '',
      verificationLink: absoluteUrl(
        `/settings/general?code=${encodeURIComponent(encrypt({ secret, key }, process.env.EMAIl_CONFIRMATION_SECRET as string))}`,
      ),
    };

    await sentEmailByTemplate({
      emails: [user?.email ?? ''],
      params: emailParams,
      template: 'confirmation-email',
    });
  }
  return {
    hasSubscription: false,
    id: user.id,
    image: user.pictureUrl,
    isPublic: false,
    name: user.name,
    otpSecret: user.otpSecret,
    role: user.role,
  };
};
