'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { PencilLineIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { GetAgentDataResponse } from '@/actions/ai/agent/get-agent-data';
import { AgentCard } from '@/components/ai-agents/agent-card/agent-card';
import { UpdatePhotoModal } from '@/components/modals/update-photo-modal';
import { Avatar, AvatarFallback, AvatarImage, Button, Input, Textarea } from '@/components/ui';
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
import { fetcher } from '@/lib/fetcher';
import { getFallbackName } from '@/lib/utils';

type DescriptionModelFormProps = {
  agentId: string;
  initialData: GetAgentDataResponse['agent'];
  isPreviewPage?: boolean;
};

const formSchema = z.object({
  description: z.string().min(1),
  name: z.string().min(1),
  pictureUrl: z.string().optional(),
});

export const DescriptionModelForm = ({
  agentId,
  initialData,
  isPreviewPage,
}: DescriptionModelFormProps) => {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: initialData?.description || '',
      name: initialData?.name || '',
      pictureUrl: initialData?.pictureUrl || '',
    },
  });

  const [isEditing, setIsEditing] = useState(false);

  const { isSubmitting, isValid } = form.formState;

  useEffect(() => {
    form.reset({
      description: initialData?.description || '',
      name: initialData?.name || '',
      pictureUrl: initialData?.pictureUrl || '',
    });
  }, [form, initialData?.description, initialData?.name, initialData?.pictureUrl]);

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
          <AgentCard
            agentId={initialData?.id}
            description={initialData?.description}
            isDefault={initialData?.isDefault}
            isDraft={initialData?.isDraft}
            isEdit
            isPublic={initialData?.isPublic}
            name={initialData?.name}
            pictureUrl={initialData?.pictureUrl}
            user={initialData?.user}
          />
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
          </form>
        </Form>
      )}
    </div>
  );
};
