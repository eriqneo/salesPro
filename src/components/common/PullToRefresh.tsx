import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation } from 'motion/react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { haptics } from '@/lib/haptics';
import { cn } from '@/lib/utils';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  disabled?: boolean;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children, disabled }) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const threshold = 80;

  const handleTouchStart = (e: TouchEvent) => {
    if (disabled || isRefreshing || (containerRef.current?.scrollTop || 0) > 0) return;
    startY.current = e.touches[0].pageY;
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (disabled || isRefreshing || (containerRef.current?.scrollTop || 0) > 0) return;
    
    const currentY = e.touches[0].pageY;
    const diff = currentY - startY.current;
    
    if (diff > 0) {
      // Resistance
      const distance = Math.pow(diff, 0.8);
      setPullDistance(distance);
      if (distance > threshold && pullDistance <= threshold) {
        haptics.light();
      }
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance > threshold) {
      setIsRefreshing(true);
      setPullDistance(threshold);
      haptics.medium();
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener('touchstart', handleTouchStart);
    el.addEventListener('touchmove', handleTouchMove);
    el.addEventListener('touchend', handleTouchEnd);

    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, isRefreshing, disabled]);

  return (
    <div ref={containerRef} className="h-full overflow-y-auto relative">
      <div 
        className="absolute left-0 right-0 flex justify-center pointer-events-none z-20"
        style={{ 
          transform: `translateY(${pullDistance - 40}px)`,
          opacity: Math.min(pullDistance / threshold, 1)
        }}
      >
        <div className="bg-white rounded-full p-2 shadow-lg border border-slate-100">
          <ArrowPathIcon className={cn(
            "w-5 h-5 text-[#0EA5E9]",
            isRefreshing && "animate-spin"
          )} />
        </div>
      </div>
      <div 
        style={{ 
          transform: `translateY(${pullDistance}px)`,
          transition: isRefreshing ? 'none' : 'transform 0.3s ease-out'
        }}
      >
        {children}
      </div>
    </div>
  );
};
