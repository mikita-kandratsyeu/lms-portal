'use client';

import { motion } from 'framer-motion';

const questions = [
  'How to create a product roadmap?',
  'What are the most useful estimation techniques?',
  'Can you convert EST 11:00 AM to Kyiv time?',
];

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

export const ChatStarters = () => {
  return (
    <div className="flex items-center">
      <div className="flex flex-col gap-3 px-4">
        {questions.map((q, i) => (
          <motion.button
            animate="visible"
            className="inline-flex max-w-full rounded-lg bg-muted px-5 py-3 text-left text-sm md:text-base text-muted-foreground"
            custom={i}
            initial="hidden"
            key={q}
            variants={bubbleVariants}
          >
            {q}
          </motion.button>
        ))}
      </div>
    </div>
  );
};
