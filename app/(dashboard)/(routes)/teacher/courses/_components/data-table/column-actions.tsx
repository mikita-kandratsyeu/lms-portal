'use client';

import { Copy, MoreHorizontal, Pencil } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/components/ui/use-toast';
import { fetcher } from '@/lib/fetcher';

type ColumnActionsProps = {
  courseId: string;
};

export const ColumnActions = ({ courseId }: ColumnActionsProps) => {
  const { toast } = useToast();
  const router = useRouter();

  const [isFetching, setIsFetching] = useState(false);

  const handleAction = (action: 'clone' | 'edit') => async () => {
    try {
      setIsFetching(true);

      if (action === 'clone') {
        const response = await fetcher.post(`/api/courses/${courseId}/clone`, {
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          const errorText = await response.text();

          throw new Error(`Failed to clone course: ${courseId}: ${response.status} ${errorText}`);
        }

        toast({ title: response?.courseId });
      }

      if (action === 'edit') {
        router.push(`/teacher/courses/${courseId}`);
      }

      router.refresh();
    } catch (error) {
      toast({ isError: true });
    } finally {
      setIsFetching(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="h-4 w-8 p-0" variant="ghost" disabled={isFetching}>
          {isFetching && <Spinner className="h-4 w-4" />}
          {!isFetching && (
            <>
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem className="hover:cursor-pointer" onClick={handleAction('edit')}>
          <Pencil className="h-4 w-4  mr-2" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem className="hover:cursor-pointer" onClick={handleAction('clone')}>
          <Copy className="h-4 w-4  mr-2" />
          Clone
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
