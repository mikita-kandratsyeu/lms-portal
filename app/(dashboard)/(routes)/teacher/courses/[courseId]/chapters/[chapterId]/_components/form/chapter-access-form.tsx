'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Chapter } from '@prisma/client';
import { Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Checkbox } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { fetcher } from '@/lib/fetcher';
import { cn } from '@/lib/utils';

type ChapterAccessFormProps = {
  chapterId: string;
  courseId: string;
  initialData: Chapter;
};

const formSchema = z.object({
  isFree: z.boolean().default(false),
});

export const ChapterAccessForm = ({ chapterId, courseId, initialData }: ChapterAccessFormProps) => {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isFree: Boolean(initialData.isFree),
    },
  });

  const [isEditing, setIsEditing] = useState(false);

  const { isSubmitting, isValid } = form.formState;

  const handleToggleEdit = () => setIsEditing((prev) => !prev);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await fetcher.patch(`/api/courses/${courseId}/chapters/${chapterId}`, { body: values });

      toast({ title: 'Chapter updated' });
      handleToggleEdit();

      router.refresh();
    } catch (error) {
      toast({ isError: true, description: (error as Error)?.message ?? '' });
    }
  };

  return (
    <div className="mt-6 border  bg-neutral-100 dark:bg-neutral-900 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Access settings
        <Button onClick={handleToggleEdit} variant="outline" size="sm">
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
      {!isEditing && (
        <div
          className={cn('text-sm mt-4', !initialData.isFree && 'text-muted-foreground italic mt-2')}
        >
          {initialData.isFree ? (
            <>
              This chapter is <strong>Free</strong> for preview.
            </>
          ) : (
            <>This chapter is not free</>
          )}
        </div>
      )}
      {isEditing && (
        <Form {...form}>
          <form className="space-y-4 mt-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              control={form.control}
              name="isFree"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormDescription>Make this chapter free for preview</FormDescription>
                  </div>
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
