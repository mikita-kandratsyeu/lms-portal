'use client';

import { Attachment, Course } from '@prisma/client';
import { Paperclip } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import * as z from 'zod';

import { FileDownload } from '@/components/common/file-download';
import { FileUpload } from '@/components/common/file-upload';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { fetcher } from '@/lib/fetcher';

type AttachmentProps = {
  courseId: string;
  initialData: Course & { attachments: Attachment[] };
};

const formSchema = z.object({
  files: z.array(z.object({ url: z.string(), name: z.string() })),
});

export const AttachmentForm = ({ initialData, courseId }: AttachmentProps) => {
  const { toast } = useToast();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleToggleEdit = () => setIsEditing((prev) => !prev);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await fetcher.post(`/api/courses/${courseId}/attachments`, { body: values });

      handleToggleEdit();

      toast({ title: 'Course updated' });
      router.refresh();
    } catch (error) {
      toast({ isError: true, description: (error as Error)?.message ?? '' });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    try {
      setDeletingId(id);

      await fetcher.delete(`/api/courses/${courseId}/attachments/${id}?name=${name}`);

      toast({ title: 'Attachment deleted' });
      router.refresh();
    } catch (error) {
      toast({ isError: true, description: (error as Error)?.message ?? '' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="mt-6 border  bg-neutral-100 dark:bg-neutral-900 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Attachments
        <Button onClick={handleToggleEdit} variant="outline" size="sm">
          {isEditing && <>Cancel</>}
          {!isEditing && (
            <>
              <Paperclip className="h-4 w-4 mr-2" />
              Attach
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <>
          {initialData.attachments.length > 0 ? (
            <div className="space-y-2 mt-4">
              {initialData.attachments.map((attachment) => (
                <FileDownload
                  key={attachment.id}
                  fileName={attachment.name}
                  isRemoveButtonDisabled={deletingId === attachment.id}
                  onFileRemove={() =>
                    handleDelete(attachment.id, attachment?.url?.split('/')?.pop() ?? '')
                  }
                  url={attachment.url}
                  showDownloadButton
                />
              ))}
            </div>
          ) : (
            <p className="text-sm mt-2 text-muted-foreground italic">No attachments</p>
          )}
        </>
      )}
      {isEditing && (
        <div className="mt-4">
          <FileUpload
            accept="application/pdf,image/*,text/*,application/zip"
            folder="course-attachments"
            maxFiles={4}
            maxFileSize={128}
            onChange={(files) => {
              if (files?.length) {
                handleSubmit({ files });
              }
            }}
          />
          <div className="flex text-xs items-start justify-between">
            <div className="text-muted-foreground mt-4">
              Add anything your students might need to complete the course
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
