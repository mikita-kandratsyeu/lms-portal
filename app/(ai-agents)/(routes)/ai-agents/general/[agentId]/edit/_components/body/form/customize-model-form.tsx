'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { PencilLineIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { GetAgentDataResponse } from '@/actions/ai/agent/get-agent-data';
import { MarkdownText } from '@/components/common/markdown-text';
import { TextBadge } from '@/components/common/text-badge';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { DEFAULT_TEMPERATURE } from '@/constants/ai/general';
import { fetcher } from '@/lib/fetcher';
import { isNumber, isString } from '@/lib/guard';

type CustomizeModelFormProps = {
  agentId: string;
  initialData: GetAgentDataResponse['agent'];
  isPreviewPage?: boolean;
};

const formSchema = z.object({
  systemInstruction: z.string(),
  temperature: z.number().default(DEFAULT_TEMPERATURE),
});

export const CustomizeModelForm = ({
  agentId,
  initialData,
  isPreviewPage,
}: CustomizeModelFormProps) => {
  const t = useTranslations('ai-agents.edit.customization');
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      systemInstruction: initialData?.systemInstruction || '',
      temperature: initialData?.temperature || DEFAULT_TEMPERATURE,
    },
  });

  const [isEditing, setIsEditing] = useState(false);

  const { isSubmitting, isValid } = form.formState;

  useEffect(() => {
    form.reset({
      systemInstruction: initialData?.systemInstruction || '',
      temperature: initialData?.temperature || DEFAULT_TEMPERATURE,
    });
  }, [initialData?.systemInstruction, initialData?.temperature, form]);

  const handleToggleEdit = () => {
    setIsEditing((prev) => !prev);
    form.reset();
  };

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await fetcher.patch(`/api/ai/agents/${agentId}`, {
        body: values,
      });

      toast({ title: t('toast.updated') });
      handleToggleEdit();

      router.refresh();
    } catch (error) {
      console.error('[CUSTOMIZE_MODEL_FORM]', error);

      toast({ isError: true });
    }
  };

  return (
    <div className="mt-6 border  bg-neutral-100 dark:bg-neutral-900 rounded-md p-4">
      <div className="font-medium flex items-center justify-between gap-x-2">
        <div className="flex gap-x-2 items-center">
          <span>{t('title')}</span>
        </div>
        <div className="flex gap-x-2 items-center">
          {!isPreviewPage && (
            <Button disabled={isSubmitting} onClick={handleToggleEdit} size="sm" variant="outline">
              {isEditing && <>{t('cancel')}</>}
              {!isEditing && (
                <>
                  <PencilLineIcon className="h-4 w-4 mr-2" />
                  {t('edit')}
                </>
              )}
            </Button>
          )}
          {isEditing && (
            <Button
              disabled={!isValid || isSubmitting}
              isLoading={isSubmitting}
              onClick={form.handleSubmit(handleSubmit)}
              size="sm"
              type="submit"
            >
              {t('save')}
            </Button>
          )}
        </div>
      </div>
      {!isEditing && (
        <div className="text-sm mr-2 mt-4">
          <h4 className="mb-2 font-semibold">{t('systemInstruction.title')}</h4>
          {isString(initialData?.systemInstruction) && (
            <MarkdownText text={initialData?.systemInstruction} />
          )}
          {!initialData?.systemInstruction && (
            <span className="text-muted-foreground italic">{t('systemInstruction.empty')}</span>
          )}
          <h4 className="mb-2 mt-4 font-semibold">{t('temperature.title')}</h4>
          {isNumber(initialData?.temperature) && (
            <TextBadge label={String(initialData.temperature)} variant="indigo" />
          )}
        </div>
      )}
      {isEditing && (
        <Form {...form}>
          <form className="space-y-4 mt-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              control={form.control}
              name="systemInstruction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="mb-4">{t('systemInstruction.title')}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      disabled={isSubmitting}
                      placeholder={t('systemInstruction.placeholder')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="temperature"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex gap-x-2 items-center mb-4">
                    <span>{t('temperature.title')}</span>
                    <TextBadge label={String(field.value)} variant="indigo" />
                  </FormLabel>
                  <FormControl>
                    <Slider
                      disabled={isSubmitting}
                      max={1}
                      min={0}
                      onBlur={field.onBlur}
                      onValueChange={(value: number[]) => field.onChange(value[0])}
                      step={0.1}
                      value={[isNumber(field.value) ? field.value : DEFAULT_TEMPERATURE]}
                    />
                  </FormControl>
                  <FormDescription className="flex justify-between">
                    <span>{t('temperature.labels.precise')}</span>
                    <span>{t('temperature.labels.neutral')}</span>
                    <span>{t('temperature.labels.creative')}</span>
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      )}
    </div>
  );
};
