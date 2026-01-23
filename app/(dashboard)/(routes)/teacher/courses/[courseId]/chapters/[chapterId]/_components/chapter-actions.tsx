'use client';

import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { ConfirmModal } from '@/components/modals/confirm-modal';
import { Button } from '@/components/ui';
import { useToast } from '@/components/ui/use-toast';
import { fetcher } from '@/lib/fetcher';

type ChapterActionsProps = {
  chapterId: string;
  courseId: string;
  disabled?: boolean;
  isPublished?: boolean;
};

export const ChapterActions = ({
  chapterId,
  courseId,
  disabled = false,
  isPublished = false,
}: ChapterActionsProps) => {
  const { toast } = useToast();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const handleTogglePublication = async () => {
    setIsLoading(true);

    try {
      await fetcher.patch(
        `/api/courses/${courseId}/chapters/${chapterId}/${isPublished ? 'unpublish' : 'publish'}`,
        { responseType: 'json' },
      );

      toast({
        title: isPublished ? 'Chapter unpublished' : 'Chapter has been published',
      });

      router.refresh();
    } catch (error) {
      toast({ isError: true, description: (error as Error)?.message ?? '' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);

    try {
      await fetcher.delete(`/api/courses/${courseId}/chapters/${chapterId}`);

      toast({
        title: 'Chapter deleted',
      });

      router.push(`/teacher/courses/${courseId}`);
      router.refresh();
    } catch (error) {
      toast({ isError: true, description: (error as Error)?.message ?? '' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center  gap-x-2">
      <Button
        onClick={handleTogglePublication}
        disabled={disabled || isLoading}
        variant="outline"
        size="sm"
      >
        {isPublished ? 'Unpublish' : 'Publish'}
      </Button>
      <ConfirmModal onConfirm={handleDelete}>
        <Button disabled={isLoading} size="sm">
          <Trash2 className="h-4 w-4" />
        </Button>
      </ConfirmModal>
    </div>
  );
};
