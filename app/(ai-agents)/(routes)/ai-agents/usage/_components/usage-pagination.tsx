'use client';

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCallback } from 'react';

import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { PAGE_SIZES } from '@/constants/paginations';

type UsagePaginationProps = {
  currentPage: number;
  pageSize: number;
  pageCount: number;
};

export const UsagePagination = ({ currentPage, pageSize, pageCount }: UsagePaginationProps) => {
  const t = useTranslations('ai-agents.usage.pagination');
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = useCallback(
    (newPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('pageIndex', newPage.toString());
      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  const handlePageSizeChange = useCallback(
    (newSize: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('pageSize', newSize);
      params.delete('pageIndex');
      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  const canPreviousPage = currentPage > 0;
  const canNextPage = currentPage < pageCount - 1;
  const showNavigation = pageCount > 1;

  return (
    <div className="flex items-center justify-end gap-2">
      <Select value={`${pageSize}`} onValueChange={handlePageSizeChange}>
        <SelectTrigger className="h-8 w-[70px]">
          <SelectValue placeholder={pageSize} />
        </SelectTrigger>
        <SelectContent side="top">
          {PAGE_SIZES.map((size) => (
            <SelectItem key={size} value={`${size}`}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {showNavigation && (
        <>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handlePageChange(0)}
            disabled={!canPreviousPage}
          >
            <span className="sr-only">{t('goToFirstPage')}</span>
            <DoubleArrowLeftIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!canPreviousPage}
          >
            <span className="sr-only">{t('goToPreviousPage')}</span>
            <ChevronLeftIcon className="h-4 w-4" />
          </Button>
          <div className="flex items-center justify-center text-sm font-medium min-w-[60px]">
            {currentPage + 1} / {pageCount}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!canNextPage}
          >
            <span className="sr-only">{t('goToNextPage')}</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handlePageChange(pageCount - 1)}
            disabled={!canNextPage}
          >
            <span className="sr-only">{t('goToLastPage')}</span>
            <DoubleArrowRightIcon className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
};
