'use client';

import { CheckIcon, PercentIcon, TagIcon, UserIcon, UsersIcon } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Mock data - промокоды для пользователя
const MOCK_PROMOTIONS = [
  {
    id: '1',
    code: 'WELCOME2026',
    description: '20% off forever',
    restrictions: 'Only for first purchase.',
    active: true,
    isPersonal: false,
    maxRedemptions: 100,
    timesRedeemed: 45,
    applied: false,
  },
  {
    id: '2',
    code: 'USER_JOHN_DOE',
    description: '50% off for 3 months',
    restrictions: 'Min amount is $10.00.',
    active: true,
    isPersonal: true,
    maxRedemptions: 1,
    timesRedeemed: 0,
    applied: false,
  },
  {
    id: '3',
    code: 'STUDENT2026',
    description: '30% off for 6 months',
    restrictions: 'Only for first purchase. Min amount is $5.00.',
    active: true,
    isPersonal: false,
    maxRedemptions: 500,
    timesRedeemed: 234,
    applied: false,
  },
  {
    id: '4',
    code: 'VIP_PERSONAL',
    description: '$25.00',
    restrictions: '',
    active: true,
    isPersonal: true,
    maxRedemptions: 1,
    timesRedeemed: 0,
    applied: false,
  },
  {
    id: '5',
    code: 'EXPIRED2025',
    description: '40% off forever',
    restrictions: 'Only for first purchase.',
    active: false,
    isPersonal: false,
    maxRedemptions: 200,
    timesRedeemed: 200,
    applied: false,
  },
  {
    id: '6',
    code: 'EARLYBIRD',
    description: '15% off for 12 months',
    restrictions: '',
    active: true,
    isPersonal: false,
    maxRedemptions: 1000,
    timesRedeemed: 567,
    applied: false,
  },
];

const PromotionsPage = () => {
  const [promotions, setPromotions] = useState(MOCK_PROMOTIONS);

  const handleApplyPromotion = (promoId: string) => {
    setPromotions(
      promotions.map(
        (promo) =>
          promo.id === promoId ? { ...promo, applied: true } : { ...promo, applied: false }, // Отменяем все остальные промокоды
      ),
    );
    // TODO: Здесь будет вызов API для применения промокода
  };

  const activePromotions = promotions.filter((promo) => promo.active);
  const inactivePromotions = promotions.filter((promo) => !promo.active);

  const renderPromotionCards = (promos: typeof promotions) => (
    <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {promos.map((promo) => (
        <Card
          key={promo.id}
          className={`flex flex-col shadow-none ${
            promo.applied ? 'border-green-500 bg-green-50/50 dark:bg-green-950/20' : ''
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
              {promo.applied && (
                <Badge
                  variant="outline"
                  className="bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-100"
                >
                  <CheckIcon className="h-3 w-3 mr-1" />
                  Applied
                </Badge>
              )}
            </div>
            <CardTitle className="text-xl font-bold tracking-wider font-mono flex items-center gap-2">
              <PercentIcon className="h-5 w-5 text-primary" />
              {promo.code}
            </CardTitle>
            <CardDescription className="text-base font-semibold text-primary mt-2">
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
                  className="bg-primary h-1.5 rounded-full transition-all"
                  style={{
                    width: `${Math.min((promo.timesRedeemed / promo.maxRedemptions) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              variant={promo.applied ? 'outline' : 'default'}
              disabled={promo.applied}
              onClick={() => handleApplyPromotion(promo.id)}
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
          </CardFooter>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="p-6 flex flex-col mb-6">
      <div className="mb-8">
        <h1 className="text-2xl font-medium">Promotions</h1>
        <p className="text-muted-foreground mt-2">
          View and apply available promotion codes to your account
        </p>
      </div>

      {/* Активные промокоды */}
      {activePromotions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
            <TagIcon className="h-5 w-5" />
            Available Promotions
          </h2>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="all">All ({activePromotions.length})</TabsTrigger>
              <TabsTrigger value="general">
                General ({activePromotions.filter((p) => !p.isPersonal).length})
              </TabsTrigger>
              <TabsTrigger value="personal">
                Personal ({activePromotions.filter((p) => p.isPersonal).length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all">{renderPromotionCards(activePromotions)}</TabsContent>
            <TabsContent value="general">
              {renderPromotionCards(activePromotions.filter((p) => !p.isPersonal))}
            </TabsContent>
            <TabsContent value="personal">
              {renderPromotionCards(activePromotions.filter((p) => p.isPersonal))}
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Неактивные/истекшие промокоды */}
      {inactivePromotions.length > 0 && (
        <div>
          <h2 className="text-lg font-medium mb-4 flex items-center gap-2 text-muted-foreground">
            <TagIcon className="h-5 w-5" />
            Expired or Unavailable
          </h2>
          <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {inactivePromotions.map((promo) => (
              <Card key={promo.id} className="flex flex-col opacity-60">
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
                    <Badge variant="destructive">Expired</Badge>
                  </div>
                  <CardTitle className="text-xl font-bold tracking-wider font-mono flex items-center gap-2">
                    <PercentIcon className="h-5 w-5 text-muted-foreground" />
                    {promo.code}
                  </CardTitle>
                  <CardDescription className="text-base font-semibold mt-2">
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
                        className="bg-muted-foreground h-1.5 rounded-full transition-all"
                        style={{
                          width: `${Math.min((promo.timesRedeemed / promo.maxRedemptions) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" variant="outline" disabled>
                    Not Available
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      {promotions.length === 0 && (
        <Card className="p-12">
          <div className="flex flex-col items-center justify-center text-center">
            <TagIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Promotions Available</h3>
            <p className="text-sm text-muted-foreground max-w-md">
              There are currently no promotion codes available for your account. Check back later
              for new offers!
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default PromotionsPage;
