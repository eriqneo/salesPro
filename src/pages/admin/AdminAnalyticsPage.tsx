import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { useSalesStore } from '@/store/useSalesStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Target, 
  MapPin, 
  TrendingUp, 
  AlertCircle,
  Download,
  Package,
  Users,
  ChevronRight
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
  FunnelChart, Funnel, LabelList
} from 'recharts';
import { exportSalesToCSV } from '@/lib/exportUtils';
import { Button } from '@/components/ui/button';
import { usePageTitle } from '@/hooks/usePageTitle';
import { KPICard } from '@/components/ui/KPICard';
import { AdminPageHeader } from '@/components/admin/responsive/AdminPageHeader';
import { useBreakpoint } from '@/hooks/useBreakpoint';

const COLORS = ['#0F172A', '#0D9488', '#334155', '#475569', '#64748B'];

export default function AdminAnalyticsPage() {
  usePageTitle('Analytics Engine');
  const { sales, dailyReports, routes } = useSalesStore();
  const { isMobile, isTablet } = useBreakpoint();

  const stats = useMemo(() => {
    const totalRevenue = sales.reduce((sum, s) => sum + s.totalKsh, 0);
    const totalCartons = sales.reduce((sum, s) => 
      sum + s.items.reduce((iSum, item) => iSum + item.quantityCartons, 0), 0
    );
    const activeAgents = new Set(sales.map(s => s.agentId)).size;
    const avgAchievement = dailyReports.length > 0 
      ? dailyReports.reduce((sum, r) => sum + r.percentageAchieved, 0) / dailyReports.length 
      : 0;

    return {
      totalRevenue,
      totalCartons,
      activeAgents,
      avgAchievement
    };
  }, [sales, dailyReports]);

  const leaderboard = useMemo(() => {
    const map: Record<string, number> = {};
    sales.forEach(s => {
      map[s.agentId] = (map[s.agentId] || 0) + s.totalKsh;
    });
    return Object.entries(map)
      .map(([id, total]) => ({ id, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [sales]);

  const achievementFunnel = useMemo(() => {
    const buckets = [
      { name: '0-25%', value: 0, fill: '#F43F5E' },
      { name: '25-50%', value: 0, fill: '#F59E0B' },
      { name: '50-75%', value: 0, fill: '#334155' },
      { name: '75-100%', value: 0, fill: '#10B981' },
      { name: '>100%', value: 0, fill: '#0D9488' },
    ];

    dailyReports.forEach(r => {
      const p = r.percentageAchieved;
      if (p <= 25) buckets[0].value++;
      else if (p <= 50) buckets[1].value++;
      else if (p <= 75) buckets[2].value++;
      else if (p <= 100) buckets[3].value++;
      else buckets[4].value++;
    });

    return buckets.reverse();
  }, [dailyReports]);

  const challengeFrequency = useMemo(() => {
    const map: Record<string, number> = {};
    dailyReports.forEach(r => {
      r.challenges.forEach(c => {
        map[c] = (map[c] || 0) + 1;
      });
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [dailyReports]);

  const salesByRegion = useMemo(() => {
    const map: Record<string, number> = {};
    sales.forEach(s => {
      const route = routes.find(r => r.name === s.routeName);
      const region = route?.region || 'Unknown';
      map[region] = (map[region] || 0) + s.totalKsh;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [sales, routes]);

  return (
    <div className={cn(
      "max-w-7xl mx-auto space-y-8",
      isMobile ? "p-4" : isTablet ? "p-6" : "p-8"
    )}>
      <AdminPageHeader 
        title="Analytics Engine"
        subtitle="Real-time performance metrics across all regions"
        actions={
          <Button 
            className="rounded-xl bg-teal-600 hover:bg-teal-700 font-black uppercase tracking-widest text-[10px] h-11 px-6 shadow-lg shadow-teal-100"
            onClick={() => exportSalesToCSV(sales, `Sales_Export_${new Date().toISOString().split('T')[0]}`)}
          >
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        }
      />

      <div className={cn(
        "grid gap-4 md:gap-6",
        isMobile ? "grid-cols-2" : isTablet ? "grid-cols-2" : "grid-cols-4"
      )}>
        <KPICard 
          label="Total Revenue" 
          value={`Ksh ${stats.totalRevenue.toLocaleString()}`} 
          subValue="+12.5% vs LW"
          icon={<TrendingUp className="w-5 h-5" />}
          className={cn(isMobile && "h-full")}
        />
        <KPICard 
          label="Cartons Sold" 
          value={stats.totalCartons.toLocaleString()} 
          subValue="Units shifted"
          icon={<Package className="w-5 h-5" />}
          className={cn(isMobile && "h-full")}
        />
        <KPICard 
          label="Active Agents" 
          value={stats.activeAgents} 
          subValue="In the field"
          icon={<Users className="w-5 h-5" />}
          className={cn(isMobile && "h-full")}
        />
        <KPICard 
          label="Avg Achievement" 
          value={`${Math.round(stats.avgAchievement)}%`} 
          subValue="Target success"
          icon={<Target className="w-5 h-5" />}
          className={cn(isMobile && "h-full")}
        />
      </div>

      <div className={cn(
        "grid gap-8",
        isMobile ? "grid-cols-1" : "lg:grid-cols-3"
      )}>
        {/* Leaderboard */}
        <Card className="lg:col-span-1 border-slate-200 shadow-soft rounded-[32px] overflow-hidden bg-white">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-8">
            <CardTitle className="flex items-center gap-2 text-slate-900 font-black tracking-tight text-xl">
              <Trophy className="w-5 h-5 text-amber-500" />
              Top Performers
            </CardTitle>
            <CardDescription className="font-bold">Most valuable agents this period</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {leaderboard.map((agent, i) => (
                <div key={agent.id} className="p-5 flex items-center gap-4 hover:bg-slate-50 transition-colors group cursor-pointer">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shadow-sm transition-transform group-hover:scale-110",
                    i === 0 ? 'bg-teal-600 text-white' : 
                    i === 1 ? 'bg-slate-200 text-slate-700' : 
                    'bg-white text-slate-400 border border-slate-100'
                  )}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-slate-900 leading-none">Agent {agent.id.slice(-4)}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1.5">Direct Field Agent</p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-black text-teal-600 italic">Ksh {agent.total.toLocaleString()}</p>
                    <ChevronRight className="w-3 h-3 text-slate-300 ml-auto mt-1" />
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 bg-slate-50/50">
              <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-teal-600">
                View Full Leaderboard
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Target Funnel */}
        <Card className="lg:col-span-2 border-slate-200 shadow-soft rounded-[32px] overflow-hidden bg-white">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-8">
            <CardTitle className="flex items-center gap-2 text-slate-900 font-black tracking-tight text-xl">
              <Target className="w-5 h-5 text-teal-600" />
              Target Pipeline
            </CardTitle>
            <CardDescription className="font-bold">Daily achievement distribution</CardDescription>
          </CardHeader>
          <CardContent className={cn(
            "p-6",
            isMobile ? "h-[250px]" : "h-[350px]"
          )}>
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', padding: '12px' }}
                  itemStyle={{ fontWeight: '900', fontSize: '12px', color: '#0F172A' }}
                />
                <Funnel
                  dataKey="value"
                  data={achievementFunnel}
                  isAnimationActive
                >
                  <LabelList position="right" fill="#64748B" stroke="none" dataKey="name" style={{ fontSize: '11px', fontWeight: '900' }} />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className={cn(
        "grid gap-8",
        isMobile ? "grid-cols-1" : "grid-cols-2"
      )}>
        {/* Region Heatmap */}
        <Card className="border-slate-200 shadow-soft rounded-[32px] overflow-hidden bg-white">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-8">
            <CardTitle className="flex items-center gap-2 text-slate-900 font-black tracking-tight text-xl">
              <MapPin className="w-5 h-5 text-teal-600" />
              Regional Split
            </CardTitle>
            <CardDescription className="font-bold">Revenue contribution by zone</CardDescription>
          </CardHeader>
          <CardContent className={cn(
            "p-6 relative flex items-center justify-center",
            isMobile ? "h-[250px]" : "h-[350px]"
          )}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={salesByRegion}
                  innerRadius={isMobile ? 60 : 80}
                  outerRadius={isMobile ? 90 : 110}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {salesByRegion.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center">
              <p className={cn(
                "font-black text-slate-900",
                isMobile ? "text-3xl" : "text-4xl"
              )}>
                {salesByRegion.length}
              </p>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Active Hubs</p>
            </div>
          </CardContent>
        </Card>

        {/* Challenge Frequency */}
        <Card className="border-slate-200 shadow-soft rounded-[32px] overflow-hidden bg-white">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-8">
            <CardTitle className="flex items-center gap-2 text-slate-900 font-black tracking-tight text-xl">
              <AlertCircle className="w-5 h-5 text-rose-500" />
              Feedback Loop
            </CardTitle>
            <CardDescription className="font-bold">Common operational issues identified</CardDescription>
          </CardHeader>
          <CardContent className={cn(
            "p-6",
            isMobile ? "h-[250px]" : "h-[350px]"
          )}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={challengeFrequency} layout="vertical" margin={{ left: 20, right: 20 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#0EA5E9" />
                    <stop offset="100%" stopColor="#0D9488" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                <XAxis type="number" axisLine={false} tickLine={false} hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 9, fontWeight: '900', fill: '#64748B' }}
                  width={100}
                />
                <Tooltip 
                  cursor={{ fill: '#F8FAFC' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" fill="url(#barGradient)" radius={[0, 8, 8, 0]} barSize={isMobile ? 24 : 32} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
