import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'shimmer' | 'none';
}

function Skeleton({
  className,
  variant = 'rectangular',
  width,
  height,
  animation = 'shimmer',
  ...props
}: SkeletonProps) {
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
    rounded: 'rounded-xl',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    shimmer: 'relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.5s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent dark:before:via-white/10',
    none: '',
  };

  const style: React.CSSProperties = {
    width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
    height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
  };

  return (
    <div
      className={cn(
        'bg-muted',
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={style}
      {...props}
    />
  );
}

// Pre-built skeleton components
function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm", className)}>
      <div className="flex items-center gap-3 mb-4">
        <Skeleton variant="circular" width={48} height={48} />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" height={16} className="w-3/4" />
          <Skeleton variant="text" height={12} className="w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton variant="text" height={12} />
        <Skeleton variant="text" height={12} className="w-5/6" />
        <Skeleton variant="text" height={12} className="w-2/3" />
      </div>
    </div>
  );
}

function SkeletonListItem({ className }: { className?: string }) {
  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-2xl p-4 flex items-center gap-3", className)}>
      <Skeleton variant="rounded" width={48} height={48} />
      <div className="flex-1 space-y-2">
        <Skeleton variant="text" height={14} className="w-2/3" />
        <Skeleton variant="text" height={10} className="w-1/3" />
      </div>
      <Skeleton variant="rounded" width={44} height={44} />
    </div>
  );
}

function SkeletonWeatherCard({ className }: { className?: string }) {
  return (
    <div className={cn("bg-white dark:bg-gray-800 rounded-2xl p-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="space-y-2">
            <Skeleton variant="text" height={14} className="w-20" />
            <Skeleton variant="text" height={10} className="w-16" />
          </div>
        </div>
        <div className="text-right space-y-2">
          <Skeleton variant="text" height={20} className="w-16" />
          <Skeleton variant="text" height={10} className="w-12" />
        </div>
      </div>
    </div>
  );
}

export { Skeleton, SkeletonCard, SkeletonListItem, SkeletonWeatherCard };
