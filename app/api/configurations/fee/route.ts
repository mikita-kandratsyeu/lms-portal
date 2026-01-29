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

    const fees = await db.fee.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(fees);
  } catch (error) {
    console.error('[FEE_GET]', error);

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

    const fee = await db.fee.create({
      data: values,
    });

    return NextResponse.json(fee);
  } catch (error) {
    console.error('[FEE_POST]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
