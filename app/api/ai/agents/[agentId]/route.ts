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

    const values = await req.json();

    const defaultModel = await db.aiModel.findFirst({ where: { isDefault: true } });

    const updatedAgent = await db.aiAgent.update({
      where: { id: agentId, userId: user.userId },
      data: {
        aiModels: {
          set: [
            ...values?.modelIds?.map((id: string) => ({
              id,
            })),
            defaultModel && { id: defaultModel.id },
          ],
        },
      },
      select: {
        id: true,
        updatedAt: true,
        name: true,
        aiModels: { select: { id: true, value: true } },
      },
    });

    return NextResponse.json(updatedAgent);
  } catch (error) {
    console.error('[AGENT_ID_PATCH]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
