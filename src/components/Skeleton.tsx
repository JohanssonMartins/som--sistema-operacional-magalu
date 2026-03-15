import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

export const Skeleton: React.FC<SkeletonProps> = ({ 
  className = '', 
  variant = 'rectangular', 
  width, 
  height 
}) => {
  const baseClass = "animate-pulse bg-gray-200 dark:bg-zinc-800";
  const variantClass = {
    text: "rounded h-4 w-full mb-2",
    circular: "rounded-full",
    rectangular: "rounded-lg"
  }[variant];

  const style: React.CSSProperties = {
    width: width,
    height: height
  };

  return (
    <div 
      className={`${baseClass} ${variantClass} ${className}`} 
      style={style}
    />
  );
};

export const TableSkeleton = ({ rows = 5, cols = 4 }: { rows?: number, cols?: number }) => (
  <div className="w-full space-y-4">
    <div className="flex gap-4 mb-6">
      {[...Array(cols)].map((_, i) => (
        <Skeleton key={i} height={40} className="flex-1" />
      ))}
    </div>
    {[...Array(rows)].map((_, i) => (
      <div key={i} className="flex gap-4 border-b border-gray-100 dark:border-zinc-800/50 py-4">
        {[...Array(cols)].map((_, j) => (
          <Skeleton key={j} height={20} className="flex-1" />
        ))}
      </div>
    ))}
  </div>
);

export const CardSkeleton = () => (
  <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm space-y-4">
    <div className="flex justify-between items-start">
      <Skeleton variant="circular" width={48} height={48} />
      <Skeleton width={60} height={24} />
    </div>
    <div className="space-y-2">
      <Skeleton variant="text" width="40%" />
      <Skeleton variant="text" height={32} width="70%" />
    </div>
    <Skeleton height={8} className="mt-4" />
  </div>
);

export const ChartSkeleton = () => (
  <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm space-y-6">
    <div className="flex justify-between items-center">
      <Skeleton width={150} height={24} />
      <div className="flex gap-2">
        <Skeleton width={80} height={32} />
        <Skeleton width={80} height={32} />
      </div>
    </div>
    <div className="h-[300px] flex items-end gap-2 px-2">
      {[...Array(12)].map((_, i) => (
        <Skeleton 
          key={i} 
          width="100%" 
          height={`${Math.floor(Math.random() * 60) + 20}%`} 
          className="rounded-t-sm"
        />
      ))}
    </div>
  </div>
);
