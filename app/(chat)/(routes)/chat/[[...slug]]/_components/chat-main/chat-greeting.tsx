'use client';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui';
import { getFallbackName } from '@/lib/utils';

type ChatGreetingProps = {
  assistantName?: string | null;
  assistantPicture?: string | null;
};

export const ChatGreeting = ({ assistantName, assistantPicture }: ChatGreetingProps) => {
  const t = useTranslations('chat.body');

  return (
    <div className="px-4 size-full flex flex-col justify-center mb-4">
      {assistantName && (
        <div className="flex justify-center my-4">
          <Avatar className="border dark:border-muted-foreground">
            <AvatarImage src={assistantPicture ?? ''} />
            <AvatarFallback>{getFallbackName(assistantName)}</AvatarFallback>
          </Avatar>
        </div>
      )}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.4 }}
        className="text-2xl font-semibold"
      >
        {t('greeting')}
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.3 }}
        className="text-2xl text-zinc-500"
      >
        {t('title')}
      </motion.div>
    </div>
  );
};
