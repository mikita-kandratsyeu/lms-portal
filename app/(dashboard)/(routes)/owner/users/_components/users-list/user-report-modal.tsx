'use client';

import { Download, FileText, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

import { TextBadge } from '@/components/common/text-badge';
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/use-toast';
import { fetcher } from '@/lib/fetcher';

type UserReportModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  userId: string;
  userName?: string | null;
  userEmail?: string | null;
  userRole?: string | null;
  isPremium?: boolean;
};

export const UserReportModal = ({
  open,
  setOpen,
  userId,
  userName,
  userEmail,
  userRole,
  isPremium,
}: UserReportModalProps) => {
  const t = useTranslations('owner.users.reportModal');
  const tRole = useTranslations('profileButton');
  const tTable = useTranslations('owner.users.table');
  const { toast } = useToast();

  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfFilename, setPdfFilename] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!open || !userId) return;

    let cancelled = false;

    const fetchReport = async () => {
      setIsLoading(true);
      setPdfBlob(null);
      setPdfFilename(null);
      setPreviewUrl(null);

      try {
        const response = await fetcher.get(`/api/users/${userId}/report`, {
          cache: 'no-store',
        });

        const contentDisposition = response.headers.get('Content-Disposition');
        const filenameMatch = contentDisposition?.match(/filename="?([^"]+)"?/);
        const filename = filenameMatch?.[1] ?? `user_${userId}_report.pdf`;

        const blob = await response.blob();

        if (cancelled) return;

        setPdfBlob(blob);
        setPdfFilename(filename);
        setPreviewUrl(URL.createObjectURL(blob));
      } catch (error) {
        if (cancelled) return;

        toast({
          isError: true,
          description: (error as Error)?.message ?? t('errors.fetchFailed'),
        });
        setOpen(false);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    fetchReport();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, userId]);

  useEffect(() => {
    document.body.style.removeProperty('pointer-events');
  }, [open]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleDownload = useCallback(() => {
    if (!pdfBlob || !pdfFilename) return;

    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = pdfFilename;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }, [pdfBlob, pdfFilename]);

  const handleSendByEmail = useCallback(async () => {
    if (!userId) return;

    setIsSending(true);

    try {
      await fetcher.post(`/api/users/${userId}/report/send`, {
        headers: { 'Content-Type': 'application/json' },
      });

      toast({ description: t('sendSuccess') });
    } catch (error) {
      toast({
        isError: true,
        description: (error as Error)?.message ?? t('errors.sendFailed'),
      });
    } finally {
      setIsSending(false);
    }
  }, [userId, t, toast]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen && previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      setOpen(nextOpen);
    },
    [previewUrl, setOpen],
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="fixed inset-x-0 bottom-0 top-0 w-full max-w-full translate-x-0 translate-y-0 gap-0 p-0 sm:left-[50%] sm:right-auto sm:top-[50%] sm:bottom-auto sm:max-w-4xl sm:max-h-[90dvh] sm:translate-x-[-50%] sm:translate-y-[-50%] sm:rounded-lg sm:p-0 flex flex-col overflow-hidden rounded-none"
        aria-describedby={undefined}
      >
        <DialogHeader className="shrink-0 border-b px-4 py-4 text-left sm:px-6">
          <div className="flex flex-col gap-1">
            <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <FileText className="h-5 w-5 shrink-0" />
              {t('title')}
            </DialogTitle>
            <DialogDescription className="sr-only">{t('description')}</DialogDescription>
            {(userName || userEmail) && (
              <div className="mt-3 flex flex-col gap-0.5 text-left">
                <div className="flex flex-wrap items-center justify-start gap-2">
                  <span className="text-base font-bold text-foreground sm:text-lg">
                    {userName ?? userEmail ?? '—'}
                  </span>
                  <TextBadge
                    label={isPremium ? tRole('premium') : tTable('base')}
                    variant={isPremium ? 'lime' : 'default'}
                  />
                </div>
                {userRole && (
                  <p className="text-sm text-muted-foreground">
                    {['admin', 'student', 'teacher'].includes(userRole)
                      ? tRole(userRole as 'admin' | 'student' | 'teacher')
                      : userRole}
                  </p>
                )}
                {userEmail && <p className="text-sm text-muted-foreground">{userEmail}</p>}
              </div>
            )}
          </div>
        </DialogHeader>
        <div className="relative min-h-[min(60vh,400px)] flex-1 overflow-hidden bg-muted/30">
          {isLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4">
              <Spinner className="h-10 w-10" />
              <p className="text-sm text-muted-foreground">{t('loading')}</p>
            </div>
          )}

          {!isLoading && previewUrl && (
            <iframe
              src={previewUrl}
              title={t('preview')}
              className="h-full w-full border-0"
              style={{ minHeight: '60vh' }}
            />
          )}
        </div>
        <DialogFooter className="shrink-0 flex-col gap-2 border-t px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
          <Button
            variant="outline"
            onClick={handleDownload}
            disabled={!pdfBlob || isLoading}
            className="w-full sm:w-auto"
          >
            <Download className="mr-2 h-4 w-4" />
            {t('download')}
          </Button>
          <Button
            onClick={handleSendByEmail}
            disabled={!pdfBlob || isLoading || isSending}
            className="w-full sm:w-auto"
          >
            <Mail className="mr-2 h-4 w-4" />
            {t('sendByEmail')}
            {isSending ? '...' : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
