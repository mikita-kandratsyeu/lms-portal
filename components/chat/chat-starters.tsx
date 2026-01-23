'use client';

import { ChatConversationStarters } from '@prisma/client';
import { motion } from 'framer-motion';
import { SyntheticEvent, useCallback } from 'react';

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
  callback?: (event: SyntheticEvent, value: string) => void;
  isAnimated?: boolean;
  showCopyButton?: boolean;
  starters?: Pick<ChatConversationStarters, 'id' | 'language' | 'text'>[];
};

export const ChatStarters = ({
  callback,
  isAnimated,
  showCopyButton,
  starters = [],
}: ChatStartersProps) => {
  const handleClick = useCallback(
    (event: SyntheticEvent, value: string) => (callback ? callback(event, value) : {}),
    [callback],
  );

  const styles =
    'group w-full rounded-lg border bg-muted/40 px-4 py-3 text-left text-sm text-foreground/80 shadow-sm transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring line-clamp-2';

  return (
    <div className="flex items-center w-full">
      <div className="flex w-full max-w-2xl flex-col items-stretch gap-3 px-4 sm:grid sm:grid-cols-2 sm:px-0">
        {starters.map((starter, index) => {
          const mobileHiddenClass = index > 1 ? 'hidden sm:block' : '';

          if (isAnimated) {
            return (
              <motion.button
                animate="visible"
                className={`${styles} ${mobileHiddenClass}`}
                custom={index}
                initial="hidden"
                key={starter.id}
                variants={bubbleVariants}
                onClick={(event) => handleClick(event, starter.text)}
                type="button"
              >
                {starter.text}
              </motion.button>
            );
          }

          return (
            <div className={`${styles} ${mobileHiddenClass}`} key={starter.id}>
              <div className="flex w-full items-center justify-between gap-x-2">
                <span className="line-clamp-2">{starter.text}</span>
                {showCopyButton && <CopyClipboard textToCopy={starter.text} />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
