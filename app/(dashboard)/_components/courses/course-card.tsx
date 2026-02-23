'use client';

import { Fee } from '@prisma/client';
import { BookOpen } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { IconBadge } from '@/components/common/icon-badge';
import { Price } from '@/components/common/price';
import { ProgressBar } from '@/components/common/progress-bar';
import { TextBadge } from '@/components/common/text-badge';
import { cn } from '@/lib/utils';

type CourseCardProps = {
  category?: string;
  chaptersLength: number;
  customRates: string | null;
  fees?: Fee[];
  id: string;
  imagePlaceholder: string;
  imageUrl: string | null;
  isNewCourse?: boolean;
  isPublished?: boolean;
  isPurchased?: boolean;
  isTopPurchased?: boolean;
  price: number | null;
  progress: number | null;
  title: string;
};

export const CourseCard = ({
  category,
  chaptersLength,
  customRates,
  fees = [],
  id,
  imagePlaceholder,
  imageUrl,
  isNewCourse,
  isPublished,
  isPurchased,
  isTopPurchased,
  price,
  progress,
  title,
}: CourseCardProps) => {
  const t = useTranslations('courses.card');

  const path = usePathname();

  const href = `/${isPurchased || path.includes('dashboard') ? 'courses' : 'preview-course'}/${id}`;

  return (
    <Link href={href} title={title} className={cn(!isPublished && 'pointer-events-none')}>
      <div
        className={cn(
          'group hover:shadow-sm transition duration-300 overflow-hidden border rounded-lg p-3 h-full dark:bg-neutral-900 hover:bg-blue-500/10 dark:hover:bg-neutral-900/75 relative',
          !isPublished && 'select-none blur-sm',
        )}
      >
        <div className="absolute flex z-10 gap-x-2 m-2">
          {isNewCourse && <TextBadge label={t('new')} variant="green" />}
          {isTopPurchased && <TextBadge label={t('topSale')} variant="indigo" />}
        </div>
        <div className="w-full aspect-w-16 aspect-h-9 rounded-md overflow-hidden">
          <Image
            alt={title}
            blurDataURL={imagePlaceholder}
            className="object-cover"
            fill
            placeholder="blur"
            src={imageUrl ?? imagePlaceholder}
          />
        </div>
        <div className="flex flex-col pt-2">
          <div className="text-lg md:text-base font-medium group-hover:text-blue-700 dark:group-hover:text-blue-400 transition duration-300 line-clamp-1">
            {title}
          </div>
          <p className="text-xs text-muted-foreground">{category}</p>
          <div className="my-3 flex items-center gap-x-2 text-sm md:text-xs">
            <div className="flex items-center gap-x-1 text-muted-foreground">
              <IconBadge size="sm" icon={BookOpen} />
              <span className="text-xs">{t('chapter', { amount: chaptersLength })}</span>
            </div>
          </div>
          {progress !== null ? (
            <ProgressBar
              showText
              variant={progress < 100 ? 'default' : 'success'}
              size="sm"
              value={progress}
            />
          ) : (
            <Price customRates={customRates} price={price} fees={fees} />
          )}
        </div>
      </div>
    </Link>
  );
};
