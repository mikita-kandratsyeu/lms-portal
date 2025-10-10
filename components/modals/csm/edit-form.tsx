'use client';

import { CsmStatus } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { CsmIssueType } from '@/actions/csm/get-csm-issues';
import { FileDownload } from '@/components/common/file-download';
import { Preview } from '@/components/common/preview';
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

      toast({ isError: true });
    } finally {
      setIsFetching(false);
      callback?.();
    }
  };

  return (
    <>
      <div className="flex flex-col w-full gap-y-4">
        <div>
          <h4 className="font-semibold">Reporter</h4>
          <p className="text-sm text-muted-foreground">
            {editIssue?.user?.name && <p className="font-semibold">{editIssue.user.name}</p>}
            <p>{editIssue.email ?? editIssue.user?.email ?? 'Unknown user'}</p>
          </p>
        </div>
        <div className="flex flex-col gap-y-2">
          <h4 className="font-semibold">Release version</h4>
          <p className="text-sm text-muted-foreground">
            {editIssue.releaseVersion ?? 'Unknown'} ({editIssue.locale ?? DEFAULT_LANGUAGE})
          </p>
        </div>
        <div className="flex flex-col gap-y-2">
          <h4 className="font-semibold">Status</h4>
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
              {Object.keys(CsmStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  <div className="flex flex-col">
                    <span className="font-medium">{capitalize(status)}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-y-2">
          <h4 className="font-semibold">Description</h4>
          <Preview id={editIssue.id} value={editIssue.description} />
        </div>
        {editIssue.attachments.length > 0 && (
          <div className="flex flex-col gap-y-2">
            <h4 className="font-semibold">Attachments</h4>
            <div className="space-y-2 mt-4">
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
          <>
            <div className="flex flex-col gap-y-2">
              <h4 className="font-semibold">Resolution comment</h4>
              <Textarea
                disabled={isFetching}
                placeholder="e.g. 'Please, add comment...'"
                value={resolutionComment}
                onChange={(event) => {
                  setResolutionComment(event.target.value);
                }}
              />
            </div>
            <div className="flex flex-row items-center space-x-2 space-y-0">
              <Checkbox
                defaultChecked={false}
                onCheckedChange={(value) => setEmailCheckBox(Boolean(value))}
              />
              <p className="text-sm leading-none">Send the confirmation to the client by email.</p>
            </div>
          </>
        )}
      </div>
      <DialogFooter>
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
