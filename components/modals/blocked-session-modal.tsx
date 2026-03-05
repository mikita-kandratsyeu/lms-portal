'use client';

import { signOut, useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import Pusher from 'pusher-js';
import { useEffect, useRef, useState } from 'react';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui';
import { BLOCK_CHANNEL_PREFIX, BLOCK_EVENT_PREFIX } from '@/constants/block';
import { useCurrentUser } from '@/hooks/use-current-user';

const AUTO_SIGNOUT_DELAY_MS = 5000;

type BlockPayload = {
  blockedReason: string | null;
  blockedUntil: string | null;
};

export const BlockedSessionModal = () => {
  const t = useTranslations('blocked.sessionModal');
  const { user } = useCurrentUser();
  const { data: session } = useSession();

  const [open, setOpen] = useState(false);
  const [payload, setPayload] = useState<BlockPayload | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [countdown, setCountdown] = useState(AUTO_SIGNOUT_DELAY_MS / 1000);

  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleSignOut = () => {
    setIsSigning(true);
    if (countdownRef.current) clearInterval(countdownRef.current);
    signOut({ callbackUrl: '/' });
  };

  useEffect(() => {
    if (!open) return;

    setCountdown(AUTO_SIGNOUT_DELAY_MS / 1000);

    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current!);
          handleSignOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [open]);

  // Detect block from session data (covers "return after browser close" case)
  useEffect(() => {
    if (open) return;

    if (session?.user?.isBlocked) {
      setPayload({
        blockedReason: session.user.blockedReason ?? null,
        blockedUntil: session.user.blockedUntil ?? null,
      });
      setOpen(true);
    }
  }, [session?.user?.isBlocked, session?.user?.blockedReason, session?.user?.blockedUntil, open]);

  // Detect block via real-time Pusher (covers "blocked while session is active" case)
  useEffect(() => {
    if (!user?.userId) return;

    const pusherClient = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY as string, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER as string,
    });

    const channelName = `${BLOCK_CHANNEL_PREFIX}${user.userId}`;
    const channel = pusherClient.subscribe(channelName);

    const handleBlock = (data: BlockPayload) => {
      setPayload(data);
      setOpen(true);
    };

    const eventName = `${BLOCK_EVENT_PREFIX}${user.userId}`;

    channel.bind(eventName, handleBlock);

    return () => {
      channel.unbind(eventName, handleBlock);
      pusherClient.unsubscribe(channelName);
    };
  }, [user?.userId]);

  if (!user?.userId) return null;

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        hideCloseButton
      >
        <DialogHeader>
          <DialogTitle className="text-destructive">{t('title')}</DialogTitle>
          <DialogDescription>{t('body')}</DialogDescription>
        </DialogHeader>

        {payload?.blockedReason && (
          <div className="rounded-md border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400 mb-1">
              {t('reasonLabel')}
            </p>
            <p className="text-sm text-foreground">{payload.blockedReason}</p>
          </div>
        )}

        <DialogFooter>
          <Button variant="destructive" onClick={handleSignOut} disabled={isSigning}>
            {isSigning ? t('signingOut') : `${t('signOut')} (${countdown})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
