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
import { fetcher } from '@/lib/fetcher';

import { CsmCategoryDialog } from './csm-category-dialog';

type CsmCategory = {
  id: string;
  name: string;
  _count: {
    csmIssue: number;
  };
};

export const CsmCategoryManager = () => {
  const [categories, setCategories] = useState<CsmCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CsmCategory | null>(null);

  const t = useTranslations('owner.configurations.csmCategories');
  const tCommon = useTranslations('owner.configurations.common');
  const { toast } = useToast();

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const response = await fetcher.get('/api/configurations/csm-category', {
        responseType: 'json',
      });
      setCategories(response);
    } catch (error) {
      console.error('Failed to fetch CSM categories:', error);
      toast({ title: t('messages.loadError'), isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm(tCommon('confirmDelete', { item: t('title').toLowerCase() }))) {
      return;
    }

    try {
      await fetcher.delete(`/api/configurations/csm-category/${id}`, { responseType: 'json' });
      toast({ title: t('messages.deleteSuccess'), type: 'success' });
      fetchCategories();
    } catch (error) {
      console.error('Failed to delete CSM category:', error);
      toast({ title: t('messages.deleteError'), isError: true });
    }
  };

  const handleEdit = (category: CsmCategory) => {
    setEditingItem(category);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingItem(null);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingItem(null);
    fetchCategories();
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
        ) : categories.length === 0 ? (
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
                  <TableHead>{t('issues')}</TableHead>
                  <TableHead className="text-right">{tCommon('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category._count.csmIssue}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(category)}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(category.id)}
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          disabled={category._count.csmIssue > 0}
                          title={
                            category._count.csmIssue > 0
                              ? tCommon('cannotDelete', {
                                  item: t('title').toLowerCase(),
                                  related: t('issues').toLowerCase(),
                                })
                              : undefined
                          }
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
      <CsmCategoryDialog
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        editingItem={editingItem}
      />
    </Card>
  );
};
