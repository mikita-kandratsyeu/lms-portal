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

type FormValues = {
  name: string;
};

type CsmCategoryDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  editingItem?: {
    id: string;
    name: string;
  } | null;
};

export const CsmCategoryDialog = ({ isOpen, onClose, editingItem }: CsmCategoryDialogProps) => {
  const t = useTranslations('owner.configurations.csmCategories.dialog');
  const tMessages = useTranslations('owner.configurations.csmCategories.messages');
  const tCommon = useTranslations('owner.configurations.common');
  const { toast } = useToast();
  const form = useForm<FormValues>({
    defaultValues: {
      name: '',
    },
  });

  useEffect(() => {
    if (editingItem) {
      form.reset({
        name: editingItem.name,
      });
    } else {
      form.reset({
        name: '',
      });
    }
  }, [editingItem, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (editingItem) {
        await fetcher.patch(`/api/configurations/csm-category/${editingItem.id}`, {
          body: values,
          responseType: 'json',
        });
        toast({ title: tMessages('updateSuccess'), type: 'success' });
      } else {
        await fetcher.post('/api/configurations/csm-category', {
          body: values,
          responseType: 'json',
        });
        toast({ title: tMessages('createSuccess'), type: 'success' });
      }

      onClose();
    } catch (error) {
      console.error('Failed to save CSM category:', error);
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
                    <Input placeholder={t('namePlaceholder')} {...field} />
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
