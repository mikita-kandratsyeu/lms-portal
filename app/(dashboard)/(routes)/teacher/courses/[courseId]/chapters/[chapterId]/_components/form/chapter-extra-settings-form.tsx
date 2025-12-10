'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Chapter } from '@prisma/client';
import { Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { TextBadge } from '@/components/common/text-badge';
import { Button, Input } from '@/components/ui';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { useVideoStore } from '@/hooks/store/use-video-store';
import { formatTimeInSeconds } from '@/lib/date';
import { fetcher } from '@/lib/fetcher';
import { cn } from '@/lib/utils';

type ChapterExtraSettingsFormProps = {
  chapterId: string;
  courseId: string;
  initialData: Chapter;
};

const formSchema = z.object({
  durationSec: z.string().min(0),
});

export const ChapterExtraSettingsForm = ({
  chapterId,
  courseId,
  initialData,
}: ChapterExtraSettingsFormProps) => {
  const { toast } = useToast();
  const router = useRouter();

  const { video } = useVideoStore((state) => ({ video: state.video }));
  const videoDuration =
    video.find((vd) => vd.id === `${chapterId}-${initialData.videoUrl}`)?.duration ?? 0;

  const isValidationNeeded = initialData.durationSec !== videoDuration;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      durationSec: String(initialData.durationSec ?? videoDuration),
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
      toast({ isError: true });
    }
  };

  const handleApplyDuration = async () => {
    try {
      await fetcher.patch(`/api/courses/${courseId}/chapters/${chapterId}`, {
        body: { durationSec: videoDuration },
      });

      toast({ title: 'Duration has been updated' });
      handleToggleEdit();

      router.refresh();
    } catch (error) {
      toast({ isError: true });
    }
  };

  return (
    <div className="mt-6 border  bg-neutral-100 dark:bg-neutral-900 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <span>Extra options</span>
          {isValidationNeeded && <TextBadge label="Need validation" variant="yellow" />}
        </div>

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
          {Number(initialData.durationSec) > 0 ? (
            <>
              <strong>{formatTimeInSeconds(Number(initialData.durationSec))}</strong> for this
              chapter.
            </>
          ) : (
            <>This chapter has not duration.</>
          )}
        </div>
      )}
      {isEditing && (
        <Form {...form}>
          <form className="space-y-4 mt-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              control={form.control}
              name="durationSec"
              render={({ field }) => (
                <FormItem>
                  <div className="text-sm flex flex-col justify-center gap-x-1">
                    <p>Custom chapter duration (seconds)</p>
                    {videoDuration > 0 && (
                      <div className="flex items-center gap-x-1 text-muted-foreground">
                        <span>Duration for uploaded video is </span>
                        <strong>{formatTimeInSeconds(videoDuration)}</strong>
                        <Button
                          className="ml-2"
                          onClick={handleApplyDuration}
                          size="sm"
                          type="button"
                          variant="outline"
                        >
                          Apply
                        </Button>
                      </div>
                    )}
                  </div>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isSubmitting}
                      placeholder="e.g. 1234"
                      type="number"
                    />
                  </FormControl>
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
