'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { User, UserSettings } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Switch } from '@/components/ui';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { useUserSettingsStore } from '@/hooks/store/use-user-settings.store';
import { fetcher } from '@/lib/fetcher';

type ChristmasFormFormProps = {
  initialData: User & { settings: UserSettings | null };
};

const formSchema = z.object({
  isChristmasMode: z.boolean().default(false),
});

export const ChristmasForm = ({ initialData }: ChristmasFormFormProps) => {
  const t = useTranslations('settings.christmas');

  const { toast } = useToast();
  const router = useRouter();

  const { setIsChristmasMode } = useUserSettingsStore((state) => ({
    setIsChristmasMode: state.setIsChristmasMode,
  }));

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isChristmasMode: Boolean(initialData?.settings?.isChristmasMode),
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await fetcher.patch(`/api/users/${initialData.id}`, { body: { settings: values } });

      setIsChristmasMode(values.isChristmasMode);

      router.refresh();
    } catch (error) {
      console.error('[CHRISTMAS_FORM]', error);

      toast({ isError: true, description: (error as Error)?.message ?? '' });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <FormField
          control={form.control}
          name="isChristmasMode"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0 rounded-md border p-4">
              <div className="space-y-0.5">
                <FormLabel>{t('title')}</FormLabel>
                <FormDescription className="text-xs">{t('body')}</FormDescription>
              </div>
              <FormControl>
                <Switch
                  aria-readonly
                  checked={field.value}
                  disabled={!isValid || isSubmitting}
                  onCheckedChange={field.onChange}
                  type="submit"
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};
