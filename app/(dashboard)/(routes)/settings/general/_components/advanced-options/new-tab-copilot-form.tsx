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

type NewTabCopilotFormProps = {
  initialData: User & { settings: UserSettings | null };
};

const formSchema = z.object({
  isCopilotInNewTab: z.boolean().default(false),
});

export const NewTabCopilotForm = ({ initialData }: NewTabCopilotFormProps) => {
  const t = useTranslations('settings.new-tab-copilot');

  const { toast } = useToast();
  const router = useRouter();

  const { setIsCopilotInNewTab } = useUserSettingsStore((state) => ({
    setIsCopilotInNewTab: state.setIsCopilotInNewTab,
  }));

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isCopilotInNewTab: Boolean(initialData?.settings?.isCopilotInNewTab),
    },
  });

  const { isSubmitting, isValid } = form.formState;

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await fetcher.patch(`/api/users/${initialData.id}`, { body: { settings: values } });

      setIsCopilotInNewTab(values.isCopilotInNewTab);

      router.refresh();
    } catch (error) {
      console.error('[NEW_TAB_COPILOT_FORM]', error);

      toast({ isError: true, description: (error as Error)?.message ?? '' });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <FormField
          control={form.control}
          name="isCopilotInNewTab"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0 rounded-md border p-4 bg-muted/30">
              <div className="space-y-0.5 flex-1">
                <FormLabel className="text-sm">{t('title')}</FormLabel>
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
