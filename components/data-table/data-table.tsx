'use client';

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import * as React from 'react';

import { getStripePromo } from '@/actions/stripe/get-stripe-promo';
import { MarkAllButton } from '@/app/(dashboard)/(routes)/settings/notifications/_components/MarkAllButton';
import { Button, Input } from '@/components/ui';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PAGE_SIZES } from '@/constants/paginations';
import { useDebounce } from '@/hooks/use-debounce';
import { useSearchLineParams } from '@/hooks/use-search-params';
import { getNotificationActionName } from '@/lib/notifications';

import { PromoModal } from '../modals/promo-modal';
import { DataTablePagination } from './columns/data-table-pagination';

type StripePromo = Awaited<ReturnType<typeof getStripePromo>>;
type Coupon = StripePromo['coupons'][number];
type Customer = StripePromo['customers'][number];

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  coupons?: Coupon[];
  customers?: Customer[];
  data: TData[];
  isCsmPage?: boolean;
  isNotificationPage?: boolean;
  isPromoPage?: boolean;
  isServerSidePagination?: boolean;
  isTeacherCoursesPage?: boolean;
  isUsersPage?: boolean;
  noLabel?: string;
  pageCount?: number;
}

export function DataTable<TData, TValue>({
  columns,
  coupons = [],
  customers = [],
  data,
  isCsmPage = false,
  isNotificationPage = false,
  isPromoPage = false,
  isServerSidePagination = true,
  isTeacherCoursesPage = false,
  isUsersPage = false,
  noLabel,
  pageCount = 0,
}: Readonly<DataTableProps<TData, TValue>>) {
  const searchParams = useSearchParams();

  const notificationsT = useTranslations('notifications.table-data');

  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: PAGE_SIZES[0],
    ...Object.fromEntries(searchParams.entries()),
  });

  const [search, setSearch] = React.useState('');

  const debouncedSearch = useDebounce(search);

  useSearchLineParams({ ...pagination, search: debouncedSearch }, !isServerSidePagination);

  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: isServerSidePagination ? undefined : getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    manualPagination: isServerSidePagination,
    state: {
      columnFilters,
      sorting,
      pagination,
    },
    pageCount: isServerSidePagination ? pageCount : undefined,
  });

  const filterPlaceholder = (() => {
    if (isTeacherCoursesPage) {
      return 'Filter courses...';
    }

    if (isPromoPage) {
      return 'Filter promotion codes...';
    }

    if (isNotificationPage) {
      return notificationsT('filter');
    }

    if (isUsersPage) {
      return 'Filter users email...';
    }

    if (isCsmPage) {
      return 'Filter csm issues...';
    }

    return '';
  })();

  return (
    <div>
      {(isTeacherCoursesPage || isPromoPage || isNotificationPage || isUsersPage || isCsmPage) && (
        <div className="flex sm:items-center pb-4 justify-between sm:space-x-2 sm:flex-row flex-col gap-y-4">
          <div className="flex gap-x-2 w-full">
            <Input
              placeholder={filterPlaceholder}
              value={
                isUsersPage || isCsmPage
                  ? search
                  : (table.getColumn('title')?.getFilterValue() as string) ?? ''
              }
              onChange={(event) => {
                if (!(isUsersPage || isCsmPage)) {
                  table.getColumn('title')?.setFilterValue(event.target.value);
                }

                setSearch(event.target.value);
              }}
              className="sm:max-w-sm"
            />
          </div>
          {isTeacherCoursesPage && (
            <Link href="/teacher/create">
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                New Course
              </Button>
            </Link>
          )}
          {isPromoPage && (
            <PromoModal coupons={coupons} customers={customers}>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" />
                Add promotion code
              </Button>
            </PromoModal>
          )}
          {isNotificationPage && (
            <>
              {(() => {
                const filteredRows = table.getFilteredSelectedRowModel().rows;
                const amountOfSelectedRows = filteredRows.length;

                const { action, ids } = getNotificationActionName(
                  filteredRows.map((row) => row.original) as unknown as any,
                );

                return (
                  amountOfSelectedRows > 0 && (
                    <MarkAllButton
                      action={action}
                      amount={amountOfSelectedRows}
                      ids={ids}
                      reset={table.resetRowSelection}
                    />
                  )
                );
              })()}
            </>
          )}
        </div>
      )}
      <div className="rounded-md border mb-4">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <>
                {noLabel && (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center text-muted-foreground"
                    >
                      {noLabel}
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
