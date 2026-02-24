'use client';

import { getCookie, setCookie } from 'cookies-next';
import { format, fromUnixTime, sub } from 'date-fns';
import { Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import React, { SyntheticEvent, useEffect, useState } from 'react';

import { getAnalytics } from '@/actions/analytics/get-analytics';
import { Button, Input, Label } from '@/components/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { ONE_DAY_SEC } from '@/constants/common';
import { Report } from '@/constants/payments';
import { roundDate } from '@/lib/date';
import { fetcher } from '@/lib/fetcher';

const toDateString = (date: Date) => format(date, 'yyyy-MM-dd');

type Analytics = Awaited<ReturnType<typeof getAnalytics>>;

type ReportModalProps = {
  children: React.ReactNode;
  reportType: Report;
  stripeConnect?: Analytics['stripeConnect'];
};

const parseErrorMessage = (message: string): string => {
  try {
    const parsed = JSON.parse(message) as { error?: string };

    return parsed?.error ?? message;
  } catch {
    return message;
  }
};

export const ReportModal = ({ children, reportType, stripeConnect }: ReportModalProps) => {
  const t = useTranslations('report-modal');
  const { toast } = useToast();
  const router = useRouter();

  const today = toDateString(new Date());
  const fallbackMinDate = stripeConnect?.created
    ? toDateString(fromUnixTime(stripeConnect.created))
    : toDateString(sub(new Date(), { years: 1 }));

  const [open, setOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [minDate, setMinDate] = useState(fallbackMinDate);
  const [startDate, setStartDate] = useState(toDateString(sub(new Date(), { days: 10 })));
  const [endDate, setEndDate] = useState(today);

  useEffect(() => {
    if (!open) return;

    fetcher
      .get(`/api/payments/report/available-dates?reportType=${reportType}`, {
        responseType: 'json',
        cache: 'no-store',
      })
      .then((data: { minDate?: string }) => {
        if (data?.minDate) {
          const effectiveMin = fallbackMinDate > data.minDate ? fallbackMinDate : data.minDate;
          setMinDate(effectiveMin);
          setStartDate((prev) => (prev < effectiveMin ? effectiveMin : prev));
        }
      })
      .catch(() => {
        setMinDate(fallbackMinDate);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fallbackMinDate is stable
  }, [open, reportType]);

  useEffect(() => {
    if (startDate && endDate && startDate > endDate) {
      setEndDate(startDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only sync when startDate changes
  }, [startDate]);

  const cookieKey = `report-${stripeConnect?.id ?? 'nonId'}-${reportType}`;

  const isRequested = Boolean(getCookie([cookieKey, 'requested'].join('-')));
  const fileUrl = getCookie(cookieKey);

  const handleSubmit = async (event: SyntheticEvent) => {
    event.preventDefault();

    if (fileUrl) {
      window.location.href = fileUrl;

      return;
    }

    try {
      setIsFetching(true);

      const response = await fetcher.post(`/api/payments/report/${stripeConnect?.id ?? 'nonId'}`, {
        responseType: 'json',
        body: {
          endDate: roundDate(new Date(endDate)),
          reportType,
          startDate: roundDate(new Date(startDate)),
        },
      });

      if (response?.url) {
        setCookie(cookieKey, response.url, { maxAge: ONE_DAY_SEC });
      }

      if (!isRequested) {
        setCookie([cookieKey, 'requested'].join('-'), 'true', { maxAge: ONE_DAY_SEC });
        toast({ title: response?.url ? t('toast.ready') : t('toast.requested') });
      } else {
        toast({ title: response?.url ? t('toast.ready') : t('toast.inProgress') });
      }

      router.refresh();
    } catch (error) {
      const message = parseErrorMessage((error as Error)?.message ?? '');
      toast({ isError: true, description: message || t('errors.generic') });
    } finally {
      setIsFetching(false);
      setOpen(false);
    }
  };

  return !isRequested ? (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{t('title')}</DialogTitle>
            <DialogDescription>{t('description')}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 my-4">
            <div className="grid gap-2">
              <Label htmlFor="start-date">{t('startDate')}</Label>
              <Input
                id="start-date"
                type="date"
                min={minDate}
                max={today}
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end-date">{t('endDate')}</Label>
              <Input
                id="end-date"
                type="date"
                min={startDate}
                max={today}
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              disabled={isFetching || !startDate || !endDate || startDate > endDate}
              isLoading={isFetching}
              type="submit"
            >
              {isFetching ? t('toast.generating') : t('request')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  ) : (
    <>
      {Boolean(fileUrl) && (
        <div
          onClick={handleSubmit}
          className="cursor-pointer [&_button]:cursor-pointer inline-flex"
        >
          {children}
        </div>
      )}
      {!fileUrl && (
        <Button
          variant="outline"
          onClick={handleSubmit}
          disabled={isFetching}
          isLoading={isFetching}
        >
          {!isFetching && <Clock className="h-4 w-4 mr-2" />}
          {t('checkStatus')}
        </Button>
      )}
    </>
  );
};
