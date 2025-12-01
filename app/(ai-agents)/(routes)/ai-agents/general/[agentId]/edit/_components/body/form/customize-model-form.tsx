'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { AiAgent, AiModel } from '@prisma/client';
import { PencilLineIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Markdown from 'react-markdown';
import * as z from 'zod';

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
  initialData: AiAgent & { aiModels: AiModel[] };
};

const formSchema = z.object({
  systemInstruction: z.string(),
  temperature: z.number().default(DEFAULT_TEMPERATURE),
});

export const CustomizeModelForm = ({ agentId, initialData }: CustomizeModelFormProps) => {
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

      toast({ title: 'LLM engine has been updated' });
      handleToggleEdit();

      router.refresh();
    } catch (error) {
      console.error('[CUSTOMIZE_MODEL_FORM]', error);

      toast({ isError: true });
    }
  };

  return (
    <div className="mt-6 border  bg-neutral-100 dark:bg-neutral-900 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        <div className="flex gap-x-2 items-center">
          <span>LLM customization</span>
        </div>
        <div className="flex gap-x-2 items-center">
          <Button disabled={isSubmitting} onClick={handleToggleEdit} size="sm" variant="outline">
            {isEditing && <>Cancel</>}
            {!isEditing && (
              <>
                <PencilLineIcon className="h-4 w-4 mr-2" />
                Edit
              </>
            )}
          </Button>
          {isEditing && (
            <Button
              disabled={!isValid || isSubmitting}
              isLoading={isSubmitting}
              onClick={form.handleSubmit(handleSubmit)}
              size="sm"
              type="submit"
            >
              Save
            </Button>
          )}
        </div>
      </div>
      {!isEditing && (
        <div className={'text-sm mr-2 mt-4'}>
          <h4 className="mb-2 font-semibold">System instruction</h4>
          {isString(initialData?.systemInstruction) && (
            <Markdown>{initialData?.systemInstruction}</Markdown>
          )}
          {!initialData?.systemInstruction && (
            <span className="text-neutral-500 italic">No system instruction for LLM engine.</span>
          )}
          <h4 className="mb-2 mt-4 font-semibold">Temperature</h4>
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
                  <FormLabel className="mb-4">System instruction</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      disabled={isSubmitting}
                      placeholder="e.g. 'You are an AI agent who ...'"
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
                    <span>Temperature</span>
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
                    <span>Precise</span>
                    <span>Neutral</span>
                    <span>Creative</span>
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
