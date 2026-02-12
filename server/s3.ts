import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import mime from 'mime-types';

export type S3FolderType =
  | 'ai-agent-images'
  | 'chat-files'
  | 'common'
  | 'course-attachments'
  | 'course-images'
  | 'course-videos'
  | 'csm-files'
  | 'profile-images';

export const DEFAULT_S3_FOLDER = 'common';

const s3Client = new S3Client({
  region: process.env.S3_REGION,
  endpoint: process.env.S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME as string;

const getS3FilePath = (fileName: string, folder: S3FolderType = DEFAULT_S3_FOLDER): string => {
  const folderMap: Record<S3FolderType, string> = {
    'ai-agent-images': 'Ai Agent Images',
    'chat-files': 'Chat Files',
    'course-attachments': 'Course Attachments',
    'course-images': 'Course Images',
    'course-videos': 'Course Videos',
    'csm-files': 'CSM Files',
    'profile-images': 'Profile Images',
    common: 'Common',
  };

  return `${folderMap[folder]}/${fileName}`;
};

export const uploadFileToS3 = async (
  file: Buffer,
  fileName: string,
  folder: S3FolderType = DEFAULT_S3_FOLDER,
  contentType?: string,
): Promise<{ url: string; key: string }> => {
  const key = getS3FilePath(fileName, folder);

  const mimeType = contentType || mime.lookup(fileName) || 'application/octet-stream';

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: mimeType,
    ACL: 'public-read',
  });

  await s3Client.send(command);

  const url = `${process.env.S3_PUBLIC_URL || `https://${BUCKET_NAME}.storage.yandexcloud.net`}/${key}`;

  return { url, key };
};

export const deleteFileFromS3 = async (key: string): Promise<boolean> => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('[DELETE_FILE_FROM_S3_ERROR]', error);
    return false;
  }
};

export const deleteFilesFromS3 = async (keys: string[]): Promise<boolean[]> => {
  return Promise.all(keys.map((key) => deleteFileFromS3(key)));
};

export const getS3StorageUsage = async (): Promise<{
  usedBytes: number;
  objectCount: number;
}> => {
  try {
    let usedBytes = 0;
    let objectCount = 0;
    let continuationToken: string | undefined;

    do {
      const command = new ListObjectsV2Command({
        Bucket: BUCKET_NAME,
        ContinuationToken: continuationToken,
      });

      const response = await s3Client.send(command);
      const contents = response.Contents ?? [];

      for (const obj of contents) {
        usedBytes += obj.Size ?? 0;
        objectCount += 1;
      }

      continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
    } while (continuationToken);

    return { usedBytes, objectCount };
  } catch (error) {
    console.error('[GET_S3_STORAGE_USAGE_ERROR]', error);
    return { usedBytes: 0, objectCount: 0 };
  }
};

export const extractKeyFromUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);

    return urlObj.pathname.substring(1);
  } catch (error) {
    console.error('[EXTRACT_KEY_FROM_URL_ERROR]', error);
    return null;
  }
};
