import React from 'react';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { usePageTitle } from '@/hooks/usePageTitle';
import { Button } from '@/components/ui/button';
import { ChevronLeftIcon, EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { haptics } from '@/lib/haptics';
import { useNavigate } from 'react-router-dom';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface AdminPageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  backTo?: string | -1;
  className?: string;
}

export function AdminPageHeader({ title, subtitle, actions, backTo, className }: AdminPageHeaderProps) {
  const { isMobile } = useBreakpoint();
  const navigate = useNavigate();
  usePageTitle(title);

  const handleBack = () => {
    haptics.light();
    if (backTo === -1 || !backTo) {
      navigate(-1);
    } else {
      navigate(backTo);
    }
  };

  if (isMobile) {
    return (
      <div className={cn("px-4 py-4 bg-white border-b border-slate-100", className)}>
        <div className="flex items-center gap-1 mb-1">
          {backTo && (
            <button onClick={handleBack} className="flex items-center text-primary font-bold text-sm -ml-1">
              <ChevronLeftIcon className="w-5 h-5" />
              <span>Back</span>
            </button>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">{title}</h1>
            {subtitle && <p className="text-sm text-slate-500 font-medium mt-0.5">{subtitle}</p>}
          </div>
          {actions && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full bg-slate-50">
                  <EllipsisVerticalIcon className="w-6 h-6 text-slate-600" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-2xl border-slate-100 p-2 min-w-[160px] z-50">
                {/* We wrap actions which are likely buttons into dropdown items if needed, 
                    but usually we'd pass an array of actions for mobile. 
                    For now let's just render the actions directly if they fit or as a menu */}
                <div className="flex flex-col gap-1">
                  {actions}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-between px-8 py-6 bg-white border-b border-slate-100", className)}>
      <div className="flex items-center gap-4">
        {backTo && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleBack}
            className="rounded-xl border border-slate-100 hover:bg-slate-50"
          >
            <ChevronLeftIcon className="w-5 h-5 text-slate-600" />
          </Button>
        )}
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">{title}</h1>
          {subtitle && <p className="text-slate-500 font-medium mt-1">{subtitle}</p>}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-3">
          {actions}
        </div>
      )}
    </div>
  );
}
