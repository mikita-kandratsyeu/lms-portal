import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import db from '@/lib/db';
import { isBusinessOwner } from '@/lib/owner';

export const GET = async () => {
  try {
    const user = await getCurrentUser();

    if (!isBusinessOwner(user?.userId)) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    const descriptions = await db.stripeSubscriptionDescription.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(descriptions);
  } catch (error) {
    console.error('[STRIPE_SUBSCRIPTION_DESCRIPTION_GET]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};

export const POST = async (req: NextRequest) => {
  try {
    const user = await getCurrentUser();

    if (!isBusinessOwner(user?.userId)) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    const values = await req.json();

    const description = await db.stripeSubscriptionDescription.create({
      data: values,
    });

    return NextResponse.json(description);
  } catch (error) {
    console.error('[STRIPE_SUBSCRIPTION_DESCRIPTION_POST]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
