import {
  CopyObjectCommand,
  DeleteObjectCommand,
  ListObjectVersionsCommand,
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

export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME as string;

export const FOLDER_MAP: Record<S3FolderType, string> = {
  'ai-agent-images': 'AI Agent Images',
  'chat-files': 'Chat Files',
  'course-attachments': 'Course Attachments',
  'course-images': 'Course Images',
  'course-videos': 'Course Videos',
  'csm-files': 'CSM Files',
  'profile-images': 'Profile Images',
  common: 'Common',
};

export const getFolderDisplayName = (folder: S3FolderType): string => FOLDER_MAP[folder] ?? folder;

const getS3FilePath = (
  fileName: string,
  folder: S3FolderType = DEFAULT_S3_FOLDER,
  userId: string,
): string => {
  return `${userId}/${FOLDER_MAP[folder]}/${fileName}`;
};

export const uploadFileToS3 = async (
  file: Buffer,
  fileName: string,
  folder: S3FolderType = DEFAULT_S3_FOLDER,
  contentType?: string,
  userId?: string,
): Promise<{ url: string; key: string }> => {
  const effectiveUserId = userId ?? 'legacy';
  const key = getS3FilePath(fileName, folder, effectiveUserId);

  const mimeType = contentType || mime.lookup(fileName) || 'application/octet-stream';

  const command = new PutObjectCommand({
    Bucket: S3_BUCKET_NAME,
    Key: key,
    Body: file,
    ContentType: mimeType,
    ACL: 'public-read',
  });

  await s3Client.send(command);

  const baseUrl = process.env.S3_PUBLIC_URL || `https://${S3_BUCKET_NAME}.storage.yandexcloud.net`;
  const encodedKey = key.split('/').map(encodeURIComponent).join('/');
  const url = `${baseUrl}/${encodedKey}`;

  return { url, key };
};

export const deleteFileFromS3 = async (key: string): Promise<boolean> => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: S3_BUCKET_NAME,
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
    let keyMarker: string | undefined;
    let versionIdMarker: string | undefined;
    let isTruncated = false;

    do {
      const command = new ListObjectVersionsCommand({
        Bucket: S3_BUCKET_NAME,
        KeyMarker: keyMarker,
        VersionIdMarker: versionIdMarker,
      });

      const response = await s3Client.send(command);
      const versions = response.Versions ?? [];

      for (const version of versions) {
        usedBytes += version.Size ?? 0;
        objectCount += 1;
      }

      keyMarker = response.NextKeyMarker;
      versionIdMarker = response.NextVersionIdMarker;
      isTruncated = response.IsTruncated ?? false;
    } while (isTruncated);

    return { usedBytes, objectCount };
  } catch (error) {
    console.warn('[GET_S3_STORAGE_USAGE] ListObjectVersions not supported, falling back to ListObjectsV2', error);

    try {
      let usedBytes = 0;
      let objectCount = 0;
      let continuationToken: string | undefined;

      do {
        const command = new ListObjectsV2Command({
          Bucket: S3_BUCKET_NAME,
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
    } catch (fallbackError) {
      console.error('[GET_S3_STORAGE_USAGE_ERROR]', fallbackError);
      return { usedBytes: 0, objectCount: 0 };
    }
  }
};

export const copyObjectInS3 = async (
  sourceKey: string,
  destinationKey: string,
): Promise<boolean> => {
  try {
    const copySource = `${S3_BUCKET_NAME}/${sourceKey.split('/').map(encodeURIComponent).join('/')}`;

    const command = new CopyObjectCommand({
      Bucket: S3_BUCKET_NAME,
      CopySource: copySource,
      Key: destinationKey,
      ACL: 'public-read',
    });

    await s3Client.send(command);

    return true;
  } catch (error) {
    console.error('[COPY_OBJECT_IN_S3_ERROR]', error);

    return false;
  }
};

export type UserS3File = {
  fileName: string;
  folder: string;
  key: string;
  url: string;
};

export const listUserS3Files = async (
  userId: string,
  pageIndex: number,
  pageSize: number,
): Promise<{ files: UserS3File[]; totalCount: number }> => {
  const prefix = `${userId}/`;
  const keys: string[] = [];
  let continuationToken: string | undefined;

  do {
    const command = new ListObjectsV2Command({
      Bucket: S3_BUCKET_NAME,
      Prefix: prefix,
      MaxKeys: 1000,
      ContinuationToken: continuationToken,
    });

    const response = await s3Client.send(command);
    const contents = response.Contents ?? [];

    for (const obj of contents) {
      if (obj.Key) keys.push(obj.Key);
    }

    continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
  } while (continuationToken);

  const totalCount = keys.length;
  const start = pageIndex * pageSize;
  const paginatedKeys = keys.slice(start, start + pageSize);

  const baseUrl = process.env.S3_PUBLIC_URL || `https://${S3_BUCKET_NAME}.storage.yandexcloud.net`;

  const files: UserS3File[] = paginatedKeys.map((key) => {
    const parts = key.split('/');
    const fileName = parts.pop() ?? key;
    const folder = parts.length >= 2 ? parts[parts.length - 1] : '';
    const encodedKey = key.split('/').map(encodeURIComponent).join('/');

    return {
      fileName,
      folder,
      key,
      url: `${baseUrl}/${encodedKey}`,
    };
  });

  return { files, totalCount };
};

export const listUserS3FilesByFolder = async (
  userId: string,
  folder: S3FolderType,
  pageIndex: number,
  pageSize: number,
): Promise<{ files: UserS3File[]; totalCount: number }> => {
  const folderName = FOLDER_MAP[folder];
  const prefix = `${userId}/${folderName}/`;
  const keys: string[] = [];
  let continuationToken: string | undefined;

  do {
    const command = new ListObjectsV2Command({
      Bucket: S3_BUCKET_NAME,
      Prefix: prefix,
      MaxKeys: 1000,
      ContinuationToken: continuationToken,
    });

    const response = await s3Client.send(command);
    const contents = response.Contents ?? [];

    for (const obj of contents) {
      if (obj.Key) keys.push(obj.Key);
    }

    continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
  } while (continuationToken);

  const totalCount = keys.length;
  const start = pageIndex * pageSize;
  const paginatedKeys = keys.slice(start, start + pageSize);

  const baseUrl = process.env.S3_PUBLIC_URL || `https://${S3_BUCKET_NAME}.storage.yandexcloud.net`;

  const files: UserS3File[] = paginatedKeys.map((key) => {
    const parts = key.split('/');
    const fileName = parts.pop() ?? key;
    const encodedKey = key.split('/').map(encodeURIComponent).join('/');

    return {
      fileName,
      folder: folderName,
      key,
      url: `${baseUrl}/${encodedKey}`,
    };
  });

  return { files, totalCount };
};

export const listAllS3Keys = async (): Promise<string[]> => {
  const keys: string[] = [];
  let continuationToken: string | undefined;

  do {
    const command = new ListObjectsV2Command({
      Bucket: S3_BUCKET_NAME,
      ContinuationToken: continuationToken,
    });

    const response = await s3Client.send(command);
    const contents = response.Contents ?? [];

    for (const obj of contents) {
      if (obj.Key) keys.push(obj.Key);
    }

    continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;
  } while (continuationToken);

  return keys;
};

export const isLegacyS3Key = (key: string): boolean => {
  const folderNames = Object.values(FOLDER_MAP);
  const firstPart = key.split('/')[0];

  return folderNames.includes(firstPart);
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
