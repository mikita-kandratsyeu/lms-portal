import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import { AGENT_ACTION, LIMIT_CONNECTED_AI_AGENTS } from '@/constants/ai/general';
import db from '@/lib/db';

export const POST = async (req: NextRequest, props: { params: Promise<{ agentId: string }> }) => {
  try {
    const { agentId } = await props.params;
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    const { action } = await req.json();

    if (action === AGENT_ACTION.CONNECT) {
      const connectionsAmount = await db.aiAgentConnection.count({
        where: { userId: user.userId },
      });

      if (connectionsAmount >= LIMIT_CONNECTED_AI_AGENTS) {
        return new NextResponse('The maximum number of connected agents has been reached.', {
          status: StatusCodes.FORBIDDEN,
        });
      }

      const connectedAgent = await db.aiAgentConnection.create({
        data: {
          userId: user.userId,
          aiAgentId: agentId,
        },
        select: {
          aiAgentId: true,
        },
      });

      return NextResponse.json(connectedAgent);
    }

    if (action === AGENT_ACTION.DISCONNECT) {
      const disconnectedAgent = await db.aiAgentConnection.delete({
        where: {
          userId_aiAgentId: { userId: user.userId, aiAgentId: agentId },
        },
        select: {
          aiAgentId: true,
        },
      });

      return NextResponse.json(disconnectedAgent);
    }

    return new NextResponse(ReasonPhrases.BAD_REQUEST, { status: StatusCodes.BAD_REQUEST });
  } catch (error) {
    console.error('[POST_CONNECTION_AI_AGENT]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
