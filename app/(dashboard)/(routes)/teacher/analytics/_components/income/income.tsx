'use client';

import { LatLngExpression } from 'leaflet';
import { useTranslations } from 'next-intl';

import { getAnalytics } from '@/actions/analytics/get-analytics';
import Map from '@/components/map';
import { DEFAULT_CURRENCY, DEFAULT_LOCALE } from '@/constants/locale';
import { formatPrice, getConvertedPrice } from '@/lib/format';

import { TotalProfitCard } from './total-profit-card';
import { TotalRevenueCard } from './total-revenue-card';

type Analytics = Awaited<ReturnType<typeof getAnalytics>>;

type IncomeProps = {
  mapData: Analytics['map'];
} & Pick<Analytics, 'totalProfit' | 'totalRevenue' | 'totalRevenueData'>;

export const Income = ({ mapData, totalProfit, totalRevenue, totalRevenueData }: IncomeProps) => {
  const t = useTranslations('teacher.analytics.income');

  const mapMarkers = mapData.map((mp) => {
    return {
      position: mp.position,
      content: (
        <div className="flex flex-col text-sm max-w-[150px]">
          <h2 className="text-medium font-semibold">
            {mp.country}, {mp.city}
          </h2>
          <div className="text-xs">
            In this region, <span className="font-semibold">{mp.totalSales} </span>sales have been
            made. The total amount of clients expenses is{' '}
            <span className="font-semibold">
              {' '}
              {formatPrice(getConvertedPrice(mp.totalAmount), {
                locale: DEFAULT_LOCALE,
                currency: mp.currency ?? DEFAULT_CURRENCY,
              })}
            </span>
            {'.'}
          </div>
        </div>
      ),
    };
  }) as { position: LatLngExpression; content: React.ReactNode }[];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <p className="font-medium text-xl">{t('title')}</p>
        </div>
        <span className="text-xs text-muted-foreground">{t('subtitle')}</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex flex-col gap-4">
          <TotalRevenueCard totalRevenue={totalRevenue} totalRevenueData={totalRevenueData} />
          <TotalProfitCard totalProfit={totalProfit} />
        </div>
        <Map
          className="w-full h-[400px] md:h-auto border rounded-lg col-span-2"
          mapStyles={{ width: '100%', height: '100%', borderRadius: '8px', zIndex: 1 }}
          markers={mapMarkers}
        />
      </div>
    </div>
  );
};
