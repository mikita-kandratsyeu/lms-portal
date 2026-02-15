import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';
import { getTranslations } from 'next-intl/server';

import { generateCompletion } from '@/actions/ai/common/generate-completion';
import { getRequestsLimit } from '@/actions/ai/common/get-requests-imit';
import { getCurrentUser } from '@/actions/auth/get-current-user';
import { REQUEST_STATUS } from '@/constants/ai/general';
import { transformInputWithAttachedFile } from '@/lib/ai/transform-input-with-file';

export const maxDuration = 60;

export const POST = async (req: NextRequest) => {
  const user = await getCurrentUser();
  const t = await getTranslations('error');

  try {
    const {
      agentId,
      attachedFile,
      input,
      instructions,
      isSearch,
      localeInfo,
      modelId,
      stream,
      temperature,
    } = await req.json();

    if (!user) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    const requestsLimit = await getRequestsLimit(user);

    if (requestsLimit.status === REQUEST_STATUS.FORBIDDEN) {
      return new NextResponse(requestsLimit.message, { status: StatusCodes.FORBIDDEN });
    }

    const transformedInput = await transformInputWithAttachedFile(input, attachedFile);

    const response = await generateCompletion({
      agentId,
      input: transformedInput,
      instructions,
      isSearch,
      localeInfo,
      modelId,
      stream,
      temperature,
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
  } catch (error: unknown) {
    console.error('[OPEN_AI_COMPLETIONS]', error);

    const errorMessage =
      (error as { message?: string })?.message ??
      (error as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error
        ?.message ??
      t('body');

    const isRateLimit =
      (error as { status?: number })?.status === 429 ||
      String(errorMessage).toLowerCase().includes('rate limit');

    return new NextResponse(errorMessage, {
      status: isRateLimit ? StatusCodes.TOO_MANY_REQUESTS : StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
