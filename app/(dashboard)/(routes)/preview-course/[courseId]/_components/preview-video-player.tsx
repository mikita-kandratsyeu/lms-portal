'use client';

import { Lock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { VideoPlayer } from '@/components/common/video-player';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

type PreviewVideoPlayerProps = { videoUrl?: string | null; isLocked?: boolean };

export const PreviewVideoPlayer = ({ videoUrl, isLocked = false }: PreviewVideoPlayerProps) => {
  const t = useTranslations('courses.preview.preview');

  const [isReady, setIsReady] = useState(false);

  return (
    <div className="relative aspect-w-16 aspect-h-9">
      {!isReady && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted gap-y-2 border">
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
          <VideoPlayer onReady={() => setIsReady(true)} videoUrl={videoUrl} />
        </div>
      )}
    </div>
  );
};
