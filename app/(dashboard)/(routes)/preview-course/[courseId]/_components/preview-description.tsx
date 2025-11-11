'use client';

import { Fee } from '@prisma/client';
import { format } from 'date-fns';
import { BookA, BookOpen, CalendarDays, Clock9, Languages } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';

import { StreamText } from '@/components/ai-agents/stream-text';
import { IconBadge } from '@/components/common/icon-badge';
import { Price } from '@/components/common/price';
import { TextBadge } from '@/components/common/text-badge';
import { UserHoverCard } from '@/components/common/user-hover-card';
import { Button } from '@/components/ui';
import { ChatCompletionRole } from '@/constants/ai/general';
import { USER_TRANSLATE_PROMPT } from '@/constants/ai/prompts';
import { TIMESTAMP_PREVIEW_TEMPLATE } from '@/constants/common';
import { SUPPORTED_LOCALES } from '@/constants/locale';
import { useCurrentUser } from '@/hooks/use-current-user';
import { formatTimeInSeconds } from '@/lib/date';

type PreviewDescriptionProps = {
  author?: string | null;
  authorUserId?: string | null;
  categories: string[];
  chaptersLength: number;
  customRates: string | null;
  customTags?: string[];
  description: string;
  durationInSec: number;
  fees?: Fee[];
  hasPurchase?: boolean;
  id: string;
  language: string | null;
  lastUpdate: Date;
  price: number | null;
  title: string;
};

export const PreviewDescription = ({
  author,
  authorUserId,
  categories,
  chaptersLength,
  customRates,
  customTags,
  description,
  durationInSec,
  fees,
  hasPurchase,
  id,
  language,
  lastUpdate,
  price,
  title,
}: PreviewDescriptionProps) => {
  const t = useTranslations('courses.preview.preview');
  const currentLocale = useLocale();
  const { user } = useCurrentUser();

  const [translatedDescription, setTranslatedDescription] = useState('');

  const languageTitle = SUPPORTED_LOCALES.find(({ key }) => key === language)?.title;

  return (
    <div className="border rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-1 text-neutral-500 mb-1">
          <IconBadge size="sm" icon={BookOpen} />
          <span className="text-xs">{t('chapter', { amount: chaptersLength })}</span>
        </div>
        {Boolean(user?.userId) && language !== currentLocale && (
          <div className="my-2">
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
          </div>
        )}
      </div>
      <h3 className="font-semibold text-lg md:text-2xl mb-2 capitalize">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{translatedDescription || description}</p>
      {Boolean(customTags?.length) && (
        <div className="flex gap-2 items-center mb-2 flex-wrap">
          {customTags?.map((tag) => <TextBadge key={tag} label={tag} variant="yellow" />)}
        </div>
      )}
      {Boolean(categories.length) && (
        <div className="flex gap-x-2 items-center">
          {categories.map((category) => (
            <TextBadge key={category} label={category} variant="indigo" />
          ))}
        </div>
      )}
      <div className="mt-4 gap-y-1">
        {author && authorUserId && (
          <UserHoverCard userId={authorUserId}>
            <Button
              className="flex items-center gap-x-1 text-neutral-500 p-0 font-normal"
              variant="link"
            >
              <BookA className="h-4 w-4" />
              <span className="text-xs">{t('author', { author })}</span>
            </Button>
          </UserHoverCard>
        )}
        {durationInSec > 0 && (
          <div className="flex items-center gap-x-1 text-neutral-500 my-1">
            <Clock9 className="h-4 w-4" />
            <span className="text-xs">{formatTimeInSeconds(durationInSec)}</span>
          </div>
        )}
        {languageTitle && (
          <div className="flex items-center gap-x-1 text-neutral-500 mb-4">
            <Languages className="h-4 w-4" />
            <span className="text-xs">
              {t('lang', {
                language: languageTitle,
              })}
            </span>
          </div>
        )}
        <div className="flex items-center gap-x-1 text-neutral-500 mb-1">
          <CalendarDays className="h-4 w-4" />
          <span className="text-xs">
            {t('lastUpdated')}&nbsp;{format(lastUpdate, TIMESTAMP_PREVIEW_TEMPLATE)}
          </span>
        </div>
      </div>
      {!hasPurchase && (
        <div className="mt-4">
          <Price customRates={customRates} price={price} fees={fees} showFeesAccordion />
        </div>
      )}
    </div>
  );
};
