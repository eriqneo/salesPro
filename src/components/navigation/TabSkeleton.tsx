import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface TabSkeletonProps {
  variant: 'home' | 'inventory' | 'shops' | 'report';
}

export const TabSkeleton: React.FC<TabSkeletonProps> = ({ variant }) => {
  return (
    <div className="p-4 space-y-6 animate-pulse">
      {variant === 'home' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-28 rounded-2xl bg-gray-100" />
            <Skeleton className="h-28 rounded-2xl bg-gray-100" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-20 w-full rounded-xl bg-gray-100" />
            <Skeleton className="h-20 w-full rounded-xl bg-gray-100" />
            <Skeleton className="h-20 w-full rounded-xl bg-gray-100" />
          </div>
        </>
      )}

      {variant === 'inventory' && (
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-48 rounded-2xl bg-gray-100" />
          <Skeleton className="h-48 rounded-2xl bg-gray-100" />
          <Skeleton className="h-48 rounded-2xl bg-gray-100" />
          <Skeleton className="h-48 rounded-2xl bg-gray-100" />
        </div>
      )}

      {variant === 'shops' && (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl bg-gray-100" />
          ))}
        </div>
      )}

      {variant === 'report' && (
        <div className="space-y-6">
          <Skeleton className="h-32 w-full rounded-2xl bg-gray-100" />
          <div className="space-y-4">
            <Skeleton className="h-12 w-full rounded-xl bg-gray-100" />
            <Skeleton className="h-12 w-full rounded-xl bg-gray-100" />
            <Skeleton className="h-32 w-full rounded-xl bg-gray-100" />
          </div>
          <Skeleton className="h-14 w-full rounded-xl bg-gray-100" />
        </div>
      )}
    </div>
  );
};
