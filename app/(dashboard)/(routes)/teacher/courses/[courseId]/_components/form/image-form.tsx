'use client';

import { Course } from '@prisma/client';
import { ImageIcon, Pencil, PlusCircle } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import * as z from 'zod';

import { FileUpload } from '@/components/common/file-upload';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { fetcher } from '@/lib/fetcher';

type ImageFormProps = {
  courseId: string;
  initialData: Course;
};

const _formSchema = z.object({
  imageUrl: z.string().min(1),
});

export const ImageForm = ({ initialData, courseId }: ImageFormProps) => {
  const { toast } = useToast();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);

  const handleToggleEdit = () => setIsEditing((prev) => !prev);

  const handleSubmit = async (values: z.infer<typeof _formSchema>) => {
    try {
      await fetcher.patch(`/api/courses/${courseId}`, { body: values });

      toast({ title: 'Course updated' });
      handleToggleEdit();

      router.refresh();
    } catch (error) {
      toast({ isError: true, description: (error as Error)?.message ?? '' });
    }
  };

  return (
    <div className="mt-6 border  bg-neutral-100 dark:bg-neutral-900 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Image
        <Button onClick={handleToggleEdit} variant="outline" size="sm">
          {isEditing && <>Cancel</>}
          {!isEditing && !initialData?.imageUrl && (
            <>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add
            </>
          )}
          {!isEditing && initialData?.imageUrl && (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </>
          )}
        </Button>
      </div>
      {!isEditing &&
        (!initialData?.imageUrl ? (
          <div className="flex items-center justify-center h-60 bg-neutral-200 dark:bg-neutral-800 rounded-md mt-4">
            <ImageIcon className="h-10 w-10 text-muted-foreground" />
          </div>
        ) : (
          <div className="relative aspect-w-16 aspect-h-9 mt-4 border">
            <Image
              alt="Upload"
              className="object-cover rounded-md"
              fill
              src={initialData.imageUrl}
            />
          </div>
        ))}
      {isEditing && (
        <div className="mt-4">
          <FileUpload
            accept="image/*"
            folder="course-images"
            maxFiles={1}
            maxFileSize={4}
            onChange={(files) => {
              if (files?.length) {
                handleSubmit({ imageUrl: files[0]?.url });
              }
            }}
          />
          <div className="flex text-xs items-end justify-between">
            <div className="text-muted-foreground mt-4">16:9 aspect ratio recommend</div>
          </div>
        </div>
      )}
    </div>
  );
};
