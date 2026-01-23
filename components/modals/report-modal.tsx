'use client';

import { getCookie, setCookie } from 'cookies-next';
import { format, fromUnixTime, sub } from 'date-fns';
import { CalendarIcon, Clock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { SyntheticEvent, useState } from 'react';
import { DateRange } from 'react-day-picker';

import { getAnalytics } from '@/actions/analytics/get-analytics';
import { Button, Calendar, Popover, PopoverContent, PopoverTrigger } from '@/components/ui';
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
import { DATE_RANGE_TEMPLATE, ONE_DAY_SEC, ONE_YEAR_SEC } from '@/constants/common';
import { Report } from '@/constants/payments';
import { roundDate } from '@/lib/date';
import { fetcher } from '@/lib/fetcher';
import { cn } from '@/lib/utils';

type Analytics = Awaited<ReturnType<typeof getAnalytics>>;

type ReportModalProps = {
  children: React.ReactNode;
  reportType: Report;
  stripeConnect?: Analytics['stripeConnect'];
};

export const ReportModal = ({ children, reportType, stripeConnect }: ReportModalProps) => {
  const { toast } = useToast();
  const router = useRouter();

  const [date, setDate] = useState<DateRange | undefined>({
    from: sub(new Date(), { seconds: ONE_DAY_SEC * 10 }),
    to: new Date(),
  });

  const [open, setOpen] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

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
          endDate: roundDate(date?.to as Date),
          reportType,
          startDate: roundDate(date?.from as Date),
        },
      });

      if (response?.url) {
        setCookie(cookieKey, response.url, { maxAge: ONE_DAY_SEC });
      }

      if (!isRequested) {
        setCookie([cookieKey, 'requested'].join('-'), 'true', { maxAge: ONE_DAY_SEC });
        toast({ title: 'Report was requested' });
      } else {
        toast({ title: response?.url ? 'Report is ready' : 'Report in progress...' });
      }

      router.refresh();
    } catch (error) {
      toast({ isError: true, description: (error as Error)?.message ?? '' });
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
            <DialogTitle>Request report</DialogTitle>
            <DialogDescription>
              Select the start and end dates of the report. The report can be requested once a day.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-2 my-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant="outline"
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !date && 'text-muted-foreground',
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date?.from ? (
                    date.to ? (
                      <>
                        {format(date.from, DATE_RANGE_TEMPLATE)}&nbsp;-&nbsp;
                        {format(date.to, DATE_RANGE_TEMPLATE)}
                      </>
                    ) : (
                      format(date.from, DATE_RANGE_TEMPLATE)
                    )
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  disabled={(date) =>
                    date > new Date() ||
                    date <
                      (stripeConnect?.created
                        ? fromUnixTime(stripeConnect.created)
                        : sub(new Date(), { seconds: ONE_YEAR_SEC }))
                  }
                />
              </PopoverContent>
            </Popover>
          </div>
          <DialogFooter>
            <Button disabled={isFetching} isLoading={isFetching} type="submit">
              Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  ) : (
    <>
      {Boolean(fileUrl) && <button onClick={handleSubmit}>{children}</button>}
      {!fileUrl && (
        <Button
          variant="outline"
          onClick={handleSubmit}
          disabled={isFetching}
          isLoading={isFetching}
        >
          {!isFetching && <Clock className="h-4 w-4 mr-2" />}
          Check report status
        </Button>
      )}
    </>
  );
};
