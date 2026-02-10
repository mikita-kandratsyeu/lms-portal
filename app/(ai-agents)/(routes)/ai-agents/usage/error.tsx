'use client';

import { useTranslations } from 'next-intl';

import { Button } from '@/components/ui';

type ErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

const UsageError = ({ error, reset }: ErrorProps) => {
  const t = useTranslations('ai-agents.usage.errors');

  return (
    <div className="flex min-h-[400px] w-full items-center justify-center p-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <h2 className="text-xl font-semibold">{t('title')}</h2>
        <p className="text-sm text-muted-foreground">{t('body')}</p>
        {process.env.NODE_ENV !== 'production' && error?.message && (
          <p className="text-xs text-muted-foreground">({error.message})</p>
        )}
        <Button variant="secondary" onClick={reset}>
          {t('tryAgain')}
        </Button>
      </div>
    </div>
  );
};

export default UsageError;
