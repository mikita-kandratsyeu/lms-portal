'use client';

import { Skeleton } from '../ui/skeleton';

export const LeaderBoardSkeleton = () => (
  <div className="p-6 flex flex-col mb-6">
    <div className="mb-8">
      <Skeleton className="h-8 w-[200px] mb-2" />
      <Skeleton className="h-4 w-full max-w-[400px]" />
    </div>

    <div className="w-full rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="bg-muted/40 p-4 border-b">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-[60px]" />
          <Skeleton className="h-4 w-[80px]" />
          <Skeleton className="h-4 w-[60px]" />
        </div>
      </div>

      {[...Array(5)].map((_, index) => (
        <div key={index} className="flex items-center justify-between p-4 border-b last:border-b-0">
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="h-5 w-[40px]" />
            <Skeleton className="h-8 w-8 sm:h-9 sm:w-9 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-4 w-[120px] sm:w-[180px]" />
              <Skeleton className="h-3 w-[60px]" />
            </div>
          </div>
          <Skeleton className="h-6 w-[50px]" />
        </div>
      ))}
    </div>

    <div className="mt-4 text-center">
      <Skeleton className="h-4 w-[150px] mx-auto" />
    </div>
  </div>
);
