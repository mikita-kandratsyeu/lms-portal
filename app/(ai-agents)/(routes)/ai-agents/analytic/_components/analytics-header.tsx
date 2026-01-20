'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type Option = {
  id: string;
  label: string;
};

type AnalyticsHeaderProps = {
  title: string;
  subtitle: string;
  scope: string;
  period: string;
  scopeOptions: Option[];
  periodOptions: Option[];
  onScopeChange: (value: string) => void;
  onPeriodChange: (value: string) => void;
};

export const AnalyticsHeader = ({
  title,
  subtitle,
  scope,
  period,
  scopeOptions,
  periodOptions,
  onScopeChange,
  onPeriodChange,
}: AnalyticsHeaderProps) => (
  <div className="flex flex-col gap-4">
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-xl font-semibold sm:text-2xl">{title}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Tabs value={scope} onValueChange={onScopeChange}>
          <TabsList className="grid h-auto w-full grid-cols-3 gap-1 sm:h-9 sm:inline-flex sm:w-auto sm:gap-0">
            {scopeOptions.map((option) => (
              <TabsTrigger key={option.id} value={option.id} className="w-full">
                {option.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <Tabs value={period} onValueChange={onPeriodChange}>
          <TabsList className="grid h-auto w-full grid-cols-2 gap-1 sm:h-9 sm:inline-flex sm:w-auto sm:grid-cols-none sm:gap-0">
            {periodOptions.map((option) => (
              <TabsTrigger key={option.id} value={option.id} className="w-full">
                {option.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
    </div>
  </div>
);
