import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import { uploadFiles } from '@/actions/uploadthing/upload-files';

export const POST = async (req: NextRequest) => {
  const user = await getCurrentUser();

  try {
    if (!user) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    const { contentType, name, base64 } = await req.json();

    let pictureUrl = null;

    if (base64) {
      const files = await uploadFiles([
        {
          base64,
          contentType,
          name,
        },
      ]);

      pictureUrl = files[0].data?.ufsUrl;
    }

    return NextResponse.json({ pictureUrl, name });
  } catch (error) {
    console.error('[POST_FILE_UPLOAD]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
