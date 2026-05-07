import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface KPICardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: React.ReactNode;
  className?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function KPICard({ label, value, subValue, icon, className, trend }: KPICardProps) {
  return (
    <Card className={cn("bg-white border-border rounded-[16px] shadow-soft overflow-hidden", className)}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          {icon && (
            <div className="w-12 h-12 rounded-full bg-gradient-brand flex items-center justify-center text-white shrink-0">
              {icon}
            </div>
          )}
          <div className="space-y-1 flex-1 min-w-0">
            <p className="text-sm font-medium text-text-secondary">{label}</p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <p className="text-2xl font-bold text-text-primary">{value}</p>
              {trend && (
                <div className={cn(
                  "flex items-center text-[10px] font-black uppercase tracking-widest",
                  trend.isPositive ? "text-success" : "text-danger"
                )}>
                  {trend.isPositive ? "+" : "-"}{trend.value}%
                </div>
              )}
            </div>
            {subValue && (
              <p className="text-xs font-medium text-text-secondary">{subValue}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
