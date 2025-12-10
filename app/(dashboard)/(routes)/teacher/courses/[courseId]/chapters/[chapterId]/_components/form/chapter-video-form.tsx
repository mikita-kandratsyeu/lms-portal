'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Chapter, MuxData } from '@prisma/client';
import { Pencil, PlusCircle, Video } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { FileUpload } from '@/components/common/file-upload';
import { VideoPlayer } from '@/components/common/video-player';
import { Input, Switch } from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/use-toast';
import { fetcher } from '@/lib/fetcher';

type ChapterVideoFormProps = {
  chapterId: string;
  courseId: string;
  initialData: Chapter & { muxData?: MuxData | null };
};

const formSchema = z.object({
  videoUrl: z.string().url().optional().or(z.literal('')),
});

const formImageSchema = z.object({
  imageUrl: z.string().url().optional().or(z.literal('')),
});

export const ChapterVideoForm = ({ initialData, chapterId, courseId }: ChapterVideoFormProps) => {
  const { toast } = useToast();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData as Chapter & { videoUrl?: string; imageUrl?: string },
  });

  const { isSubmitting, isValid } = form.formState;

  const [isImage, setIsImage] = useState(false);

  const handleToggleEdit = () => {
    setIsEditing((prev) => !prev);
    setIsVideoReady(isEditing ? false : isVideoReady);
  };

  const handleSubmit = async (values: z.infer<typeof formSchema & typeof formImageSchema>) => {
    try {
      await fetcher.patch(`/api/courses/${courseId}/chapters/${chapterId}`, { body: values });

      toast({ title: 'Chapter updated' });
      handleToggleEdit();

      router.refresh();
    } catch (error) {
      toast({ isError: true });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="mt-6 border  bg-neutral-100 dark:bg-neutral-900 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        <div className="flex items-center gap-x-4">
          {isEditing && (
            <Switch
              aria-readonly
              checked={isImage}
              disabled={isSubmitting}
              onCheckedChange={() => setIsImage((prev) => !prev)}
              type="submit"
            />
          )}
          {isEditing && <span>{isImage ? 'Image Preview' : 'Video'}</span>}
        </div>
        <Button onClick={handleToggleEdit} variant="outline" size="sm">
          {isEditing && <>Cancel</>}
          {!isEditing && !initialData?.videoUrl && (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add
            </>
          )}
          {!isEditing && initialData?.videoUrl && (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <>
          {!initialData?.videoUrl && !initialData?.imageUrl && (
            <div className="flex items-center justify-center h-60 bg-neutral-200 dark:bg-neutral-800 rounded-md mt-4">
              <Video className="h-10 w-10 text-muted-foreground" />
            </div>
          )}
          {initialData?.videoUrl && (
            <div className="relative mt-4">
              <VideoPlayer
                id={initialData.id}
                onReady={() => setIsVideoReady(true)}
                videoUrl={initialData.videoUrl}
              />
              {!isVideoReady && (
                <div className="absolute h-full w-full bg-muted border top-0 right-0 rounded-md flex items-center justify-center">
                  <Spinner className="h-6 w-6 text-primary" />
                </div>
              )}
            </div>
          )}
          {initialData?.imageUrl && (
            <div className="relative aspect-w-16 aspect-h-9 mt-4 border">
              <Image
                alt="Upload"
                className="object-cover rounded-md"
                fill
                src={initialData.imageUrl}
              />
            </div>
          )}
        </>
      )}
      {isEditing && (
        <div className="mt-4">
          <div className="relative">
            {isImage && (
              <FileUpload
                endpoint="courseImage"
                onChange={(files) => {
                  if (files?.length) {
                    handleSubmit({ imageUrl: files[0]?.url });
                  }
                }}
              />
            )}
            {!isImage && (
              <FileUpload
                endpoint="chapterVideo"
                onBegin={() => setIsUploading(true)}
                onChange={(files) => {
                  if (files?.length) {
                    handleSubmit({ videoUrl: files[0]?.url });
                  }
                }}
              />
            )}
            {isSubmitting && (
              <div className="absolute h-full w-full bg-neutral-500/20 top-0 right-0 rounded-md" />
            )}
          </div>
          {!isImage && (
            <Form {...form}>
              <form
                className="flex items-start justify-between mt-4"
                onSubmit={form.handleSubmit(handleSubmit)}
              >
                <FormField
                  control={form.control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem className="w-full pr-2">
                      <FormControl>
                        <Input
                          {...field}
                          disabled={isSubmitting || isUploading}
                          placeholder="e.g. https://www.youtube.com/watch?v=XYa_kQ..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex items-center gap-x-2 basis-2/5">
                  <Button
                    className="w-full"
                    disabled={!isValid || isSubmitting || isUploading}
                    isLoading={isSubmitting}
                    type="submit"
                  >
                    Add
                  </Button>
                </div>
              </form>
            </Form>
          )}
          {!isImage && (
            <div className="flex text-xs items-end justify-between">
              <div className="text-muted-foreground mt-4">
                Upload or add a link to the video from this chapter
              </div>
            </div>
          )}
        </div>
      )}
      {initialData.videoUrl && !isEditing && (
        <div className="text-xs text-muted-foreground mt-4">
          Video processing may take several minutes. Refresh the page if the video is not displayed.
        </div>
      )}
    </div>
  );
};
