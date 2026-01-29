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
} from '@/components/ui';
import { useToast } from '@/components/ui/use-toast';
import { fetcher } from '@/lib/fetcher';
import { getConvertedPrice, getScaledPrice } from '@/lib/format';

type FormValues = {
  name: string;
  method: string;
  type: string;
  amount: string;
  rate: string;
};

type FeeDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  editingItem?: {
    id: string;
    name: string;
    method: string;
    type: string | null;
    amount: number;
    rate: number;
  } | null;
};

export const FeeDialog = ({ isOpen, onClose, editingItem }: FeeDialogProps) => {
  const t = useTranslations('owner.configurations.fees.dialog');
  const tMessages = useTranslations('owner.configurations.fees.messages');
  const tCommon = useTranslations('owner.configurations.common');
  const tFees = useTranslations('owner.configurations.fees');
  const { toast } = useToast();
  const form = useForm<FormValues>({
    defaultValues: {
      name: '',
      method: '',
      type: '',
      amount: '0',
      rate: '0',
    },
  });

  useEffect(() => {
    if (editingItem) {
      form.reset({
        name: editingItem.name,
        method: editingItem.method,
        type: editingItem.type || '',
        amount: getConvertedPrice(editingItem.amount).toString(),
        rate: editingItem.rate.toString(),
      });
    } else {
      form.reset({
        name: '',
        method: '',
        type: '',
        amount: '0',
        rate: '0',
      });
    }
  }, [editingItem, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = {
        name: values.name,
        method: values.method,
        type: values.type || null,
        amount: getScaledPrice(parseFloat(values.amount)),
        rate: parseFloat(values.rate),
      };

      if (editingItem) {
        await fetcher.patch(`/api/configurations/fee/${editingItem.id}`, {
          body: payload,
          responseType: 'json',
        });
        toast({ title: tMessages('updateSuccess'), type: 'success' });
      } else {
        await fetcher.post('/api/configurations/fee', { body: payload, responseType: 'json' });
        toast({ title: tMessages('createSuccess'), type: 'success' });
      }

      onClose();
    } catch (error) {
      console.error('Failed to save fee:', error);
      toast({ title: tMessages('saveError'), isError: true });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingItem ? t('editTitle') : t('createTitle')}</DialogTitle>
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
                    <Input placeholder={t('methodPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="method"
              rules={{ required: t('methodRequired') }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tFees('method')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('methodPlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tFees('type')} (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder={t('typePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                rules={{
                  required: t('amountRequired'),
                  pattern: {
                    value: /^\d+(\.\d{1,2})?$/,
                    message: t('invalidAmount'),
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tFees('amount')} (USD)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder={t('amountPlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rate"
                rules={{
                  required: t('rateRequired'),
                  pattern: {
                    value: /^\d+(\.\d{1,2})?$/,
                    message: t('invalidRate'),
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tFees('rate')} (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder={t('ratePlaceholder')}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
