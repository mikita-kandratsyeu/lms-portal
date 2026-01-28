import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import { S3FolderType, uploadFileToS3 } from '@/server/s3';

export const POST = async (req: NextRequest) => {
  const user = await getCurrentUser();

  try {
    if (!user) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as S3FolderType) || 'common';
    const name = formData.get('name') as string;

    let pictureUrl = null;
    let fileKey = null;

    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const result = await uploadFileToS3(buffer, name, folder, file.type);

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
