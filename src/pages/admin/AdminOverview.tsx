// Admin Overview Page
import React, { useMemo } from 'react';
import { useSalesStore } from '@/store/useSalesStore';
import { useAdminStore } from '@/store/useAdminStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Package, 
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { AdminPageHeader } from '@/components/admin/responsive/AdminPageHeader';
import { DataTable, ColumnConfig } from '@/components/admin/responsive/DataTable';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const COLORS = ['#0F172A', '#0D9488', '#14B8A6', '#334155', '#64748B'];

export default function AdminOverview() {
  const { isMobile, isTablet } = useBreakpoint();
  const navigate = useNavigate();
  const { sales, dailyReports, shops } = useSalesStore();
  const { agents } = useAdminStore();

  const stats = useMemo(() => {
    const totalKsh = sales.reduce((sum, s) => sum + s.totalKsh, 0);
    const totalCartons = sales.reduce((sum, s) => 
      sum + s.items.reduce((iSum, item) => iSum + item.quantityCartons, 0), 0
    );
    const activeAgents = new Set(sales.map(s => s.agentId)).size;
    
    const avgCallAchievement = dailyReports.length > 0 
      ? dailyReports.reduce((sum, r) => sum + (r.achievedCalls / r.targetCalls) * 100, 0) / dailyReports.length
      : 0;

    return {
      totalKsh,
      totalCartons,
      activeAgents,
      avgCallAchievement
    };
  }, [sales, dailyReports]);

  const agentSalesData = useMemo(() => {
    const agentMap: Record<string, number> = {};
    sales.forEach(s => {
      const agent = agents.find(a => a.uid === s.agentId);
      const name = agent?.name || `Agent ${s.agentId.slice(-3)}`;
      agentMap[name] = (agentMap[name] || 0) + s.totalKsh;
    });
    return Object.entries(agentMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, isMobile ? 5 : 8);
  }, [sales, agents, isMobile]);

  const regionalData = useMemo(() => {
    const regionMap: Record<string, number> = {};
    shops.forEach(s => {
      regionMap[s.region] = (regionMap[s.region] || 0) + 1;
    });
    return Object.entries(regionMap).map(([name, value]) => ({ name, value }));
  }, [shops]);

  const submissionTrend = useMemo(() => {
    const data: any[] = [];
    const now = new Date();
    const daysToShow = isMobile ? 7 : 14;
    for (let i = daysToShow - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const dayReps = dailyReports.filter((r: any) => r.date === dateStr);
      const rate = agents.length > 0 ? (dayReps.length / agents.length) * 100 : 0;
      data.push({
        date: format(d, isMobile ? 'E' : 'MMM d'),
        rate: Math.round(rate)
      });
    }
    return data;
  }, [dailyReports, agents, isMobile]);

  const columns: ColumnConfig<any>[] = [
    {
      id: 'agent',
      header: 'Agent Name',
      accessor: (r) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
            {r.agentName.charAt(0)}
          </div>
          <span className="font-bold text-slate-900">{r.agentName}</span>
        </div>
      ),
      showOnTablet: true
    },
    {
      id: 'calls',
      header: 'Calls (T/A)',
      accessor: (r) => (
        <span className="text-sm font-medium text-slate-600">
          {r.achievedCalls} / {r.targetCalls}
        </span>
      ),
      showOnTablet: true
    },
    {
      id: 'sales',
      header: 'Sales (Ksh)',
      accessor: (r) => (
        <span className="text-sm font-black text-slate-900">
          Ksh {r.actualSalesKsh.toLocaleString()}
        </span>
      ),
      showOnTablet: true
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (r) => (
        <Badge className="bg-teal-500 hover:bg-teal-600 text-white border-none text-[10px] font-black uppercase tracking-widest px-2 py-0.5">
          Submitted
        </Badge>
      ),
      showOnTablet: false
    }
  ];

  const renderMobileCard = (r: any) => (
    <div 
      onClick={() => navigate(`/admin/agents/${r.agentId}`)}
      className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm active:bg-slate-50 transition-all flex flex-col gap-3"
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-sm">
            {r.agentName.charAt(0)}
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm leading-none">{r.agentName}</h4>
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">{r.region}</p>
          </div>
        </div>
        <Badge className="bg-teal-500 text-white border-none text-[9px] font-black uppercase tracking-widest">
          {Math.round(r.percentageAchieved)}% Target
        </Badge>
      </div>
      
      <div className="flex items-center justify-between text-xs">
        <div className="flex flex-col gap-0.5">
          <span className="text-slate-400 font-bold uppercase text-[9px]">Calls</span>
          <span className="font-black text-slate-700">{r.achievedCalls} / {r.targetCalls}</span>
        </div>
        <div className="flex flex-col gap-0.5 items-end">
          <span className="text-slate-400 font-bold uppercase text-[9px]">Sales</span>
          <span className="font-black text-teal-600">Ksh {r.actualSalesKsh.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-slate-50 text-[10px] text-slate-400 font-medium">
        <CheckCircle2 className="w-3.5 h-3.5 text-teal-500" />
        <span>Submitted at {format(r.submittedAt, 'h:mm a')}</span>
        <ChevronRight className="w-4 h-4 ml-auto text-slate-300" />
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-full bg-[#F8FAFC]">
      <AdminPageHeader 
        title="Dashboard Overview" 
        subtitle="Real-time performance metrics across all regions"
      />

      <div className={cn(
        "flex-1 space-y-8 max-w-7xl mx-auto w-full",
        isMobile ? "px-4 py-4" : isTablet ? "px-6 py-5" : "px-8 py-6"
      )}>
        {/* KPI Grid */}
        <div className={cn(
          "grid gap-4 md:gap-6",
          isMobile || isTablet ? "grid-cols-2" : "grid-cols-4"
        )}>
          <KPICard 
            title="Total Sales" 
            value={`Ksh ${stats.totalKsh.toLocaleString()}`} 
            icon={<TrendingUp className="w-5 h-5" />}
            trend="+12.5%"
            trendUp={true}
            isMobile={isMobile}
          />
          <KPICard 
            title="Cartons Sold" 
            value={stats.totalCartons.toLocaleString()} 
            icon={<Package className="w-5 h-5" />}
            trend="+5.2%"
            trendUp={true}
            isMobile={isMobile}
          />
          <KPICard 
            title="Active Agents" 
            value={stats.activeAgents.toString()} 
            icon={<Users className="w-5 h-5" />}
            trend="Live"
            trendUp={true}
            isMobile={isMobile}
          />
          <KPICard 
            title="Avg Achievement" 
            value={`${Math.round(stats.avgCallAchievement)}%`} 
            icon={<Target className="w-5 h-5" />}
            trend="-2.1%"
            trendUp={false}
            isMobile={isMobile}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sales by Agent (2/3 width on desktop) */}
          <Card className="lg:col-span-2 border-none shadow-soft rounded-[32px] overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg font-black tracking-tight">Sales by Agent</CardTitle>
              <CardDescription>Revenue generated per sales representative</CardDescription>
            </CardHeader>
            <CardContent className={isMobile ? "h-[200px]" : "h-[320px]"}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={agentSalesData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="value" fill="#0D9488" radius={[8, 8, 0, 0]} barSize={isMobile ? 24 : 40} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Regional Distribution (1/3 width on desktop) */}
          <Card className="border-none shadow-soft rounded-[32px] overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg font-black tracking-tight">Sales by Region</CardTitle>
              <CardDescription>Distribution of active shops</CardDescription>
            </CardHeader>
            <CardContent className={isMobile ? "h-[220px]" : "h-[320px]"}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={regionalData}
                    innerRadius={isMobile ? 60 : 70}
                    outerRadius={isMobile ? 90 : 100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {regionalData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none' }} />
                  <Legend 
                    layout={isMobile ? "horizontal" : "vertical"} 
                    align="center" 
                    verticalAlign={isMobile ? "bottom" : "middle"}
                    wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingLeft: isMobile ? 0 : '20px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Submission Trend (Full width) */}
        <Card className="border-none shadow-soft rounded-[32px] overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg font-black tracking-tight">Submission Rate Trend</CardTitle>
            <CardDescription>% of agents submitting daily</CardDescription>
          </CardHeader>
          <CardContent className={isMobile ? "h-[180px]" : "h-[280px]"}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={submissionTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#14B8A6" 
                  strokeWidth={3} 
                  dot={{ r: 4, fill: '#14B8A6', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Agent Activity Table / Card List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-slate-900 tracking-tight ml-1">Today's Agent Activity</h3>
          </div>
          <DataTable 
            columns={columns}
            data={dailyReports.slice(0, isMobile ? 5 : 8)}
            mobileCardRenderer={renderMobileCard}
            onRowClick={(r) => navigate(`/admin/agents/${r.agentId}`)}
          />
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, icon, trend, trendUp, isMobile }: any) {
  return (
    <Card className="border-none shadow-soft rounded-[28px] overflow-hidden bg-white">
      <CardContent className={isMobile ? "p-4" : "p-6"}>
        <div className="flex items-center justify-between mb-4">
          <div className={cn(
            "rounded-2xl flex items-center justify-center bg-slate-900 text-teal-400",
            isMobile ? "w-10 h-10 shadow-lg shadow-slate-200" : "w-12 h-12 shadow-xl shadow-slate-200"
          )}>
            {icon}
          </div>
          <div className={cn(
            "flex items-center gap-1 font-black",
            trendUp ? 'text-teal-500' : 'text-danger',
            isMobile ? "text-[10px]" : "text-xs"
          )}>
            {trendUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            {trend}
          </div>
        </div>
        <div className="space-y-1">
          <p className={cn("font-bold text-slate-400 uppercase tracking-widest", isMobile ? "text-[10px]" : "text-xs")}>{title}</p>
          <p className={cn("font-black tracking-tighter text-slate-900", isMobile ? "text-xl" : "text-3xl")}>{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
