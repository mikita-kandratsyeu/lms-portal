'use client';

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
  filterStorageByAccept?: boolean;
  folder?: S3FolderType;
  maxFiles?: number;
  maxFileSize?: number;
  onBegin?: () => void;
  onChange: (files: { url: string; name: string; key: string }[]) => void;
  showSelectFromStorage?: boolean;
};

export const FileUploadModal = ({
  accept,
  children,
  filterStorageByAccept = true,
  folder = DEFAULT_S3_FOLDER,
  maxFiles,
  maxFileSize,
  onBegin,
  onChange,
  showSelectFromStorage = true,
}: FileUploadModalProps) => {
  const t = useTranslations('file-upload-modal');
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="fixed inset-x-0 bottom-0 top-0 w-full max-w-full translate-x-0 translate-y-0 sm:left-[50%] sm:right-auto sm:top-[50%] sm:bottom-auto sm:max-w-[525px] sm:max-h-[625px] sm:translate-x-[-50%] sm:translate-y-[-50%] overflow-auto sm:h-auto h-full flex flex-col justify-start pt-6 rounded-none sm:rounded-lg">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
        </DialogHeader>
        <div className="w-full flex flex-col gap-y-2 my-4">
          <FileUpload
            accept={accept}
            filterStorageByAccept={filterStorageByAccept}
            folder={folder}
            maxFiles={maxFiles}
            maxFileSize={maxFileSize}
            onChange={(args) => {
              onChange(args);
              setOpen(false);
            }}
            onBegin={onBegin}
            showSelectFromStorage={showSelectFromStorage}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
