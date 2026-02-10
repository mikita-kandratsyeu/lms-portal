'use client';

import { format } from 'date-fns';
import { useLocale, useTranslations } from 'next-intl';

import type { UsageRow } from '@/actions/ai/pricing/get-ai-pricing';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui';
import { TIMESTAMP_TEMPLATE } from '@/constants/common';
import { formatPrice } from '@/lib/format';
import { getFormatLocale } from '@/lib/locale';

const formatTokens = (count: number) => {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;

  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;

  return count.toString();
};

type UsageTableProps = {
  rows: UsageRow[];
};

export const UsageTable = ({ rows }: UsageTableProps) => {
  const t = useTranslations('ai-agents.usage');
  const locale = useLocale();
  const formatLocale = getFormatLocale(locale);

  if (!rows.length) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border">
        <p className="text-sm text-muted-foreground">{t('table.empty')}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[160px]">{t('table.date')}</TableHead>
            <TableHead className="hidden min-w-[180px] md:table-cell">{t('table.email')}</TableHead>
            <TableHead className="min-w-[160px]">{t('table.model')}</TableHead>
            <TableHead className="hidden lg:table-cell">{t('table.provider')}</TableHead>
            <TableHead className="hidden xl:table-cell">{t('table.referer')}</TableHead>
            <TableHead className="text-right">{t('table.inputTokens')}</TableHead>
            <TableHead className="text-right">{t('table.outputTokens')}</TableHead>
            <TableHead className="hidden text-right sm:table-cell">
              {t('table.totalTokens')}
            </TableHead>
            <TableHead className="text-right">{t('table.cost')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="text-xs">
                {format(new Date(row.createdAt), TIMESTAMP_TEMPLATE, { locale: formatLocale })}
              </TableCell>
              <TableCell className="hidden text-xs md:table-cell">
                <span className="max-w-[180px] truncate block">{row.email}</span>
              </TableCell>
              <TableCell className="text-xs font-medium">{row.model}</TableCell>
              <TableCell className="hidden text-xs capitalize lg:table-cell">
                {row.provider}
              </TableCell>
              <TableCell className="hidden text-xs xl:table-cell">
                <span className="max-w-[160px] truncate block text-muted-foreground">
                  {row.referer ?? '—'}
                </span>
              </TableCell>
              <TableCell className="text-right text-xs tabular-nums">
                {formatTokens(row.inputTokens)}
              </TableCell>
              <TableCell className="text-right text-xs tabular-nums">
                {formatTokens(row.outputTokens)}
              </TableCell>
              <TableCell className="hidden text-right text-xs tabular-nums sm:table-cell">
                {formatTokens(row.totalTokens)}
              </TableCell>
              <TableCell className="text-right text-xs tabular-nums">
                {formatPrice(row.costCents)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
