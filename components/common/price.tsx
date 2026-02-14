'use client';

import { Fee } from '@prisma/client';
import { useTranslations } from 'next-intl';
import { memo, useMemo } from 'react';

import { useHydration } from '@/hooks/use-hydration';
import { useLocaleAmount } from '@/hooks/use-locale-amount';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Skeleton } from '../ui';
import { TextBadge } from './text-badge';

type PriceProps = {
  currency?: string;
  customRates?: string | null;
  fees?: Fee[];
  ignoreExchangeRate?: boolean;
  price: number | null;
  showFeesAccordion?: boolean;
  useDefaultLocale?: boolean;
};

const AccordionContentComponent = memo(
  ({ formattedCalculatedFees }: { formattedCalculatedFees: any[] }) => (
    <AccordionContent className="flex flex-col gap-1 text-xs font-normal text-muted-foreground">
      {formattedCalculatedFees.map((fee) => (
        <div key={fee.id} className="flex gap-2 items-center justify-between">
          <div>{fee.name}&nbsp;</div>
          <div>{fee.amount}</div>
        </div>
      ))}
    </AccordionContent>
  ),
);

const PriceComponent = ({
  currency,
  customRates,
  fees = [],
  ignoreExchangeRate = false,
  price,
  showFeesAccordion = false,
  useDefaultLocale = false,
}: PriceProps) => {
  const t = useTranslations('price');

  const {
    amount,
    formattedPrice,
    formattedCalculatedFees,
    formattedTotalFees,
    formattedNet,
    isLoading,
  } = useLocaleAmount({
    currency,
    customRates,
    fees,
    ignoreExchangeRate,
    price,
    useDefaultLocale,
  });

  const { isMounted } = useHydration();

  const shouldShowFees = useMemo(
    () => Boolean(fees.length) && formattedNet && formattedTotalFees,
    [fees.length, formattedNet, formattedTotalFees],
  );

  if (!isMounted) {
    return <Skeleton className="h-[20px] w-[100px]" />;
  }

  return (
    <p className="text-md md:text-small font-bold text-neutral-700 dark:text-neutral-300">
      {isLoading && <Skeleton className="h-[20px] w-[100px]" />}
      {!isLoading && (amount ?? 0) > 0 && (
        <div className="flex flex-col gap-1">
          <span>{formattedPrice}</span>
          {shouldShowFees && (
            <>
              {showFeesAccordion ? (
                <Accordion type="single" collapsible>
                  <AccordionItem value="fees" className="border-none">
                    <AccordionTrigger className="pt-0 pb-2 hover:no-underline">
                      <div className="flex gap-1 text-xs font-normal text-muted-foreground">
                        <span>{formattedNet}</span>
                        <span>+&nbsp;{formattedTotalFees}</span>
                        <span className="">{t('fees')}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContentComponent formattedCalculatedFees={formattedCalculatedFees} />
                  </AccordionItem>
                </Accordion>
              ) : (
                <div className="flex gap-1 text-xs font-normal text-muted-foreground">
                  <span>{formattedNet}</span>
                  <span>+&nbsp;{formattedTotalFees}</span>
                  <span className="">{t('fees')}</span>
                </div>
              )}
            </>
          )}
        </div>
      )}
      {!isLoading && amount === 0 && <TextBadge variant="lime" label={t('free')} />}
    </p>
  );
};

AccordionContentComponent.displayName = 'AccordionContentComponent';
PriceComponent.displayName = 'Price';

export const Price = memo(PriceComponent);
