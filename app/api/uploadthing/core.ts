import { ReasonPhrases } from 'http-status-codes';
import { createUploadthing, type FileRouter } from 'uploadthing/next';
import { UploadThingError } from 'uploadthing/server';

import { getCurrentUser } from '@/actions/auth/get-current-user';

const f = createUploadthing();

const handleAuth = async () => {
  const user = await getCurrentUser();

  if (!user) {
    throw new UploadThingError(ReasonPhrases.UNAUTHORIZED);
  }

  return { userId: user.userId };
};

export const ourFileRouter = {
  courseImage: f({ image: { maxFileSize: '8MB', maxFileCount: 1 } })
    .middleware(() => handleAuth())
    .onUploadComplete(() => {}),
  courseAttachments: f({
    pdf: {
      maxFileSize: '16MB',
      maxFileCount: 4,
    },
    image: {
      maxFileSize: '4MB',
      maxFileCount: 4,
    },
    text: {
      maxFileSize: '4MB',
      maxFileCount: 4,
    },
    'application/zip': {
      maxFileSize: '128MB',
      maxFileCount: 4,
    },
  })
    .middleware(() => handleAuth())
    .onUploadComplete(() => {}),
  chapterVideo: f({ video: { maxFileSize: '2GB', maxFileCount: 1 } })
    .middleware(() => handleAuth())
    .onUploadComplete(() => {}),
  csmAttachments: f({
    pdf: {
      maxFileSize: '16MB',
      maxFileCount: 4,
    },
    image: {
      maxFileSize: '4MB',
      maxFileCount: 4,
    },
    video: { maxFileSize: '512MB', maxFileCount: 1 },
  }).onUploadComplete(() => {}),
  chatAttachments: f({
    pdf: {
      maxFileSize: '8MB',
      maxFileCount: 1,
    },
    image: {
      maxFileSize: '8MB',
      maxFileCount: 1,
    },
  }).onUploadComplete(() => {}),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
