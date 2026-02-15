import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';
import { getTranslations } from 'next-intl/server';
import { v4 as uuidv4 } from 'uuid';

import { generateImage } from '@/actions/ai/common/generate-image';
import { getRequestsLimit } from '@/actions/ai/common/get-requests-imit';
import { getCurrentUser } from '@/actions/auth/get-current-user';
import { uploadFiles } from '@/actions/s3/upload-files';
import { REQUEST_STATUS } from '@/constants/ai/general';

export const maxDuration = 60;

export const POST = async (req: NextRequest) => {
  const user = await getCurrentUser();
  const t = await getTranslations('error');

  try {
    const { agentId, modelId, prompt } = await req.json();

    if (!user) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    const referer = req.headers.get('referer') ?? req.headers.get('referrer');
    const requestsLimit = await getRequestsLimit(user, referer);

    if (requestsLimit.status === REQUEST_STATUS.FORBIDDEN) {
      return new NextResponse(requestsLimit.message, { status: StatusCodes.FORBIDDEN });
    }

    const response = await generateImage({
      agentId,
      modelId,
      n: 1,
      prompt,
      quality: 'hd',
      response_format: 'b64_json',
      size: '1024x1024',
    });

    if (!response.image) {
      console.error('[OPEN_AI_FORBIDDEN_IMAGE_MODEL]', user);

      return new NextResponse(ReasonPhrases.FORBIDDEN, {
        status: StatusCodes.FORBIDDEN,
      });
    }

    const files = await uploadFiles([
      {
        name: `${uuidv4()}.png`,
        base64: response.image.data[0].b64_json ?? '',
        contentType: 'image/png',
        folder: 'chat-files',
      },
    ]);

    return NextResponse.json({
      revisedPrompt: response.image.data[0].revised_prompt,
      url: files[0].data?.url,
    });
  } catch (error) {
    console.error('[OPEN_AI_IMAGE]', error);

    return new NextResponse(t('body'), {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
