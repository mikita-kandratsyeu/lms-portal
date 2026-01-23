'use client';

import { ArrowRight, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button } from '@/components/ui';
import { useToast } from '@/components/ui/use-toast';
import { useConfettiStore } from '@/hooks/store/use-confetti-store';
import { fetcher } from '@/lib/fetcher';

type CourseProgressButton = {
  chapterId: string;
  courseId: string;
  isCompleted?: boolean;
  nextChapterId?: string;
};

export const CourseProgressButton = ({
  chapterId,
  courseId,
  isCompleted,
  nextChapterId,
}: CourseProgressButton) => {
  const t = useTranslations('courses.video-player');

  const { toast } = useToast();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const handleOpenConfetti = useConfettiStore((state) => state.onOpen);

  const handleClick = async () => {
    setIsLoading(true);

    try {
      await fetcher.put(`/api/courses/${courseId}/chapters/${chapterId}/progress`, {
        body: { isCompleted: !isCompleted },
      });

      if (!isCompleted && !nextChapterId) {
        handleOpenConfetti();
      } else if (!isCompleted && nextChapterId) {
        router.push(`/courses/${courseId}/chapters/${nextChapterId}`);
      }

      toast({ title: t('progress') });
      router.refresh();
    } catch (error) {
      toast({ isError: true, description: (error as Error)?.message ?? '' });
    } finally {
      setIsLoading(false);
    }
  };

  const Icon = isCompleted ? XCircle : ArrowRight;

  return (
    <Button
      className="w-full md:w-auto"
      disabled={isLoading}
      onClick={handleClick}
      size="lg"
      type="button"
      variant={isCompleted ? 'outline' : 'success'}
    >
      {t(isCompleted ? 'notCompleted' : 'completed')}
      <Icon className="h-4 w-4 ml-2" />
    </Button>
  );
};
