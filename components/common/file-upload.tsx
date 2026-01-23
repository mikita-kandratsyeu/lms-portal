'use client';

import { useTranslations } from 'next-intl';

import { ourFileRouter } from '@/app/api/uploadthing/core';
import { useToast } from '@/components/ui/use-toast';
import { UploadDropzone } from '@/lib/uploadthing';

type FileUploadProps = {
  endpoint: keyof typeof ourFileRouter;
  onBegin?: () => void;
  onChange: (files: { url: string; name: string }[]) => void;
};

export const FileUpload = ({ endpoint, onBegin, onChange }: FileUploadProps) => {
  const t = useTranslations('file-upload');

  const { toast } = useToast();

  return (
    <UploadDropzone
      content={{
        button({ ready, isUploading }) {
          if (isUploading) {
            return <div>{t('uploading')}</div>;
          }

          if (ready) {
            return <div>{t('upload')}</div>;
          }

          return <div>{t('upload')}</div>;
        },
        allowedContent({ fileTypes, isUploading }) {
          if (isUploading) {
            t('uploading');
          }
          return fileTypes.join(', ');
        },
        label() {
          return <div>{t('dragAndDrop')}</div>;
        },
      }}
      endpoint={endpoint}
      onUploadBegin={onBegin}
      onClientUploadComplete={(res) => {
        onChange(res?.map(({ url, name }) => ({ url, name })));
      }}
      onUploadError={(error: Error) => {
        toast({ isError: true, description: String(error?.message) });
      }}
    />
  );
};
