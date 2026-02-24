'use client';

import { Download, FileText, ImageIcon, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useRef, useState } from 'react';

import { cn } from '@/lib/utils';

import { Button } from '../ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico'];

const isImageFile = (fileName: string): boolean => {
  const ext = fileName.toLowerCase().slice(fileName.lastIndexOf('.'));
  return IMAGE_EXTENSIONS.includes(ext);
};

type FileDownloadProps = {
  compact?: boolean;
  fileName: string;
  folder?: string;
  isRemoveButtonDisabled?: boolean;
  onFilePreview?: () => void;
  onFileRemove?: () => void;
  onFileSelect?: () => void;
  showDownloadButton?: boolean;
  url: string;
};

export const FileDownload = ({
  compact = false,
  fileName,
  folder,
  isRemoveButtonDisabled = false,
  onFilePreview,
  onFileRemove,
  onFileSelect,
  showDownloadButton = false,
  url,
}: FileDownloadProps) => {
  const t = useTranslations('file-download');

  const [previewOpen, setPreviewOpen] = useState(false);
  const previewJustClosedRef = useRef(false);

  const isImage = isImageFile(fileName);
  const canPreview = isImage;
  const isSelectable = Boolean(onFileSelect);

  const scheduleRefReset = () => {
    previewJustClosedRef.current = true;
    setTimeout(() => {
      previewJustClosedRef.current = false;
    }, 100);
  };

  const handlePreviewOpenChange = (open: boolean) => {
    if (!open) scheduleRefReset();
    setPreviewOpen(open);
  };

  const handlePreviewClick = () => {
    if (onFilePreview) {
      onFilePreview();
    } else {
      setPreviewOpen(true);
    }
  };

  const lastDot = fileName.lastIndexOf('.');
  const name = lastDot > 0 ? fileName.slice(0, lastDot) : fileName;
  const extension = lastDot > 0 ? fileName.slice(lastDot) : '';

  const handleRootClick = (e: React.MouseEvent) => {
    if (!isSelectable) return;
    if (previewJustClosedRef.current) return;
    if ((e.target as HTMLElement).closest('[data-file-action]')) return;

    onFileSelect?.();
  };

  return (
    <div
      className={cn(
        compact
          ? 'flex items-center justify-between p-2 w-full rounded border mb-1 gap-x-1.5'
          : 'flex items-center justify-between p-3 w-full rounded-md border mb-2 gap-x-2',
        isSelectable &&
          'cursor-pointer hover:bg-muted/50 hover:border-primary/50 transition-colors',
      )}
      onClick={isSelectable ? handleRootClick : undefined}
      onKeyDown={
        isSelectable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onFileSelect?.();
              }
            }
          : undefined
      }
      role={isSelectable ? 'button' : undefined}
      tabIndex={isSelectable ? 0 : undefined}
    >
      <div className="flex items-center min-w-0">
        <FileText
          className={
            compact
              ? 'h-3.5 w-3.5 mr-2 flex-shrink-0 text-red-500'
              : 'h-4 w-4 mr-3 flex-shrink-0 text-red-500'
          }
        />
        <div className="flex flex-col min-w-0">
          <p
            className={
              compact
                ? 'text-primary font-medium text-xs line-clamp-1 truncate'
                : 'text-primary font-medium text-sm line-clamp-2'
            }
          >
            {name}
          </p>
          <div className="flex flex-col text-muted-foreground text-xs">
            {folder && (
              <span className="truncate" title={folder}>
                {folder}
              </span>
            )}
            {extension && <span>{extension}</span>}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-x-1.5 flex-shrink-0" data-file-action>
        {canPreview && (
          <Button
            className={compact ? 'h-7 w-7 p-0' : undefined}
            onClick={handlePreviewClick}
            title={t('preview')}
            type="button"
            variant="outline"
          >
            <ImageIcon className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
          </Button>
        )}
        {showDownloadButton && (
          <Link href={url} target="_blank">
            <Button
              className={compact ? 'h-7 w-7 p-0' : undefined}
              title={t('download')}
              type="button"
              variant="outline"
            >
              <Download className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
            </Button>
          </Link>
        )}
        {Boolean(onFileRemove) && (
          <Button
            className={compact ? 'h-7 w-7 p-0' : undefined}
            disabled={isRemoveButtonDisabled}
            variant="outline"
            onClick={onFileRemove}
            title="Remove"
          >
            <Trash2 className={compact ? 'h-3 w-3' : 'h-4 w-4'} />
          </Button>
        )}
      </div>
      <Dialog open={previewOpen} onOpenChange={handlePreviewOpenChange}>
        <DialogContent
          className="max-w-[90vw] max-h-[90vh] overflow-auto sm:max-w-[min(600px,90vw)]"
          onPointerDownOutside={scheduleRefReset}
        >
          <DialogHeader>
            <DialogTitle>{fileName}</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            <img
              alt={fileName}
              className="max-h-[70vh] w-auto object-contain rounded-md"
              src={url}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
