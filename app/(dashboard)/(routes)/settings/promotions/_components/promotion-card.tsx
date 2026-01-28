'use client';

import { CheckIcon, CopyIcon, PercentIcon, UserIcon, UsersIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { Promotion } from './types';

type PromotionCardProps = {
  promo: Promotion;
};

export const PromotionCard = ({ promo }: PromotionCardProps) => {
  const t = useTranslations('promotions');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(promo.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  return (
    <Card className="flex flex-col shadow-none">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge
            variant={promo.isPersonal ? 'default' : 'secondary'}
            className="flex items-center gap-1"
          >
            {promo.isPersonal ? (
              <>
                <UserIcon className="h-3 w-3" />
                {t('badges.personal')}
              </>
            ) : (
              <>
                <UsersIcon className="h-3 w-3" />
                {t('badges.general')}
              </>
            )}
          </Badge>
        </div>
        {promo.name && <h3 className="text-lg font-semibold mb-2">{promo.name}</h3>}
        <CardTitle className="text-xl font-bold tracking-wider font-mono flex items-center gap-2">
          <PercentIcon className="h-5 w-5 text-primary" />
          {promo.code}
        </CardTitle>
        <CardDescription className="text-base font-semibold mt-2 text-primary">
          {promo.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col flex-grow pb-3">
        <div className="space-y-3 flex-grow">
          {promo.restrictions && (
            <div className="pt-3 border-t space-y-1">
              <p className="text-xs font-medium text-muted-foreground">{t('restrictions')}</p>
              <p className="text-xs text-muted-foreground">{promo.restrictions}</p>
            </div>
          )}
          {promo.expiresAt && (
            <div className="pt-3 border-t space-y-1">
              <p className="text-xs font-medium text-muted-foreground">{t('expiresAt')}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(promo.expiresAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          )}
        </div>
        <div className="mt-3 space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{t('redeemed')}</span>
            <span className="font-medium">
              {promo.timesRedeemed} / {promo.maxRedemptions}
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-1.5">
            <div
              className="h-1.5 rounded-full transition-all bg-primary"
              style={{
                width: `${Math.min((promo.timesRedeemed / promo.maxRedemptions) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" onClick={handleCopy} disabled={copied}>
          {copied ? (
            <>
              <CheckIcon className="h-4 w-4 mr-2" />
              {t('buttons.copied')}
            </>
          ) : (
            <>
              <CopyIcon className="h-4 w-4 mr-2" />
              {t('buttons.copyCode')}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
