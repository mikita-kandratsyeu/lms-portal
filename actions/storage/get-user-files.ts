'use server';

import { listUserS3Files, type UserS3File } from '@/server/s3';

type GetUserFilesParams = {
  pageIndex?: string;
  pageSize?: string;
  userId: string;
};

export const getUserFiles = async ({
  userId,
  pageIndex = '0',
  pageSize = '10',
}: GetUserFilesParams): Promise<{
  files: UserS3File[];
  pageCount: number;
  totalCount: number;
}> => {
  const page = Math.max(0, parseInt(pageIndex, 10) || 0);
  const size = Math.min(50, Math.max(5, parseInt(pageSize, 10) || 10));

  const { files, totalCount } = await listUserS3Files(userId, page, size);
  const pageCount = Math.ceil(totalCount / size) || 1;

  return {
    files,
    pageCount,
    totalCount,
  };
};
