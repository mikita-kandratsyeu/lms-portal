import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';
import { getTranslations } from 'next-intl/server';

import { generateCompletion } from '@/actions/ai/generate-completion';
import { getRequestsLimit } from '@/actions/ai/get-requests-imit';
import { getCurrentUser } from '@/actions/auth/get-current-user';
import { REQUEST_STATUS } from '@/constants/ai/general';

export const maxDuration = 60;

export const POST = async (req: NextRequest) => {
  const user = await getCurrentUser();
  const t = await getTranslations('error');

  try {
    const { input, instructions, isSearch, localeInfo, model, stream } = await req.json();

    if (!user) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    const requestsLimit = await getRequestsLimit(user);

    if (requestsLimit.status === REQUEST_STATUS.FORBIDDEN) {
      return new NextResponse(requestsLimit.message, { status: StatusCodes.FORBIDDEN });
    }

    const response = await generateCompletion({
      input,
      instructions,
      isSearch,
      localeInfo,
      model,
      stream,
    });

    if (!response.completion) {
      console.error('[OPEN_AI_FORBIDDEN_MODEL]', user);

      return new NextResponse(ReasonPhrases.FORBIDDEN, {
        status: StatusCodes.FORBIDDEN,
      });
    }

    if (stream) {
      return new NextResponse(response.completion as any, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }

    return NextResponse.json({ completion: response.completion });
  } catch (error) {
    console.error('[OPEN_AI_COMPLETIONS]', error);

    return new NextResponse(t('body'), {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
