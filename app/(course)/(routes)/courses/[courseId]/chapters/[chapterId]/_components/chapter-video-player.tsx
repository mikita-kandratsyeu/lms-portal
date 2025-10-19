'use client';

import { Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { VideoPlayer } from '@/components/common/video-player';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/use-toast';
import { useConfettiStore } from '@/hooks/store/use-confetti-store';
import { fetcher } from '@/lib/fetcher';
import { cn } from '@/lib/utils';

type ChapterVideoPlayerProps = {
  chapterId: string;
  completeOnEnd?: boolean;
  courseId: string;
  isLocked: boolean;
  nextChapterId?: string;
  videoUrl?: string | null;
};

export const ChapterVideoPlayer = ({
  chapterId,
  completeOnEnd = false,
  courseId,
  isLocked,
  nextChapterId,
  videoUrl,
}: ChapterVideoPlayerProps) => {
  const t = useTranslations('courses.video-player');

  const { toast } = useToast();
  const router = useRouter();

  const [isReady, setIsReady] = useState(false);

  const handleOpenConfetti = useConfettiStore((state) => state.onOpen);

  const handleEnd = async () => {
    if (completeOnEnd) {
      try {
        await fetcher.put(`/api/courses/${courseId}/chapters/${chapterId}/progress`, {
          body: { isCompleted: true },
        });

        if (!nextChapterId) {
          handleOpenConfetti();
        } else {
          router.push(`/courses/${courseId}/chapters/${nextChapterId}`);
        }

        toast({ title: t('progress') });
        router.refresh();
      } catch (error) {
        toast({
          isError: true,
        });
      }
    }
  };

  return (
    <div className="relative aspect-w-16 aspect-h-9">
      {!isReady && !isLocked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted gap-y-2 ">
          <Spinner className="h-8 w-8 text-secondary-foreground" />
          <p className="text-sm">{t('loading')}</p>
        </div>
      )}
      {isLocked && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted gap-y-2 text-secondary-foreground">
          <Lock className="h-8 w-8" />
          <p className="text-sm">{t('lock')}</p>
        </div>
      )}
      {!isLocked && videoUrl && (
        <div className={cn(!isReady && 'hidden')}>
          <VideoPlayer
            autoPlay
            onEnded={handleEnd}
            onReady={() => setIsReady(true)}
            videoUrl={videoUrl}
          />
        </div>
      )}
    </div>
  );
};
