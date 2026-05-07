import React from 'react';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Drawer } from 'vaul';
import { cn } from '@/lib/utils';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ResponsiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export function ResponsiveModal({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  children, 
  footer,
  className 
}: ResponsiveModalProps) {
  const { isMobile } = useBreakpoint();

  if (isMobile) {
    return (
      <Drawer.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[100]" />
          <Drawer.Content className={cn(
            "bg-white flex flex-col rounded-t-[32px] fixed bottom-0 left-0 right-0 z-[101] outline-none max-h-[96vh]",
            className
          )}>
            <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-slate-200 my-4" />
            <div className="flex-1 overflow-y-auto px-6 pb-8">
              <div className="mb-6">
                <Drawer.Title className="text-xl font-black text-slate-900 tracking-tight">{title}</Drawer.Title>
                {description && <Drawer.Description className="text-sm text-slate-500 font-medium mt-1">{description}</Drawer.Description>}
              </div>
              {children}
              {footer && <div className="mt-8 pt-4 border-t border-slate-100">{footer}</div>}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn("sm:max-w-[600px] p-0 overflow-hidden border-none rounded-[32px] shadow-2xl", className)}>
        <DialogHeader className="p-8 border-b border-slate-100 bg-white">
          <DialogTitle className="text-2xl font-black tracking-tight text-slate-900">{title}</DialogTitle>
          {description ? (
            <DialogDescription className="text-sm text-slate-500 font-medium">{description}</DialogDescription>
          ) : (
            <DialogDescription className="sr-only">Modal description</DialogDescription>
          )}
        </DialogHeader>
        <div className="p-8 max-h-[70vh] overflow-y-auto">
          {children}
        </div>
        {footer && (
          <DialogFooter className="p-8 bg-slate-50 border-t border-slate-100">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
