'use client';

import { ArrowRight, MoreHorizontal, ShoppingCart } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Button, ButtonProps } from '@/components/ui';
import { useToast } from '@/components/ui/use-toast';
import { useLocaleStore } from '@/hooks/store/use-locale-store';
import { useHydration } from '@/hooks/use-hydration';
import { useLocaleAmount } from '@/hooks/use-locale-amount';
import { fetcher } from '@/lib/fetcher';

type CourseEnrollButtonProps = {
  courseId: string;
  customRates: string | null;
  price: number | null;
  variant?: ButtonProps['variant'];
};

export const CourseEnrollButton = ({
  courseId,
  customRates,
  price,
  variant = 'success',
}: CourseEnrollButtonProps) => {
  const t = useTranslations('course-enroll');

  const { toast } = useToast();

  const localeInfo = useLocaleStore((state) => state.localeInfo);
  const { amount, formattedPrice, isLoading } = useLocaleAmount({
    customRates,
    price,
    roundToNearestFive: true,
  });

  const { isMounted } = useHydration();

  const [isFetching, setIsFetching] = useState(false);

  const handleClick = async () => {
    setIsFetching(true);

    try {
      const response = await fetcher.post(`/api/courses/${courseId}/checkout`, {
        body: {
          locale: localeInfo?.locale,
          details: localeInfo?.details,
          rate: localeInfo?.rate,
        },
        responseType: 'json',
      });

      if (response?.message) {
        toast({ title: response?.message });
      } else {
        toast({ title: t('redirect') });
        window.location.assign(response.url);
      }
    } catch (error) {
      console.error('[COURSE_ENROLL_BUTTON]', error);

      toast({ isError: true, description: (error as Error)?.message ?? '' });
    } finally {
      setIsFetching(false);
    }
  };

  if (!isMounted) {
    return (
      <Button
        className="w-full line-clamp-1 flex justify-center items-center"
        size="lg"
        variant={variant}
        disabled
      >
        <MoreHorizontal className="w-6 h-6 animate-pulse" />
      </Button>
    );
  }

  return (
    <Button
      className="w-full line-clamp-1 flex items-center"
      disabled={isFetching || isLoading}
      onClick={handleClick}
      size="lg"
      variant={variant}
    >
      {isLoading && <MoreHorizontal className="w-6 h-6 animate-pulse" />}
      {!isLoading && (
        <>
          {(amount ?? 0) > 0 && <ShoppingCart className="hidden md:block w-4 h-4 mr-2" />}
          <span>{t('enrollFor')}</span>
          {(amount ?? 0) > 0 && formattedPrice}
          {amount === 0 && (
            <>
              {t('free')}
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </>
      )}
    </Button>
  );
};
