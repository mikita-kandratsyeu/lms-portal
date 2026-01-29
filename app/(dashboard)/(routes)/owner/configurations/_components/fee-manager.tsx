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

import { FeeDialog } from './fee-dialog';

type Fee = {
  id: string;
  name: string;
  method: string;
  type: string | null;
  amount: number;
  rate: number;
  createdAt: string;
  updatedAt: string;
};

export const FeeManager = () => {
  const [fees, setFees] = useState<Fee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Fee | null>(null);

  const t = useTranslations('owner.configurations.fees');
  const tCommon = useTranslations('owner.configurations.common');
  const { toast } = useToast();
  const defaultLocale = { locale: DEFAULT_LOCALE, currency: DEFAULT_CURRENCY };

  const fetchFees = async () => {
    try {
      setIsLoading(true);
      const response = await fetcher.get('/api/configurations/fee', { responseType: 'json' });
      setFees(response);
    } catch (error) {
      console.error('Failed to fetch fees:', error);
      toast({ title: t('messages.loadError'), isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm(tCommon('confirmDelete', { item: t('title').toLowerCase() }))) {
      return;
    }

    try {
      await fetcher.delete(`/api/configurations/fee/${id}`, { responseType: 'json' });
      toast({ title: t('messages.deleteSuccess'), type: 'success' });
      fetchFees();
    } catch (error) {
      console.error('Failed to delete fee:', error);
      toast({ title: t('messages.deleteError'), isError: true });
    }
  };

  const handleEdit = (fee: Fee) => {
    setEditingItem(fee);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    fetchFees();
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
        ) : fees.length === 0 ? (
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
                  <TableHead>{t('method')}</TableHead>
                  <TableHead>{t('type')}</TableHead>
                  <TableHead>{t('amount')}</TableHead>
                  <TableHead>{t('rate')} (%)</TableHead>
                  <TableHead className="text-right">{tCommon('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fees.map((fee) => (
                  <TableRow key={fee.id}>
                    <TableCell className="font-medium">{fee.name}</TableCell>
                    <TableCell>{fee.method}</TableCell>
                    <TableCell>{fee.type || '-'}</TableCell>
                    <TableCell>
                      {formatPrice(getConvertedPrice(fee.amount), defaultLocale)}
                    </TableCell>
                    <TableCell>{fee.rate}%</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(fee)}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(fee.id)}
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
      <FeeDialog isOpen={isDialogOpen} onClose={handleDialogClose} editingItem={editingItem} />
    </Card>
  );
};
