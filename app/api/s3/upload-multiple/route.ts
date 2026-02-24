import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import { DEFAULT_S3_FOLDER, S3FolderType, uploadFileToS3 } from '@/server/s3';

const ANONYMOUS_ALLOWED_FOLDERS: S3FolderType[] = ['csm-files'];

export const POST = async (req: NextRequest) => {
  const user = await getCurrentUser();

  try {
    const formData = await req.formData();
    const folder = (formData.get('folder') as S3FolderType) || DEFAULT_S3_FOLDER;

    const isAnonymousAllowed = !user && ANONYMOUS_ALLOWED_FOLDERS.includes(folder);

    if (!user && !isAnonymousAllowed) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    const effectiveUserId = user?.userId ?? 'anonymous';

    const uploadedFiles: Array<{ url: string; name: string; key: string }> = [];

    for (const [key, value] of formData.entries()) {
      if (key.startsWith('file') && value instanceof File) {
        const file = value as File;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const timestamp = Date.now();
        const fileName = `${effectiveUserId}_${timestamp}_${file.name}`;

        const result = await uploadFileToS3(buffer, fileName, folder, file.type, effectiveUserId);

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
