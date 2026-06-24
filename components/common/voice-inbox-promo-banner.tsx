'use client';

import { hasCookie, setCookie } from 'cookies-next';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Mic, X } from 'lucide-react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { ONE_WEEK_SEC } from '@/constants/common';
import { cn } from '@/lib/utils';

const PROMO_BANNER_COOKIE = 'voice-inbox-promo-dismissed';
const VOICE_INBOX_URL = 'https://voice-inbox.online/';

export const VoiceInboxPromoBanner = () => {
  const t = useTranslations('voice-inbox-promo');

  const [isDismissed, setIsDismissed] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setIsDismissed(hasCookie(PROMO_BANNER_COOKIE));
  }, []);

  useEffect(() => {
    const height = isMounted && !isDismissed ? 'var(--promo-banner-active-height)' : '0px';
    document.documentElement.style.setProperty('--promo-banner-height', height);

    return () => {
      document.documentElement.style.setProperty('--promo-banner-height', '0px');
    };
  }, [isDismissed, isMounted]);

  const handleDismiss = () => {
    setCookie(PROMO_BANNER_COOKIE, 'true', { maxAge: ONE_WEEK_SEC });
    setIsDismissed(true);
  };

  const isVisible = isMounted && !isDismissed;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          animate={{ height: 'var(--promo-banner-active-height)', opacity: 1 }}
          className="fixed top-0 left-0 right-0 z-[60] overflow-hidden"
          exit={{ height: 0, opacity: 0 }}
          initial={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className={cn(
              'relative h-[var(--promo-banner-active-height)] flex items-center',
              'bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700',
              'text-white text-sm',
            )}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.12)_50%,transparent_75%)] bg-[length:200%_100%] animate-promo-shimmer"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.07] bg-[radial-gradient(circle_at_20%_50%,white,transparent_50%),radial-gradient(circle_at_80%_50%,white,transparent_50%)]"
            />

            <div className="relative flex w-full items-center gap-2 px-3 sm:gap-3 sm:px-4">
              <div className="flex min-w-0 flex-1 items-center justify-center gap-2 sm:gap-3">
                <div className="hidden sm:flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm ring-1 ring-white/20">
                  <Mic className="h-3.5 w-3.5" />
                </div>

                <span className="shrink-0 rounded-full bg-white/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ring-1 ring-white/20 sm:text-[11px]">
                  {t('badge')}
                </span>

                <p className="min-w-0 truncate text-center text-xs font-medium sm:text-sm">
                  <span className="font-semibold">{t('title')}</span>
                  <span className="hidden text-white/80 sm:inline"> — {t('description')}</span>
                </p>

                <Link
                  className={cn(
                    'group shrink-0 inline-flex items-center gap-1 rounded-full',
                    'bg-white px-2.5 py-1 text-[11px] font-semibold text-indigo-700',
                    'transition-all hover:bg-white/90 hover:shadow-md sm:px-3 sm:text-xs',
                  )}
                  href={VOICE_INBOX_URL}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  {t('cta')}
                  <ArrowUpRight className="h-3 w-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </div>

              <button
                aria-label={t('dismiss')}
                className={cn(
                  'shrink-0 rounded-md p-1.5 text-white/70 transition-colors',
                  'hover:bg-white/10 hover:text-white',
                )}
                onClick={handleDismiss}
                type="button"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
