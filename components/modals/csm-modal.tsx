'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CsmCategory } from '@prisma/client';
import { Paperclip } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { useCurrentUser } from '@/hooks/use-current-user';
import { getSortedCategories } from '@/lib/csm';
import { fetcher } from '@/lib/fetcher';

import { Editor } from '../common/editor';
import { FileDownload } from '../common/file-download';
import { FileUpload } from '../common/file-upload';
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui';
import { useToast } from '../ui/use-toast';

type CsmModalProps = {
  categories?: CsmCategory[];
  open: boolean;
  setOpen: (value: boolean) => void;
};

const formSchema = z.object({
  categoryId: z.string().min(1),
  description: z.string().min(1),
  email: z.string().email().min(1),
  files: z.array(z.object({ url: z.string(), name: z.string() })),
});

export const CsmModal = ({ categories = [], open, setOpen }: CsmModalProps) => {
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

  const sortedCategories = getSortedCategories(categories);

  const handleToggleEdit = () => setIsEditing((prev) => !prev);

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
        <DialogContent className="sm:max-w-[525px] sm:max-h-[625px] overflow-auto max-w-max sm:h-auto h-full sm:w-auto w-full flex flex-col justify-start pt-6">
          <DialogHeader>
            <DialogTitle>{t('title')}</DialogTitle>
            <DialogDescription>{t('body')}</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form className="space-y-4 mt-4" onSubmit={form.handleSubmit(handleSubmit)}>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <Input
                      {...field}
                      {...(user?.email && { value: user.email })}
                      disabled={isSubmitting || Boolean(user?.userId)}
                      placeholder={t('enterEmail')}
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="text-start">
                          <SelectValue placeholder={t('selectReason')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sortedCategories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {t(`categories.${category.name}`)}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                    <FormControl>
                      <Editor {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="files"
                render={() => (
                  <>
                    <div className="font-medium flex items-center justify-between">
                      {t('attachments')}
                      <Button onClick={handleToggleEdit} variant="outline" size="sm" type="button">
                        {isEditing && <>{t('cancel')}</>}
                        {!isEditing && (
                          <>
                            <Paperclip className="h-4 w-4 mr-2" />
                            {t('attach')}
                          </>
                        )}
                      </Button>
                    </div>
                    {!isEditing && (
                      <>
                        {files.length > 0 ? (
                          <div className="space-y-2 mt-4">
                            {files.map((file) => (
                              <FileDownload
                                key={file.id}
                                fileName={file.name}
                                onFileRemove={() => {
                                  setFiles((prev) => prev.filter((pr) => pr.id !== file.id));
                                }}
                                url={file.url}
                              />
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm mt-2 text-neutral-500 italic text-center">
                            {t('notFound')}
                          </p>
                        )}
                      </>
                    )}
                    {isEditing && (
                      <FileUpload
                        endpoint="csmAttachments"
                        onBegin={() => setIsUploading(true)}
                        onChange={(files) => {
                          if (files?.length) {
                            setFiles(files.map((file) => ({ id: uuidv4(), ...file })));
                            setIsEditing(false);
                            setIsUploading(false);
                          }
                        }}
                      />
                    )}
                  </>
                )}
              />
              <DialogFooter>
                <Button
                  disabled={!isValid || isSubmitting || isUploading}
                  isLoading={isSubmitting}
                  type="submit"
                >
                  {t('submit')}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};
