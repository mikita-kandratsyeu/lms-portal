'use client';

import { ChatConversationStarters } from '@prisma/client';
import { motion } from 'framer-motion';
import { useCallback } from 'react';

import { CopyClipboard } from '../common/copy-clipboard';

const bubbleVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      delay: i * 0.3,
      ease: 'easeOut',
    },
  }),
};

type ChatStartersProps = {
  callback?: (text: string) => void;
  isAnimated?: boolean;
  showCopyButton?: boolean;
  starters: Pick<ChatConversationStarters, 'id' | 'language' | 'text'>[];
};

export const ChatStarters = ({
  callback,
  isAnimated,
  showCopyButton,
  starters,
}: ChatStartersProps) => {
  const handleClick = useCallback((text: string) => (callback ? callback(text) : {}), [callback]);

  return (
    <div className="flex items-center">
      <div className="flex flex-col gap-3 w-full">
        {starters.map((starter, index) => (
          <motion.button
            animate="visible"
            className="inline-flex max-w-full rounded-lg bg-muted px-5 py-3 text-left text-sm md:text-base text-muted-foreground line-clamp-2 border justify-between items-center gap-x-2"
            custom={index}
            initial="hidden"
            key={starter.id}
            variants={isAnimated ? bubbleVariants : undefined}
            onClick={() => handleClick(starter.text)}
          >
            {starter.text}
            {showCopyButton && <CopyClipboard textToCopy={starter.text} />}
          </motion.button>
        ))}
      </div>
    </div>
  );
};
