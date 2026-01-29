'use client';

import { Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React, { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { DEFAULT_S3_FOLDER, S3FolderType } from '@/server/s3';

import { FileUpload } from '../common/file-upload';

type FileUploadModalProps = {
  accept?: string;
  children: React.ReactNode;
  folder?: S3FolderType;
  maxFiles?: number;
  maxFileSize?: number;
  onBegin?: () => void;
  onChange: (files: { url: string; name: string; key: string }[]) => void;
};

export const FileUploadModal = ({
  accept,
  children,
  folder = DEFAULT_S3_FOLDER,
  maxFiles,
  maxFileSize,
  onBegin,
  onChange,
}: FileUploadModalProps) => {
  const t = useTranslations('file-upload-modal');

  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[525px] sm:max-h-[625px] overflow-auto max-w-max sm:h-auto h-full sm:w-auto w-full flex flex-col justify-start pt-6">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>
        <div className="w-full flex flex-col gap-y-2 my-4">
          <FileUpload
            accept={accept}
            folder={folder}
            maxFiles={maxFiles}
            maxFileSize={maxFileSize}
            onChange={(args) => {
              onChange(args);
              setOpen(false);
            }}
            onBegin={onBegin}
          />
        </div>
        <div className="flex gap-x-2 items-center justify-center">
          <Info className="w-4 h-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{t('footer')}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
