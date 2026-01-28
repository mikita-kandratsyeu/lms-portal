import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import { base64ToBlob } from '@/lib/utils';
import { S3FolderType, uploadFileToS3 } from '@/server/s3';

export const POST = async (req: NextRequest) => {
  const user = await getCurrentUser();

  try {
    if (!user) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    const { contentType, name, base64, folder } = await req.json();

    let pictureUrl = null;
    let fileKey = null;

    if (base64) {
      const blob = base64ToBlob(base64, contentType);
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const result = await uploadFileToS3(
        buffer,
        name,
        (folder as S3FolderType) || 'common',
        contentType,
      );

      pictureUrl = result.url;
      fileKey = result.key;
    }

    return NextResponse.json({ pictureUrl, name, fileKey });
  } catch (error) {
    console.error('[POST_FILE_UPLOAD]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
