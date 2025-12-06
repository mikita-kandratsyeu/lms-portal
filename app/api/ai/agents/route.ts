import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import { DEFAULT_TEMPERATURE, LIMIT_CONNECTED_AI_AGENTS } from '@/constants/ai/general';
import db from '@/lib/db';

export const POST = async (req: NextRequest) => {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    const ownAgentsAmount = !user.hasSubscription
      ? await db.aiAgent.count({ where: { userId: user.userId } })
      : -1;

    if (ownAgentsAmount >= LIMIT_CONNECTED_AI_AGENTS) {
      return new NextResponse('The maximum number of agents created has been reached.', {
        status: StatusCodes.FORBIDDEN,
      });
    }

    const { name } = await req.json();
    const defaultModel = await db.aiModel.findFirst({ where: { isDefault: true } });

    if (defaultModel) {
      const agent = await db.aiAgent.create({
        data: {
          userId: user.userId,
          aiModels: {
            connect: [{ id: defaultModel.id }],
          },
          isDraft: true,
          name,
          temperature: DEFAULT_TEMPERATURE,
        },
      });

      return NextResponse.json(agent);
    }

    return new NextResponse(ReasonPhrases.BAD_REQUEST, { status: StatusCodes.BAD_REQUEST });
  } catch (error) {
    console.error('[POST_CREATE_AI_AGENT]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
