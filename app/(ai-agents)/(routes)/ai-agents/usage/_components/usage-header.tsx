'use client';

import { Download, Mail } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useCallback, useState } from 'react';

import { Button } from '@/components/ui';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Period } from '@/constants/ai/analytics';
import { fetcher } from '@/lib/fetcher';

type UsageHeaderProps = {
  title: string;
  subtitle: string;
  period: string;
  isEmailConfirmed: boolean;
};

const periodOptionIds = [Period['7D'], Period['30D'], Period['90D'], Period.ALL];

export const UsageHeader = ({ title, subtitle, period, isEmailConfirmed }: UsageHeaderProps) => {
  const t = useTranslations('ai-agents.usage');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isSending, setIsSending] = useState(false);

  const periodOptions = periodOptionIds.map((id) => ({
    id,
    label: t(`periods.${id}`),
  }));

  const handlePeriodChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('period', value);
      params.delete('pageIndex');
      router.push(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  const handleExportCsv = useCallback(() => {
    const params = new URLSearchParams();
    params.set('period', period);
    window.open(`/api/ai/usage/export?${params.toString()}`, '_blank');
  }, [period]);

  const handleSendByEmail = useCallback(async () => {
    setIsSending(true);
    try {
      await fetcher.post('/api/ai/usage/export', {
        body: { period },
        responseType: 'json',
      });
      toast({ title: t('sendByEmailSuccess'), type: 'success' });
    } catch (error: unknown) {
      const msg = (error as Error)?.message;
      let description = t('errors.exportFailed');

      if (msg) {
        try {
          const data = JSON.parse(msg) as { error?: string };
          if (data.error) description = data.error;
          else description = msg;
        } catch {
          description = msg;
        }
      }

      toast({ isError: true, description });
    } finally {
      setIsSending(false);
    }
  }, [period, toast, t]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-xl font-semibold sm:text-2xl">{title}</h1>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Tabs value={period} onValueChange={handlePeriodChange}>
            <TabsList className="grid h-auto w-full grid-cols-2 gap-1 sm:h-9 sm:inline-flex sm:w-auto sm:grid-cols-none sm:gap-0">
              {periodOptions.map((option) => (
                <TabsTrigger key={option.id} value={option.id} className="w-full">
                  {option.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm" onClick={handleExportCsv} className="gap-2">
            <Download className="h-4 w-4" />
            {t('exportCsv')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSendByEmail}
            disabled={isSending || !isEmailConfirmed}
            title={!isEmailConfirmed ? t('sendByEmailDisabledReason') : undefined}
            className="gap-2"
          >
            <Mail className="h-4 w-4" />
            {isSending ? t('sendByEmailSending') : t('sendByEmail')}
          </Button>
        </div>
      </div>
    </div>
  );
};
