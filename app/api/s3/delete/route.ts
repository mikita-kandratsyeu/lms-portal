import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import { deleteFilesFromS3, extractKeyFromUrl } from '@/server/s3';

export const POST = async (req: NextRequest) => {
  const user = await getCurrentUser();

  try {
    if (!user) {
      return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
    }

    const { fileUrls, fileKeys } = await req.json();

    let keys: string[] = [];

    if (fileKeys && Array.isArray(fileKeys) && fileKeys.length > 0) {
      keys = fileKeys.filter((k: unknown): k is string => typeof k === 'string' && k.length > 0);
    } else if (fileUrls && Array.isArray(fileUrls) && fileUrls.length > 0) {
      keys = fileUrls
        .map((url: string) => extractKeyFromUrl(url))
        .filter((key): key is string => key !== null);
    }

    if (keys.length === 0) {
      return new NextResponse('Invalid file URLs or keys', { status: StatusCodes.BAD_REQUEST });
    }

    const userPrefix = `${user.userId}/`;
    const forbiddenKeys = keys.filter(
      (key) => key.includes('/') && /^[a-f0-9-]{36}\//i.test(key) && !key.startsWith(userPrefix),
    );

    if (forbiddenKeys.length > 0) {
      return new NextResponse('Some files do not belong to the user', {
        status: StatusCodes.FORBIDDEN,
      });
    }

    const results = await deleteFilesFromS3(keys);

    return NextResponse.json({
      success: results.every((result) => result),
      deleted: results.filter((result) => result).length,
      failed: results.filter((result) => !result).length,
    });
  } catch (error) {
    console.error('[POST_FILE_DELETE]', error);

    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
