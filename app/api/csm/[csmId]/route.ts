import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import db from '@/lib/db';
import { isOwner } from '@/lib/owner';

export const DELETE = async (_: NextRequest, props: { params: Promise<{ csmId: string }> }) => {
  const { csmId } = await props.params;

  try {
    const user = await getCurrentUser();

    if (!isOwner(user?.userId)) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    const deletedCsmIssue = await db.csmIssue.delete({ where: { id: csmId } });

    return NextResponse.json(deletedCsmIssue);
  } catch (error) {
    console.error('[CSM_ID_DELETE]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
