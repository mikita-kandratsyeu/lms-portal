import { CheckIcon, PercentIcon, UserIcon, UsersIcon } from 'lucide-react';

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

type PromotionCardProps = {
  promo: {
    id: string;
    code: string;
    description: string;
    restrictions: string;
    active: boolean;
    isPersonal: boolean;
    maxRedemptions: number;
    timesRedeemed: number;
    applied: boolean;
  };
  onApply: (id: string) => void;
  isExpired?: boolean;
};

export const PromotionCard = ({ promo, onApply, isExpired = false }: PromotionCardProps) => {
  return (
    <Card
      className={`flex flex-col transition-all hover:shadow-lg ${
        isExpired
          ? 'opacity-60'
          : promo.applied
            ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20'
            : ''
      }`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge
            variant={promo.isPersonal ? 'default' : 'secondary'}
            className="flex items-center gap-1"
          >
            {promo.isPersonal ? (
              <>
                <UserIcon className="h-3 w-3" />
                Personal
              </>
            ) : (
              <>
                <UsersIcon className="h-3 w-3" />
                General
              </>
            )}
          </Badge>
          {isExpired ? (
            <Badge variant="destructive">Expired</Badge>
          ) : (
            promo.applied && (
              <Badge
                variant="outline"
                className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-100"
              >
                <CheckIcon className="h-3 w-3 mr-1" />
                Applied
              </Badge>
            )
          )}
        </div>
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
            <p className="text-xs font-medium text-muted-foreground">Restrictions:</p>
            <p className="text-xs text-muted-foreground">{promo.restrictions}</p>
          </div>
        )}
        <div className="mt-3 pt-3 border-t">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Redeemed:</span>
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
            Not Available
          </Button>
        ) : (
          <Button
            className="w-full"
            variant={promo.applied ? 'outline' : 'default'}
            disabled={promo.applied}
            onClick={() => onApply(promo.id)}
          >
            {promo.applied ? (
              <>
                <CheckIcon className="h-4 w-4 mr-2" />
                Applied
              </>
            ) : (
              'Apply Promotion'
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
