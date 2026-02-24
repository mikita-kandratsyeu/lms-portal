'use client';

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from '@radix-ui/react-icons';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';

import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { PAGE_SIZES } from '@/constants/paginations';

type StoragePaginationProps = {
  currentPage: number;
  pageCount: number;
  pageSize: number;
};

export const StoragePagination = ({ currentPage, pageCount, pageSize }: StoragePaginationProps) => {
  const t = useTranslations('settings.storage.pagination');
  const router = useRouter();
  const searchParams = useSearchParams();

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('pageIndex', newPage.toString());
    router.push(`/settings/storage?${params.toString()}`);
  };

  const handlePageSizeChange = (newSize: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('pageSize', newSize);
    params.set('pageIndex', '0');
    router.push(`/settings/storage?${params.toString()}`);
  };

  const canPreviousPage = currentPage > 0;
  const canNextPage = currentPage < pageCount - 1;

  if (pageCount <= 1) return null;

  return (
    <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 mt-6">
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
        {currentPage + 1} / {pageCount || 1}
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
    </div>
  );
};
