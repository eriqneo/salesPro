import React, { useMemo } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useSalesStore } from '@/store/useSalesStore';
import { useUIStore } from '@/store/useUIStore';
import { ProgressRing } from '@/components/sales/ProgressRing';
import { OfflineBadge } from '@/components/sales/OfflineBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Package, FileText, Plus, History, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { TabSkeleton } from '@/components/navigation/TabSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { PullToRefresh } from '@/components/common/PullToRefresh';
import { useSwipeBack } from '@/hooks/useSwipeBack';
import { haptics } from '@/lib/haptics';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'motion/react';

export default function AgentDashboard() {
  const { user } = useAuthStore();
  const { sales, inventory, dailyReports, shops } = useSalesStore();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);

  // Disable swipe back on home screen
  useSwipeBack(false);

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate refetch
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
  };

  const { setRecordSaleOpen } = useUIStore();

  const handleAction = (path: string) => {
    haptics.light();
    if (path === '/agent/record') {
      setRecordSaleOpen(true);
      return;
    }
    navigate(path);
  };

  const stats = useMemo(() => {
    const today = new Date().setHours(0, 0, 0, 0);
    const todaySales = sales.filter(s => s.timestamp >= today);
    const totalKsh = todaySales.reduce((sum, s) => sum + s.totalKsh, 0);
    const totalCartons = todaySales.reduce((sum, s) => 
      sum + s.items.reduce((iSum, item) => iSum + item.quantityCartons, 0), 0
    );
    
    // Mock targets
    const targetKsh = 50000;
    const targetCalls = 20;
    const achievedCalls = todaySales.length; // Assuming 1 sale = 1 call for now

    return {
      totalKsh,
      totalCartons,
      percentageOfTarget: (totalKsh / targetKsh) * 100,
      targetCalls,
      achievedCalls
    };
  }, [sales]);

  const recentActivity = useMemo(() => {
    const agentSales = sales
      .filter(s => s.agentId === user?.uid)
      .map(s => ({ ...s, type: 'sale' as const }));
    
    const agentReports = dailyReports
      .filter(r => r.agentId === user?.uid)
      .map(r => ({ ...r, type: 'report' as const, timestamp: r.submittedAt }));

    return [...agentSales, ...agentReports]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 5);
  }, [sales, dailyReports, user]);

  if (!user || isLoading) return <TabSkeleton variant="home" />;

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="flex flex-col min-h-full pb-28">
        <div className="p-5 space-y-8">
          {/* Mission Status Hero Card */}
          <Card className="bg-[#0F172A] border-none rounded-[32px] shadow-2xl overflow-hidden relative group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#0D948840,transparent_70%)] pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-teal-500/10 blur-[80px] rounded-full pointer-events-none" />
            
            <CardContent className="p-8 relative z-10">
              <div className="flex items-center justify-between gap-6">
                <div className="flex-1 space-y-4">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-teal-400 mb-1">Mission Status</h3>
                    <p className="text-3xl font-black text-white tracking-tighter">
                      {stats.achievedCalls} / {stats.targetCalls}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Daily Calls Achieved</p>
                  </div>
                  
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((stats.achievedCalls / stats.targetCalls) * 100, 100)}%` }}
                      className="h-full bg-gradient-to-r from-teal-600 to-teal-400"
                    />
                  </div>
                  
                  <p className="text-[11px] text-white font-black uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                    {stats.targetCalls - stats.achievedCalls > 0 
                      ? `${stats.targetCalls - stats.achievedCalls} calls remaining`
                      : "Daily Target Met!"}
                  </p>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 bg-teal-500/20 blur-2xl rounded-full" />
                  <ProgressRing 
                    current={stats.achievedCalls} 
                    target={stats.targetCalls} 
                    size={100} 
                    strokeWidth={8}
                    color="#0D9488"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KPIs Grid */}
          <div className="grid grid-cols-2 gap-5">
            <KPIStatsCard 
              label="Sales Today" 
              value={`Ksh ${stats.totalKsh.toLocaleString()}`} 
              progress={stats.percentageOfTarget}
              icon={<ShoppingBag className="w-5 h-5 text-teal-500" />}
              accentColor="bg-teal-500"
            />
            <KPIStatsCard 
              label="Cartons Sold" 
              value={stats.totalCartons.toString()} 
              progress={(stats.totalCartons / 20) * 100} // Mock target
              icon={<Package className="w-5 h-5 text-indigo-500" />}
              accentColor="bg-indigo-500"
            />
          </div>

          {/* Quick Actions */}
          <div className="space-y-5">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Quick Actions</h3>
            <div className="grid grid-cols-3 gap-4">
              <QuickActionBlock 
                icon={<Plus className="w-7 h-7" />} 
                label="New Sale" 
                onClick={() => handleAction('/agent/record')}
                gradient="from-teal-500/10 to-teal-500/5"
                iconColor="text-teal-600"
              />
              <QuickActionBlock 
                icon={<Package className="w-7 h-7" />} 
                label="Inventory" 
                onClick={() => handleAction('/agent/inventory')}
                gradient="from-indigo-500/10 to-indigo-500/5"
                iconColor="text-indigo-600"
              />
              <QuickActionBlock 
                icon={<FileText className="w-7 h-7" />} 
                label="Report" 
                onClick={() => handleAction('/agent/report')}
                gradient="from-amber-500/10 to-amber-500/5"
                iconColor="text-amber-600"
              />
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="space-y-5">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Operations Feed</h3>
              <button 
                onClick={() => navigate('/agent/report/history')}
                className="text-[10px] font-black uppercase tracking-widest text-teal-600 flex items-center gap-1.5 group"
              >
                View History <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
            
            <div className="space-y-0 pl-3 border-l-2 border-slate-100 ml-2">
              {recentActivity.length === 0 ? (
                <div className="pl-6 pt-2">
                  <EmptyState 
                    title={`Welcome, ${user.name.split(' ')[0]}!`}
                    subtitle="Ready to conquer the day? Your sales will appear here."
                    illustration="home"
                  />
                </div>
              ) : (
                recentActivity.map((activity, idx) => {
                  const isSale = activity.type === 'sale';
                  const shop = isSale ? shops.find(s => s.id === activity.shopId) : null;
                  
                  return (
                    <div 
                      key={idx}
                      onClick={() => navigate(isSale ? `/agent/history/${activity.id}` : '/agent/report/history')}
                      className="relative pl-8 pb-8 last:pb-0 group"
                    >
                      {/* Timeline Dot */}
                      <div className={cn(
                        "absolute left-[-9px] top-1 w-4 h-4 rounded-full border-4 border-white shadow-sm transition-transform group-active:scale-125",
                        isSale ? "bg-teal-500" : "bg-amber-500"
                      )} />
                      
                      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm active:bg-slate-50 transition-all flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                          isSale ? "bg-teal-50 text-teal-600" : "bg-amber-50 text-amber-600"
                        )}>
                          {isSale ? <ShoppingBag className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate tracking-tight">
                            {isSale ? (shop?.name || 'New Sale Recorded') : 'Daily Report Submitted'}
                          </p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">
                            {format(activity.timestamp, 'h:mm a')} • {format(activity.timestamp, 'MMM d')}
                          </p>
                        </div>
                        {isSale && (
                          <div className="text-right">
                            <span className="text-xs font-black text-teal-600 bg-teal-50 px-2 py-1 rounded-lg">
                              Ksh {activity.totalKsh.toLocaleString()}
                            </span>
                          </div>
                        )}
                        <ChevronRight className="w-4 h-4 text-slate-300" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </PullToRefresh>
  );
}

function KPIStatsCard({ label, value, progress, icon, accentColor }: { 
  label: string, 
  value: string, 
  progress: number, 
  icon: React.ReactNode,
  accentColor: string
}) {
  return (
    <Card className="bg-white border-none rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] overflow-hidden relative">
      <div className={cn("absolute left-0 top-0 bottom-0 w-1.5", accentColor)} />
      <CardContent className="p-5 space-y-4">
        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
          {icon}
        </div>
        <div className="space-y-1">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">{label}</p>
          <p className="text-xl font-black text-slate-900 tracking-tight">{value}</p>
        </div>
        <div className="space-y-1.5">
          <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              className={cn("h-full", accentColor)}
            />
          </div>
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
            {Math.round(progress)}% of daily target
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionBlock({ icon, label, onClick, gradient, iconColor }: { 
  icon: React.ReactNode, 
  label: string, 
  onClick: () => void, 
  gradient: string,
  iconColor: string
}) {
  return (
    <button 
      onClick={onClick}
      className="flex flex-col items-center gap-3 p-5 rounded-3xl bg-white shadow-[0_4px_16px_rgba(0,0,0,0.03)] border border-slate-50 active:scale-95 transition-all group"
    >
      <div className={cn("w-16 h-16 rounded-[22px] flex items-center justify-center bg-gradient-to-br transition-transform group-hover:rotate-6", gradient, iconColor)}>
        {icon}
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-900">{label}</span>
    </button>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-6 w-20" />
      </div>
      <Skeleton className="h-32 w-full rounded-xl" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    </div>
  );
}
