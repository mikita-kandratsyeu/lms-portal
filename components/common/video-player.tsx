'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { QualityOption } from '@/components/common/video-player-controls';
import { VideoPlayerControls } from '@/components/common/video-player-controls';
import { useVideoStore } from '@/hooks/store/use-video-store';
import { isFunction, isNumber } from '@/lib/guard';

export type VideoPlayerProps = {
  autoPlay?: boolean;
  id?: string;
  onEnded?: () => void;
  onReady?: () => void;
  qualities?: QualityOption[];
  showControls?: boolean;
  videoUrl: string;
};

const playerWrapperClassName =
  'relative w-full overflow-hidden rounded-xl border border-border bg-muted shadow-sm ring-1 ring-black/5 dark:ring-white/5 [--video-aspect:16/9] min-h-0';

type ReactPlayerRef = {
  getCurrentTime: () => number;
  getInternalPlayer: () => unknown;
  seekTo: (amount: number, type?: 'seconds' | 'fraction', keepPlaying?: boolean) => void;
};

export const VideoPlayer = ({
  autoPlay = false,
  id,
  onEnded,
  onReady,
  qualities,
  showControls = true,
  videoUrl,
}: VideoPlayerProps) => {
  const ReactPlayer = useMemo(() => dynamic(() => import('react-player/lazy'), { ssr: false }), []);

  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<ReactPlayerRef | null>(null);

  const { setVideo } = useVideoStore((state) => ({ setVideo: state.setVideo }));

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [selectedQualityUrl, setSelectedQualityUrl] = useState<string | undefined>(undefined);

  const isGoogleDrivePlayer = videoUrl.includes('drive.google.com');
  const isGoogleSlidesPlayer = videoUrl.includes('docs.google.com');
  const isVKPlayer = videoUrl.includes('vk.com');

  const effectiveUrl = qualities?.length
    ? selectedQualityUrl ?? qualities[0]?.url ?? videoUrl
    : videoUrl;

  const url = useMemo(() => new URL(effectiveUrl), [effectiveUrl]);
  const useCustomControls = showControls;

  const handleSetDuration = useCallback(
    (d: unknown) => {
      if (isNumber(d) && d > 0) {
        setDuration(d);
        if (id) {
          setVideo({ id: `${id}-${videoUrl}`, duration: Math.ceil(d) });
        }
      }
    },
    [id, videoUrl, setVideo],
  );

  const handleProgress = useCallback((state: { playedSeconds: number }) => {
    setCurrentTime(state.playedSeconds);
  }, []);

  const handlePlay = useCallback(() => setIsPlaying(true), []);
  const handlePause = useCallback(() => setIsPlaying(false), []);

  const handleReady = useCallback(() => {
    setIsPlaying(autoPlay);
    const internal = playerRef.current?.getInternalPlayer?.();
    if (internal && isNumber((internal as HTMLVideoElement).playbackRate)) {
      setPlaybackRate((internal as HTMLVideoElement).playbackRate);
    }
    onReady?.();
  }, [autoPlay, onReady]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  useEffect(() => {
    if (!useCustomControls) return;
    const internal = playerRef.current?.getInternalPlayer?.();
    if (!internal) return;
    if (isNumber((internal as HTMLVideoElement).volume)) {
      (internal as HTMLVideoElement).volume = volume;
      (internal as HTMLVideoElement).muted = muted;
    } else if (isFunction((internal as { setVolume?: (v: number) => void }).setVolume)) {
      (internal as { setVolume: (v: number) => void }).setVolume(muted ? 0 : volume * 100);
    }
  }, [muted, useCustomControls, volume]);

  const commonProps = {
    height: '100%',
    onEnded,
    width: '100%',
  };

  if (isGoogleDrivePlayer || isGoogleSlidesPlayer || isVKPlayer) {
    if (autoPlay && !isGoogleDrivePlayer) {
      url.searchParams.append('autoplay', '1');
    }

    return (
      <div
        ref={containerRef}
        className={playerWrapperClassName}
        style={{ aspectRatio: 'var(--video-aspect)' }}
        onContextMenu={handleContextMenu}
      >
        <iframe
          {...commonProps}
          allow="autoplay screen-wake-lock=*"
          allowFullScreen
          className="absolute inset-0 border-0"
          onDurationChange={() => handleSetDuration(0)}
          onLoad={onReady}
          src={url.toString()}
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={playerWrapperClassName}
      style={{ aspectRatio: 'var(--video-aspect)' }}
      onContextMenu={handleContextMenu}
    >
      <div className="absolute inset-0">
        <ReactPlayer
          key={effectiveUrl}
          ref={playerRef as React.RefObject<ReactPlayerRef>}
          {...commonProps}
          className="react-player"
          config={{
            file: {
              attributes: {
                controlsList: 'nodownload',
                disablePictureInPicture: true,
                disableRemotePlayback: true,
              },
            },
          }}
          controls={!useCustomControls}
          onDuration={handleSetDuration}
          onPause={handlePause}
          onPlay={handlePlay}
          onProgress={handleProgress}
          onReady={handleReady}
          playing={useCustomControls ? isPlaying : autoPlay}
          url={url.toString()}
        />
      </div>

      {useCustomControls && (
        <VideoPlayerControls
          containerRef={containerRef}
          currentTime={currentTime}
          duration={duration}
          isPlaying={isPlaying}
          muted={muted}
          onMutedChange={setMuted}
          onPlayPause={() => setIsPlaying((p) => !p)}
          onPlaybackRateChange={setPlaybackRate}
          onVolumeChange={setVolume}
          playbackRate={playbackRate}
          playerRef={
            playerRef as React.RefObject<{
              seekTo: (a: number, t?: string) => void;
              getInternalPlayer: () => unknown;
            } | null>
          }
          qualities={qualities}
          selectedQualityUrl={selectedQualityUrl}
          onQualitySelect={qualities && qualities.length > 0 ? setSelectedQualityUrl : undefined}
          showControls={showControls}
          volume={volume}
        />
      )}
    </div>
  );
};
