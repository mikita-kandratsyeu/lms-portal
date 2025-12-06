'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { PencilLineIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { GetAgentDataResponse } from '@/actions/ai/agent/get-agent-data';
import { AgentCard } from '@/components/ai-agents/agent-card/agent-card';
import { LanguageSwitcher } from '@/components/common/language-switcher';
import { UpdatePhotoModal } from '@/components/modals/update-photo-modal';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Input,
  Switch,
  Textarea,
} from '@/components/ui';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { DEFAULT_LANGUAGE } from '@/constants/locale';
import { useCurrentUser } from '@/hooks/use-current-user';
import { fetcher } from '@/lib/fetcher';
import { isBusinessOwner } from '@/lib/owner';
import { getFallbackName } from '@/lib/utils';

type DescriptionModelFormProps = {
  agentId: string;
  initialData: GetAgentDataResponse['agent'];
  isPreviewPage?: boolean;
};

const formSchema = z.object({
  description: z.string().min(1),
  isSystem: z.boolean().default(false).optional(),
  language: z.string().default(DEFAULT_LANGUAGE),
  name: z.string().min(1),
  pictureUrl: z.string().optional(),
});

export const DescriptionModelForm = ({
  agentId,
  initialData,
  isPreviewPage,
}: DescriptionModelFormProps) => {
  const { user } = useCurrentUser();

  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: initialData?.description || '',
      isSystem: Boolean(initialData?.isSystem),
      language: initialData?.language || DEFAULT_LANGUAGE,
      name: initialData?.name || '',
      pictureUrl: initialData?.pictureUrl || '',
    },
  });

  const [isEditing, setIsEditing] = useState(false);

  const { isSubmitting, isValid } = form.formState;

  useEffect(() => {
    form.reset({
      description: initialData?.description || '',
      isSystem: Boolean(initialData?.isSystem),
      language: initialData?.language || DEFAULT_LANGUAGE,
      name: initialData?.name || '',
      pictureUrl: initialData?.pictureUrl || '',
    });
  }, [
    form,
    initialData?.description,
    initialData?.isSystem,
    initialData?.language,
    initialData?.name,
    initialData?.pictureUrl,
  ]);

  const handleToggleEdit = () => {
    setIsEditing((prev) => !prev);
    form.reset();
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await fetcher.patch(`/api/ai/agents/${agentId}`, {
        body: values,
      });

      toast({ title: 'Agent description has been updated' });
      handleToggleEdit();

      router.refresh();
    } catch (error) {
      console.error('[DESCRIPTION_MODEL_FORM]', error);

      toast({ isError: true });
    }
  };

  return (
    <div className="mt-6 border  bg-neutral-100 dark:bg-neutral-900 rounded-md p-4">
      <div className="font-medium flex items-center justify-between gap-x-2">
        <div className="flex gap-x-2 items-center">
          <span>Agent description</span>
        </div>
        <div className="flex gap-x-2 items-center">
          {!isPreviewPage && (
            <Button disabled={isSubmitting} onClick={handleToggleEdit} size="sm" variant="outline">
              {isEditing && <>Cancel</>}
              {!isEditing && (
                <>
                  <PencilLineIcon className="h-4 w-4 mr-2" />
                  Edit
                </>
              )}
            </Button>
          )}
          {isEditing && (
            <Button
              disabled={!isValid || isSubmitting}
              isLoading={isSubmitting}
              onClick={form.handleSubmit(handleSubmit)}
              size="sm"
              type="submit"
            >
              Save
            </Button>
          )}
        </div>
      </div>
      {!isEditing && (
        <div className="mt-4">
          <AgentCard agentId={initialData?.id} isEdit {...initialData} />
        </div>
      )}
      {isEditing && (
        <Form {...form}>
          <form className="space-y-4 mt-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="flex gap-x-4">
              <FormField
                control={form.control}
                name="pictureUrl"
                render={({ field }) => (
                  <FormItem>
                    <UpdatePhotoModal callback={field.onChange} type="ai-agent">
                      <button disabled={isSubmitting}>
                        <Avatar className="border dark:border-muted-foreground w-24 h-24">
                          <AvatarImage src={form.watch(field.name) || ''} />
                          <AvatarFallback>
                            {getFallbackName(initialData?.name || '')}
                          </AvatarFallback>
                        </Avatar>
                      </button>
                    </UpdatePhotoModal>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="mb-4">Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isSubmitting} placeholder="e.g. 'Nova Copilot'" />
                    </FormControl>
                    <FormDescription>Come up with a name for your agent</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-4">Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      disabled={isSubmitting}
                      placeholder="e.g. 'AI agent who ...'"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isBusinessOwner(user?.userId) && (
              <FormField
                control={form.control}
                name="isSystem"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0 rounded-md border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>System agent</FormLabel>
                      <FormDescription className="text-xs">
                        The agent will be displayed as a system agent.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        aria-readonly
                        checked={field.value}
                        disabled={!isValid || isSubmitting}
                        onCheckedChange={field.onChange}
                        type="button"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0 rounded-md border p-4">
                  <div className="space-y-0.5">
                    <FormLabel>Agent language</FormLabel>
                    <FormDescription className="text-xs">
                      Specify the default language.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <LanguageSwitcher
                      callback={field.onChange}
                      isDisabled={isSubmitting}
                      value={field.value}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>
      )}
    </div>
  );
};
