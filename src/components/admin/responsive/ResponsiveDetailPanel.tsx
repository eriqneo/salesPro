import React from 'react';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { AnimatePresence, motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';

interface ResponsiveDetailPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: number; // Desktop width
  onMobileNavigate?: () => void;
}

export function ResponsiveDetailPanel({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  width = 420,
  onMobileNavigate 
}: ResponsiveDetailPanelProps) {
  const { isMobile } = useBreakpoint();

  // If mobile, we usually navigate to a new route. 
  // If this component is rendered on mobile, it should call onMobileNavigate immediately if it opens.
  React.useEffect(() => {
    if (isMobile && isOpen && onMobileNavigate) {
      onMobileNavigate();
    }
  }, [isMobile, isOpen, onMobileNavigate]);

  if (isMobile) return null; // Logic is handled by route change

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          style={{ width }}
          className="fixed top-0 right-0 bottom-0 bg-white shadow-2xl z-50 border-l border-slate-100 flex flex-col pt-16" // pt-16 for TopBar
        >
          <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">{title}</h2>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="rounded-full hover:bg-white"
            >
              <XMarkIcon className="w-6 h-6 text-slate-400" />
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-8">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
