'use client';

import { BookOpenIcon, ClockIcon, LanguagesIcon, SparklesIcon } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { Card } from '@/components/ui/card';
import { SUPPORTED_LOCALES } from '@/constants/locale';
import { formatTimeInSeconds } from '@/lib/date';
import { cn } from '@/lib/utils';

type CourseHighlightsProps = {
  durationInSec: number;
  language: string | null;
  chaptersLength: number;
  hasAiTranslation?: boolean;
};

export const CourseHighlights = ({
  durationInSec,
  language,
  chaptersLength,
  hasAiTranslation = true,
}: CourseHighlightsProps) => {
  const t = useTranslations('courses.preview.highlights');
  const currentLocale = useLocale();

  const languageTitle = SUPPORTED_LOCALES.find(({ key }) => key === language)?.title;
  const isDifferentLanguage = language !== currentLocale;

  const highlights = [
    {
      icon: ClockIcon,
      label: t('duration'),
      value: formatTimeInSeconds(durationInSec),
      description: t('durationDesc'),
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    },
    {
      icon: LanguagesIcon,
      label: t('language'),
      value: languageTitle || language || 'N/A',
      description: isDifferentLanguage && hasAiTranslation ? t('aiTranslation') : t('originalLang'),
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-950/30',
      badge: isDifferentLanguage && hasAiTranslation,
    },
    {
      icon: BookOpenIcon,
      label: t('chapters'),
      value: chaptersLength.toString(),
      description: t('chaptersDesc'),
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-950/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {highlights.map((highlight, index) => (
        <Card key={index} className={cn('p-4 shadow-none rounded-lg', highlight.bgColor)}>
          <div className="flex items-center gap-2">
            <div className={cn('p-2 rounded-lg', highlight.bgColor)}>
              <highlight.icon className={cn('h-5 w-5', highlight.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  {highlight.label}
                </p>
                {highlight.badge && (
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
                    <SparklesIcon className="h-3 w-3 text-white" />
                    <span className="text-[10px] font-semibold text-white">{t('ai')}</span>
                  </div>
                )}
              </div>
              <p className={cn('text-lg font-bold mb-1', highlight.color)}>{highlight.value}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{highlight.description}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};
