'use client';

import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { ConfirmModal } from '@/components/modals/confirm-modal';
import { Button } from '@/components/ui';
import { useToast } from '@/components/ui/use-toast';
import { useConfettiStore } from '@/hooks/store/use-confetti-store';
import { fetcher } from '@/lib/fetcher';

type ActionsProps = {
  courseId: string;
  disabled?: boolean;
  hasPurchases?: boolean;
  isPublished?: boolean;
};

export const Actions = ({
  courseId,
  disabled = false,
  hasPurchases = false,
  isPublished = false,
}: ActionsProps) => {
  const { toast } = useToast();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const handleOpenConfetti = useConfettiStore((state) => state.onOpen);

  const handleTogglePublication = async () => {
    setIsLoading(true);

    try {
      await fetcher.patch(`/api/courses/${courseId}/${isPublished ? 'unpublish' : 'publish'}`);

      if (isPublished) {
        toast({ title: 'Course unpublished' });
      } else {
        handleOpenConfetti();
        toast({ title: 'Course has been published' });
      }

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
      await fetcher.delete(`/api/courses/${courseId}`);

      toast({ title: 'Course deleted' });

      router.push(`/teacher/courses`);
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
      {!hasPurchases && (
        <ConfirmModal onConfirm={handleDelete}>
          <Button disabled={isLoading || hasPurchases} size="sm">
            <Trash2 className="h-4 w-4" />
          </Button>
        </ConfirmModal>
      )}
    </div>
  );
};
