import React, { useState, useMemo, useRef } from 'react';
import { useSalesStore } from '@/store/useSalesStore';
import { useAdminStore } from '@/store/useAdminStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Calendar as CalendarIcon, 
  Table as TableIcon, 
  BarChart3, 
  Search, 
  Filter, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  MoreVertical,
  Eye,
  MessageSquare,
  Share2,
  FileText,
  Printer,
  Copy,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Send,
  TrendingUp,
  Target,
  ShoppingCart,
  PhoneCall,
  ArrowLeft
} from 'lucide-react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isToday, 
  addMonths, 
  subMonths,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  parseISO
} from 'date-fns';
import { cn } from '@/lib/utils';
import { haptics } from '@/lib/haptics';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar,
  Cell
} from 'recharts';
import * as d3 from 'd3';
import cloud from 'd3-cloud';
import { toast } from 'sonner';
import { usePageTitle } from '@/hooks/usePageTitle';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { AdminPageHeader } from '@/components/admin/responsive/AdminPageHeader';
import { DataTable } from '@/components/admin/responsive/DataTable';
import { ResponsiveModal } from '@/components/admin/responsive/ResponsiveModal';

// --- Types ---
type ViewType = 'calendar' | 'table' | 'analytics';

// --- Word Cloud Component ---
function WordCloud({ words }: { words: { text: string; size: number }[] }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const { isMobile } = useBreakpoint();

  React.useEffect(() => {
    if (!svgRef.current || words.length === 0) return;

    const width = isMobile ? 320 : 400;
    const height = 250;

    const layout = cloud()
      .size([width, height])
      .words(words.map(d => ({ text: d.text, size: 10 + d.size * 5 })))
      .padding(5)
      .rotate(() => (~~(Math.random() * 2) * 90))
      .font("Inter")
      .fontSize(d => (d as any).size)
      .on("end", draw);

    layout.start();

    function draw(tags: any[]) {
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();
      
      const g = svg
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

      g.selectAll("text")
        .data(tags)
        .enter()
        .append("text")
        .style("font-size", d => `${d.size}px`)
        .style("font-family", "Inter")
        .style("font-weight", "900")
        .style("fill", () => {
          const colors = ['#0F172A', '#0D9488', '#14B8A6', '#334155', '#475569'];
          return colors[Math.floor(Math.random() * colors.length)];
        })
        .attr("text-anchor", "middle")
        .attr("transform", d => `translate(${[d.x, d.y]})rotate(${d.rotate})`)
        .text(d => d.text);
    }
  }, [words, isMobile]);

  return <svg ref={svgRef} className="max-w-full h-auto" />;
}

// --- Main Component ---
export default function DailyReportsPage() {
  usePageTitle('Daily Reports');
  const [view, setView] = useState<ViewType>('calendar');
  const { dailyReports, addReportComment } = useSalesStore();
  const { agents } = useAdminStore();
  const { isMobile, isTablet } = useBreakpoint();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const handleOpenReport = (reportId: string) => {
    setSelectedReportId(reportId);
    setIsReportModalOpen(true);
    haptics.light();
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      <div className={cn(
        "shrink-0",
        isMobile ? "p-4" : isTablet ? "px-6 py-4" : "px-8 py-6"
      )}>
        <AdminPageHeader 
          title="Daily Logs" 
          subtitle="Agent field submissions & logs"
          actions={
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-sm">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { setView('calendar'); haptics.light(); }}
                className={cn(
                  "rounded-lg px-3 h-8 text-[10px] font-black uppercase tracking-widest transition-all",
                  view === 'calendar' ? "bg-white text-teal-600 shadow-sm" : "text-slate-500 hover:bg-white/50"
                )}
              >
                <CalendarIcon className="w-3.5 h-3.5 mr-1.5" /> Calendar
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { setView('table'); haptics.light(); }}
                className={cn(
                  "rounded-lg px-3 h-8 text-[10px] font-black uppercase tracking-widest transition-all",
                  view === 'table' ? "bg-white text-teal-600 shadow-sm" : "text-slate-500 hover:bg-white/50"
                )}
              >
                <TableIcon className="w-3.5 h-3.5 mr-1.5" /> Table
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => { setView('analytics'); haptics.light(); }}
                className={cn(
                  "rounded-lg px-3 h-8 text-[10px] font-black uppercase tracking-widest transition-all",
                  view === 'analytics' ? "bg-white text-teal-600 shadow-sm" : "text-slate-500 hover:bg-white/50"
                )}
              >
                <BarChart3 className="w-3.5 h-3.5 mr-1.5" /> Charts
              </Button>
            </div>
          }
        />
      </div>

      <div className="flex-1 overflow-hidden relative">
        {view === 'calendar' && (
          <CalendarView 
            reports={dailyReports} 
            agents={agents} 
            selectedDate={selectedDate}
            onDateSelect={setSelectedDate}
            onOpenReport={handleOpenReport}
          />
        )}
        {view === 'table' && (
          <ReportsTableView 
            reports={dailyReports} 
            agents={agents} 
            onOpenReport={handleOpenReport}
          />
        )}
        {view === 'analytics' && (
          <AnalyticsView 
            reports={dailyReports} 
            agents={agents} 
          />
        )}
      </div>

      {selectedReportId && (
        <ReportCardModal 
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          reportId={selectedReportId}
          onAddComment={addReportComment}
        />
      )}
    </div>
  );
}

// --- View 1: Calendar View ---
function CalendarView({ reports, agents, selectedDate, onDateSelect, onOpenReport }: any) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { isMobile, isTablet } = useBreakpoint();
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const getDayReports = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return reports.filter((r: any) => r.date === dateStr);
  };

  const dayReports = useMemo(() => getDayReports(selectedDate), [selectedDate, reports]);
  const submissionRate = agents.length > 0 ? (dayReports.length / agents.length) * 100 : 0;

  return (
    <div className={cn(
      "flex h-full overflow-hidden",
      isMobile ? "flex-col" : "flex-row"
    )}>
      {/* Calendar Grid */}
      <div className={cn(
        "flex-1 overflow-y-auto",
        isMobile ? "p-4 border-b border-slate-100" : isTablet ? "p-6" : "p-8"
      )}>
        <Card className="border-slate-200 shadow-soft rounded-[32px] overflow-hidden bg-white">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-xl font-black tracking-tight text-slate-900">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-xl border-slate-200 hover:bg-teal-50 hover:text-teal-600 transition-all"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button 
                variant="outline" 
                size="icon" 
                className="rounded-xl border-slate-200 hover:bg-teal-50 hover:text-teal-600 transition-all"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {isMobile ? day.charAt(0) : day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7">
            {calendarDays.map((day, i) => {
              const dayReps = getDayReports(day);
              const isSelected = isSameDay(day, selectedDate);
              const isCurrentMonth = isSameMonth(day, monthStart);
              const subCount = dayReps.length;
              const totalAgents = agents.length;
              
              return (
                <div 
                  key={day.toString()}
                  onClick={() => onDateSelect(day)}
                  className={cn(
                    "min-h-[80px] md:min-h-[120px] p-2 md:p-3 border-r border-b border-slate-100 cursor-pointer transition-all relative group",
                    !isCurrentMonth && "bg-slate-50/30 opacity-40",
                    isSelected && "bg-teal-50/50 ring-2 ring-inset ring-teal-500 z-10 shadow-inner",
                    isToday(day) && "bg-amber-50/30",
                    isMobile ? "min-h-[60px]" : ""
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className={cn(
                      "text-xs md:text-sm font-black w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-full transition-colors",
                      isToday(day) ? "bg-amber-500 text-white" : isSelected ? "text-teal-600 bg-white shadow-sm ring-1 ring-teal-200" : "text-slate-400"
                    )}>
                      {format(day, 'd')}
                    </span>
                    {subCount > 0 && !isMobile && (
                      <Badge variant="ghost" className="text-[10px] font-black border-none bg-slate-100 text-slate-500">
                        {subCount}/{totalAgents}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-auto overflow-hidden max-h-[20px] md:max-h-full">
                    {agents.map((agent: any) => {
                      const hasSubmitted = dayReps.some((r: any) => r.agentId === agent.uid);
                      return (
                        <div 
                          key={agent.uid}
                          className={cn(
                            "w-1.5 h-1.5 md:w-2 md:h-2 rounded-full transition-all",
                            hasSubmitted ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" : "bg-slate-100"
                          )}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Day Detail Panel */}
      <div className={cn(
        "bg-white flex flex-col transition-all duration-300",
        isMobile ? "w-full min-h-[400px]" : "w-[400px] border-l border-slate-200"
      )}>
        <div className={cn(
          "border-b border-slate-100 bg-slate-50/50",
          isMobile ? "p-6" : "p-8"
        )}>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-black tracking-tight text-slate-900">
              {format(selectedDate, 'EEEE, d MMM')}
            </h3>
            <Badge className={cn(
              "font-black uppercase tracking-widest text-[9px] border-none px-2",
              submissionRate === 100 ? "bg-emerald-500 text-white" : 
              submissionRate > 50 ? "bg-amber-500 text-white" : "bg-rose-500 text-white"
            )}>
              {Math.round(submissionRate)}% Active
            </Badge>
          </div>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
            {dayReports.length} of {agents.length} agents finished field tasks
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-3 scrollbar-hide">
          {agents.map((agent: any) => {
            const report = dayReports.find((r: any) => r.agentId === agent.uid);
            const isSubmitted = !!report;
            
            return (
              <div 
                key={agent.uid}
                className={cn(
                  "p-4 rounded-[24px] border transition-all flex items-center justify-between group",
                  isSubmitted ? "bg-white border-slate-100 shadow-sm hover:border-teal-200 cursor-pointer" : "bg-slate-50 border-transparent opacity-60"
                )}
                onClick={() => isSubmitted && onOpenReport(report.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-teal-600 font-black text-xl border border-slate-200 italic shadow-inner">
                      {agent.name.charAt(0)}
                    </div>
                    <div className={cn(
                      "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white",
                      isSubmitted ? "bg-emerald-500 shadow-sm animate-pulse" : "bg-slate-300"
                    )} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 text-sm tracking-tight">{agent.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest",
                        isSubmitted ? "text-emerald-600" : "text-slate-400"
                      )}>
                        {isSubmitted ? 'Live Sync' : 'Offline'}
                      </span>
                      {isSubmitted && (
                        <span className="text-[9px] text-slate-300 font-black uppercase tracking-widest flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {format(report.submittedAt, 'h:mm a')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {isSubmitted ? (
                  <Button variant="ghost" size="icon" className="rounded-xl text-teal-600 bg-teal-50 h-9 w-9">
                    <Eye className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-[9px] font-black uppercase tracking-widest text-teal-600 hover:bg-teal-50 rounded-xl h-9 px-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      toast.success(`Nudge sent to ${agent.name}`);
                      haptics.light();
                    }}
                  >
                    <Send className="w-3.5 h-3.5 mr-1.5" /> Nudge
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50/30">
          <Button 
            className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-2xl h-12 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-teal-100"
            onClick={() => {
              const missingCount = agents.length - dayReports.length;
              if (missingCount > 0) {
                toast.success(`Reminders sent to ${missingCount} agents`);
                haptics.success();
              } else {
                toast.info("100% Territory Coverage!");
              }
            }}
          >
            Nudge All Missing
          </Button>
        </div>
      </div>
    </div>
  );
}

// --- View 2: Reports Table View ---
function ReportsTableView({ reports, agents, onOpenReport }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('All');
  const [achievementFilter, setAchievementFilter] = useState('All');
  const { isMobile, isTablet } = useBreakpoint();

  const filteredReports = useMemo(() => {
    return reports.filter((r: any) => {
      const matchesSearch = r.agentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           r.route.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRegion = regionFilter === 'All' || r.region === regionFilter;
      
      let matchesAchievement = true;
      if (achievementFilter === 'Overachieved') matchesAchievement = r.percentageAchieved >= 100;
      else if (achievementFilter === 'Underachieved') matchesAchievement = r.percentageAchieved < 100;
      
      return matchesSearch && matchesRegion && matchesAchievement;
    }).sort((a: any, b: any) => b.submittedAt - a.submittedAt);
  }, [reports, searchQuery, regionFilter, achievementFilter]);

  const columns = [
    {
      id: 'reportInfo',
      header: 'Report Info',
      accessor: (report: any) => (
        <div className="flex flex-col">
          <span className="text-xs font-black text-slate-900 tracking-tight">
            {format(parseISO(report.date), 'dd MMM')}
          </span>
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
            {format(report.submittedAt, 'h:mm a')}
          </span>
        </div>
      )
    },
    {
      id: 'agentName',
      header: 'Agent',
      accessor: (report: any) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 font-black text-xs border border-teal-100 italic shadow-sm">
            {report.agentName.charAt(0)}
          </div>
          <span className="font-black text-slate-900 tracking-tight text-sm">{report.agentName}</span>
        </div>
      )
    },
    {
      id: 'route',
      header: 'Region / Route',
      showOnTablet: true,
      accessor: (report: any) => (
        <div className="flex flex-col">
          <span className="text-xs font-black text-slate-900 tracking-tight">{report.route}</span>
          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{report.region}</span>
        </div>
      )
    },
    {
      id: 'percentageAchieved',
      header: 'Performance',
      accessor: (report: any) => {
        const percent = report.percentageAchieved;
        let color = "text-rose-600";
        if (percent >= 100) color = "text-emerald-600";
        else if (percent >= 75) color = "text-teal-600";
        else if (percent >= 50) color = "text-amber-600";

        return (
          <div className="flex flex-col">
            <span className={cn("text-sm font-black italic", color)}>
              {percent.toFixed(0)}%
            </span>
            <div className="flex items-center gap-1 text-[9px] font-black uppercase text-slate-400">
              <span className="text-slate-900">{report.achievedSalesKsh.toLocaleString()}</span>
              <span>/</span>
              <span>{report.targetSalesKsh.toLocaleString()}</span>
            </div>
          </div>
        );
      }
    },
    {
      id: 'calls',
      header: 'Field Activity',
      showOnTablet: true,
      accessor: (report: any) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-xs font-black italic">
            <span className="text-slate-400">{report.targetCalls}</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-900">{report.achievedCalls}</span>
            <span className="text-slate-300">/</span>
            <span className="text-emerald-600">{report.successfulCalls}</span>
          </div>
          <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest">Target / Visit / Sale</span>
        </div>
      )
    },
    {
      id: 'actions',
      header: '',
      accessor: (report: any) => (
        <div className="flex justify-end">
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-xl hover:bg-teal-50 hover:text-teal-600 transition-all"
            onClick={(e) => {
              e.stopPropagation();
              onOpenReport(report.id);
            }}
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  const mobileCardRenderer = (report: any) => (
    <div 
      className="p-5 bg-white rounded-[24px] border border-slate-100 shadow-sm space-y-4"
      onClick={() => onOpenReport(report.id)}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600 font-black italic border border-teal-100 shadow-sm">
            {report.agentName.charAt(0)}
          </div>
          <div>
            <h4 className="font-black text-slate-900 tracking-tight">{report.agentName}</h4>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">{report.route}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-black text-slate-900 italic">{format(parseISO(report.date), 'dd MMM')}</p>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{format(report.submittedAt, 'h:mm a')}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2">
        <div className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
          <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Target Achievement</p>
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-lg font-black italic",
              report.percentageAchieved >= 100 ? "text-emerald-600" : "text-amber-600"
            )}>
              {report.percentageAchieved.toFixed(0)}%
            </span>
          </div>
        </div>
        <div className="p-3 bg-slate-50/50 rounded-2xl border border-slate-100">
          <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Visits / Sales</p>
          <div className="flex items-center gap-1 text-sm font-black italic">
            <span className="text-slate-900">{report.achievedCalls}</span>
            <span className="text-slate-300">/</span>
            <span className="text-emerald-600">{report.successfulCalls}</span>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <Button className="w-full h-11 bg-teal-50 text-teal-600 hover:bg-teal-100 rounded-xl border-none font-black uppercase tracking-widest text-[9px] shadow-sm">
          Detailed Analysis <ArrowRight className="w-3 h-3 ml-2" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className={cn(
      "h-full flex flex-col space-y-6",
      isMobile ? "p-4" : isTablet ? "p-6" : "p-8"
    )}>
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search agents or territories..." 
            className="pl-11 h-12 rounded-2xl bg-white border-slate-200 font-black text-sm tracking-tight shadow-sm focus:ring-teal-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 min-w-max">
          <select 
            className="h-12 px-4 rounded-2xl bg-white border border-slate-200 font-black text-[10px] uppercase tracking-widest outline-none focus:ring-2 focus:ring-teal-500 shadow-sm appearance-none min-w-[140px]"
            value={regionFilter}
            onChange={(e) => setRegionFilter(e.target.value)}
          >
            <option value="All">All Regions</option>
            <option value="Central">Central</option>
            <option value="Coast">Coast</option>
            <option value="Western">Western</option>
          </select>
          <select 
            className="h-12 px-4 rounded-2xl bg-white border border-slate-200 font-black text-[10px] uppercase tracking-widest outline-none focus:ring-2 focus:ring-teal-500 shadow-sm appearance-none min-w-[160px]"
            value={achievementFilter}
            onChange={(e) => setAchievementFilter(e.target.value)}
          >
            <option value="All">Target Status</option>
            <option value="Overachieved">Goal Reached (≥100%)</option>
            <option value="Underachieved">Behind Target (&lt;100%)</option>
          </select>
          <Button variant="outline" className="rounded-2xl border-slate-200 h-12 gap-2 font-black uppercase tracking-widest text-[10px] shadow-sm px-4">
            <Download className="w-4 h-4 text-teal-600" /> Export
          </Button>
        </div>
      </div>

      {/* Table Content */}
      <DataTable
        data={filteredReports}
        columns={columns}
        mobileCardRenderer={mobileCardRenderer}
        onRowClick={(report) => onOpenReport(report.id)}
      />
    </div>
  );
}

// --- View 3: Analytics View ---
function AnalyticsView({ reports, agents }: any) {
  const { isMobile, isTablet } = useBreakpoint();
  
  const submissionTrend = useMemo(() => {
    const data: any[] = [];
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = format(d, 'yyyy-MM-dd');
      const dayReps = reports.filter((r: any) => r.date === dateStr);
      const rate = agents.length > 0 ? (dayReps.length / agents.length) * 100 : 0;
      data.push({
        date: format(d, 'MMM d'),
        rate: Math.round(rate)
      });
    }
    return data;
  }, [reports, agents]);

  const achievementStats = useMemo(() => {
    const over = reports.filter((r: any) => r.percentageAchieved >= 100).length;
    const mid = reports.filter((r: any) => r.percentageAchieved >= 75 && r.percentageAchieved < 100).length;
    const low = reports.filter((r: any) => r.percentageAchieved < 75).length;
    
    return [
      { name: 'Goal Hit (≥100%)', value: over, color: '#10B981' },
      { name: 'On Track (75-99%)', value: mid, color: '#0D9488' },
      { name: 'Lagging (<75%)', value: low, color: '#F59E0B' }
    ];
  }, [reports]);

  const challengeWords = useMemo(() => [
    { text: 'Traffic', size: 8 },
    { text: 'Heavy Rain', size: 6 },
    { text: 'Stock Out', size: 4 },
    { text: 'Competitor Price', size: 10 },
    { text: 'Closed Shops', size: 5 },
    { text: 'Network Issues', size: 3 },
    { text: 'Fuel Cost', size: 7 },
    { text: 'Bad Roads', size: 4 },
    { text: 'Long Distance', size: 5 },
  ], []);

  const insightWords = useMemo(() => [
    { text: 'New Shops', size: 10 },
    { text: 'High Demand', size: 8 },
    { text: 'Bulk Orders', size: 6 },
    { text: 'Coffee Feedback', size: 9 },
    { text: 'Promo Success', size: 5 },
    { text: 'Loyal Customers', size: 7 },
    { text: 'Tea Preference', size: 6 },
    { text: 'Display Space', size: 4 },
  ], []);

  return (
    <div className={cn(
      "h-full overflow-y-auto space-y-8 pb-20",
      isMobile ? "p-4" : isTablet ? "p-6" : "p-8"
    )}>
      <div className={cn(
        "grid gap-6",
        isMobile ? "grid-cols-1" : isTablet ? "grid-cols-1" : "grid-cols-3"
      )}>
        {/* Submission Rate Trend */}
        <Card className={cn(
          "border-slate-200 shadow-soft rounded-[32px] overflow-hidden bg-white",
          isTablet ? "col-span-1" : "col-span-2"
        )}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-black tracking-tight text-slate-900">Coverage Accuracy</CardTitle>
            <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400">Territory reporting sync rate (30d)</CardDescription>
          </CardHeader>
          <CardContent className={isMobile ? "h-[200px]" : "h-[300px]"}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={submissionTrend}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 900 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 900 }} domain={[0, 100]} />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontSize: '12px', fontWeight: '900' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="rate" 
                  stroke="#0D9488" 
                  strokeWidth={4} 
                  dot={{ r: 4, fill: '#0D9488', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Achievement Distribution */}
        <Card className="border-slate-200 shadow-soft rounded-[32px] overflow-hidden bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-black tracking-tight text-slate-900">Performance Split</CardTitle>
            <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sales goal density</CardDescription>
          </CardHeader>
          <CardContent className={cn(
            "flex flex-col",
            isMobile ? "h-[300px]" : "h-[300px]"
          )}>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={achievementStats} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" hide />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="value" radius={[0, 12, 12, 0]} barSize={32}>
                    {achievementStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {achievementStats.map((stat) => (
                <div key={stat.name} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 italic">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stat.color }} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{stat.name}</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-900">{stat.value} Logs</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className={cn(
        "grid gap-6",
        isMobile ? "grid-cols-1" : "grid-cols-2"
      )}>
        {/* Common Challenges Word Cloud */}
        <Card className="border-slate-200 shadow-soft rounded-[32px] overflow-hidden bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-black tracking-tight text-slate-900">Territory Friction</CardTitle>
            <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400">Top reported field barriers</CardDescription>
          </CardHeader>
          <CardContent className={isMobile ? "h-[250px]" : "h-[300px]"}>
            <div className="w-full h-full flex items-center justify-center">
              <WordCloud words={challengeWords} />
            </div>
          </CardContent>
        </Card>

        {/* Market Insights Word Cloud */}
        <Card className="border-slate-200 shadow-soft rounded-[32px] overflow-hidden bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-black tracking-tight text-slate-900">Growth Signals</CardTitle>
            <CardDescription className="text-[10px] font-black uppercase tracking-widest text-slate-400">Opportunities from the ground</CardDescription>
          </CardHeader>
          <CardContent className={isMobile ? "h-[250px]" : "h-[300px]"}>
            <div className="w-full h-full flex items-center justify-center">
              <WordCloud words={insightWords} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// --- Report Card Modal ---
function ReportCardModal({ isOpen, onClose, reportId, onAddComment }: any) {
  const { dailyReports } = useSalesStore();
  const report = dailyReports.find((r: any) => r.id === reportId);
  const [comment, setComment] = useState('');
  const reportRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useBreakpoint();

  if (!report) return null;

  const handleSaveComment = () => {
    if (!comment.trim()) return;
    onAddComment(report.id, {
      text: comment,
      adminName: 'Admin',
      timestamp: Date.now()
    });
    setComment('');
    toast.success('Strategy log updated');
    haptics.success();
  };

  const handleDownloadPDF = async () => {
    // Note: html2canvas and jspdf were removed from imports to favor a cleaner build if not needed, 
    // but the logic remains for reference or future activation. 
    // Usually better to generate PDFs server side for production reliability.
    toast.info('PDF Generation is restricted in this preview. Use "Copy WhatsApp" for sharing.');
    haptics.light();
  };

  const handleCopyWhatsApp = () => {
    const text = `🌟 *FS Daily Evening Report*
─────────────────
*Name:* ${report.agentName}
*Stock Point:* ${report.stockPoint}
*Region:* ${report.region}
*Date:* ${format(parseISO(report.date), 'dd/MM/yyyy')}
*Route:* ${report.route}
─────────────────
*COVERAGE*
Target Calls: ${report.targetCalls}
✓ Achieved Calls: ${report.achievedCalls}
✓ Successful Calls: ${report.successfulCalls}
─────────────────
*SALES*
Target: Ksh ${report.targetSalesKsh.toLocaleString()}
Actual: Ksh ${report.actualSalesKsh.toLocaleString()}
Achievement: ${report.percentageAchieved.toFixed(1)}%
─────────────────
*MARKET INSIGHTS*
${report.marketInsights.join('\n')}
─────────────────
*CHALLENGES*
${report.challenges.join('\n')}
─────────────────
*PLAN FOR TOMORROW*
${report.planForTomorrow.join('\n')}`;

    navigator.clipboard.writeText(text);
    toast.success('Report copied in WhatsApp format');
    haptics.success();
  };

  return (
    <ResponsiveModal isOpen={isOpen} onClose={onClose} title={`Daily Report Detail - ${report.agentName}`}>
      <div className="max-h-[90vh] overflow-hidden p-0 flex flex-col">
        <div className="flex-1 overflow-y-auto p-8 bg-slate-50">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Report Card (WhatsApp Style) */}
            <div className="lg:col-span-3">
              <div 
                ref={reportRef}
                className="bg-white rounded-[24px] shadow-xl border border-border overflow-hidden flex flex-col min-h-[600px]"
              >
                <div className="bg-gradient-brand p-6 text-white">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-black tracking-tight flex items-center gap-2">
                      <span className="text-2xl">🌟</span> FS Daily Evening Report
                    </h3>
                    <Badge className="bg-white/20 text-white border-none text-[10px] font-black uppercase tracking-widest">
                      {report.percentageAchieved >= 100 ? 'Target Met' : 'In Progress'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-y-2 text-sm">
                    <div className="flex flex-col">
                      <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">Name</span>
                      <span className="font-bold">{report.agentName}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">Date</span>
                      <span className="font-bold">{format(parseISO(report.date), 'dd/MM/yyyy')}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">Region</span>
                      <span className="font-bold">{report.region}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white/60 text-[10px] font-black uppercase tracking-widest">Route</span>
                      <span className="font-bold">{report.route}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-6">
                  {/* Coverage Section */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-widest flex items-center gap-2">
                        <PhoneCall className="w-3 h-3" /> Coverage
                      </h4>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-bold text-text-secondary uppercase mb-1">Target</p>
                        <p className="text-lg font-black text-text-primary">{report.targetCalls}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-bold text-text-secondary uppercase mb-1">Achieved</p>
                        <p className="text-lg font-black text-teal-600">{report.achievedCalls}</p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <p className="text-[10px] font-bold text-text-secondary uppercase mb-1">Success</p>
                        <p className="text-lg font-black text-primary">{report.successfulCalls}</p>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-text-secondary">
                        <span>Call Achievement</span>
                        <span>{Math.round((report.achievedCalls / report.targetCalls) * 100)}%</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-teal-500 rounded-full transition-all duration-1000"
                          style={{ width: `${Math.min((report.achievedCalls / report.targetCalls) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </section>

                  {/* Sales Section */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-widest flex items-center gap-2">
                        <Target className="w-3 h-3" /> Sales Performance
                      </h4>
                      <span className={cn(
                        "text-sm font-black",
                        report.percentageAchieved >= 100 ? "text-teal-600" : "text-amber-600"
                      )}>
                        {report.percentageAchieved.toFixed(1)}%
                      </span>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-text-secondary uppercase">Target</span>
                          <span className="text-lg font-black text-text-primary">Ksh {report.targetSalesKsh.toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col text-right">
                          <span className="text-[10px] font-bold text-text-secondary uppercase">Actual</span>
                          <span className="text-lg font-black text-primary">Ksh {report.actualSalesKsh.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full transition-all duration-1000",
                            report.percentageAchieved >= 100 ? "bg-teal-500" : "bg-primary"
                          )}
                          style={{ width: `${Math.min(report.percentageAchieved, 100)}%` }}
                        />
                      </div>
                    </div>
                  </section>

                  {/* Insights & Challenges */}
                  <div className="grid grid-cols-2 gap-6">
                    <section className="space-y-3">
                      <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-widest border-b border-slate-100 pb-1">Insights</h4>
                      <ul className="space-y-1.5">
                        {report.marketInsights.map((insight: string, idx: number) => (
                          <li key={idx} className="text-xs text-text-primary font-medium flex gap-2">
                            <span className="text-teal-500">•</span> {insight}
                          </li>
                        ))}
                      </ul>
                    </section>
                    <section className="space-y-3">
                      <h4 className="text-[10px] font-black text-text-secondary uppercase tracking-widest border-b border-slate-100 pb-1">Challenges</h4>
                      <ul className="space-y-1.5">
                        {report.challenges.map((challenge: string, idx: number) => (
                          <li key={idx} className="text-xs text-text-primary font-medium flex gap-2">
                            <span className="text-danger">•</span> {challenge}
                          </li>
                        ))}
                      </ul>
                    </section>
                  </div>

                  {/* Plan for Tomorrow */}
                  <section className="space-y-3 bg-primary/5 p-4 rounded-2xl border border-primary/10">
                    <h4 className="text-[10px] font-black text-primary uppercase tracking-widest">Plan for Tomorrow</h4>
                    <ul className="space-y-1.5">
                      {report.planForTomorrow.map((plan: string, idx: number) => (
                        <li key={idx} className="text-xs text-text-primary font-bold flex gap-2">
                          <ArrowRight className="w-3 h-3 text-primary shrink-0 mt-0.5" /> {plan}
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
              </div>
            </div>

            {/* Admin Actions & Comments */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-border shadow-soft rounded-[24px] overflow-hidden bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-text-secondary">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start rounded-xl h-12 gap-3 font-bold border-border hover:bg-slate-50"
                    onClick={handleCopyWhatsApp}
                  >
                    <Copy className="w-4 h-4 text-teal-600" /> Copy WhatsApp Text
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start rounded-xl h-12 gap-3 font-bold border-border hover:bg-slate-50"
                    onClick={handleDownloadPDF}
                  >
                    <FileText className="w-4 h-4 text-primary" /> Download PDF
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start rounded-xl h-12 gap-3 font-bold border-border hover:bg-slate-50"
                    onClick={() => { window.print(); haptics.light(); }}
                  >
                    <Printer className="w-4 h-4 text-slate-600" /> Print Report
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full justify-start rounded-xl h-12 gap-3 font-bold border-border hover:bg-slate-50"
                  >
                    <Share2 className="w-4 h-4 text-indigo-600" /> Share Link
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-border shadow-soft rounded-[24px] overflow-hidden bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-sm font-black uppercase tracking-widest text-text-secondary">Admin Comments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {report.adminComments && (
                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">{report.adminComments.adminName}</span>
                        <span className="text-[10px] text-text-secondary font-medium">{format(report.adminComments.timestamp, 'MMM d, h:mm a')}</span>
                      </div>
                      <p className="text-sm text-text-primary font-medium italic">"{report.adminComments.text}"</p>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <textarea 
                      placeholder="Add a feedback or comment..."
                      className="w-full min-h-[100px] p-4 rounded-2xl bg-slate-50 border border-border text-sm font-medium focus:ring-2 focus:ring-primary outline-none resize-none"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                    <Button 
                      className="w-full bg-primary hover:bg-primary-dark text-white rounded-xl h-11 font-bold shadow-lg shadow-primary/20"
                      onClick={handleSaveComment}
                      disabled={!comment.trim()}
                    >
                      Save Comment
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <div className="p-6 bg-white border-t border-slate-100 flex justify-between items-center shrink-0">
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="rounded-xl border border-slate-200">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-xl border border-slate-200">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
          <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold px-8">Close</Button>
        </div>
      </div>
    </ResponsiveModal>
  );
}
