'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Check, RefreshCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { getStripePromo } from '@/actions/stripe/get-stripe-promo';
import { CurrencyInput } from '@/components/common/currency-input';
import {
  Button,
  Checkbox,
  Input,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { DEFAULT_CURRENCY, DEFAULT_LOCALE } from '@/constants/locale';
import { PromoStatus } from '@/constants/payments';
import { useLocaleStore } from '@/hooks/store/use-locale-store';
import { fetcher } from '@/lib/fetcher';
import { getScaledPrice } from '@/lib/format';
import { isString } from '@/lib/guard';
import { generatePromotionCode } from '@/lib/promo';
import { cn } from '@/lib/utils';

type StripePromo = Awaited<ReturnType<typeof getStripePromo>>;
type Coupon = StripePromo['coupons'][number];
type Customer = StripePromo['customers'][number];

type PromoModalProps = {
  children: React.ReactNode;
  coupons: Coupon[];
  customers: Customer[];
};

const formSchema = z.object({
  code: z.string().min(1),
  couponId: z.string().min(1),
  customerId: z.string(),
  firstTimePurchase: z.boolean().default(false),
  limitNumberOfRedeemed: z.boolean().default(false),
  limitToSpecificCustomer: z.boolean().default(false),
  minAmount: z.string(),
  minAmountCurrency: z.string(),
  numberOfRedeemed: z.string(),
  requireMinimumAmount: z.boolean().default(false),
});

export const PromoModal = ({ children, coupons, customers }: PromoModalProps) => {
  const t = useTranslations('promo-modal');

  const { toast } = useToast();

  const { exchangeRates } = useLocaleStore((state) => ({
    exchangeRates: state.exchangeRates,
  }));

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: '',
      couponId: '',
      customerId: '',
      minAmount: '',
      minAmountCurrency: DEFAULT_CURRENCY,
      numberOfRedeemed: '10',
    },
  });

  const router = useRouter();

  const { isSubmitting, isValid } = form.formState;

  const [open, setOpen] = useState(false);
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');

  const watchLimitToSpecificCustomer = form.watch('limitToSpecificCustomer');
  const watchLimitNumberOfRedeemed = form.watch('limitNumberOfRedeemed');
  const watchRequireMinimumAmount = form.watch('requireMinimumAmount');

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await fetcher.post(`/api/payments/promo?action=${PromoStatus.NEW}`, {
        body: {
          ...values,
          numberOfRedeemed: Number(values.numberOfRedeemed),
          minAmount: getScaledPrice(
            isString(values.minAmount)
              ? Number(values.minAmount.replace(/,/g, '.'))
              : values.minAmount,
          ),
        },
        responseType: 'json',
      });

      toast({ title: t('created') });

      router.refresh();
    } catch (error) {
      toast({ isError: true, description: (error as Error)?.message ?? '' });
    } finally {
      setOpen(false);
    }
  };

  const handleGeneratePromotionCode = (onChange: (value: string) => void) => {
    const code = generatePromotionCode();

    onChange(code);
  };

  const handleOnPriceChange = (onChange: (value: string) => void) => (_price?: string) => {
    if (!_price) {
      onChange('');
      return;
    }

    onChange(_price);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('body')}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4 mt-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              control={form.control}
              name="couponId"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>{t('coupon')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className={cn('text-start', field.value ? 'py-7' : '')}>
                        <SelectValue placeholder={t('selectCoupon')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {coupons.map((cp) => (
                        <SelectItem key={cp.id} value={cp.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{cp.name}</span>
                            <span className="text-muted-foreground">{cp.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>{t('code')}</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      <Input {...field} disabled={isSubmitting} placeholder="e.g. FRIENDS20" />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleGeneratePromotionCode(field.onChange)}
                      >
                        <RefreshCcw className="w-4 h-4" />
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="firstTimePurchase"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormDescription>{t('firstTimePurchaseBody')}</FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="limitToSpecificCustomer"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormDescription>{t('limitToSpecificCustomersBody')}</FormDescription>
                  </div>
                </FormItem>
              )}
            />
            {watchLimitToSpecificCustomer && (
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => {
                  const filteredCustomers = customers.filter((cs) => {
                    const searchLower = customerSearchQuery.toLowerCase();
                    return (
                      cs.name?.toLowerCase().includes(searchLower) ||
                      cs.email?.toLowerCase().includes(searchLower)
                    );
                  });

                  const handleSelectCustomer = (customerId: string) => {
                    field.onChange(customerId);
                  };

                  return (
                    <FormItem className="w-full">
                      <div className="space-y-2">
                        <Input
                          placeholder={t('searchCustomer')}
                          value={customerSearchQuery}
                          onChange={(e) => setCustomerSearchQuery(e.target.value)}
                          className="w-full"
                        />
                        <div className="border rounded-md max-h-[200px] overflow-y-auto">
                          {filteredCustomers.length === 0 ? (
                            <div className="p-4 text-center text-sm text-muted-foreground">
                              {t('noCustomerFound')}
                            </div>
                          ) : (
                            filteredCustomers.map((cs) => {
                              const isSelected = field.value === cs.id;
                              return (
                                <button
                                  key={cs.id}
                                  type="button"
                                  onClick={() => handleSelectCustomer(cs.id)}
                                  className={cn(
                                    'w-full flex items-center gap-2 p-3 text-left hover:bg-accent transition-colors',
                                    isSelected && 'bg-accent',
                                  )}
                                >
                                  <Check
                                    className={cn(
                                      'h-4 w-4 shrink-0',
                                      isSelected ? 'opacity-100' : 'opacity-0',
                                    )}
                                  />
                                  <div className="flex flex-col flex-1 min-w-0">
                                    <span className="font-medium text-sm">{cs.name ?? 'N/A'}</span>
                                    <span className="text-muted-foreground text-xs truncate">
                                      {cs.email ?? 'N/A'}
                                    </span>
                                  </div>
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            )}
            <FormField
              control={form.control}
              name="limitNumberOfRedeemed"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormDescription>{t('limitNumberOfRedeemedBody')}</FormDescription>
                  </div>
                </FormItem>
              )}
            />
            {watchLimitNumberOfRedeemed && (
              <div>
                <FormField
                  control={form.control}
                  name="numberOfRedeemed"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            {...field}
                            disabled={isSubmitting}
                            placeholder="e.g. 10"
                            type="number"
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            {exchangeRates?.rates && (
              <>
                <FormField
                  control={form.control}
                  name="requireMinimumAmount"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormDescription>{t('requireMinimumAmount')}</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
                {watchRequireMinimumAmount && (
                  <div className="flex flex-row items-center space-x-3 space-y-0">
                    <FormField
                      control={form.control}
                      name="minAmountCurrency"
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value.toLowerCase()}
                          >
                            <SelectTrigger className="w-[80px]">
                              <SelectValue placeholder={t('selectCurrency')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup className="z-10">
                                {Object.keys(exchangeRates.rates).map((key) => (
                                  <SelectItem key={key} value={key.toLowerCase()}>
                                    {key}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="minAmount"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <CurrencyInput
                              intlConfig={{ locale: DEFAULT_LOCALE, currency: DEFAULT_CURRENCY }}
                              name={field.name}
                              onValueChange={handleOnPriceChange(field.onChange)}
                              placeholder={t('selectMinAmount')}
                              value={field.value}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </>
            )}
            <DialogFooter>
              <Button disabled={!isValid || isSubmitting} isLoading={isSubmitting} type="submit">
                {t('submit')}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
