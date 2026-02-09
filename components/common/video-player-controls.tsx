'use client';

import {
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Settings2,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { isFunction, isNumber } from '@/lib/guard';
import { cn } from '@/lib/utils';

const PLAYBACK_SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] as const;

function formatTime(seconds: number): string {
  if (!isNumber(seconds) || seconds < 0) return '0:00';

  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);

  return `${m}:${s.toString().padStart(2, '0')}`;
}

export type QualityOption = { label: string; url: string };

type VideoPlayerControlsProps = {
  containerRef: React.RefObject<HTMLDivElement | null>;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  muted: boolean;
  onMutedChange: (muted: boolean) => void;
  onPlayPause: () => void;
  onPlaybackRateChange?: (rate: number) => void;
  onVolumeChange: (value: number) => void;
  playbackRate: number;
  playerRef: React.RefObject<{
    seekTo: (a: number, t?: string) => void;
    getInternalPlayer: () => unknown;
  } | null>;
  onQualitySelect?: (url: string) => void;
  qualities?: QualityOption[];
  selectedQualityUrl?: string;
  showControls: boolean;
  volume: number;
};

export function VideoPlayerControls({
  containerRef,
  currentTime,
  duration,
  isPlaying,
  muted,
  onMutedChange,
  onPlaybackRateChange,
  onPlayPause,
  onVolumeChange,
  playbackRate,
  playerRef,
  qualities = [],
  selectedQualityUrl,
  onQualitySelect,
  showControls,
  volume,
}: VideoPlayerControlsProps) {
  const t = useTranslations('courses.video-player.controls');

  const [controlsVisible, setControlsVisible] = useState(true);
  const [progressValue, setProgressValue] = useState(0);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  useEffect(() => {
    setProgressValue(progressPercent);
  }, [progressPercent]);

  const handleSeek = useCallback(
    (value: number[]) => {
      const v = value[0];

      if (!Number.isFinite(v) || duration <= 0) return;

      const seconds = (v / 100) * duration;

      playerRef.current?.seekTo(seconds, 'seconds');
      setProgressValue(v);
    },
    [duration, playerRef],
  );

  const skip = useCallback(
    (delta: number) => {
      let current = currentTime;

      const internal = playerRef.current?.getInternalPlayer?.();

      if (internal) {
        if (isNumber((internal as HTMLVideoElement).currentTime)) {
          current = (internal as HTMLVideoElement).currentTime;
        } else if (isFunction((internal as any).getCurrentTime)) {
          current = (internal as any).getCurrentTime();
        }
      }

      const next = Math.max(0, Math.min(duration, current + delta));
      playerRef.current?.seekTo(next, 'seconds');
    },
    [currentTime, duration, playerRef],
  );

  const setRate = useCallback(
    (rate: number) => {
      const internal = playerRef.current?.getInternalPlayer?.();

      if (!internal) return;

      if (isFunction((internal as { setPlaybackRate?: (r: number) => void }).setPlaybackRate)) {
        (internal as { setPlaybackRate: (r: number) => void }).setPlaybackRate(rate);
      } else if (typeof (internal as HTMLVideoElement).playbackRate !== 'undefined') {
        (internal as HTMLVideoElement).playbackRate = rate;
      }
      onPlaybackRateChange?.(rate);
    },
    [onPlaybackRateChange, playerRef],
  );

  const toggleFullscreen = useCallback(() => {
    const el = containerRef.current;

    if (!el) return;

    if (!document.fullscreenElement) {
      el.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }, [containerRef]);

  const showControlsTemporarily = useCallback(() => {
    setControlsVisible(true);

    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);

    hideTimeoutRef.current = setTimeout(() => setControlsVisible(false), 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  const showBar = showControls && (controlsVisible || !isPlaying);
  const hasQuality = qualities.length > 1 && onQualitySelect;

  if (!showControls) return null;

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className={cn(
          'absolute inset-0 z-10 flex flex-col justify-end transition-opacity duration-200',
          showBar ? 'opacity-100' : 'opacity-0',
        )}
        onMouseMove={showControlsTemporarily}
        onMouseLeave={() => setControlsVisible(false)}
        onTouchStart={showControlsTemporarily}
        onClick={(e) => {
          if (!showBar) {
            e.stopPropagation();
            onPlayPause();
          }
        }}
      >
        <div className="bg-gradient-to-t from-black/50 via-black/20 to-transparent pt-8 pb-0">
          <div className="group/progress w-full px-3 pt-3 pb-2 sm:pt-2 sm:pb-0 min-h-[44px] sm:min-h-0 flex items-center">
            <Slider
              value={[progressValue]}
              onValueChange={handleSeek}
              max={100}
              step={0.1}
              className="video-progress h-2 sm:h-2 cursor-pointer touch-manipulation [&_[data-orientation=horizontal]]:cursor-pointer [&_[data-orientation=horizontal]]:touch-manipulation"
            />
          </div>
          <div className="flex items-center justify-between gap-2 px-2 sm:px-2 pt-1 sm:pt-0 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] sm:pb-2">
            <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 min-h-[44px] min-w-[44px] sm:h-9 sm:w-9 sm:min-h-0 sm:min-w-0 shrink-0 text-white hover:bg-white/20 hover:text-white touch-manipulation"
                    onClick={onPlayPause}
                  >
                    {isPlaying ? (
                      <Pause className="h-5 w-5 sm:h-5 sm:w-5" />
                    ) : (
                      <Play className="h-5 w-5 sm:h-5 sm:w-5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">{t('playPause')}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 min-h-[44px] min-w-[44px] sm:h-9 sm:w-9 sm:min-h-0 sm:min-w-0 shrink-0 text-white hover:bg-white/20 hover:text-white touch-manipulation"
                    onClick={() => skip(-10)}
                  >
                    <RotateCcw className="h-5 w-5 sm:h-4 sm:w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">{t('skipBack')}</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 min-h-[44px] min-w-[44px] sm:h-9 sm:w-9 sm:min-h-0 sm:min-w-0 shrink-0 text-white hover:bg-white/20 hover:text-white touch-manipulation"
                    onClick={() => skip(10)}
                  >
                    <RotateCw className="h-5 w-5 sm:h-4 sm:w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">{t('skipForward')}</TooltipContent>
              </Tooltip>

              <span className="ml-0.5 min-w-[3.5rem] sm:min-w-[4rem] text-xs sm:text-xs text-white/90 tabular-nums select-none shrink-0">
                {formatTime(currentTime)}/{formatTime(duration)}
              </span>
            </div>
            <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 min-h-[44px] min-w-[44px] sm:h-9 sm:w-9 sm:min-h-0 sm:min-w-0 shrink-0 text-white hover:bg-white/20 hover:text-white touch-manipulation"
                    onClick={() => onMutedChange(!muted)}
                  >
                    {muted || volume === 0 ? (
                      <VolumeX className="h-5 w-5 sm:h-4 sm:w-4" />
                    ) : (
                      <Volume2 className="h-5 w-5 sm:h-4 sm:w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">{muted ? t('unmute') : t('mute')}</TooltipContent>
              </Tooltip>
              <div className="hidden sm:flex items-center gap-0.5">
                <Slider
                  value={[muted ? 0 : volume * 100]}
                  onValueChange={(v) => {
                    onVolumeChange(v[0] / 100);
                    if (v[0] > 0) onMutedChange(false);
                  }}
                  max={100}
                  step={1}
                  className="video-progress w-20 [&_[data-orientation=horizontal]]:cursor-pointer"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 min-h-[44px] min-w-[44px] sm:h-9 sm:w-9 sm:min-h-0 sm:min-w-0 shrink-0 text-white hover:bg-white/20 hover:text-white touch-manipulation sm:hidden"
                  >
                    <Settings2 className="h-5 w-5 sm:h-4 sm:w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  side="top"
                  className="min-w-[10rem] max-h-[70vh] overflow-y-auto"
                >
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    {t('speed')}
                  </DropdownMenuLabel>
                  {PLAYBACK_SPEEDS.map((speed) => (
                    <DropdownMenuItem
                      key={speed}
                      onClick={() => setRate(speed)}
                      className={cn(playbackRate === speed && 'bg-accent')}
                    >
                      {speed}x
                    </DropdownMenuItem>
                  ))}
                  {hasQuality && onQualitySelect && qualities.length > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel className="text-xs text-muted-foreground">
                        {t('quality')}
                      </DropdownMenuLabel>
                      {qualities.map((q) => (
                        <DropdownMenuItem
                          key={q.url}
                          onClick={() => onQualitySelect(q.url)}
                          className={cn(selectedQualityUrl === q.url && 'bg-accent')}
                        >
                          {q.label}
                        </DropdownMenuItem>
                      ))}
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden sm:inline-flex h-9 shrink-0 px-2 text-white hover:bg-white/20 hover:text-white"
                  >
                    <Settings2 className="mr-1 h-4 w-4" />
                    <span className="tabular-nums">{playbackRate}x</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-[7rem]">
                  {PLAYBACK_SPEEDS.map((speed) => (
                    <DropdownMenuItem
                      key={speed}
                      onClick={() => setRate(speed)}
                      className={cn(playbackRate === speed && 'bg-accent')}
                    >
                      {speed}x
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              {hasQuality && onQualitySelect && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hidden sm:inline-flex h-9 shrink-0 px-2 text-white hover:bg-white/20 hover:text-white text-xs"
                    >
                      {t('quality')}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[7rem]">
                    {qualities.map((q) => (
                      <DropdownMenuItem
                        key={q.url}
                        onClick={() => onQualitySelect(q.url)}
                        className={cn(selectedQualityUrl === q.url && 'bg-accent')}
                      >
                        {q.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 min-h-[44px] min-w-[44px] sm:h-9 sm:w-9 sm:min-h-0 sm:min-w-0 shrink-0 text-white hover:bg-white/20 hover:text-white touch-manipulation"
                    onClick={toggleFullscreen}
                  >
                    <Maximize2 className="h-5 w-5 sm:h-4 sm:w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">{t('fullscreen')}</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
