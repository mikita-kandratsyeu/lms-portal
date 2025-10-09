'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CsmCategory, CsmStatus } from '@prisma/client';
import { format } from 'date-fns/format';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import Markdown from 'react-markdown';
import ScrollToBottom from 'react-scroll-to-bottom';
import { z } from 'zod';

import { CsmIssueType } from '@/actions/csm/get-csm-issues';
import { FileDownload } from '@/components/common/file-download';
import { Preview } from '@/components/common/preview';
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/components/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { TIMESTAMP_USER_PROFILE_TEMPLATE } from '@/constants/common';
import { useCurrentUser } from '@/hooks/use-current-user';
import { fetcher } from '@/lib/fetcher';
import { capitalize, cn } from '@/lib/utils';

import { CreateForm } from './create-form';

type CsmModalProps = {
  categories?: CsmCategory[];
  editIssue?: CsmIssueType;
  open: boolean;
  setOpen: (value: boolean) => void;
};

const formSchema = z.object({
  categoryId: z.string().min(1),
  description: z.string().min(1),
  email: z.string().email().min(1),
  files: z.array(z.object({ url: z.string(), name: z.string() })),
});

export const CsmModal = ({ categories = [], editIssue, open, setOpen }: CsmModalProps) => {
  const t = useTranslations('csm-modal');

  const { user } = useCurrentUser();

  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: user?.email ?? '',
      categoryId: '',
      description: '',
      files: [],
    },
  });

  const [files, setFiles] = useState<{ id: string; url: string; name: string }[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const { isSubmitting, isValid } = form.formState;

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const issue = await fetcher.post('/api/csm/create', {
        body: { ...values, files },
        responseType: 'json',
      });

      toast({ description: t('success'), title: `${issue.issueNumber}`.toUpperCase() });
      router.refresh();
    } catch (error) {
      console.error('[CSM_MODAL]', error);

      toast({ isError: true });
    } finally {
      form.reset({ categoryId: '', description: '', files: [] });

      setFiles([]);
      setIsEditing(false);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogPortal>
        <DialogContent
          className={cn(
            'sm:max-w-[525px] sm:max-h-[625px] overflow-auto max-w-max sm:h-auto h-full sm:w-auto w-full flex flex-col justify-start pt-6',
            editIssue && 'min-w-[525px]',
          )}
        >
          <DialogHeader>
            <DialogTitle>{editIssue ? editIssue.name : t('title')}</DialogTitle>
            <DialogDescription>
              {editIssue ? (
                <div className="mt-2 text-sm flex justify-between items-center gap-x-6">
                  <div className="flex flex-col">
                    <p className="font-medium">
                      {capitalize(editIssue?.category?.name ?? 'Unknown')}
                    </p>
                    <p className="line-clamp-2">
                      {t(`categories.${editIssue?.category?.name ?? ''}`)}
                    </p>
                  </div>
                  <div className="flex flex-col gap-y-1 text-xs items-end">
                    <p>Created at {format(editIssue.createdAt, TIMESTAMP_USER_PROFILE_TEMPLATE)}</p>
                    <p>Updated at {format(editIssue.updatedAt, TIMESTAMP_USER_PROFILE_TEMPLATE)}</p>
                  </div>
                </div>
              ) : (
                t('body')
              )}
            </DialogDescription>
          </DialogHeader>
          {editIssue && (
            <>
              <div className="flex flex-col w-full gap-y-4">
                <div>
                  <h4 className="font-semibold">Reporter</h4>
                  <p className="text-sm text-muted-foreground">
                    {editIssue?.user?.name && (
                      <p className="font-semibold">{editIssue.user.name}</p>
                    )}
                    <p>{editIssue.email ?? editIssue.user?.email ?? 'Unknown user'}</p>
                  </p>
                </div>
                <div className="flex flex-col gap-y-2">
                  <h4 className="font-semibold">Status</h4>
                  <Select onValueChange={() => {}} defaultValue={CsmStatus.new}>
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
                  {/* <ScrollToBottom
                    className="flex h-[200px] w-full flex-co border-2 border-violet-500 rounded-lg"
                    followButtonClassName="scroll-to-bottom-button"
                  >
                    <p className="text-sm prose dark:prose-invert prose-a:text-accent-primary prose-a:no-underline hover:prose-a:underline m-4">
                      <Markdown>{editIssue.description}</Markdown>
                    </p>
                  </ScrollToBottom> */}
                  <Preview id={editIssue.id} value={editIssue.description} />
                </div>
                {editIssue.attachments.length > 0 && (
                  <div className="flex flex-col gap-y-2">
                    <h4 className="font-semibold">Attachments</h4>
                    <div className="space-y-2 mt-4">
                      {editIssue.attachments.map((attachment) => (
                        <FileDownload
                          key={attachment.id}
                          fileName={attachment.name}
                          showDownloadButton
                          onFileRemove={() => {
                            setFiles((prev) => prev.filter((pr) => pr.id !== attachment.id));
                          }}
                          url={attachment.url}
                        />
                      ))}
                    </div>
                  </div>
                )}
                <div className="flex flex-col gap-y-2">
                  <h4 className="font-semibold">Resolution</h4>
                  <Textarea
                    disabled={isSubmitting}
                    placeholder="e.g. 'Please, add message...'"
                    value={''}
                    onChange={(event) => {
                      // setPromptMessage(event.target.value);
                    }}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  disabled={isSubmitting || isUploading}
                  isLoading={isSubmitting}
                  type="submit"
                >
                  {t('submit')}
                </Button>
              </DialogFooter>
            </>
          )}
          {!editIssue && <CreateForm categories={categories} callback={() => setOpen(false)} />}
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};
