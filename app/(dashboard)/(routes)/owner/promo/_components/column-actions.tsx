'use client';

import { MoreHorizontal, XCircle } from 'lucide-react';
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
import { PromoStatus } from '@/constants/payments';
import { fetcher } from '@/lib/fetcher';

type ColumnActionsProps = {
  promoId: string;
};

export const ColumnActions = ({ promoId }: ColumnActionsProps) => {
  const { toast } = useToast();
  const router = useRouter();

  const [isFetching, setIsFetching] = useState(false);

  const handleAction = async () => {
    try {
      setIsFetching(true);

      await fetcher.post(`/api/payments/promo?action=${PromoStatus.DECLINED}`, {
        body: {
          promoId,
        },
        responseType: 'json',
      });

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
        <DropdownMenuItem className="hover:cursor-pointer text-red-500" onClick={handleAction}>
          <XCircle className="h-4 w-4  mr-2" />
          Deactivate
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
