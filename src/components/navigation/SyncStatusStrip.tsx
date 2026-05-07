import React from 'react';
import { useConnectivity } from '@/hooks/useConnectivity';
import { ArrowPathIcon, CloudIcon, SignalSlashIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';

export const SyncStatusStrip: React.FC = () => {
  const { isOnline, pendingSyncs } = useConnectivity();

  if (isOnline && pendingSyncs === 0) return null;

  return (
    <div 
      role="alert"
      aria-live="polite"
      className={cn(
        "fixed top-[calc(56px+env(safe-area-inset-top))] left-0 right-0 z-30 h-8 flex items-center justify-center px-4 transition-all duration-300",
        isOnline ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
      )}
    >
      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider">
        {isOnline ? (
          <>
            <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
            <span>Syncing {pendingSyncs} pending items...</span>
          </>
        ) : (
          <>
            <SignalSlashIcon className="w-3.5 h-3.5" />
            <span>Offline • {pendingSyncs} items queued</span>
          </>
        )}
      </div>
    </div>
  );
};
