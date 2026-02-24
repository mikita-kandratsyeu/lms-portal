'use client';

import {
  ChevronLeft,
  ChevronRight,
  CloudUpload,
  FileText,
  FolderOpen,
  Info,
  Trash2,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { useToast } from '@/components/ui/use-toast';
import { useCurrentUser } from '@/hooks/use-current-user';
import { fetcher } from '@/lib/fetcher';
import { DEFAULT_S3_FOLDER, getFolderDisplayName, S3FolderType } from '@/server/s3';

import { FileDownload } from '../common/file-download';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

const ACCEPT_TO_LABEL: Record<string, string> = {
  'application/pdf': 'PDF',
  'image/*': 'Images',
  'image/jpeg': 'JPG',
  'image/png': 'PNG',
  'image/gif': 'GIF',
};

function formatAcceptTypes(anyFileLabel: string, accept?: string): string {
  if (!accept) return anyFileLabel;
  const types = accept.split(',').map((t) => t.trim());
  const labels = types.map((t) => ACCEPT_TO_LABEL[t] ?? t.replace('/*', ''));
  return labels.filter(Boolean).join(', ') || anyFileLabel;
}

type S3FileItem = { url: string; name: string; key: string; folder: string };

type FileUploadProps = {
  accept?: string;
  folder?: S3FolderType;
  maxFiles?: number;
  maxFileSize?: number;
  onBegin?: () => void;
  onChange: (files: { url: string; name: string; key: string }[]) => void;
  showSelectFromStorage?: boolean;
};

export const FileUpload = ({
  accept,
  folder = DEFAULT_S3_FOLDER,
  maxFiles = 4,
  maxFileSize = 16,
  onBegin,
  onChange,
  showSelectFromStorage = true,
}: FileUploadProps) => {
  const t = useTranslations('file-upload');
  const { toast } = useToast();
  const { user } = useCurrentUser();

  const canSelectFromStorage = showSelectFromStorage && !!user;

  const [activeTab, setActiveTab] = useState<'upload' | 'select'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [storageFiles, setStorageFiles] = useState<S3FileItem[]>([]);
  const [storagePage, setStoragePage] = useState(0);
  const [storageTotalCount, setStorageTotalCount] = useState(0);
  const [isLoadingStorage, setIsLoadingStorage] = useState(false);

  const folderDisplayName = getFolderDisplayName(folder);
  const storagePageSize = 12;
  const storagePageCount = Math.ceil(storageTotalCount / storagePageSize) || 1;

  useEffect(() => {
    if (activeTab !== 'select' || !canSelectFromStorage) return;

    let cancelled = false;
    setIsLoadingStorage(true);

    fetcher
      .get(
        `/api/s3/files?folder=${encodeURIComponent(folder)}&pageIndex=${storagePage}&pageSize=${storagePageSize}`,
        { responseType: 'json', cache: 'no-store' },
      )
      .then((res: { files?: S3FileItem[]; totalCount?: number }) => {
        if (cancelled) return;
        if (res?.files) {
          setStorageFiles(res.files);
          setStorageTotalCount(res.totalCount ?? 0);
        }
      })
      .catch((error: Error) => {
        if (cancelled) return;
        toast({ isError: true, description: error?.message ?? t('loadStorageError') });
      })
      .finally(() => {
        if (!cancelled) setIsLoadingStorage(false);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- toast/t in catch only; including them can cause infinite re-fetches
  }, [activeTab, canSelectFromStorage, folder, storagePage]);

  const handleSelectFromStorage = (file: S3FileItem) => {
    onChange([{ url: file.url, name: file.name, key: file.key }]);
  };

  const validateFiles = (files: FileList | null): File[] => {
    if (!files || files.length === 0) return [];

    const fileArray = Array.from(files);
    const validFiles: File[] = [];

    for (const file of fileArray) {
      if (file.size > maxFileSize * 1024 * 1024) {
        toast({
          isError: true,
          description: `${file.name}: ${t('fileTooLarge')} (max ${maxFileSize}MB)`,
        });
        continue;
      }

      if (accept) {
        const acceptedTypes = accept.split(',').map((type) => type.trim());
        const fileType = file.type;
        const fileExtension = `.${file.name.split('.').pop()}`;

        const isAccepted = acceptedTypes.some(
          (type) =>
            type === fileType ||
            type === fileExtension ||
            (type.endsWith('/*') && fileType.startsWith(type.replace('/*', ''))),
        );

        if (!isAccepted) {
          toast({
            isError: true,
            description: `${file.name}: ${t('invalidFileType')}`,
          });
          continue;
        }
      }

      validFiles.push(file);
    }

    if (validFiles.length > maxFiles) {
      toast({
        isError: true,
        description: `${t('tooManyFiles')} (max ${maxFiles})`,
      });
      return validFiles.slice(0, maxFiles);
    }

    return validFiles;
  };

  const handleFileSelect = (files: FileList | null) => {
    const validFiles = validateFiles(files);
    if (validFiles.length > 0) {
      setSelectedFiles(validFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    onBegin?.();

    try {
      const formData = new FormData();
      formData.append('folder', folder);

      selectedFiles.forEach((file, index) => {
        formData.append(`file${index}`, file);
      });

      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      const response = await fetcher.post('/api/s3/upload-multiple', {
        body: formData as any,
        responseType: 'json',
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response?.files) {
        onChange(response.files);
        setSelectedFiles([]);
        toast({
          description: t('uploadSuccess'),
        });
      }
    } catch (error) {
      toast({
        isError: true,
        description: (error as Error)?.message ?? t('uploadError'),
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const uploadContent = (
    <>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative flex flex-col items-center justify-center w-full min-h-[240px] sm:min-h-[280px]
          border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200
          ${
            isDragging
              ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/20 scale-[1.02]'
              : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-950/10'
          }
        `}
      >
        <input
          type="file"
          onChange={(e) => handleFileSelect(e.target.files)}
          accept={accept}
          multiple={maxFiles > 1}
          disabled={isUploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center gap-3 sm:gap-4 pointer-events-none px-4">
          <div
            className={`p-3 sm:p-4 rounded-full transition-all duration-200 ${isDragging ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}
          >
            <CloudUpload
              className={`w-8 h-8 sm:w-10 sm:h-10 transition-colors duration-200 ${isDragging ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}
            />
          </div>
          <div className="text-center">
            <p className="text-sm sm:text-base font-semibold text-gray-700 dark:text-gray-300">
              {t('uploadFile')}
            </p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1.5 sm:mt-2">
              {t('clickToSelect')}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2 sm:mt-3">
              {formatAcceptTypes(t('anyFileType'), accept)}
            </p>
          </div>
        </div>
      </div>
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('selectedFiles')}: {selectedFiles.length}
          </p>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {selectedFiles.map((file, index) => {
              const [name, ...extensionParts] = file.name.split('.');
              const extension = extensionParts.join('.');
              const fileSize = (file.size / 1024 / 1024).toFixed(2);

              return (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 w-full rounded-md border gap-x-2"
                >
                  <div className="flex items-center flex-1 min-w-0">
                    <FileText className="h-4 w-4 mr-3 flex-shrink-0 text-red-500" />
                    <div className="flex flex-col flex-1 min-w-0">
                      <p className="text-primary font-medium text-sm line-clamp-2 break-all">
                        {name}
                      </p>
                      <div className="flex items-center gap-x-2">
                        <p className="text-muted-foreground text-xs">{`.${extension}`}</p>
                        <span className="text-muted-foreground text-xs">({fileSize} MB)</span>
                      </div>
                    </div>
                  </div>
                  {!isUploading && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeFile(index)}
                      title={t('remove')}
                      className="flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {isUploading && (
        <div className="space-y-2">
          <Progress value={uploadProgress} />
          <p className="text-sm text-center text-gray-600 dark:text-gray-400">
            {t('uploading')} {uploadProgress}%
          </p>
        </div>
      )}
      {selectedFiles.length > 0 && !isUploading && (
        <Button onClick={handleUpload} disabled={isUploading} className="w-full">
          {t('upload')}
        </Button>
      )}
    </>
  );

  const selectContent = (
    <div className="space-y-3">
      <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border">
        <FolderOpen className="h-4 w-4 text-muted-foreground" />
        <p className="text-sm font-medium">
          {t('folderLabel')}: <span className="text-primary">{folderDisplayName}</span>
        </p>
      </div>
      {isLoadingStorage ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <p className="text-sm text-muted-foreground">{t('loadingStorage')}</p>
        </div>
      ) : storageFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[200px] text-center p-4">
          <FolderOpen className="h-12 w-12 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">{t('noFilesInFolder')}</p>
          <p className="text-xs text-muted-foreground mt-1">{t('uploadFirst')}</p>
        </div>
      ) : (
        <>
          <div className="space-y-2 max-h-[280px] overflow-y-auto">
            {storageFiles.map((file) => (
              <FileDownload
                key={file.key}
                fileName={file.name}
                folder={file.folder}
                onFileSelect={() => handleSelectFromStorage(file)}
                showDownloadButton
                url={file.url}
              />
            ))}
          </div>
          {storagePageCount > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={storagePage <= 0}
                onClick={() => setStoragePage((p) => Math.max(0, p - 1))}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                {storagePage + 1} / {storagePageCount}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={storagePage >= storagePageCount - 1}
                onClick={() => setStoragePage((p) => Math.min(storagePageCount - 1, p + 1))}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );

  return (
    <div className="w-full space-y-4">
      {canSelectFromStorage ? (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'upload' | 'select')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload">{t('tabUpload')}</TabsTrigger>
            <TabsTrigger value="select">{t('tabSelect')}</TabsTrigger>
          </TabsList>
          <TabsContent value="upload" className="mt-4 space-y-4">
            {uploadContent}
          </TabsContent>
          <TabsContent value="select" className="mt-4">
            {selectContent}
          </TabsContent>
        </Tabs>
      ) : (
        uploadContent
      )}
      <div className="flex gap-x-2 items-center justify-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <p className="text-xs text-blue-700 dark:text-blue-300">
          {t('footer', {
            maxFiles,
            maxSize: maxFileSize,
            types: formatAcceptTypes(t('anyFileType'), accept),
          })}
        </p>
      </div>
    </div>
  );
};
