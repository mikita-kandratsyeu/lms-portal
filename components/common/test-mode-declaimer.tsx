'use client';

import { hasCookie, setCookie } from 'cookies-next';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { ONE_DAY_SEC } from '@/constants/common';

import { useToast as useToastProvider } from '../ui/use-toast';

type TestModeDeclaimerProps = {
  useToast?: boolean;
  useBanner?: boolean;
};

export const TestModeDeclaimer = ({ useBanner, useToast }: TestModeDeclaimerProps) => {
  const t = useTranslations('footer');

  const { toast } = useToastProvider();

  const [shownDeclaimer, setShownDeclaimer] = useState(true);

  const handleAcceptDeclaimer = () => {
    setCookie('test-mode-declaimer', 'true', { maxAge: ONE_DAY_SEC });
    setShownDeclaimer(true);
  };

  useEffect(() => {
    const hasShownContent = hasCookie('test-mode-declaimer');

    if (!hasShownContent && useToast) {
      toast({
        action: { label: 'OK', onClick: handleAcceptDeclaimer },
        duration: Infinity,
        title: t('testModeDeclaimer'),
      });
    }

    setShownDeclaimer(hasShownContent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (shownDeclaimer || useToast) {
    return null;
  }

  if (useBanner) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 0 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.5 }}
        className="fixed flex items-center justify-between w-full p-2 bg-orange-500 text-white font-semibold text-xs z-[100]"
      >
        <p className="flex-grow text-center">{t('testModeDeclaimer')}</p>
        <button onClick={handleAcceptDeclaimer} className="ml-auto px-2">
          <X className="h-4 w-4" />
        </button>
      </motion.div>
    );
  }

  return null;
};
