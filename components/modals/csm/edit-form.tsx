'use client';

import { CsmStatus } from '@prisma/client';
import { AlertCircle, CheckCircle2, Clock, FileText, Mail, Package, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { CsmIssueType } from '@/actions/csm/get-csm-issues';
import { FileDownload } from '@/components/common/file-download';
import { Preview } from '@/components/common/preview';
import { Badge, Card, CardContent } from '@/components/ui';
import {
  Button,
  Checkbox,
  DialogFooter,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/components/ui';
import { useToast } from '@/components/ui/use-toast';
import { DEFAULT_LANGUAGE } from '@/constants/locale';
import { fetcher } from '@/lib/fetcher';
import { capitalize } from '@/lib/utils';

type EditFormProps = { callback?: () => void; editIssue: CsmIssueType };

const getStatusIcon = (status: CsmStatus) => {
  switch (status) {
    case CsmStatus.new:
      return AlertCircle;
    case CsmStatus.progress:
      return Clock;
    case CsmStatus.done:
      return CheckCircle2;
    default:
      return AlertCircle;
  }
};

const getStatusColor = (status: CsmStatus) => {
  switch (status) {
    case CsmStatus.new:
      return 'text-orange-600';
    case CsmStatus.progress:
      return 'text-yellow-600';
    case CsmStatus.done:
      return 'text-green-600';
    default:
      return 'text-gray-600';
  }
};

export const EditForm = ({ callback, editIssue }: EditFormProps) => {
  const t = useTranslations('csm-modal');

  const { toast } = useToast();
  const router = useRouter();

  const [status, setStatus] = useState(editIssue.status ?? CsmStatus.new);
  const [resolutionComment, setResolutionComment] = useState(editIssue.resolutionComment ?? '');
  const [emailCheckBox, setEmailCheckBox] = useState(false);

  const [isFetching, setIsFetching] = useState(false);

  const handleSubmit = async () => {
    setIsFetching(true);

    try {
      const response = await fetcher.patch(`/api/csm/${editIssue.id}`, {
        body: { values: { status, resolutionComment }, settings: { emailCheckBox } },
        responseType: 'json',
      });

      toast({
        description: 'Issue has been updated',
        title: `${response?.issue?.name}`.toUpperCase(),
      });
      router.refresh();
    } catch (error) {
      console.error('[CSM_FORM_EDIT]', error);

      toast({ isError: true, description: (error as Error)?.message ?? '' });
    } finally {
      setIsFetching(false);
      callback?.();
    }
  };

  return (
    <>
      <div className="flex flex-col w-full gap-4">
        <Card className="shadow-none border-muted">
          <CardContent className="pt-4 space-y-3">
            <div className="flex items-start gap-3">
              <User className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium mb-1">{t('form.reporter')}</h4>
                <div className="space-y-1">
                  {editIssue?.user?.name && (
                    <p className="text-sm font-medium text-foreground">{editIssue.user.name}</p>
                  )}
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    <p className="truncate">
                      {editIssue.email ?? editIssue.user?.email ?? 'Unknown user'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 pt-2 border-t">
              <Package className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-medium mb-1">{t('form.releaseInfo')}</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">
                    {editIssue.releaseVersion ?? 'Unknown'}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {editIssue.locale ?? DEFAULT_LANGUAGE}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium flex items-center gap-2">{t('form.status')}</label>
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value as CsmStatus);
            }}
          >
            <SelectTrigger className="text-start">
              <SelectValue placeholder={t('selectReason')} />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(CsmStatus).map((statusKey) => {
                const StatusIcon = getStatusIcon(statusKey as CsmStatus);
                const statusColor = getStatusColor(statusKey as CsmStatus);
                return (
                  <SelectItem key={statusKey} value={statusKey}>
                    <div className="flex items-center gap-2">
                      <StatusIcon className={`h-4 w-4 ${statusColor}`} />
                      <span className="font-medium">{capitalize(statusKey)}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {t('form.description')}
          </label>
          <div className="rounded-md border p-3 bg-muted/30">
            <Preview id={editIssue.id} value={editIssue.description} />
          </div>
        </div>

        {editIssue.attachments.length > 0 && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">
              {t('form.attachmentsCount', { count: editIssue.attachments.length })}
            </label>
            <div className="space-y-2">
              {editIssue.attachments.map((attachment) => (
                <FileDownload
                  fileName={attachment.name}
                  isRemoveButtonDisabled
                  key={attachment.id}
                  showDownloadButton
                  url={attachment.url}
                />
              ))}
            </div>
          </div>
        )}

        {status === CsmStatus.done && (
          <Card className="shadow-none border-green-200 bg-green-50/50 dark:bg-green-950/20 dark:border-green-900">
            <CardContent className="pt-4 space-y-3">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  {t('form.resolutionComment')}
                </label>
                <Textarea
                  disabled={isFetching}
                  placeholder={t('form.resolutionPlaceholder')}
                  value={resolutionComment}
                  className="min-h-[100px] bg-background"
                  onChange={(event) => {
                    setResolutionComment(event.target.value);
                  }}
                />
              </div>
              <div className="flex items-start gap-2 pt-2">
                <Checkbox
                  id="email-notification"
                  defaultChecked={false}
                  onCheckedChange={(value) => setEmailCheckBox(Boolean(value))}
                />
                <label
                  htmlFor="email-notification"
                  className="text-sm leading-relaxed cursor-pointer"
                >
                  {t('form.emailNotification')}
                </label>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <DialogFooter className="mt-6">
        <Button
          disabled={isFetching || (status === CsmStatus.done && !resolutionComment.length)}
          isLoading={isFetching}
          type="submit"
          onClick={handleSubmit}
        >
          {t('submit')}
        </Button>
      </DialogFooter>
    </>
  );
};
