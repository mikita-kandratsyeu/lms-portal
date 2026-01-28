'use server';

import { deleteFilesFromS3, extractKeyFromUrl } from '@/server/s3';

export const deleteFiles = async (fileUrls: string[]) => {
  const keys = fileUrls
    .map((url) => extractKeyFromUrl(url))
    .filter((key): key is string => key !== null);

  if (keys.length === 0) {
    return { success: false };
  }

  const results = await deleteFilesFromS3(keys);
  const success = results.every((result) => result);

  return { success };
};
