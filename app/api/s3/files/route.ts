import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { NextRequest, NextResponse } from 'next/server';

import { getCurrentUser } from '@/actions/auth/get-current-user';
import { DEFAULT_S3_FOLDER, listUserS3FilesByFolder, S3FolderType } from '@/server/s3';

export const GET = async (req: NextRequest) => {
  const user = await getCurrentUser();

  if (!user) {
    return new NextResponse(ReasonPhrases.UNAUTHORIZED, { status: StatusCodes.UNAUTHORIZED });
  }

  try {
    const { searchParams } = new URL(req.url);
    const folder = (searchParams.get('folder') as S3FolderType) || DEFAULT_S3_FOLDER;
    const pageIndex = Math.max(0, parseInt(searchParams.get('pageIndex') ?? '0', 10));
    const pageSize = Math.min(50, Math.max(5, parseInt(searchParams.get('pageSize') ?? '20', 10)));

    const { files, totalCount } = await listUserS3FilesByFolder(
      user.userId,
      folder,
      pageIndex,
      pageSize,
    );

    return NextResponse.json({
      files: files.map((f) => ({ url: f.url, name: f.fileName, key: f.key, folder: f.folder })),
      totalCount,
      pageCount: Math.ceil(totalCount / pageSize) || 1,
    });
  } catch (error) {
    console.error('[GET_S3_FILES]', error);
    return new NextResponse(ReasonPhrases.INTERNAL_SERVER_ERROR, {
      status: StatusCodes.INTERNAL_SERVER_ERROR,
    });
  }
};
