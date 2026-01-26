import { format } from 'date-fns';
import { AlertTriangle, CheckCircle2, Lightbulb } from 'lucide-react';
import { useTranslations } from 'next-intl';
import React from 'react';
import { HeatMapGrid } from 'react-grid-heatmap';

import { getNovaPulse } from '@/actions/nova-pulse/get-nova-pulse';
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui';
import { formatTimeInSeconds } from '@/lib/date';
import { isArray } from '@/lib/guard';
import { cn } from '@/lib/utils';
import { capitalize } from '@/lib/utils';

type HeatmapProps = {
  data: Awaited<ReturnType<typeof getNovaPulse>>['heatMap'];
  summary: Awaited<ReturnType<typeof getNovaPulse>>['summary'];
};

const getHeatMapColor = (
  value: number,
  min: number,
  max: number,
  startColor: { r: number; g: number; b: number },
  endColor: { r: number; g: number; b: number },
) => {
  const normalized = Math.min(Math.max((value - min) / (max - min), 0), 1);

  const eased =
    normalized < 0.5 ? 2 * normalized * normalized : 1 - Math.pow(-2 * normalized + 2, 2) / 2;

  const r = Math.floor(startColor.r + eased * (endColor.r - startColor.r));
  const g = Math.floor(startColor.g + eased * (endColor.g - startColor.g));
  const b = Math.floor(startColor.b + eased * (endColor.b - startColor.b));

  return `rgb(${r}, ${g}, ${b})`;
};

export const Heatmap = ({ data, summary }: HeatmapProps) => {
  const t = useTranslations('nova-pulse.heatmap');

  const xLabels = new Array(12).fill(0).map((_, index) => {
    const date = new Date(2024, index, 1);

    return capitalize(format(date, 'LLL'));
  });
  const yLabels = Object.keys(data)
    .map((key) => key.split('-')[0])
    .filter((value, index, arr) => arr.indexOf(value) === index)
    .toSorted((a, b) => Number(b) - Number(a));

  if (yLabels.length === 0) {
    yLabels.push(format(new Date(), 'yyyy'));
  }

  const maxValue = Math.max(...Object.values(data).map((progress) => progress.xp));

  const heatMapData: number[][] = [];

  yLabels.forEach((y) => {
    const row = xLabels.map((_, indexX) => {
      const key = `${y}-${indexX + 1 < 10 ? 0 : ''}${indexX + 1}`;
      const xp = data?.[key]?.xp;

      return xp ?? 0;
    });

    heatMapData.push(row);
  });

  return (
    <Card className="shadow-none h-full flex-1">
      <div className="p-4 sm:p-6">
        <CardTitle className="mb-2">{t('title')}</CardTitle>
        <CardDescription className="text-xs sm:text-sm my-4 leading-relaxed">
          <div className="flex flex-col gap-y-3 sm:gap-y-4">
            <p className="text-foreground/80">{summary.body}</p>
            {isArray(summary.strengths) && summary.strengths.length > 0 && (
              <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3 sm:p-4 border border-green-200 dark:border-green-800">
                <h4 className="text-sm sm:text-base font-semibold mb-2 text-green-700 dark:text-green-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                  {t('strengths')}
                </h4>
                <ul className="list-disc list-inside space-y-1.5 text-green-900 dark:text-green-200">
                  {summary.strengths.map((strength, index) => (
                    <li key={index} className="leading-relaxed">
                      {strength}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {isArray(summary.weaknesses) && summary.weaknesses.length > 0 && (
              <div className="bg-amber-50 dark:bg-amber-950/20 rounded-lg p-3 sm:p-4 border border-amber-200 dark:border-amber-800">
                <h4 className="text-sm sm:text-base font-semibold mb-2 text-amber-700 dark:text-amber-400 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
                  {t('weaknesses')}
                </h4>
                <ul className="list-disc list-inside space-y-1.5 text-amber-900 dark:text-amber-200">
                  {summary.weaknesses.map((weakness, index) => (
                    <li key={index} className="leading-relaxed">
                      {weakness}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {isArray(summary.recommendations) && summary.recommendations.length > 0 && (
              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 sm:p-4 border border-blue-200 dark:border-blue-800">
                <h4 className="text-sm sm:text-base font-semibold mb-2 text-blue-700 dark:text-blue-400 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5" />
                  {t('recommendations')}
                </h4>
                <ul className="list-disc list-inside space-y-1.5 text-blue-900 dark:text-blue-200">
                  {summary.recommendations.map((recommendation, index) => (
                    <li key={index} className="leading-relaxed">
                      {recommendation}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </CardDescription>
      </div>
      <CardContent className="m-0 p-4 sm:p-6 pt-0">
        <div className="relative">
          <div className="overflow-x-auto overflow-y-hidden pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div
              className="min-w-max sm:min-w-0"
              style={{
                width: '100%',
                fontFamily: 'var(--font-sans), sans-serif',
              }}
            >
              <HeatMapGrid
                data={heatMapData}
                yLabels={yLabels}
                xLabels={xLabels}
                cellRender={(x, y, value) => {
                  const style = {
                    opacity: value ? 1 : 0.35,
                    background: getHeatMapColor(
                      value,
                      0,
                      maxValue,
                      { r: 14, g: 165, b: 233 },
                      { r: 34, g: 197, b: 94 },
                    ),
                  };

                  const key = `${yLabels[x]}-${y + 1 < 10 ? 0 : ''}${y + 1}`;
                  const targetInfo = data[key];

                  return value > 0 ? (
                    <TooltipProvider key={`${x}-${y}`}>
                      <Tooltip delayDuration={200}>
                        <TooltipTrigger asChild>
                          <div
                            className={cn(
                              'w-full h-full flex items-center justify-center',
                              'border-2 border-transparent',
                              'hover:cursor-pointer hover:border-foreground/40',
                              'hover:brightness-110 hover:shadow-md',
                              'transition-all duration-150 ease-in-out',
                              'rounded-sm',
                              'text-white dark:text-white font-medium',
                              'relative',
                            )}
                            style={style}
                          >
                            <span className="text-[0.6rem] sm:text-xs drop-shadow-sm">{value}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent
                          side="top"
                          className="text-xs sm:text-sm border shadow-lg"
                          sideOffset={5}
                        >
                          <div className="space-y-1">
                            <p className="font-semibold">
                              {t('tooltip.xp', { xp: targetInfo.xp })}
                            </p>
                            {targetInfo.totalSpentTimeInSec > 0 && (
                              <p className="text-muted-foreground">
                                {t('tooltip.time', {
                                  time: formatTimeInSeconds(targetInfo.totalSpentTimeInSec),
                                })}
                              </p>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <div
                      className="w-full h-full border-2 border-transparent rounded-sm transition-all duration-150 hover:border-border/40 hover:bg-muted/20"
                      style={style}
                    >
                      &nbsp;
                    </div>
                  );
                }}
                xLabelsStyle={(index) => ({
                  color: 'hsl(var(--muted-foreground))',
                  fontSize: 'clamp(0.625rem, 2vw, 0.75rem)',
                  fontWeight: '500',
                  opacity: index % 2 ? 0.4 : 1,
                })}
                yLabelsStyle={() => ({
                  fontSize: 'clamp(0.625rem, 2vw, 0.75rem)',
                  textTransform: 'uppercase',
                  color: 'hsl(var(--muted-foreground))',
                  fontWeight: '600',
                  letterSpacing: '0.05em',
                })}
                cellStyle={() => ({
                  background: 'none',
                  border: 'none',
                  borderRadius: '0',
                  fontSize: '.7rem',
                  margin: 'clamp(1px, 0.2vw, 2px)',
                })}
                cellHeight="clamp(2rem, 4vw, 2.5rem)"
                xLabelsPos="bottom"
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between pt-4">
          <div className="text-xs text-muted-foreground">
            <span className="font-semibold text-primary">{Object.keys(data).length}</span>{' '}
            {t('monthsTracked')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
