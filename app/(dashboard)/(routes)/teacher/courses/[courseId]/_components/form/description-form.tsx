'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Course } from '@prisma/client';
import { Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { StreamText } from '@/components/ai/stream-text';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { ChatCompletionRole } from '@/constants/ai/general';
import { USER_COURSE_SHORT_DESCRIPTION_PROMPT } from '@/constants/ai/prompts';
import { TEXTAREA_MAX_LENGTH } from '@/constants/courses';
import { fetcher } from '@/lib/fetcher';
import { cn } from '@/lib/utils';

type DescriptionFormProps = {
  courseId: string;
  initialData: Course;
};

const formSchema = z.object({
  description: z.string().min(1).max(TEXTAREA_MAX_LENGTH),
});

export const DescriptionForm = ({ initialData, courseId }: DescriptionFormProps) => {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: initialData?.description || '',
    },
  });

  const defaultPrompt = USER_COURSE_SHORT_DESCRIPTION_PROMPT(form.getValues().description);

  const [isEditing, setIsEditing] = useState(false);
  const [newDescription, setNewDescription] = useState('');
  const [promptMessage, setPromptMessage] = useState(defaultPrompt);

  const { isSubmitting, isValid } = form.formState;

  useEffect(() => {
    if (newDescription.length) {
      form.setValue('description', newDescription);
    }
  }, [form, newDescription]);

  const handleToggleEdit = () => {
    setIsEditing((prev) => !prev);
    setNewDescription(initialData?.description || '');
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await fetcher.patch(`/api/courses/${courseId}`, { body: values });

      toast({ title: 'Course updated' });
      handleToggleEdit();

      router.refresh();
    } catch (error) {
      toast({ isError: true });
    }
  };

  return (
    <div className="mt-6 border  bg-neutral-100 dark:bg-neutral-900 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Description
        <div className="flex items-center gap-x-2">
          {isEditing && (
            <StreamText
              callback={setNewDescription}
              isSubmitting={isSubmitting}
              isValid={isValid}
              messages={[
                {
                  role: ChatCompletionRole.USER,
                  content: promptMessage,
                },
              ]}
              showModelSelector
            />
          )}
          <Button onClick={handleToggleEdit} variant="outline" size="sm" disabled={isSubmitting}>
            {isEditing ? (
              <>Cancel</>
            ) : (
              <>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </>
            )}
          </Button>
        </div>
      </div>
      {!isEditing && (
        <p
          className={cn('text-sm mt-4', !initialData.description && 'text-neutral-500 italic mt-2')}
        >
          {initialData.description || 'No description'}
        </p>
      )}
      {isEditing && (
        <div className="flex flex-col gap-y-2 mt-2">
          <p className="text-sm text-muted-foreground">Input prompt</p>
          <Textarea
            disabled={isSubmitting}
            placeholder="e.g. 'Please, add emoji for...'"
            value={promptMessage}
            onChange={(event) => {
              setPromptMessage(event.target.value);
            }}
          />
        </div>
      )}
      {isEditing && (
        <Form {...form}>
          <form className="space-y-4 mt-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      {...field}
                      disabled={isSubmitting}
                      maxLength={TEXTAREA_MAX_LENGTH}
                      placeholder="e.g. 'This course is about ...'"
                    />
                  </FormControl>
                  <FormDescription
                    className={cn(
                      'text-xs text-end',
                      form.watch('description').length >= TEXTAREA_MAX_LENGTH && 'text-red-600',
                    )}
                  >{`${form.watch('description').length}/${TEXTAREA_MAX_LENGTH}`}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-x-2">
              <Button disabled={!isValid || isSubmitting} isLoading={isSubmitting} type="submit">
                Save
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};
