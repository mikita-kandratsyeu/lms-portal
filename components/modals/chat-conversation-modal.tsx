'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Link, RefreshCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Conversation } from '@/actions/chat/get-chat-conversations';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPortal,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { CONVERSATION_ACTION } from '@/constants/chat';
import { useChatStore } from '@/hooks/store/use-chat-store';
import { generateConversationTitle } from '@/lib/chat/chat';
import { fetcher } from '@/lib/fetcher';
import { absoluteUrl, cn } from '@/lib/utils';

import { Button, Checkbox, Input } from '../ui';
import { useToast } from '../ui/use-toast';

type ChatConversationModalProps = {
  initialData?: Conversation;
  isEdit?: boolean;
  isShare?: boolean;
  open?: boolean;
  setOpen?: (value: boolean) => void;
};

const formSchema = z.object({
  isOnlyAuth: z.boolean().default(false).optional(),
  isShared: z.boolean().default(false).optional(),
  title: z.string().min(1),
});

export const ChatConversationModal = ({
  initialData,
  isEdit = false,
  isShare = false,
  open = false,
  setOpen,
}: ChatConversationModalProps) => {
  const t = useTranslations('chat-conversation-modal');

  const { toast } = useToast();

  const router = useRouter();

  const { setConversationId } = useChatStore((state) => ({
    setConversationId: state.setConversationId,
  }));

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isOnlyAuth: initialData?.shared.isOnlyAuth,
      isShared: initialData?.shared.isShared,
      title: initialData?.title ?? '',
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const title = useMemo(() => {
    if (isEdit) {
      return t('titleEdit');
    }

    if (isShare) {
      return t('sharedAccess');
    }

    return t('titleAdd');
  }, [isEdit, isShare, t]);

  const [isUpdatingSharedLink, setIsUpdatingSharedLink] = useState(false);
  const [sharedLink, setSharedLink] = useState(
    initialData?.shared?.id ? absoluteUrl(`/chat/shared/${initialData.shared.id}`) : '',
  );

  const watchIsShared = form.watch('isShared') as boolean;
  const watchIsOnlyAuth = form.watch('isOnlyAuth') as boolean;

  const handleOpenChange = (value: boolean) => {
    setOpen?.(value);

    if (
      initialData?.shared.isShared !== watchIsShared ||
      initialData?.shared.isOnlyAuth !== watchIsOnlyAuth
    ) {
      router.refresh();
    }
  };

  const handleGenerateTitle = (onChange: (value: string) => void) => {
    const title = generateConversationTitle();

    onChange(title);
  };

  const handleShareConversation = async (isActive: boolean, isOnlyAuth: boolean) => {
    setIsUpdatingSharedLink(true);

    try {
      const response =
        initialData?.shared.isCreated || sharedLink
          ? await fetcher.patch(`/api/chat/conversations/${initialData?.id}/share`, {
              body: { isActive, isOnlyAuth },
              responseType: 'json',
            })
          : await fetcher.post(`/api/chat/conversations/${initialData?.id}/share`, {
              responseType: 'json',
            });

      setSharedLink(absoluteUrl(`/chat/shared/${response?.id}`));
    } catch (error) {
      toast({ isError: true });
    } finally {
      setIsUpdatingSharedLink(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(sharedLink);

    toast({ title: t('copied') });
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response =
        isEdit || isShare
          ? await fetcher.patch(
              `/api/chat/conversations/${initialData?.id}?action=${CONVERSATION_ACTION.EDIT}`,
              { body: { ...values }, responseType: 'json' },
            )
          : await fetcher.post(`/api/chat/conversations?action=${CONVERSATION_ACTION.NEW}`, {
              body: { ...values },
              responseType: 'json',
            });

      setConversationId(response?.id ?? '');

      if (!isEdit && !isShare) {
        router.replace('/chat');
      }

      router.refresh();
    } catch (error) {
      toast({ isError: true });
    } finally {
      setOpen?.(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => handleOpenChange(open)}>
      <DialogPortal>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{t('description')}</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form className="space-y-4 mt-4" onSubmit={form.handleSubmit(handleSubmit)}>
              {!isShare && (
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>{t('title')}</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            {...field}
                            aria-hidden="true"
                            disabled={isSubmitting}
                            placeholder="e.g. New conversation"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleGenerateTitle(field.onChange)}
                            disabled={isSubmitting || isUpdatingSharedLink}
                          >
                            <RefreshCcw className="w-4 h-4" />
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              {isShare && (
                <>
                  <FormField
                    control={form.control}
                    name="isShared"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            onClick={() => handleShareConversation(!field.value, watchIsOnlyAuth)}
                            disabled={isSubmitting || isUpdatingSharedLink}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormDescription>{t('openAccess')}</FormDescription>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isOnlyAuth"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            disabled={!watchIsShared || isSubmitting || isUpdatingSharedLink}
                            onCheckedChange={field.onChange}
                            onClick={() => handleShareConversation(watchIsShared, !field.value)}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormDescription>{t('onlyAuth')}</FormDescription>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              <DialogFooter className="pt-4">
                <div className={cn('w-full flex', isShare ? 'justify-between' : 'justify-end')}>
                  {isShare && (
                    <Button
                      disabled={
                        isSubmitting || !sharedLink || isUpdatingSharedLink || !watchIsShared
                      }
                      onClick={handleCopyLink}
                      type="button"
                      variant="outline"
                    >
                      <div className="flex items-center gap-x-2">
                        <Link className="w-4 h-4" />
                        <span>{t('copyLink')}</span>
                      </div>
                    </Button>
                  )}
                  {!isShare && (
                    <Button
                      disabled={!isValid || isSubmitting || isUpdatingSharedLink}
                      isLoading={isSubmitting}
                      type="submit"
                    >
                      {t('submit')}
                    </Button>
                  )}
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};
