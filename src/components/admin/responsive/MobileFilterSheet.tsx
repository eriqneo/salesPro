import React from 'react';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { Drawer } from 'vaul';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  FunnelIcon, 
  XMarkIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import { haptics } from '@/lib/haptics';

export interface FilterConfig {
  id: string;
  label: string;
  type: 'select' | 'daterange' | 'search' | 'multiselect';
  options?: { label: string; value: string }[];
  placeholder?: string;
  value: any;
  onChange: (value: any) => void;
}

interface MobileFilterSheetProps {
  filters: FilterConfig[];
  onApply?: () => void;
  onReset?: () => void;
  className?: string;
}

export function MobileFilterSheet({ filters, onApply, onReset, className }: MobileFilterSheetProps) {
  const { isMobile } = useBreakpoint();
  const [isOpen, setIsOpen] = React.useState(false);

  if (!isMobile) {
    return (
      <div className={cn("flex flex-wrap items-center gap-3 bg-white p-4 rounded-2xl shadow-sm border border-slate-100", className)}>
        {filters.map((filter) => (
          <div key={filter.id} className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">
              {filter.label}
            </label>
            {filter.type === 'search' ? (
              <Input 
                placeholder={filter.placeholder}
                value={filter.value}
                onChange={(e) => filter.onChange(e.target.value)}
                className="h-10 rounded-xl bg-slate-50 border-none w-64"
              />
            ) : filter.type === 'select' ? (
              <div className="relative">
                <select 
                  className="h-10 pl-3 pr-10 rounded-xl bg-slate-50 border-none text-sm font-bold appearance-none outline-none focus:ring-2 focus:ring-primary/20 min-w-[140px]"
                  value={filter.value}
                  onChange={(e) => filter.onChange(e.target.value)}
                >
                  {filter.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            ) : null}
          </div>
        ))}
        {(onReset || onApply) && (
          <div className="flex gap-2 ml-auto pt-5">
            {onReset && (
              <Button variant="ghost" size="sm" onClick={onReset} className="text-xs font-bold text-slate-500">
                Reset
              </Button>
            )}
            {onApply && (
              <Button size="sm" onClick={onApply} className="bg-primary text-white text-xs font-black uppercase tracking-widest px-6 rounded-xl h-10">
                Apply Filters
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <Button 
        onClick={() => { setIsOpen(true); haptics.light(); }}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-brand shadow-xl shadow-primary/40 z-40 text-white flex items-center justify-center border-none"
      >
        <FunnelIcon className="w-6 h-6" />
      </Button>

      <Drawer.Root open={isOpen} onOpenChange={setIsOpen}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 bg-black/40 z-[100]" />
          <Drawer.Content className="fixed bottom-0 left-0 right-0 z-[101] flex flex-col bg-[#F8FAFC] rounded-t-[32px] max-h-[90vh] pb-10">
            <div className="p-4 bg-white rounded-t-[32px] flex-1">
              <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-slate-200 mb-8" />
              
              <div className="flex items-center justify-between mb-8 px-2">
                <h3 className="text-xl font-black text-slate-900">Filters</h3>
                <button onClick={() => setIsOpen(false)} className="p-2 bg-slate-100 rounded-full">
                  <XMarkIcon className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="space-y-6 px-2">
                {filters.map((filter) => (
                  <div key={filter.id} className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-400">
                      {filter.label}
                    </label>
                    {filter.type === 'search' ? (
                      <Input 
                        placeholder={filter.placeholder}
                        value={filter.value}
                        onChange={(e) => filter.onChange(e.target.value)}
                        className="h-14 rounded-2xl bg-slate-50 border-none text-base"
                      />
                    ) : filter.type === 'select' ? (
                      <div className="relative">
                        <select 
                          className="h-14 w-full px-4 rounded-2xl bg-slate-50 border-none text-base font-bold appearance-none outline-none focus:ring-2 focus:ring-primary/20"
                          value={filter.value}
                          onChange={(e) => filter.onChange(e.target.value)}
                        >
                          {filter.options?.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                        <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>

              <div className="flex gap-4 mt-10 px-2">
                <Button 
                  variant="outline" 
                  onClick={() => { onReset?.(); setIsOpen(false); }}
                  className="flex-1 h-14 rounded-2xl font-bold border-slate-200"
                >
                  Reset
                </Button>
                <Button 
                  onClick={() => { onApply?.(); setIsOpen(false); haptics.success(); }}
                  className="flex-1 h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/20"
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  );
}
