import React from 'react';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { Box } from 'lucide-react';

export interface ColumnConfig<T> {
  id: string;
  header: string;
  accessor: (item: T, index: number) => React.ReactNode;
  showOnTablet?: boolean;
}

interface DataTableProps<T> {
  columns: ColumnConfig<T>[];
  data: T[];
  onRowClick?: (item: T) => void;
  mobileCardRenderer: (item: T) => React.ReactNode;
  mobileStrategy?: 'card' | 'scroll';
  className?: string;
}

export function DataTable<T extends { id?: string | number; uid?: string | number }>({ 
  columns, 
  data, 
  onRowClick, 
  mobileCardRenderer,
  mobileStrategy = 'card',
  className 
}: DataTableProps<T>) {
  const { isMobile, isTablet } = useBreakpoint();

  const getItemKey = (item: T, index: number) => {
    return (item as any).id || (item as any).uid || `row-${index}`;
  };

  if (isMobile && mobileStrategy === 'card') {
    return (
      <div className={cn("space-y-3", className)}>
        {data.map((item, index) => (
          <div 
            key={getItemKey(item, index)} 
            onClick={() => onRowClick?.(item)}
            className="active:scale-[0.98] transition-all"
          >
            {mobileCardRenderer(item)}
          </div>
        ))}
      </div>
    );
  }

  // Horizontal scroll strategy for mobile/tablet if requested
  if (isMobile && mobileStrategy === 'scroll') {
    return (
      <div className={cn("overflow-x-auto rounded-[24px] border border-slate-100 bg-white shadow-sm", className)}>
        <Table className="min-w-[800px]">
          <TableHeader className="bg-slate-50">
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.id} className="text-[10px] font-black uppercase tracking-widest text-slate-400 py-4">
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length > 0 ? (
              data.map((item, index) => (
                <TableRow 
                  key={getItemKey(item, index)} 
                  onClick={() => onRowClick?.(item)}
                  className={cn("cursor-pointer hover:bg-slate-50 transition-colors", onRowClick && "active:bg-slate-100")}
                >
                  {columns.map((col) => (
                    <TableCell key={col.id} className="py-4">
                      {col.accessor(item, index)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow key="empty-scroll">
                <TableCell colSpan={columns.length} className="h-24 text-center text-slate-400 font-medium">
                  No records to display in scroll view.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className={cn("bg-white rounded-[32px] border border-slate-100 shadow-soft overflow-hidden", className)}>
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow>
            {columns.map((col) => (
              <TableHead 
                key={col.id} 
                className={cn(
                  "text-[10px] font-black uppercase tracking-widest text-slate-400 py-5",
                  !col.showOnTablet && isTablet && "hidden"
                )}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((item, index) => (
              <TableRow 
                key={getItemKey(item, index)} 
                onClick={() => onRowClick?.(item)}
                className={cn(
                  "hover:bg-slate-50/50 transition-colors group",
                  onRowClick && "cursor-pointer"
                )}
              >
                {columns.map((col) => (
                  <TableCell 
                    key={col.id} 
                    className={cn(
                      "py-5",
                      !col.showOnTablet && isTablet && "hidden"
                    )}
                  >
                    {col.accessor(item, index)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow key="empty-default">
              <TableCell colSpan={columns.length} className="h-32 text-center text-slate-400 font-medium">
                <div className="flex flex-col items-center gap-2">
                  <Box className="w-8 h-8 opacity-20" />
                  <span>No data repositories found</span>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
