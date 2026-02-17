'use client';

import { Fee } from '@prisma/client';
import { Info } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { memo, useMemo } from 'react';

import { useAppConfigStore } from '@/hooks/store/use-app-config-store';
import { useHydration } from '@/hooks/use-hydration';
import { useLocaleAmount } from '@/hooks/use-locale-amount';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Skeleton,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui';
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

  const { config } = useAppConfigStore((state) => ({ config: state.config }));
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
          <span className="inline-flex items-center gap-1.5">
            {formattedPrice}
            {config?.features?.enableDynamicPricing && (
              <TooltipProvider delayDuration={200}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="inline-flex shrink-0 rounded-full p-0.5 text-muted-foreground/70 transition-colors hover:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={t('dynamicPriceTooltip')}
                    >
                      <Info className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[220px]">
                    {t('dynamicPriceTooltip')}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </span>
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
