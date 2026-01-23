'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Course } from '@prisma/client';
import { Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import {
  Checkbox,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { DEFAULT_LANGUAGE, SUPPORTED_LOCALES } from '@/constants/locale';
import { fetcher } from '@/lib/fetcher';

type AdvancedOptionsFormProps = {
  courseId: string;
  initialData: Course;
};

const formSchema = z.object({
  isPremium: z.boolean().default(false),
  language: z.string().default(DEFAULT_LANGUAGE),
});

export const AdvancedOptionsForm = ({ courseId, initialData }: AdvancedOptionsFormProps) => {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isPremium: Boolean(initialData.isPremium),
      language: initialData.language ?? DEFAULT_LANGUAGE,
    },
  });

  const [isEditing, setIsEditing] = useState(false);

  const { isSubmitting, isValid } = form.formState;

  const handleToggleEdit = () => setIsEditing((prev) => !prev);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await fetcher.patch(`/api/courses/${courseId}`, { body: values });

      toast({ title: 'Course updated' });
      handleToggleEdit();

      router.refresh();
    } catch (error) {
      toast({ isError: true, description: (error as Error)?.message ?? '' });
    }
  };

  return (
    <div className="mt-6 border  bg-neutral-100 dark:bg-neutral-900 rounded-md p-4">
      <div className="font-medium flex items-center justify-between">
        Advanced options
        <Button onClick={handleToggleEdit} variant="outline" size="sm">
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </>
          )}
        </Button>
      </div>
      {!isEditing && (
        <div className="text-sm mt-4 gap-y-2">
          <div>
            Current language of course is{' '}
            <strong>
              {SUPPORTED_LOCALES.find(({ key }) => key === initialData.language)?.title}
            </strong>
            .
          </div>
          <div>
            {initialData.isPremium ? (
              <span>
                This course is <strong>Premium</strong> and available only for paid subscribers.
              </span>
            ) : (
              <span>
                This course is <strong>Basic</strong>
              </span>
            )}
          </div>
        </div>
      )}
      {isEditing && (
        <Form {...form}>
          <form className="space-y-4 mt-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              control={form.control}
              name="language"
              render={({ field }) => (
                <FormItem className="shadow-none">
                  <p className="text-sm">General course language</p>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a language" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SUPPORTED_LOCALES.map(({ key, title }) => (
                        <SelectItem key={key} value={key}>
                          {title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isPremium"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormDescription>Make this course Premium</FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <div className="flex items-center gap-x-2">
              <Button disabled={!isValid || isSubmitting} isLoading={isSubmitting} type="submit">
                Save
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};
