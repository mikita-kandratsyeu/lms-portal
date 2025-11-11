'use client';

import 'react-quill-new/dist/quill.bubble.css';

import dynamic from 'next/dynamic';
import { useLocale } from 'next-intl';
import { useMemo, useState } from 'react';

import { ChatCompletionRole } from '@/constants/ai/general';
import { USER_TRANSLATE_PROMPT } from '@/constants/ai/prompts';
import { useCurrentUser } from '@/hooks/use-current-user';

import { StreamText } from '../ai-agents/stream-text';

type PreviewProps = {
  enableTranslate?: boolean;
  id: string;
  language?: string | null;
  value: string;
};

export const Preview = ({ enableTranslate, id, language, value }: PreviewProps) => {
  const ReactQuill = useMemo(() => dynamic(() => import('react-quill-new'), { ssr: false }), []);

  const currentLocale = useLocale();
  const { user } = useCurrentUser();

  const [translatedDescription, setTranslatedDescription] = useState('');

  return (
    <>
      {Boolean(user?.userId) && enableTranslate && language !== currentLocale && (
        <div className="p-4">
          <StreamText
            cacheKey={`preview-chapter-description-[${id}]::user-[${user?.userId}]-[${currentLocale}]`}
            isTranslateButton
            callback={setTranslatedDescription}
            messages={[
              {
                role: ChatCompletionRole.USER,
                content: USER_TRANSLATE_PROMPT(value, currentLocale),
              },
            ]}
          />
        </div>
      )}
      <ReactQuill
        className="dark:bg-neutral-950 text-primary"
        theme="bubble"
        value={translatedDescription || value}
        readOnly
      />
    </>
  );
};
