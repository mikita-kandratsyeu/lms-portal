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
import { cn } from '@/lib/utils';

import { Promotion } from './types';

type PromotionCardProps = {
  promo: Promotion;
  isExpired?: boolean;
};

export const PromotionCard = ({ promo, isExpired = false }: PromotionCardProps) => {
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
    <Card className={cn('flex flex-col shadow-none', isExpired ? 'opacity-60' : '')}>
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
          {isExpired && <Badge variant="destructive">{t('badges.expired')}</Badge>}
        </div>
        {promo.name && <h3 className="text-lg font-semibold mb-2">{promo.name}</h3>}
        <CardTitle className="text-xl font-bold tracking-wider font-mono flex items-center gap-2">
          <PercentIcon
            className={`h-5 w-5 ${isExpired ? 'text-muted-foreground' : 'text-primary'}`}
          />
          {promo.code}
        </CardTitle>
        <CardDescription
          className={`text-base font-semibold mt-2 ${isExpired ? '' : 'text-primary'}`}
        >
          {promo.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-grow pb-3">
        {promo.restrictions && (
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">{t('restrictions')}</p>
            <p className="text-xs text-muted-foreground">{promo.restrictions}</p>
          </div>
        )}
        <div className="mt-3 pt-3 border-t">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{t('redeemed')}</span>
            <span className="font-medium">
              {promo.timesRedeemed} / {promo.maxRedemptions}
            </span>
          </div>
          <div className="w-full bg-secondary rounded-full h-1.5 mt-1">
            <div
              className={`h-1.5 rounded-full transition-all ${isExpired ? 'bg-muted-foreground' : 'bg-primary'}`}
              style={{
                width: `${Math.min((promo.timesRedeemed / promo.maxRedemptions) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {isExpired ? (
          <Button className="w-full" variant="outline" disabled>
            {t('buttons.notAvailable')}
          </Button>
        ) : (
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
        )}
      </CardFooter>
    </Card>
  );
};
