import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { haptics } from '@/lib/haptics';

interface PageHeaderProps {
  title: React.ReactNode;
  subtitle?: string;
  showBack?: boolean;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, showBack, actions, className }: PageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    haptics.light();
    navigate(-1);
  };

  return (
    <div className={cn("bg-gradient-brand p-6 text-white shrink-0", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBack && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleBack}
              className="text-white hover:bg-white/10 rounded-xl"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
            {subtitle && <p className="text-white/80 text-sm font-medium">{subtitle}</p>}
          </div>
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
