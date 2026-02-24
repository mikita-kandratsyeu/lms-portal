'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { FileDownload } from '@/components/common/file-download';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

import { StorageEmpty } from './storage-empty';
import { StoragePagination } from './storage-pagination';

type UserS3File = {
  fileName: string;
  folder: string;
  key: string;
  url: string;
};

type StoragePageClientProps = {
  files: UserS3File[];
  pageCount: number;
  totalCount: number;
  currentPage: number;
  pageSize: number;
};

export const StoragePageClient = ({
  files,
  pageCount,
  totalCount,
  currentPage,
  pageSize,
}: StoragePageClientProps) => {
  const t = useTranslations('settings.storage');
  const router = useRouter();
  const { toast } = useToast();
  const [fileToDelete, setFileToDelete] = useState<UserS3File | null>(null);
  const [fileToPreview, setFileToPreview] = useState<UserS3File | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleRemoveClick = (file: UserS3File) => setFileToDelete(file);
  const handlePreviewClick = (file: UserS3File) => setFileToPreview(file);

  const handleConfirmRemove = async () => {
    if (!fileToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch('/api/s3/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileKeys: [fileToDelete.key] }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || 'Failed to delete');
      }

      toast({ description: t('deleted') });
      setFileToDelete(null);
      router.refresh();
    } catch (error) {
      console.error('[STORAGE_DELETE]', error);
      toast({ isError: true, description: (error as Error)?.message ?? t('deleteError') });
    } finally {
      setIsDeleting(false);
    }
  };

  if (files.length === 0) {
    return <StorageEmpty />;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t('fileCount', { count: totalCount })}</p>
      <div className="grid gap-2 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {files.map((file) => (
          <FileDownload
            key={file.key}
            fileName={file.fileName}
            folder={file.folder}
            isRemoveButtonDisabled={isDeleting}
            onFilePreview={() => handlePreviewClick(file)}
            onFileRemove={() => handleRemoveClick(file)}
            showDownloadButton
            url={file.url}
          />
        ))}
      </div>
      <StoragePagination currentPage={currentPage} pageCount={pageCount} pageSize={pageSize} />
      <AlertDialog open={!!fileToDelete} onOpenChange={(open) => !open && setFileToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmDeleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('confirmDelete')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRemove}>{t('delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <Dialog open={!!fileToPreview} onOpenChange={(open) => !open && setFileToPreview(null)}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-auto sm:max-w-[min(600px,90vw)]">
          <DialogHeader>
            <DialogTitle>{fileToPreview?.fileName ?? ''}</DialogTitle>
          </DialogHeader>
          {fileToPreview && (
            <div className="flex justify-center">
              <img
                alt={fileToPreview.fileName}
                className="max-h-[70vh] w-auto object-contain rounded-md"
                src={fileToPreview.url}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
