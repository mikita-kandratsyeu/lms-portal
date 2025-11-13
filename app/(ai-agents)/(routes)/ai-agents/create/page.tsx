'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { fetcher } from '@/lib/fetcher';

const formSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
});

const CreatePage = () => {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const { isSubmitting, isValid } = form.formState;

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const data = await fetcher.post('/api/courses', {
        body: {
          ...values,
        },
        responseType: 'json',
      });

      toast({ title: 'Course has been created' });

      router.push(`/teacher/courses/${data.id}`);
    } catch (error) {
      toast({ isError: true });
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex md:items-center md:justify-center h-full p-6">
      <div>
        <h1 className="text-2xl">Name your AI agent</h1>
        <p className="text-sm text-muted-foreground">
          What would you like to name your agent? Do not worry, you can change this latter.
        </p>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8 mt-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isSubmitting}
                      placeholder="e.g 'Advanced Web Development'"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center gap-x-2">
              <Link href="/ai-agents/general">
                <Button type="button" variant="ghost">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={!isValid || isSubmitting} isLoading={isSubmitting}>
                Continue
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default CreatePage;
