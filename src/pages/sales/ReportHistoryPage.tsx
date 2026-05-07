import * as React from 'react';
import { useSalesStore } from '@/store/useSalesStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ClipboardDocumentCheckIcon as ClipboardCheck, 
  CalendarIcon as Calendar, 
  ChevronRightIcon as ChevronRight, 
  ChartBarIcon as TrendingUp 
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { AgentPageHeader } from '@/components/navigation/AgentPageHeader';
import { useSwipeBack } from '@/hooks/useSwipeBack';
import { cn } from '@/lib/utils';

export default function ReportHistoryPage() {
  const { dailyReports } = useSalesStore();
  const { user } = useAuthStore();

  useSwipeBack();

  const agentReports = React.useMemo(() => {
    return dailyReports
      .filter(r => r.agentId === user?.uid)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [dailyReports, user]);

  return (
    <div className="flex flex-col min-h-full pb-24 pt-[calc(56px+env(safe-area-inset-top))]">
      <AgentPageHeader 
        title="Report History" 
        showBack 
        backTo="/agent/home"
      />

      <div className="p-4 space-y-4">
        {agentReports.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-border shadow-soft">
            <ClipboardCheck className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-text-secondary font-bold">No reports submitted yet</p>
          </div>
        ) : (
          agentReports.map((report) => (
            <Card 
              key={report.id} 
              className="border-border shadow-soft bg-white active:bg-slate-50 transition-all cursor-pointer rounded-2xl overflow-hidden"
            >
              <CardContent className="p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <ClipboardCheck className="w-6 h-6" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-black text-text-primary tracking-tight">{format(new Date(report.date), 'EEEE, MMM d')}</p>
                    <Badge className={cn(
                      "border-none font-black text-[8px] uppercase px-2 h-5",
                      report.percentageAchieved >= 90 ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                    )}>
                      {report.percentageAchieved.toFixed(0)}% Target
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] text-text-secondary font-black uppercase tracking-widest">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5" /> Ksh {report.actualSalesKsh.toLocaleString()}
                    </div>
                    <span>{report.route}</span>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-slate-300" />
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
