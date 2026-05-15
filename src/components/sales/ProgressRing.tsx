import React from 'react';

interface ProgressRingProps {
  current: number;
  target: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  textColor?: string;
}

export function ProgressRing({ 
  current, 
  target, 
  size = 120, 
  strokeWidth = 10,
  color = "var(--color-primary)",
  textColor = "text-slate-900"
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          className="text-white/10"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          stroke={color}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className={cn("text-2xl font-black tracking-tighter leading-none", textColor)}>
          {Math.round(percentage)}%
        </span>
        <span className={cn("text-[9px] font-black uppercase tracking-widest mt-0.5 opacity-60", textColor)}>
          Target
        </span>
      </div>
    </div>
  );
}

import { cn } from '@/lib/utils';
