import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import { DEFAULT_COUNTRY_CODE } from '@/constants/locale';
import db from '@/lib/db';
import { absoluteUrl } from '@/lib/utils';
import { stripe } from '@/server/stripe';

export const POST = async (_: NextRequest, props: { params: Promise<{ userId: string }> }) => {
  const { userId } = await props.params;

  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    const existingConnectAccount = await db.stripeConnectAccount.findUnique({
      where: { userId },
    });

    let connectAccountId = existingConnectAccount?.stripeAccountId;

    if (!existingConnectAccount) {
      const connectAccount = await stripe.accounts.create({
        metadata: {
          name: user.name!,
          userId,
        },
        type: 'express',
        country: DEFAULT_COUNTRY_CODE,
        email: user.email!,
        settings: {
          payouts: {
            schedule: {
              delay_days: 2,
              interval: 'weekly',
              weekly_anchor: 'friday',
            },
          },
        },
      });

      await db.stripeConnectAccount.create({
        data: { userId, stripeAccountId: connectAccount.id },
      });

      connectAccountId = connectAccount.id;
    }

    if (!connectAccountId) {
      return new NextResponse(ReasonPhrases.BAD_REQUEST, { status: StatusCodes.BAD_REQUEST });
    }

    const connectAccountLink = await stripe.accountLinks.create({
      account: connectAccountId,
      refresh_url: absoluteUrl('/teacher/analytics'),
      return_url: absoluteUrl('/teacher/analytics'),
      type: 'account_onboarding',
    });

    return NextResponse.json(connectAccountLink);
  } catch (error) {
    console.error('[PAYMENTS_STRIPE_CREATE]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
