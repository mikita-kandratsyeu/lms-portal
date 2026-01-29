import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import db from '@/lib/db';
import { isBusinessOwner } from '@/lib/owner';

export const PATCH = async (req: NextRequest, props: { params: Promise<{ id: string }> }) => {
  const { id } = await props.params;

  try {
    const user = await getCurrentUser();

    if (!isBusinessOwner(user?.userId)) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    const values = await req.json();

    const description = await db.stripeSubscriptionDescription.update({
      where: { id },
      data: values,
    });

    return NextResponse.json(description);
  } catch (error) {
    console.error('[STRIPE_SUBSCRIPTION_DESCRIPTION_PATCH]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};

export const DELETE = async (_: NextRequest, props: { params: Promise<{ id: string }> }) => {
  const { id } = await props.params;

  try {
    const user = await getCurrentUser();

    if (!isBusinessOwner(user?.userId)) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    const description = await db.stripeSubscriptionDescription.delete({
      where: { id },
    });

    return NextResponse.json(description);
  } catch (error) {
    console.error('[STRIPE_SUBSCRIPTION_DESCRIPTION_DELETE]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
