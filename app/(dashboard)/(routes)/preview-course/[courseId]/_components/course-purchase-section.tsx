'use client';

import { Fee } from '@prisma/client';
import { ArrowRight, Check, Tag, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { AuthRedirect } from '@/components/auth/auth-redirect';
import { CourseEnrollButton } from '@/components/common/course-enroll-button';
import { Price } from '@/components/common/price';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { ContinueButton } from './continue-button';

type Promotion = {
  id: string;
  code: string;
  name: string | null;
  description: string;
  restrictions: string;
  isPersonal: boolean;
  percentOff: number | null;
  amountOff: number | null;
  currency: string | null;
};

type CoursePurchaseSectionProps = {
  courseId: string;
  customRates: string | null;
  fees: Fee[];
  hasPurchase: boolean;
  isLoggedIn: boolean;
  price: number | null;
  promotions: Promotion[];
};

export const CoursePurchaseSection = ({
  courseId,
  customRates,
  fees,
  hasPurchase,
  isLoggedIn,
  price,
  promotions,
}: CoursePurchaseSectionProps) => {
  const t = useTranslations('courses.preview');
  const tPromo = useTranslations('courses.preview.promo');

  const [appliedPromoId, setAppliedPromoId] = useState<string | null>(null);

  const sortedPromos = useMemo(() => {
    return [...promotions].sort((a, b) => {
      const savingsA = a.percentOff ? (price ?? 0) * (a.percentOff / 100) : a.amountOff ?? 0;
      const savingsB = b.percentOff ? (price ?? 0) * (b.percentOff / 100) : b.amountOff ?? 0;
      return savingsB - savingsA;
    });
  }, [promotions, price]);

  const appliedPromo = sortedPromos.find((p) => p.id === appliedPromoId) ?? null;

  const discountedPrice = useMemo(() => {
    if (!appliedPromo || price === null) return price;
    if (appliedPromo.percentOff) {
      return Math.max(0, Math.round(price * (1 - appliedPromo.percentOff / 100)));
    }
    if (appliedPromo.amountOff) {
      return Math.max(0, price - appliedPromo.amountOff);
    }
    return price;
  }, [appliedPromo, price]);

  return (
    <>
      {!hasPurchase && (
        <div className="border rounded-lg p-6 bg-card space-y-4">
          <h4 className="font-semibold text-lg">{t('preview.pricing')}</h4>

          <div className="space-y-1">
            {appliedPromo && discountedPrice !== price && (
              <div className="text-sm text-muted-foreground line-through opacity-60">
                <Price customRates={customRates} price={price} fees={fees} />
              </div>
            )}
            <Price
              customRates={customRates}
              price={appliedPromo ? discountedPrice : price}
              fees={fees}
              showFeesAccordion
            />
            {appliedPromo && discountedPrice !== price && (
              <div className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950/50 dark:text-green-400">
                <Check className="h-3 w-3" />
                {tPromo('savings')} — {appliedPromo.description}
              </div>
            )}
          </div>

          {isLoggedIn && !hasPurchase && sortedPromos.length > 0 && (
            <div className="pt-2 border-t space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <Tag className="h-3.5 w-3.5" />
                {tPromo('available')}
              </div>
              <div className="space-y-2">
                {sortedPromos.map((promo) => {
                  const isApplied = appliedPromoId === promo.id;
                  return (
                    <div
                      key={promo.id}
                      className={cn(
                        'flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors',
                        isApplied
                          ? 'border-primary/40 bg-primary/5'
                          : 'border-border bg-background hover:bg-muted/40',
                      )}
                    >
                      <div className="flex min-w-0 flex-col gap-0.5">
                        <span className="font-mono text-xs font-semibold tracking-wider">
                          {promo.code}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {promo.description}
                          {promo.restrictions ? ` · ${promo.restrictions}` : ''}
                        </span>
                      </div>
                      <Button
                        className={cn('ml-2 h-7 shrink-0 text-xs', isApplied && 'gap-1')}
                        onClick={() => setAppliedPromoId(isApplied ? null : promo.id)}
                        size="sm"
                        variant={isApplied ? 'secondary' : 'outline'}
                      >
                        {isApplied ? (
                          <>
                            <Check className="h-3 w-3" />
                            {tPromo('applied')}
                            <X className="h-3 w-3" />
                          </>
                        ) : (
                          tPromo('apply')
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      <div
        className={cn(
          'w-full border rounded-lg p-6',
          isLoggedIn &&
            'bg-gradient-to-r from-indigo-500 from-10% via-sky-500 via-30% to-emerald-500 to-90%',
          !isLoggedIn && 'bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500',
        )}
      >
        <div className="mb-8 space-y-2 text-white">
          <h4 className="font-semibold text-xl">{t('readyToLearn')}</h4>
          <p className="text-sm">{t('keepProgress')}</p>
        </div>
        <div className="w-full">
          {isLoggedIn ? (
            <>
              {!hasPurchase && (
                <CourseEnrollButton
                  courseId={courseId}
                  customRates={customRates}
                  price={discountedPrice}
                  promoCode={appliedPromo?.id}
                  variant="outline"
                />
              )}
              {hasPurchase && <ContinueButton redirectUrl={`/courses/${courseId}`} />}
            </>
          ) : (
            <AuthRedirect>
              <Button className="w-full truncate" variant="outline">
                {t('loginToContinue')}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </AuthRedirect>
          )}
        </div>
      </div>
    </>
  );
};
