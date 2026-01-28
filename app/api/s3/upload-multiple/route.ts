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
    const folder = (formData.get('folder') as S3FolderType) || 'common';

    const uploadedFiles: Array<{ url: string; name: string; key: string }> = [];

    for (const [key, value] of formData.entries()) {
      if (key.startsWith('file') && value instanceof File) {
        const file = value as File;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const timestamp = Date.now();
        const fileName = `${user.userId}_${timestamp}_${file.name}`;

        const result = await uploadFileToS3(buffer, fileName, folder, file.type);

        uploadedFiles.push({
          url: result.url,
          name: file.name,
          key: result.key,
        });
      }
    }

    if (uploadedFiles.length === 0) {
      return new NextResponse('No files uploaded', { status: StatusCodes.BAD_REQUEST });
    }

    return NextResponse.json({ files: uploadedFiles });
  } catch (error) {
    console.error('[POST_MULTIPLE_FILE_UPLOAD]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
