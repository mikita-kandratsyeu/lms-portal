'use client';

import { Edit, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { useToast } from '@/components/ui/use-toast';
import { DEFAULT_CURRENCY, DEFAULT_LOCALE } from '@/constants/locale';
import { fetcher } from '@/lib/fetcher';
import { formatPrice, getConvertedPrice } from '@/lib/format';

import { StripeSubscriptionDialog } from './stripe-subscription-dialog';

type StripeSubscription = {
  id: string;
  name: string;
  period: string;
  price: number;
  createdAt: string;
  updatedAt: string;
};

export const StripeSubscriptionManager = () => {
  const [subscriptions, setSubscriptions] = useState<StripeSubscription[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<StripeSubscription | null>(null);

  const t = useTranslations('owner.configurations.subscriptions');
  const tCommon = useTranslations('owner.configurations.common');
  const { toast } = useToast();
  const defaultLocale = { locale: DEFAULT_LOCALE, currency: DEFAULT_CURRENCY };

  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true);
      const response = await fetcher.get('/api/configurations/stripe-subscription-description', {
        responseType: 'json',
      });
      setSubscriptions(response);
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
      toast({ title: t('messages.loadError'), isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm(tCommon('confirmDelete', { item: t('title').toLowerCase() }))) {
      return;
    }

    try {
      await fetcher.delete(`/api/configurations/stripe-subscription-description/${id}`, {
        responseType: 'json',
      });
      toast({ title: t('messages.deleteSuccess'), type: 'success' });
      fetchSubscriptions();
    } catch (error) {
      console.error('Failed to delete subscription:', error);
      toast({ title: t('messages.deleteError'), isError: true });
    }
  };

  const handleEdit = (subscription: StripeSubscription) => {
    setEditingItem(subscription);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    fetchSubscriptions();
  };

  return (
    <Card className="shadow-none">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>{t('title')}</CardTitle>
            <CardDescription>{t('description')}</CardDescription>
          </div>
          <Button onClick={handleCreate} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" />
            {tCommon('addNew')}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">{tCommon('loading')}</p>
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-muted-foreground">{tCommon('noData')}</p>
            <Button onClick={handleCreate} variant="outline" size="sm" className="mt-4">
              {tCommon('createFirst', { item: t('title').toLowerCase() })}
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{tCommon('name')}</TableHead>
                  <TableHead>{t('period')}</TableHead>
                  <TableHead>{t('price')}</TableHead>
                  <TableHead className="text-right">{tCommon('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscriptions.map((subscription) => (
                  <TableRow key={subscription.id}>
                    <TableCell className="font-medium">{subscription.name}</TableCell>
                    <TableCell className="capitalize">{subscription.period}</TableCell>
                    <TableCell>
                      {formatPrice(getConvertedPrice(subscription.price), defaultLocale)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(subscription)}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(subscription.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
      <StripeSubscriptionDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        editingItem={editingItem}
      />
    </Card>
  );
};
