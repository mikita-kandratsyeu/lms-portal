import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import db from '@/lib/db';
import { isBusinessOwner } from '@/lib/owner';

export const PATCH = async (req: NextRequest, props: { params: Promise<{ agentId: string }> }) => {
  const { agentId } = await props.params;

  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    if (!user.hasSubscription || !isBusinessOwner(user.userId)) {
      return new NextResponse(ReasonPhrases.FORBIDDEN, { status: StatusCodes.FORBIDDEN });
    }

    const agent = await db.aiAgent.findUnique({
      where: { id: agentId, userId: user.userId },
      include: { aiModels: true },
    });

    if (!agent) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    if (!agent.description || !agent.name || !agent.aiModels.length) {
      return new NextResponse('errors.missingRequiredFields', {
        status: StatusCodes.BAD_REQUEST,
      });
    }

    const { isPublic } = await req.json();

    const publishedAgent = await db.aiAgent.update({
      where: { id: agentId, userId: user.userId },
      data: { isDraft: false, isPublic },
      select: { id: true, isPublic: true, isDraft: true },
    });

    return NextResponse.json(publishedAgent);
  } catch (error) {
    console.error('[PUBLISH_AGENT_ID]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
