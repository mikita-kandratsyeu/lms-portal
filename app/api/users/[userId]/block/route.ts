import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import { blockUser, unblockUser } from '@/actions/users/block-user';
import { isBusinessOwner } from '@/lib/owner';

type RequestProps = { params: Promise<{ userId: string }> };

export const PATCH = async (req: NextRequest, props: RequestProps) => {
  const { userId } = await props.params;

  const currentUser = await getCurrentUser();

  try {
    if (!currentUser || !isBusinessOwner(currentUser.userId)) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    const { action, reason, blockedUntil } = await req.json();

    if (action === 'block') {
      if (!reason) {
        return new NextResponse(ReasonPhrases.BAD_REQUEST, { status: StatusCodes.BAD_REQUEST });
      }

      await blockUser({
        userId,
        reason,
        blockedUntil: blockedUntil ? new Date(blockedUntil) : null,
      });

      return NextResponse.json({ success: true });
    }

    if (action === 'unblock') {
      await unblockUser(userId);

      return NextResponse.json({ success: true });
    }

    return new NextResponse(ReasonPhrases.BAD_REQUEST, { status: StatusCodes.BAD_REQUEST });
  } catch (error) {
    console.error('[PATCH_USER_BLOCK]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
