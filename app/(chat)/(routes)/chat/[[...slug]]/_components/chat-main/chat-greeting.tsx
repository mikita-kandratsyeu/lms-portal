'use client';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';

export const ChatGreeting = () => {
  const t = useTranslations('chat.body');

  return (
    <div className="px-4 size-full flex flex-col justify-center mb-4">
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
