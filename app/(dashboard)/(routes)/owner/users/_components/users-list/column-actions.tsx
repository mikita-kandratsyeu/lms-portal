'use client';

import { format } from 'date-fns/format';
import { FileText, MoreHorizontal } from 'lucide-react';
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
import { TIMESTAMP_EMAIL_TEMPLATE } from '@/constants/common';
import { fetcher } from '@/lib/fetcher';

type ColumnActionsProps = {
  userId: string;
};

export const ColumnActions = ({ userId }: ColumnActionsProps) => {
  const { toast } = useToast();
  const router = useRouter();

  const [isFetching, setIsFetching] = useState(false);

  const handleAction = (action: 'pdf') => async () => {
    try {
      setIsFetching(true);

      if (action === 'pdf') {
        const response = await fetcher.post(`/api/users/${userId}/report`, {
          headers: { 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          const errorText = await response.text();

          throw new Error(`Failed to generate PDF: ${response.status} ${errorText}`);
        }

        const blob = await response.blob();

        const url = globalThis.URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${userId}_${format(new Date(), TIMESTAMP_EMAIL_TEMPLATE)}_report.pdf`;

        document.body.appendChild(a);
        a.click();

        globalThis.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        return blob;
      }

      router.refresh();
    } catch (error) {
      toast({ isError: true, description: (error as Error)?.message ?? '' });
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
        <DropdownMenuItem className="hover:cursor-pointer" onClick={handleAction('pdf')}>
          <FileText className="h-4 w-4  mr-2" />
          Get PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
