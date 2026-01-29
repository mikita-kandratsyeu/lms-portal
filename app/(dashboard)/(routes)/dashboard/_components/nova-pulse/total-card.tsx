'use client';

import { useTranslations } from 'next-intl';
import CountUp from 'react-countup';

import { getNovaPulse } from '@/actions/nova-pulse/get-nova-pulse';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui';
import { DEFAULT_LOCALE } from '@/constants/locale';
import { formatTimeInSeconds } from '@/lib/date';
import { getConvertedPrice, getCurrencySymbol } from '@/lib/format';

type TotalCardProps = {
  info: Awaited<ReturnType<typeof getNovaPulse>>;
  type: 'money' | 'time';
};

export const TotalCard = ({ info, type }: TotalCardProps) => {
  const t = useTranslations('nova-pulse');

  const spentTimeInSec = formatTimeInSeconds(info.totalSpentTimeInSec);

  if (type === 'time' && !spentTimeInSec.length) {
    return null;
  }
  return (
    <Card className="shadow-none h-full p-4 sm:p-6 flex-1">
      <CardTitle className="mb-2">{t(`${type}.title`)}</CardTitle>
      <CardDescription className="text-xs mb-4">{t(`${type}.body`)}</CardDescription>
      <CardContent className="m-0 p-0">
        {type === 'money' &&
          info.totalSpentMoney.map((money: any) => (
            <p className="mb-1" key={money.currency}>
              <CountUp
                className="font-semibold"
                decimals={2}
                duration={2.75}
                end={getConvertedPrice(money.amount)}
                prefix={`${getCurrencySymbol(DEFAULT_LOCALE, money.currency)} `}
              />
            </p>
          ))}
        {type === 'time' && <p className="mb-1 font-semibold">{spentTimeInSec}</p>}
      </CardContent>
    </Card>
  );
};
