'use client';

import { AiModelFeature } from '@prisma/client';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import {
  Button,
  Checkbox,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@/components/ui';
import { useToast } from '@/components/ui/use-toast';
import { fetcher } from '@/lib/fetcher';
import { capitalize } from '@/lib/utils';

const FEATURE_OPTIONS = Object.keys(AiModelFeature);

type FormValues = {
  name: string;
  provider: string;
  providerName: string;
  value: string;
  features: string[];
  isDefault: boolean;
  isSubscription: boolean;
};

type AiModelDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  editingItem?: {
    id: string;
    name: string;
    provider: string;
    providerName: string;
    value: string;
    features: string[];
    isDefault: boolean;
    isSubscription: boolean;
  } | null;
};

export const AiModelDialog = ({ isOpen, onClose, editingItem }: AiModelDialogProps) => {
  const t = useTranslations('owner.configurations.aiModels.dialog');
  const tMessages = useTranslations('owner.configurations.aiModels.messages');
  const tCommon = useTranslations('owner.configurations.common');
  const tFeatures = useTranslations('owner.configurations.aiModels.featureNames');
  const tAiModels = useTranslations('owner.configurations.aiModels');
  const { toast } = useToast();

  const form = useForm<FormValues>({
    defaultValues: {
      name: '',
      provider: '',
      providerName: '',
      value: '',
      features: [],
      isDefault: false,
      isSubscription: false,
    },
  });

  useEffect(() => {
    if (editingItem) {
      form.reset({
        name: editingItem.name,
        provider: editingItem.provider,
        providerName: editingItem.providerName,
        value: editingItem.value,
        features: editingItem.features,
        isDefault: editingItem.isDefault,
        isSubscription: editingItem.isSubscription,
      });
    } else {
      form.reset({
        name: '',
        provider: '',
        providerName: '',
        value: '',
        features: [],
        isDefault: false,
        isSubscription: false,
      });
    }
  }, [editingItem, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (editingItem) {
        await fetcher.patch(`/api/configurations/ai-model/${editingItem.id}`, {
          body: values,
          responseType: 'json',
        });
        toast({ title: tMessages('updateSuccess'), type: 'success' });
      } else {
        await fetcher.post('/api/configurations/ai-model', {
          body: values,
          responseType: 'json',
        });
        toast({ title: tMessages('createSuccess'), type: 'success' });
      }

      onClose();
    } catch (error) {
      console.error('Failed to save AI model:', error);
      toast({ title: tMessages('saveError'), isError: true });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px] max-h-[90vh] overflow-y-auto">
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
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="provider"
                rules={{ required: t('providerRequired') }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tAiModels('provider')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('providerPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="providerName"
                rules={{ required: t('providerNameRequired') }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{tAiModels('providerName')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('providerNamePlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="value"
              rules={{ required: t('valueRequired') }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{tAiModels('value')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('valuePlaceholder')} {...field} />
                  </FormControl>
                  <FormDescription>{t('valueDescription')}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="features"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">{tAiModels('features')}</FormLabel>
                    <FormDescription>{t('selectFeatures')}</FormDescription>
                  </div>
                  {FEATURE_OPTIONS.map((feature) => {
                    const featureName =
                      tFeatures(feature.toLowerCase() as any) || capitalize(feature);
                    return (
                      <FormField
                        key={feature}
                        control={form.control}
                        name="features"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={feature}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(feature)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, feature])
                                      : field.onChange(
                                          field.value?.filter((value) => value !== feature),
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">{featureName}</FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    );
                  })}
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-4 rounded-lg border p-4">
              <FormField
                control={form.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>{t('isDefault')}</FormLabel>
                      <FormDescription>{t('isDefaultDescription')}</FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isSubscription"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>{t('isSubscription')}</FormLabel>
                      <FormDescription>{t('isSubscriptionDescription')}</FormDescription>
                    </div>
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
