'use client';

import { hasCookie, setCookie } from 'cookies-next';
import { ArrowUpRight, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { ONE_WEEK_SEC } from '@/constants/common';
import { cn } from '@/lib/utils';

const PROMO_BANNER_COOKIE = 'voice-inbox-promo-dismissed';
const VOICE_INBOX_URL = 'https://voice-inbox.online/';
const VOICE_INBOX_APP_ICON = '/assets/voice-inbox-app-icon.svg';

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
        'group relative overflow-hidden rounded-2xl p-3.5',
        'bg-[linear-gradient(145deg,#5b21b6_0%,#4f46e5_45%,#7c3aed_100%)]',
        'shadow-[0_8px_32px_-8px_rgba(91,33,182,0.55)] ring-1 ring-inset ring-white/15',
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35] bg-[radial-gradient(circle_at_0%_0%,rgba(255,255,255,0.22),transparent_42%),radial-gradient(circle_at_100%_100%,rgba(236,72,153,0.28),transparent_40%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:radial-gradient(rgba(255,255,255,0.9)_0.6px,transparent_0.6px)] [background-size:10px_10px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(105deg,transparent_35%,rgba(255,255,255,0.1)_50%,transparent_65%)] bg-[length:220%_100%] animate-promo-shimmer"
      />

      <button
        aria-label={t('dismiss')}
        className="absolute top-2.5 right-2.5 z-10 rounded-full p-1 text-white/55 transition-colors hover:bg-black/10 hover:text-white"
        onClick={handleDismiss}
        type="button"
      >
        <X className="h-3.5 w-3.5" />
      </button>

      <div className="relative">
        <div className="mb-3 flex items-center justify-between pr-6">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-[31%]">
            <Image
              alt={t('bannerTitle')}
              className="h-full w-full object-cover"
              height={40}
              src={VOICE_INBOX_APP_ICON}
              unoptimized
              width={40}
            />
          </div>
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1',
              'bg-gradient-to-r from-amber-200 via-amber-300 to-orange-300',
              'text-[10px] font-bold uppercase tracking-[0.08em] text-amber-950',
              'shadow-[0_2px_8px_rgba(251,191,36,0.35)] ring-1 ring-amber-100/80',
            )}
          >
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-700/50" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-800" />
            </span>
            {t('badge')}
          </span>
        </div>

        <h2 className="mb-1.5 text-[15px] font-semibold leading-tight tracking-tight text-white">
          {t('bannerTitle')}
        </h2>
        <p className="mb-3.5 text-[12px] leading-[1.45] text-white/78">{t('bannerBody')}</p>

        <Link
          className={cn(
            'group/btn flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2.5',
            'bg-white text-[13px] font-semibold text-violet-700',
            'shadow-[0_2px_12px_rgba(0,0,0,0.12)] transition-all duration-200',
            'hover:bg-violet-50 hover:shadow-[0_4px_16px_rgba(0,0,0,0.16)] active:scale-[0.98]',
          )}
          href={VOICE_INBOX_URL}
          rel="noopener noreferrer"
          target="_blank"
        >
          {t('cta')}
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
        </Link>
      </div>
    </div>
  );
};
