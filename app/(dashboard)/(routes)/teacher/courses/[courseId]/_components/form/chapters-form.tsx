'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Chapter, Course } from '@prisma/client';
import { PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Input } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/use-toast';
import { TEXTAREA_MAX_LENGTH } from '@/constants/courses';
import { formatTimeInSeconds } from '@/lib/date';
import { fetcher } from '@/lib/fetcher';
import { cn } from '@/lib/utils';

import { ChaptersList } from '../chapters-list';

type ChaptersFormProps = {
  courseId: string;
  initialData: Course & { chapters: Chapter[] };
};

const formSchema = z.object({
  title: z.string().min(1),
});

export const ChaptersForm = ({ initialData, courseId }: ChaptersFormProps) => {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
    },
  });

  const totalDuration = initialData.chapters.reduce(
    (acc, current) => acc + (current.durationSec ?? 0),
    0,
  );

  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const { isSubmitting, isValid } = form.formState;

  const handleToggleCreating = () => setIsCreating((prev) => !prev);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await fetcher.post(`/api/courses/${courseId}/chapters`, { body: values });

      toast({ title: 'Chapter created' });
      handleToggleCreating();

      router.refresh();
    } catch (error) {
      toast({ isError: true, description: (error as Error)?.message ?? '' });
    }
  };

  const handleReorder = async (updatedData: { id: string; position: number }[]) => {
    try {
      setIsUpdating(true);

      await fetcher.put(`/api/courses/${courseId}/chapters/reorder`, {
        body: { list: updatedData },
      });

      toast({ title: 'Chapters reordered' });

      router.refresh();
    } catch (error) {
      toast({ isError: true, description: (error as Error)?.message ?? '' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEdit = (id: string) => router.push(`/teacher/courses/${courseId}/chapters/${id}`);

  return (
    <div className="relative mt-6 border  bg-neutral-100 dark:bg-neutral-900 rounded-md p-4">
      {isUpdating && (
        <div className="absolute h-full w-full bg-neutral-500/20 top-0 right-0 rounded-md flex items-center justify-center">
          <Spinner className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}
      <div className="font-medium flex items-center justify-between">
        <div className="flex flex-col justify-center">
          <p>Chapters</p>
          <span className="text-xs text-muted-foreground">
            {formatTimeInSeconds(totalDuration)}
          </span>
        </div>
        <Button onClick={handleToggleCreating} variant="outline" size="sm">
          {isCreating ? (
            <>Cancel</>
          ) : (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add
            </>
          )}
        </Button>
      </div>
      {isCreating && (
        <Form {...form}>
          <form className="space-y-4 mt-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isSubmitting}
                      maxLength={TEXTAREA_MAX_LENGTH}
                      placeholder="e.g. 'Introduction to the course'"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-x-2">
              <Button disabled={!isValid || isSubmitting} isLoading={isSubmitting} type="submit">
                Create
              </Button>
            </div>
          </form>
        </Form>
      )}
      {!isCreating && (
        <>
          <div
            className={cn(
              'text-sm mr-2 mt-4',
              !initialData.chapters.length && 'text-muted-foreground italic',
            )}
          >
            {!initialData.chapters.length && 'No chapters'}
            <ChaptersList
              items={initialData.chapters || []}
              onEdit={handleEdit}
              onReorder={handleReorder}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-4">
            Drag and drop to reorder the chapters
          </div>
        </>
      )}
    </div>
  );
};
