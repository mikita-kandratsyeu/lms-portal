'use server';

import { getS3StorageUsage } from '@/server/s3';

export const getS3StorageUsageAction = async () => {
  return getS3StorageUsage();
};
