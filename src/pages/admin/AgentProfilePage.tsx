import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Building2, 
  TrendingUp, 
  ShoppingBag, 
  Package, 
  ClipboardCheck,
  ChevronRight,
  Settings,
  History,
  Lock,
  UserMinus,
  CheckCircle2,
  XCircle,
  MessageSquare,
  AlertCircle,
  Users as UsersIcon,
  Search,
  Filter,
  BarChart3
} from 'lucide-react';
import { BuildingOffice2Icon } from '@heroicons/react/24/outline';
import { useAdminStore } from '@/store/useAdminStore';
import { useSalesStore } from '@/store/useSalesStore';
import { AdminPageHeader } from '@/components/admin/responsive/AdminPageHeader';
import { DataTable, ColumnConfig } from '@/components/admin/responsive/DataTable';
import { ResponsiveModal } from '@/components/admin/responsive/ResponsiveModal';
import { KPICard } from '@/components/ui/KPICard';
import { GradientButton } from '@/components/ui/GradientButton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import { format, eachDayOfInterval, subDays, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { haptics } from '@/lib/haptics';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

export default function AgentProfilePage() {
  usePageTitle('Agent Profile');
  const { id } = useParams();
  const navigate = useNavigate();
  const { isMobile, isTablet } = useBreakpoint();
  const { agents, updateAgent } = useAdminStore();
  const { sales, inventory, inventoryLogs, dailyReports, products } = useSalesStore();

  const agent = agents.find(a => a.uid === id);

  const agentSales = useMemo(() => sales.filter(s => s.agentId === id), [sales, id]);
  const agentReports = useMemo(() => dailyReports.filter(r => r.agentId === id), [dailyReports, id]);
  const agentInventory = useMemo(() => inventory.filter(i => i.agentId === id), [inventory, id]);
  const agentLogs = useMemo(() => inventoryLogs.filter(l => l.agentId === id), [inventoryLogs, id]);

  const stats = useMemo(() => {
    const totalSales = agentSales.reduce((sum, s) => sum + s.totalKsh, 0);
    const thisMonth = new Date().getMonth();
    const monthSales = agentSales
      .filter(s => new Date(s.timestamp).getMonth() === thisMonth)
      .reduce((sum, s) => sum + s.totalKsh, 0);
    const monthReports = agentReports.filter(r => new Date(r.submittedAt).getMonth() === thisMonth).length;

    return {
      totalSales,
      monthSales,
      monthReports
    };
  }, [agentSales, agentReports]);

  const reportSummary = useMemo(() => {
    const totalReports = agentReports.length;
    if (totalReports === 0) return { avgAchievement: 0, totalCalls: 0, successRate: 0 };
    
    const sumAchievement = agentReports.reduce((sum, r) => sum + r.percentageAchieved, 0);
    const sumCalls = agentReports.reduce((sum, r) => sum + r.achievedCalls, 0);
    const sumSuccess = agentReports.reduce((sum, r) => sum + r.successfulCalls, 0);
    
    return {
      avgAchievement: Math.round(sumAchievement / totalReports),
      totalCalls: sumCalls,
      successRate: Math.round((sumSuccess / sumCalls) * 100) || 0
    };
  }, [agentReports]);

  const chartData = useMemo(() => {
    const last30Days = eachDayOfInterval({
      start: subDays(new Date(), 29),
      end: new Date()
    });

    return last30Days.map(day => {
      const daySales = agentSales
        .filter(s => isSameDay(new Date(s.timestamp), day))
        .reduce((sum, s) => sum + s.totalKsh, 0);
      return {
        date: format(day, 'MMM d'),
        sales: daySales,
        target: 50000 // Mock target
      };
    });
  }, [agentSales]);

  const callData = useMemo(() => {
    const last7Days = eachDayOfInterval({
      start: subDays(new Date(), 6),
      end: new Date()
    });

    return last7Days.map(day => {
      const report = agentReports.find(r => isSameDay(new Date(r.submittedAt), day));
      return {
        day: format(day, 'EEE'),
        calls: report?.achievedCalls || 0,
        target: report?.targetCalls || 20
      };
    });
  }, [agentReports]);

  if (!agent) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
        <UserMinus className="w-8 h-8 text-slate-400" />
      </div>
      <p className="text-slate-500 font-bold">Agent not found or has been removed.</p>
      <Button variant="outline" onClick={() => navigate('/admin/agents')}>Back to Agents</Button>
    </div>
  );

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className="flex flex-col min-h-full bg-[#F8FAFC]">
      <AdminPageHeader 
        title="Agent Profile"
        subtitle="Manage individual field agent performance and history"
        backTo="/admin/agents"
        actions={
          <div className="flex items-center gap-2">
            <Badge className={cn(
              "rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border-none",
              agent.status === 'active' ? 'bg-teal-50 text-teal-600' : 'bg-slate-100 text-slate-500'
            )}>
              {agent.status}
            </Badge>
            <Button variant="outline" size="sm" className="h-9 rounded-xl shadow-sm border-slate-200 bg-white" onClick={() => haptics.light()}>
              <Settings className="w-4 h-4 mr-2" /> Quick Edit
            </Button>
          </div>
        }
      />

      <div className={cn(
        "flex-1 space-y-6 max-w-7xl mx-auto w-full",
        isMobile ? "px-4 py-4" : isTablet ? "px-6 py-5" : "px-8 py-6"
      )}>
        {/* Header Profile Card */}
        <Card className="bg-gradient-to-br from-teal-600 to-blue-700 border-none shadow-xl rounded-[32px] overflow-hidden text-white relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <BuildingOffice2Icon className="w-32 h-32" />
          </div>
          <CardContent className={cn("p-8 relative z-10", isMobile && "p-6")}>
            <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
              <Avatar className={cn(
                "bg-white/20 border-4 border-white/30 shadow-2xl",
                isMobile ? "h-20 w-20" : "h-28 w-28"
              )}>
                <AvatarFallback className={cn("font-black bg-transparent text-white", isMobile ? "text-2xl" : "text-4xl")}>
                  {getInitials(agent.name)}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 text-center md:text-left space-y-4">
                <div>
                  <h1 className={cn("font-black tracking-tighter mb-1", isMobile ? "text-2xl" : "text-4xl")}>{agent.name}</h1>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4 text-white/90 text-[11px] font-bold uppercase tracking-wider">
                    <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 opacity-70" /> {agent.region}</div>
                    <div className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5 opacity-70" /> {agent.stockPoint}</div>
                    <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 opacity-70" /> Joined {format(agent.createdAt, 'MMM yyyy')}</div>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
                  <a href={`tel:${agent.phoneNumber}`} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-colors border border-white/10">
                    <Phone className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">{agent.phoneNumber}</span>
                  </a>
                  <a href={`mailto:${agent.email}`} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-colors border border-white/10">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="text-sm font-bold truncate max-w-[150px]">{agent.email}</span>
                  </a>
                </div>
              </div>

              <div className={cn(
                "grid gap-3 shrink-0",
                isMobile ? "grid-cols-3 w-full" : "grid-cols-1 w-56"
              )}>
                <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-md border border-white/10">
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-0.5">Total Sales</p>
                  <p className="text-lg font-black truncate">Ksh {stats.totalSales.toLocaleString()}</p>
                </div>
                <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-md border border-white/10">
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-0.5">Monthly</p>
                  <p className="text-lg font-black truncate">Ksh {stats.monthSales.toLocaleString()}</p>
                </div>
                <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-md border border-white/10">
                  <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-0.5">Target</p>
                  <p className="text-lg font-black">{reportSummary.avgAchievement}%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="bg-white/80 p-1.5 rounded-[24px] border border-slate-200 shadow-sm w-full flex overflow-x-auto no-scrollbar justify-start md:justify-center lg:justify-start">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'sales', label: 'Sales' },
              { id: 'inventory', label: 'Inventory' },
              { id: 'reports', label: 'Reports' },
              { id: 'settings', label: 'Settings' }
            ].map(tab => (
              <TabsTrigger 
                key={tab.id}
                value={tab.id} 
                className="rounded-2xl font-black text-[10px] uppercase tracking-widest px-6 py-3 data-[state=active]:bg-teal-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="overview" className="mt-8 space-y-8">
            <div className={cn(
              "grid gap-4",
              isMobile || isTablet ? "grid-cols-2" : "grid-cols-4"
            )}>
              <KPICard label="Total Calls" value={reportSummary.totalCalls.toString()} icon={<Phone className="w-6 h-6" />} />
              <KPICard label="Success Rate" value={`${reportSummary.successRate}%`} icon={<CheckCircle2 className="w-6 h-6" />} />
              <KPICard label="7-Day Sales" value={`Ksh ${agentSales.filter(s => s.timestamp >= subDays(new Date(), 7).getTime()).reduce((sum, s) => sum + s.totalKsh, 0).toLocaleString()}`} icon={<TrendingUp className="w-6 h-6" />} />
              <KPICard label="Inventory" value={agentInventory.reduce((sum, i) => sum + i.quantityCartons, 0).toString()} icon={<Package className="w-6 h-6" />} />
            </div>

            <div className={cn(
              "grid gap-8",
              isMobile ? "grid-cols-1" : "lg:grid-cols-3"
            )}>
              <Card className="lg:col-span-2 border-slate-200 shadow-soft rounded-[32px] overflow-hidden bg-white">
                <CardHeader className="border-b border-slate-100 bg-slate-50/30 p-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl font-black tracking-tight text-slate-900">Sales Trend</CardTitle>
                      <CardDescription className="font-bold">Last 30 days revenue analysis</CardDescription>
                    </div>
                    <TrendingUp className="w-8 h-8 text-teal-600/20" />
                  </div>
                </CardHeader>
                <CardContent className={cn("p-8", isMobile ? "h-[250px]" : "h-[350px]")}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748B' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748B' }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      />
                      <Line type="monotone" dataKey="sales" stroke="#0D9488" strokeWidth={4} dot={{ r: 4, fill: '#0D9488', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 0 }} />
                      <Line type="monotone" dataKey="target" stroke="#CBD5E1" strokeWidth={2} strokeDasharray="8 8" dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-soft rounded-[32px] overflow-hidden bg-white">
                <CardHeader className="border-b border-slate-100 bg-slate-50/30 p-8">
                  <CardTitle className="text-xl font-black tracking-tight text-slate-900">Call Velocity</CardTitle>
                  <CardDescription className="font-bold">7-day visitation activity</CardDescription>
                </CardHeader>
                <CardContent className={cn("p-8", isMobile ? "h-[250px]" : "h-[350px]")}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={callData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748B' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748B' }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                      />
                      <Bar dataKey="calls" radius={[8, 8, 0, 0]} barSize={24}>
                        {callData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.calls >= entry.target ? '#0D9488' : '#2563EB'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

        <TabsContent value="sales" className="mt-8">
          <Card className="border-slate-200 shadow-soft rounded-[32px] overflow-hidden bg-white">
            <DataTable 
              columns={[
                {
                  id: 'date',
                  header: 'Date',
                  accessor: (s) => (
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">{format(s.timestamp, 'MMM d, yyyy')}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{format(s.timestamp, 'HH:mm')}</span>
                    </div>
                  ),
                  showOnTablet: true
                },
                {
                  id: 'territory',
                  header: 'Territory',
                  accessor: (s) => (
                    <Badge variant="outline" className="rounded-lg bg-slate-50 border-slate-200 text-slate-600 font-bold px-3 py-1">
                      {s.routeName}
                    </Badge>
                  ),
                  showOnTablet: true
                },
                {
                  id: 'revenue',
                  header: 'Revenue',
                  accessor: (s) => (
                    <p className="font-black text-teal-600 text-base">Ksh {s.totalKsh.toLocaleString()}</p>
                  ),
                  showOnTablet: true
                },
                {
                  id: 'actions',
                  header: '',
                  accessor: (s) => (
                    <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                      <SaleDetailsModal sale={s} />
                    </div>
                  ),
                  showOnTablet: true
                }
              ]}
              data={agentSales}
              mobileCardRenderer={(s) => (
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{format(s.timestamp, 'MMM d, HH:mm')}</span>
                      <span className="font-bold text-slate-900">{s.routeName}</span>
                    </div>
                    <p className="font-black text-teal-600 text-sm">Ksh {s.totalKsh.toLocaleString()}</p>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                    <span className="text-[10px] font-bold text-slate-500">{s.items.length} Products</span>
                    <SaleDetailsModal sale={s} />
                  </div>
                </div>
              )}
            />
          </Card>
        </TabsContent>

        <TabsContent value="inventory" className="mt-8 space-y-8">
          <div className={cn(
            "grid gap-8",
            isMobile ? "grid-cols-1" : "lg:grid-cols-3"
          )}>
            <Card className="lg:col-span-2 border-slate-200 shadow-soft rounded-[32px] overflow-hidden bg-white">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-8">
                <CardTitle className="text-xl font-black tracking-tight text-slate-900">Stock Allocation</CardTitle>
                <CardDescription className="font-bold">Current field inventory levels</CardDescription>
              </CardHeader>
              <DataTable 
                columns={[
                  {
                    id: 'product',
                    header: 'Product',
                    accessor: (i) => (
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-teal-600 border border-slate-100 shadow-sm">
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-sm text-slate-900">{i.productName}</p>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{i.productSku}</p>
                        </div>
                      </div>
                    ),
                    showOnTablet: true
                  },
                  {
                    id: 'cartons',
                    header: 'Cartons',
                    accessor: (i) => <span className="font-black text-lg text-slate-900">{i.quantityCartons}</span>,
                    showOnTablet: true
                  },
                  {
                    id: 'packets',
                    header: 'Packets',
                    accessor: (i) => <span className="font-black text-lg text-slate-900">{i.quantityPackets}</span>,
                    showOnTablet: false
                  },
                  {
                    id: 'status',
                    header: 'Status',
                    accessor: (i) => (
                      <Badge className={cn(
                        "rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-widest border-none",
                        i.quantityCartons >= 10 ? 'bg-emerald-50 text-emerald-600' : 
                        i.quantityCartons >= 5 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'
                      )}>
                        {i.quantityCartons >= 10 ? 'Healthy' : i.quantityCartons >= 5 ? 'Low' : 'Critical'}
                      </Badge>
                    ),
                    showOnTablet: true
                  }
                ]}
                data={agentInventory}
                mobileCardRenderer={(i) => (
                  <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-teal-600 border border-slate-100 shadow-inner">
                      <Package className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">{i.productName}</p>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-xs font-black text-slate-900">{i.quantityCartons} <span className="text-[10px] text-slate-400">CTN</span></p>
                        <Badge className={cn(
                          "rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border-none",
                          i.quantityCartons >= 10 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        )}>
                          {i.quantityCartons >= 10 ? 'Ok' : 'Low'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                )}
              />
            </Card>

            <Card className="border-slate-200 shadow-soft rounded-[32px] overflow-hidden bg-white">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-8">
                <CardTitle className="text-xl font-black tracking-tight text-slate-900">Stock Movements</CardTitle>
                <CardDescription className="font-bold">Recent load-ins and deductions</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-[500px] overflow-y-auto scrollbar-hide">
                  <div className="divide-y divide-slate-100">
                    {agentLogs.length > 0 ? agentLogs.slice(0, 15).map((log) => (
                      <div key={log.id} className="p-5 flex items-center gap-5 hover:bg-slate-50 transition-colors">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                          log.type === 'addition' ? 'bg-teal-50 text-teal-600' : 'bg-blue-50 text-blue-600'
                        )}>
                          {log.type === 'addition' ? <TrendingUp className="w-5 h-5" /> : <ShoppingBag className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-slate-900 truncate">{log.productId}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{format(log.timestamp, 'MMM d, HH:mm')}</p>
                        </div>
                        <div className="text-right">
                          <p className={cn(
                            "text-base font-black italic",
                            log.type === 'addition' ? 'text-teal-600' : 'text-blue-600'
                          )}>
                            {log.type === 'addition' ? '+' : '-'}{log.quantityCartons} <span className="text-[10px]">CTN</span>
                          </p>
                        </div>
                      </div>
                    )) : (
                      <div className="p-20 text-center text-slate-400 font-bold italic">No logs available</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="mt-8 space-y-8">
          <div className={cn(
            "grid gap-8",
            isMobile ? "grid-cols-1" : "lg:grid-cols-4"
          )}>
            <div className={cn(
              "space-y-8",
              isMobile ? "grid grid-cols-2 lg:grid-cols-1 gap-4 space-y-0" : "lg:col-span-1"
            )}>
              <Card className="border-slate-200 shadow-soft rounded-[32px] overflow-hidden bg-white">
                <CardHeader className="bg-slate-50/30 p-6 border-b border-slate-100 text-center">
                  <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Achievement</CardTitle>
                </CardHeader>
                <CardContent className="p-6 flex flex-col items-center justify-center space-y-4">
                  <div className="relative w-24 h-24 md:w-32 md:h-32 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                      <circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="8" fill="transparent" 
                        strokeDasharray="283" 
                        strokeDashoffset={283 * (1 - Math.min(reportSummary.avgAchievement, 100) / 100)} 
                        className="text-teal-600 transition-all duration-1000" 
                      />
                    </svg>
                    <span className="absolute text-xl md:text-3xl font-black text-slate-900">{reportSummary.avgAchievement}%</span>
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 text-center">Avg daily progression</p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-soft rounded-[32px] overflow-hidden bg-white">
                <CardHeader className="bg-slate-50/30 p-6 border-b border-slate-100 text-center">
                  <CardTitle className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Field Stats</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Visits/Day</span>
                    <span className="text-sm font-black text-slate-900">{(reportSummary.totalCalls / (agentReports.length || 1)).toFixed(1)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Orders/Day</span>
                    <span className="text-sm font-black text-slate-900">{(agentSales.length / (agentReports.length || 1)).toFixed(1)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Conversion</span>
                    <span className="text-sm font-black text-emerald-600">{reportSummary.successRate}%</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="lg:col-span-3 border-slate-200 shadow-soft rounded-[32px] overflow-hidden bg-white">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-8">
                <CardTitle className="text-xl font-black tracking-tight text-slate-900">Attendance Calendar</CardTitle>
                <CardDescription className="font-bold">Submission consistency tracking (Last 35 days)</CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-7 gap-2 md:gap-3">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                    <div key={i} className="text-[10px] font-black uppercase tracking-widest text-center text-slate-400 mb-2">{d}</div>
                  ))}
                  {Array.from({ length: 35 }).map((_, i) => {
                    const day = subDays(new Date(), 34 - i);
                    const report = agentReports.find(r => isSameDay(new Date(r.submittedAt), day));
                    const isFuture = day > new Date();
                    const isToday = isSameDay(day, new Date());
                    
                    return (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.05 }}
                        className={cn(
                          "aspect-square rounded-xl cursor-pointer flex flex-col items-center justify-center gap-1 border transition-all duration-200",
                          isFuture ? 'bg-slate-50 border-slate-100 text-slate-300' :
                          report ? 'bg-emerald-500 border-emerald-600 text-white shadow-md shadow-emerald-100' : 
                          'bg-rose-50 border-rose-100 text-rose-500',
                          isToday && !report && 'ring-2 ring-teal-500 ring-offset-2'
                        )}
                        onClick={() => {
                          if (report) {
                            haptics.light();
                            toast.info(`Report for ${format(day, 'MMM d')}: Ksh ${report.actualSalesKsh.toLocaleString()}`);
                          }
                        }}
                      >
                        <span className="text-[11px] font-black">{format(day, 'd')}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className={cn(
            "grid gap-4",
            isMobile ? "grid-cols-1" : "grid-cols-2"
          )}>
            {agentReports.slice(0, 6).map((report) => (
              <Card key={report.id} className="border-slate-200 shadow-soft rounded-[32px] overflow-hidden bg-white hover:border-teal-500/20 transition-all group">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-4">
                  <div className="flex justify-between items-center">
                    <Badge className="bg-white text-slate-900 border-slate-200 shadow-sm px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                      {format(new Date(report.submittedAt), 'EEE, MMM d, yyyy')}
                    </Badge>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                      {format(report.submittedAt, 'HH:mm')}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Calls</p>
                      <p className="text-lg font-black text-slate-900">{report.achievedCalls}/{report.targetCalls}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Revenue</p>
                      <p className="text-lg font-black text-teal-600">Ksh {report.actualSalesKsh.toLocaleString()}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Target</p>
                      <p className={cn(
                        "text-lg font-black",
                        report.percentageAchieved >= 100 ? 'text-emerald-600' : 'text-amber-500'
                      )}>{Math.round(report.percentageAchieved)}%</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Challenges</p>
                          <p className="text-xs font-bold text-slate-700 leading-snug">{report.challenges.join(', ') || 'No reports obstacles'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-teal-50/50 rounded-xl border border-teal-100/50">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                        <div className="w-full">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Feedback</p>
                          {report.adminComments ? (
                            <div className="mt-1">
                              <p className="text-xs font-bold text-slate-900 italic leading-relaxed">"{report.adminComments.text}"</p>
                              <p className="text-[9px] text-teal-600 font-black uppercase tracking-widest mt-1">— {report.adminComments.adminName}</p>
                            </div>
                          ) : (
                            <div className="flex gap-2 mt-2">
                              <Input placeholder="Type feedback..." className="h-9 text-xs rounded-xl bg-white border-teal-200 shadow-sm" />
                              <Button size="icon" className="h-9 w-9 shrink-0 rounded-xl bg-teal-600 shadow-md shadow-teal-200">
                                <ChevronRight className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-8">
          <div className={cn(
            "grid gap-8",
            isMobile ? "grid-cols-1" : "lg:grid-cols-3"
          )}>
            <Card className="lg:col-span-2 border-slate-200 shadow-soft rounded-[32px] overflow-hidden bg-white">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-8">
                <CardTitle className="text-xl font-black tracking-tight text-slate-900">Internal Records</CardTitle>
                <CardDescription className="font-bold">Administrative data and profile synchronization</CardDescription>
              </CardHeader>
              <CardContent className={cn("p-8 space-y-8", isMobile && "p-6")}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</Label>
                    <Input defaultValue={agent.name} className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-teal-500 font-bold" />
                  </div>
                  <div className="space-y-2.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email</Label>
                    <Input defaultValue={agent.email} className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-teal-500 font-bold" />
                  </div>
                  <div className="space-y-2.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Region</Label>
                    <Input defaultValue={agent.region} className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-teal-500 font-bold" />
                  </div>
                  <div className="space-y-2.5">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Stock Point</Label>
                    <Input defaultValue={agent.stockPoint} className="h-12 rounded-xl bg-slate-50 border-slate-200 focus:ring-teal-500 font-bold" />
                  </div>
                </div>
                <div className="pt-4">
                  <Button className="w-full md:w-auto h-12 px-8 rounded-xl bg-teal-600 hover:bg-teal-700 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-teal-100">
                    Sync Profile Changes
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-8">
              <Card className="border-slate-200 shadow-soft rounded-[32px] overflow-hidden bg-white">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-8">
                  <CardTitle className="text-xl font-black tracking-tight text-slate-900">System Access</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-3">
                  <Button variant="outline" className="w-full h-12 rounded-xl border-slate-200 font-bold gap-3 shadow-sm justify-start px-6">
                    <Lock className="w-4 h-4 text-teal-600" /> Forced Password Reset
                  </Button>
                  <Button 
                    variant="outline" 
                    className={cn(
                      "w-full h-12 rounded-xl border-slate-200 font-bold gap-3 shadow-sm justify-start px-6",
                      agent.status === 'active' ? 'text-rose-600 hover:bg-rose-50 border-rose-100' : 'text-emerald-600 hover:bg-emerald-50 border-emerald-100'
                    )}
                    onClick={() => {
                      haptics.medium();
                      updateAgent({ ...agent, status: agent.status === 'active' ? 'inactive' : 'active' });
                    }}
                  >
                    <UserMinus className="w-4 h-4" /> 
                    {agent.status === 'active' ? 'Deactivate Access' : 'Restore Access'}
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-slate-200 shadow-soft rounded-[32px] overflow-hidden bg-white">
                <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-8">
                  <CardTitle className="text-xl font-black tracking-tight text-slate-900">Territories</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="flex flex-wrap gap-2">
                    {agent.assignedRoutes?.length > 0 ? agent.assignedRoutes.map(route => (
                      <Badge key={route} className="bg-slate-50 text-slate-700 border-slate-200 border px-3 py-1.5 rounded-lg font-bold">
                        {route}
                      </Badge>
                    )) : (
                      <p className="text-sm font-bold text-slate-400 italic">No routes assigned.</p>
                    )}
                  </div>
                  <Button variant="ghost" className="w-full h-10 rounded-xl text-teal-600 font-black text-[10px] uppercase tracking-widest border-teal-100 border bg-teal-50/30">
                    Modify Route Bindings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  </div>
);
}

function SaleDetailsModal({ sale }: { sale: any }) {
  const { products } = useSalesStore();
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <>
      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={(e) => { e.stopPropagation(); setIsOpen(true); haptics.light(); }}>
        <ChevronRight className="w-4 h-4" />
      </Button>

      <ResponsiveModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Sale Breakdown"
      >
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Value</p>
            <p className="text-2xl font-black text-teal-600">Ksh {sale.totalKsh.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Timestamp</p>
            <p className="text-sm font-bold text-slate-900">{format(sale.timestamp, 'MMM d, HH:mm')}</p>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Inventory Sold</p>
          <div className="space-y-2">
            {sale.items.map((item: any, i: number) => {
              const product = products.find(p => p.sku === item.productId);
              return (
                <div key={i} className="flex justify-between items-center p-3.5 bg-white rounded-xl border border-slate-100 shadow-sm">
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{product?.name || item.productId}</p>
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none mt-0.5">{item.productId}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-slate-900 text-sm">{item.quantityCartons} <span className="text-[10px] text-slate-400">CTN</span></p>
                    <p className="text-[10px] text-teal-600 font-bold uppercase tracking-widest">Ksh {item.priceKsh.toLocaleString()}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="space-y-3">
          <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-1">Route Context</p>
          <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-slate-200 shadow-sm">
              <MapPin className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-sm font-black text-slate-900">{sale.routeName}</p>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Territory Entry</p>
            </div>
          </div>
        </div>
      </div>
    </ResponsiveModal>
    </>
  );
}
