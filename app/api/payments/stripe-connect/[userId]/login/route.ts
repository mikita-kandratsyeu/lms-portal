import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import db from '@/lib/db';
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

    const connectAccountId = existingConnectAccount?.stripeAccountId;

    if (!connectAccountId) {
      return new NextResponse(ReasonPhrases.BAD_REQUEST, { status: StatusCodes.BAD_REQUEST });
    }

    const connectAccountLogin = await stripe.accounts.createLoginLink(connectAccountId);

    return NextResponse.json(connectAccountLogin);
  } catch (error) {
    console.error('[PAYMENTS_STRIPE_ACCOUNT]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
