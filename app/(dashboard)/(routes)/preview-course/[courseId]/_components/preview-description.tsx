'use client';

import { format } from 'date-fns';
import { BookA, CalendarDays } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';

import { StreamText } from '@/components/ai-agents/stream-text';
import { TextBadge } from '@/components/common/text-badge';
import { UserHoverCard } from '@/components/common/user-hover-card';
import { Button } from '@/components/ui';
import { ChatCompletionRole } from '@/constants/ai/general';
import { USER_TRANSLATE_PROMPT } from '@/constants/ai/prompts';
import { TIMESTAMP_PREVIEW_TEMPLATE } from '@/constants/common';
import { useCurrentUser } from '@/hooks/use-current-user';

type PreviewDescriptionProps = {
  author?: string | null;
  authorUserId?: string | null;
  categories: string[];
  customTags?: string[];
  description: string;
  id: string;
  language: string | null;
  lastUpdate: Date;
  title: string;
};

export const PreviewDescription = ({
  author,
  authorUserId,
  categories,
  customTags,
  description,
  id,
  language,
  lastUpdate,
  title,
}: PreviewDescriptionProps) => {
  const t = useTranslations('courses.preview.preview');
  const currentLocale = useLocale();
  const { user } = useCurrentUser();

  const [translatedDescription, setTranslatedDescription] = useState('');

  return (
    <div className="border rounded-lg p-6 space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-2xl capitalize">{title}</h3>
          {Boolean(user?.userId) && language !== currentLocale && (
            <StreamText
              cacheKey={`preview-course-description-[${id}]::user-[${user?.userId}]-[${currentLocale}]`}
              isTranslateButton
              callback={setTranslatedDescription}
              messages={[
                {
                  role: ChatCompletionRole.USER,
                  content: USER_TRANSLATE_PROMPT(description, currentLocale),
                },
              ]}
            />
          )}
        </div>
        <div className="space-y-4">
          {Boolean(customTags?.length || categories.length) && (
            <div className="flex gap-2 items-center flex-wrap">
              {categories.map((category) => (
                <TextBadge key={category} label={category} variant="indigo" />
              ))}
              {customTags?.map((tag) => <TextBadge key={tag} label={tag} variant="yellow" />)}
            </div>
          )}
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="text-muted-foreground leading-relaxed">
              {translatedDescription || description}
            </p>
          </div>
        </div>
      </div>
      <div className="pt-4 space-y-1">
        <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
          {t('additionalInfo')}
        </h4>
        {author && authorUserId && (
          <UserHoverCard userId={authorUserId}>
            <Button
              className="flex items-center gap-x-2 text-muted-foreground p-0 font-normal hover:text-foreground"
              variant="link"
            >
              <BookA className="h-4 w-4" />
              <span className="text-sm">{t('author', { author })}</span>
            </Button>
          </UserHoverCard>
        )}
        <div className="flex items-center gap-x-2 text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          <span className="text-sm">
            {t('lastUpdated')}&nbsp;{format(lastUpdate, TIMESTAMP_PREVIEW_TEMPLATE)}
          </span>
        </div>
      </div>
    </div>
  );
};
