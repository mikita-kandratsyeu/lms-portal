'use client';

import { useTranslations } from 'next-intl';
import { toast as soonerToast } from 'sonner';

type Toast = {
  action?: { label: string; onClick: () => void };
  description?: string;
  duration?: number;
  isError?: boolean;
  promiseData?: {
    promise: Promise<any>;
    data: {
      success: (data: any) => { message: string; description: string };
      loading?: string;
      error?: string;
    };
  };
  title?: string;
  type?: 'success' | 'info' | 'warning';
};

const toast =
  (t: (key: string) => string) =>
  ({
    action,
    description,
    duration,
    isError = false,
    promiseData,
    title = '',
    type = 'info',
  }: Toast) => {
    if (isError) {
      return soonerToast.error(t('error.title'), { description: description ?? t('error.body') });
    }

    if (promiseData) {
      return soonerToast.promise(promiseData.promise, promiseData.data);
    }

    const toast = soonerToast[type];

    return toast(title, {
      action,
      description,
      duration,
    });
  };

function useToast() {
  const t = useTranslations('toast');

  return {
    toast: toast(t),
  };
}

export { useToast };
