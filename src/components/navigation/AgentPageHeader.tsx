import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/button';

interface AgentPageHeaderProps {
  title: string;
  onBack?: () => void;
  backLabel?: string;
  rightAction?: React.ReactNode;
  showBack?: boolean;
  isDirty?: boolean;
  discardMessage?: string;
  backTo?: string;
  className?: string;
}

export const AgentPageHeader: React.FC<AgentPageHeaderProps> = ({
  title,
  onBack,
  backLabel = "Back",
  rightAction,
  showBack = true,
  isDirty = false,
  discardMessage = "Your unsaved changes will be lost.",
  backTo,
  className
}) => {
  const navigate = useNavigate();
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const handleBack = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else if (onBack) {
      onBack();
    } else if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  const confirmDiscard = () => {
    setShowDiscardConfirm(false);
    if (onBack) {
      onBack();
    } else if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <>
      <header className={cn(
        "fixed top-0 left-0 right-0 z-40 bg-gradient-to-br from-slate-900 to-teal-600 h-[calc(56px+env(safe-area-inset-top))] pt-[calc(env(safe-area-inset-top)+8px)] px-4 flex items-center justify-between",
        className
      )}>
        <div className="flex-1 flex items-center">
          {showBack && (
            <button 
              onClick={handleBack}
              className="flex items-center gap-1 -ml-2 h-11 px-2 active:opacity-60 transition-opacity"
            >
              <ChevronLeftIcon className="w-5 h-5 text-white" />
              <span className="text-[14px] text-white/90 font-medium">{backLabel}</span>
            </button>
          )}
        </div>

        <h1 className="text-[16px] text-white font-semibold tracking-[0.1px] truncate max-w-[calc(100%-160px)] text-center">
          {title}
        </h1>

        <div className="flex-1 flex justify-end">
          {rightAction}
        </div>
      </header>

      <BottomSheet
        isOpen={showDiscardConfirm}
        onClose={() => setShowDiscardConfirm(false)}
        title="Discard changes?"
      >
        <div className="flex flex-col items-center text-center space-y-6 py-4">
          <p className="text-[13px] text-[#64748B] leading-relaxed">
            {discardMessage}
          </p>
          
          <div className="w-full flex flex-col gap-3">
            <Button 
              variant="outline"
              className="w-full h-12 rounded-xl border-[#0EA5E9] text-[#0EA5E9] font-semibold"
              onClick={() => setShowDiscardConfirm(false)}
            >
              Keep editing
            </Button>
            <Button 
              variant="ghost"
              className="w-full h-12 rounded-xl text-[#EF4444] font-semibold"
              onClick={confirmDiscard}
            >
              Discard
            </Button>
          </div>
        </div>
      </BottomSheet>
    </>
  );
};
