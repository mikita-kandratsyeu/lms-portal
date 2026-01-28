'use server';

import { base64ToBlob } from '@/lib/utils';
import { S3FolderType, uploadFileToS3 } from '@/server/s3';

export const uploadFiles = async (
  files: { name: string; contentType: string; base64: string; folder?: S3FolderType }[],
) => {
  const uploadPromises = files.map(async ({ name, contentType, base64, folder }) => {
    try {
      const blob = base64ToBlob(base64, contentType);
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const result = await uploadFileToS3(buffer, name, folder || 'common', contentType);

      return {
        data: {
          url: result.url,
          key: result.key,
          name,
        },
        error: null,
      };
    } catch (error) {
      console.error('[UPLOAD_FILE_ERROR]', error);
      return {
        data: null,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  });

  const response = await Promise.all(uploadPromises);

  return response;
};
