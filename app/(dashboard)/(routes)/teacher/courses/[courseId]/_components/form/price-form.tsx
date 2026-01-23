'use client';

import { Course, Fee } from '@prisma/client';
import { format, fromUnixTime } from 'date-fns';
import { Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ChangeEvent, SyntheticEvent, useState } from 'react';

import { CurrencyInput } from '@/components/common/currency-input';
import { Price } from '@/components/common/price';
import {
  Input,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { TIMESTAMP_TEMPLATE } from '@/constants/common';
import { DEFAULT_CURRENCY, DEFAULT_LOCALE } from '@/constants/locale';
import { MAX_PRICE_INT } from '@/constants/payments';
import { useLocaleStore } from '@/hooks/store/use-locale-store';
import { fetcher } from '@/lib/fetcher';
import { formatPrice, getConvertedPrice, getScaledPrice } from '@/lib/format';
import { hasJsonStructure } from '@/lib/utils';

type PriceFormProps = {
  courseId: string;
  fees: Fee[];
  initialData: Course;
};

export const PriceForm = ({ courseId, fees, initialData }: PriceFormProps) => {
  const { toast } = useToast();
  const router = useRouter();

  const { exchangeRates, localeInfo } = useLocaleStore((state) => ({
    exchangeRates: state.exchangeRates,
    localeInfo: state.localeInfo,
  }));

  const [price, setPrice] = useState<string | number>(
    getConvertedPrice(initialData?.price ?? 0) || '',
  );
  const [selectedCurrency, setSelectedCurrency] = useState(
    localeInfo?.locale.currency ?? DEFAULT_CURRENCY,
  );
  const [customRates, setCustomRates] = useState(initialData.customRates ?? '');
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleToggleEdit = () => setIsEditing((prev) => !prev);

  const handleOnPriceChange = (_price?: string) => {
    if (!_price) {
      setPrice('');
      return;
    }

    if (Number(_price) <= MAX_PRICE_INT) {
      setPrice(_price);
    }
  };

  const handleCustomRatesChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.value) {
      setCustomRates('');
      return;
    }

    setCustomRates(event.target.value);
  };

  const handleCurrencySelect = (_currency: string) => {
    setSelectedCurrency(_currency);
  };

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();

    setIsSubmitting(true);

    try {
      await fetcher.patch(`/api/courses/${courseId}`, {
        body: {
          customRates,
          price: getScaledPrice(
            typeof price === 'string' ? Number(price.replace(/,/g, '.')) : price,
          ),
        },
      });

      toast({ title: 'Course updated' });
      handleToggleEdit();

      router.refresh();
    } catch (error) {
      toast({ isError: true, description: (error as Error)?.message ?? '' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValidCustomRates = hasJsonStructure(customRates);

  return (
    <div className="mt-6 border  bg-neutral-100 dark:bg-neutral-900 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Price
        <Button onClick={handleToggleEdit} variant="outline" size="sm">
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <Price fees={fees} price={initialData?.price ?? 0} showFeesAccordion useDefaultLocale />
      )}
      {isEditing && (
        <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2 justify-center">
            <div className="flex gap-2 items-center">
              <CurrencyInput
                intlConfig={{ locale: DEFAULT_LOCALE, currency: DEFAULT_CURRENCY }}
                name="price"
                onValueChange={handleOnPriceChange}
                placeholder="Set a price for course"
                value={price}
              />
              {exchangeRates?.rates && (
                <div
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                  title={`Updated at ${format(fromUnixTime(exchangeRates.updatedAt), TIMESTAMP_TEMPLATE)}`}
                >
                  <span>≈</span>
                  <div>
                    {formatPrice(
                      ((price || 0) as number) *
                        {
                          ...exchangeRates.rates,
                          ...(isValidCustomRates && JSON.parse(customRates)),
                        }[selectedCurrency],
                      {
                        locale: DEFAULT_LOCALE,
                        currency: selectedCurrency,
                      },
                    )}
                  </div>
                  <Select onValueChange={handleCurrencySelect} defaultValue={selectedCurrency}>
                    <SelectTrigger className="w-[80px]">
                      <SelectValue placeholder="Select a currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup className="z-10">
                        {Object.keys(exchangeRates.rates).map((key) => (
                          <SelectItem key={key} value={key}>
                            {key}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Fees will be included in the price</p>
          </div>
          <p className="text-sm">You can also add a custom exchange rate</p>
          <Input
            disabled={isSubmitting}
            placeholder={`e.g. '{"BTN": 82.908948, ... }'`}
            onChange={handleCustomRatesChange}
            defaultValue={initialData?.customRates ?? ''}
          />
          <div className="flex items-center gap-x-2">
            <Button
              disabled={!price || isSubmitting || Boolean(!isValidCustomRates && customRates)}
              isLoading={isSubmitting}
              type="submit"
            >
              Save
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
