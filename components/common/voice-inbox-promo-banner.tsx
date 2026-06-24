'use client';

import { hasCookie, setCookie } from 'cookies-next';
import { Mic, Sparkles, X } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { ONE_WEEK_SEC } from '@/constants/common';
import { cn } from '@/lib/utils';

const PROMO_BANNER_COOKIE = 'voice-inbox-promo-dismissed';
const VOICE_INBOX_URL = 'https://voice-inbox.online/';

type VoiceInboxPromoBannerProps = {
  className?: string;
};

export const VoiceInboxPromoBanner = ({ className }: VoiceInboxPromoBannerProps) => {
  const t = useTranslations('voice-inbox-promo');

  const [isDismissed, setIsDismissed] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setIsDismissed(hasCookie(PROMO_BANNER_COOKIE));
  }, []);

  const handleDismiss = () => {
    setCookie(PROMO_BANNER_COOKIE, 'true', { maxAge: ONE_WEEK_SEC });
    setIsDismissed(true);
  };

  if (!isMounted || isDismissed) {
    return null;
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl p-4',
        'bg-gradient-to-br from-violet-600 via-indigo-600 to-fuchsia-600',
        'shadow-lg shadow-violet-500/30 ring-1 ring-white/20',
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-fuchsia-400/40 blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-8 -left-4 h-20 w-20 rounded-full bg-cyan-400/30 blur-2xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.15)_50%,transparent_70%)] bg-[length:200%_100%] animate-promo-shimmer"
      />

      <button
        aria-label={t('dismiss')}
        className="absolute top-2 right-2 z-10 rounded-md p-1 text-white/70 transition-colors hover:bg-white/15 hover:text-white"
        onClick={handleDismiss}
        type="button"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <div className="relative flex items-start gap-3 pr-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm ring-1 ring-white/30 shadow-inner">
          <Mic className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-300" />
            <h2 className="font-semibold tracking-tight text-sm text-white leading-snug">
              {t('bannerTitle')}
            </h2>
          </div>
          <p className="text-xs leading-relaxed text-white/85 mb-3">{t('bannerBody')}</p>
          <Link
            className={cn(
              'inline-flex w-full items-center justify-center rounded-lg px-3 py-2',
              'bg-white text-sm font-semibold text-indigo-700',
              'shadow-md shadow-black/10 transition-all',
              'hover:bg-white/95 hover:shadow-lg hover:-translate-y-px',
            )}
            href={VOICE_INBOX_URL}
            rel="noopener noreferrer"
            target="_blank"
          >
            {t('cta')}
          </Link>
        </div>
      </div>
    </div>
  );
};
