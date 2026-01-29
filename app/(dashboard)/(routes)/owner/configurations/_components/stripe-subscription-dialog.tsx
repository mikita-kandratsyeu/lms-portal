'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { useToast } from '@/components/ui/use-toast';
import { fetcher } from '@/lib/fetcher';
import { getConvertedPrice, getScaledPrice } from '@/lib/format';

type FormValues = {
  name: string;
  period: 'monthly' | 'yearly';
  price: string;
};

type StripeSubscriptionDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  editingItem?: {
    id: string;
    name: string;
    period: string;
    price: number;
  } | null;
};

export const StripeSubscriptionDialog = ({
  isOpen,
  onClose,
  editingItem,
}: StripeSubscriptionDialogProps) => {
  const t = useTranslations('owner.configurations.subscriptions.dialog');
  const tMessages = useTranslations('owner.configurations.subscriptions.messages');
  const tCommon = useTranslations('owner.configurations.common');
  const tPeriod = useTranslations('owner.configurations.subscriptions');
  const { toast } = useToast();
  const form = useForm<FormValues>({
    defaultValues: {
      name: '',
      period: 'monthly',
      price: '0',
    },
  });

  useEffect(() => {
    if (editingItem) {
      form.reset({
        name: editingItem.name,
        period: editingItem.period as 'monthly' | 'yearly',
        price: getConvertedPrice(editingItem.price).toString(),
      });
    } else {
      form.reset({
        name: '',
        period: 'monthly',
        price: '0',
      });
    }
  }, [editingItem, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = {
        name: values.name,
        period: values.period,
        price: getScaledPrice(parseFloat(values.price)),
      };

      if (editingItem) {
        await fetcher.patch(
          `/api/configurations/stripe-subscription-description/${editingItem.id}`,
          {
            body: payload,
            responseType: 'json',
          },
        );
        toast({ title: tMessages('updateSuccess'), type: 'success' });
      } else {
        await fetcher.post('/api/configurations/stripe-subscription-description', {
          body: payload,
          responseType: 'json',
        });
        toast({ title: tMessages('createSuccess'), type: 'success' });
      }

      onClose();
    } catch (error) {
      console.error('Failed to save subscription:', error);
      toast({ title: tMessages('saveError'), isError: true });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {editingItem ? tCommon('edit') : tCommon('create')}{' '}
            {editingItem ? t('editTitle') : t('createTitle')}
          </DialogTitle>
          <DialogDescription>
            {editingItem ? t('updateDescription') : t('createDescription')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              rules={{ required: t('nameRequired') }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tCommon('name')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('namePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tPeriod('period')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('selectPeriod')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="monthly">{tPeriod('monthly')}</SelectItem>
                      <SelectItem value="yearly">{tPeriod('yearly')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              rules={{
                required: t('priceRequired'),
                pattern: {
                  value: /^\d+(\.\d{1,2})?$/,
                  message: t('invalidPrice'),
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('priceLabel')}</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder={t('pricePlaceholder')}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                {tCommon('cancel')}
              </Button>
              <Button type="submit">{editingItem ? tCommon('update') : tCommon('create')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
