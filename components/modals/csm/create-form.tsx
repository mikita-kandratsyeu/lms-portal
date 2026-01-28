'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CsmCategory } from '@prisma/client';
import { FileText, Mail, Paperclip, Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

import { Editor } from '@/components/common/editor';
import { FileDownload } from '@/components/common/file-download';
import { FileUpload } from '@/components/common/file-upload';
import {
  Button,
  DialogFooter,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { useCurrentUser } from '@/hooks/use-current-user';
import { getSortedCategories } from '@/lib/csm';
import { fetcher } from '@/lib/fetcher';

type CreateFormProps = { categories?: CsmCategory[]; callback?: () => void };

const formSchema = z.object({
  categoryId: z.string().min(1),
  description: z.string().min(1),
  email: z.string().email().min(1),
  files: z.array(z.object({ url: z.string(), name: z.string() })),
});

export const CreateForm = ({ categories, callback }: CreateFormProps) => {
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
      console.error('[CSM_FORM_CREATE]', error);

      toast({ isError: true, description: (error as Error)?.message ?? '' });
    } finally {
      form.reset({ categoryId: '', description: '', files: [] });

      setFiles([]);
      setIsEditing(false);
      callback?.();
    }
  };

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="w-full">
              <label className="text-sm font-medium flex items-center gap-2 mb-2">
                <Mail className="h-4 w-4" />
                {t('form.emailAddress')}
              </label>
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
              <label className="text-sm font-medium flex items-center gap-2 mb-2">
                <Tag className="h-4 w-4" />
                {t('form.issueCategory')}
              </label>
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
                        <span className="font-medium">{t(`categories.${category.name}`)}</span>
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
            <FormItem className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                {t('form.description')}
              </label>
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
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Paperclip className="h-4 w-4" />
                  {t('attachments')}
                  {files.length > 0 && (
                    <span className="text-xs text-muted-foreground">({files.length})</span>
                  )}
                </label>
                <Button onClick={handleToggleEdit} variant="outline" size="sm" type="button">
                  {isEditing ? (
                    t('cancel')
                  ) : (
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
                    <div className="space-y-2">
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
                    <p className="text-sm text-muted-foreground italic text-center py-3 border border-dashed rounded-md">
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
            </div>
          )}
        />
        <DialogFooter className="mt-6">
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
  );
};
