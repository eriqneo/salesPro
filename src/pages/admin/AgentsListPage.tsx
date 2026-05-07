// Agents List Page
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  UserCheck, 
  Trophy, 
  Target, 
  Plus, 
  ChevronRight,
  MapPin,
  Building2,
  CheckCircle2,
  XCircle,
  MoreVertical,
  Eye,
  Edit,
  UserMinus
} from 'lucide-react';
import { useAdminStore } from '@/store/useAdminStore';
import { useSalesStore } from '@/store/useSalesStore';
import { AdminPageHeader } from '@/components/admin/responsive/AdminPageHeader';
import { DataTable, ColumnConfig } from '@/components/admin/responsive/DataTable';
import { MobileFilterSheet, FilterConfig } from '@/components/admin/responsive/MobileFilterSheet';
import { KPICard } from '@/components/ui/KPICard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { haptics } from '@/lib/haptics';
import { cn } from '@/lib/utils';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { toast } from 'sonner';
import { AddStockModal } from '@/components/admin/modals/AddStockModal';

export default function AgentsListPage() {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useBreakpoint();
  const { agents, deactivateAgent } = useAdminStore();
  const { sales, dailyReports } = useSalesStore();
  
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);

  const handleAddStock = (agent: any) => {
    haptics.light();
    setSelectedAgent(agent);
    setIsStockModalOpen(true);
  };

  // Stats calculation
  const stats = useMemo(() => {
    const activeToday = agents.filter(a => a.status === 'active').length;
    
    const agentSales: Record<string, number> = {};
    sales.forEach(s => {
      agentSales[s.agentId] = (agentSales[s.agentId] || 0) + s.totalKsh;
    });
    
    let topAgent = { name: 'N/A', sales: 0 };
    Object.entries(agentSales).forEach(([id, total]) => {
      if (total > topAgent.sales) {
        const agent = agents.find(a => a.uid === id);
        if (agent) topAgent = { name: agent.name, sales: total };
      }
    });

    const avgAchievement = dailyReports.length > 0
      ? dailyReports.reduce((sum, r) => sum + r.percentageAchieved, 0) / dailyReports.length
      : 0;

    return {
      total: agents.length,
      activeToday,
      topPerformer: topAgent,
      avgAchievement
    };
  }, [agents, sales, dailyReports]);

  const filteredAgents = useMemo(() => {
    return agents.filter(agent => {
      const matchesSearch = agent.name.toLowerCase().includes(search.toLowerCase()) ||
                          agent.region.toLowerCase().includes(search.toLowerCase()) ||
                          agent.stockPoint.toLowerCase().includes(search.toLowerCase());
      const matchesRegion = regionFilter === 'All' || agent.region === regionFilter;
      const matchesStatus = statusFilter === 'All' || agent.status === statusFilter.toLowerCase();
      return matchesSearch && matchesRegion && matchesStatus;
    });
  }, [agents, search, regionFilter, statusFilter]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleRowClick = (agent: any) => {
    haptics.light();
    navigate(`/admin/agents/${agent.uid}`);
  };

  const filterConfigs: FilterConfig[] = [
    {
      id: 'search',
      label: 'Search Agents',
      type: 'search',
      placeholder: 'Name, region or stock point...',
      value: search,
      onChange: setSearch
    },
    {
      id: 'region',
      label: 'Region',
      type: 'select',
      options: [{ label: 'All Regions', value: 'All' }, ...Array.from(new Set(agents.map(a => a.region))).map(r => ({ label: r, value: r }))],
      value: regionFilter,
      onChange: setRegionFilter
    },
    {
      id: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'All Status', value: 'All' },
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' }
      ],
      value: statusFilter,
      onChange: setStatusFilter
    }
  ];

  const columns: ColumnConfig<any>[] = [
    {
      id: 'agent',
      header: 'Agent',
      accessor: (a) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 bg-teal-500 border-none shadow-sm">
            <AvatarFallback className="text-white font-black text-[10px] bg-transparent">
              {getInitials(a.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900">{a.name}</span>
            <span className="text-[10px] font-medium text-slate-400">{a.email}</span>
          </div>
        </div>
      ),
      showOnTablet: true
    },
    {
      id: 'region',
      header: 'Region',
      accessor: (a) => (
        <div className="flex items-center gap-1.5 text-slate-600">
          <MapPin className="w-3.5 h-3.5" />
          <span className="text-sm font-medium">{a.region}</span>
        </div>
      ),
      showOnTablet: true
    },
    {
      id: 'stockPoint',
      header: 'Stock Point',
      accessor: (a) => (
        <div className="flex items-center gap-1.5 text-slate-600">
          <Building2 className="w-3.5 h-3.5" />
          <span className="text-sm font-medium">{a.stockPoint}</span>
        </div>
      ),
      showOnTablet: false
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (a) => (
        <Badge className={cn(
          "rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-widest border-none",
          a.status === 'active' ? 'bg-teal-50 text-teal-600' : 'bg-slate-50 text-slate-500'
        )}>
          {a.status}
        </Badge>
      ),
      showOnTablet: true
    },
    {
      id: 'actions',
      header: '',
      accessor: (a) => (
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-xl border-slate-100">
              <DropdownMenuItem onClick={() => navigate(`/admin/agents/${a.uid}`)} className="rounded-lg gap-2 font-medium">
                <Eye className="w-4 h-4" /> View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddStock(a)} className="rounded-lg gap-2 font-medium text-teal-600 focus:text-teal-600 focus:bg-teal-50">
                <Plus className="w-4 h-4" /> Add Stock
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg gap-2 font-medium">
                <Edit className="w-4 h-4" /> Edit Agent
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => deactivateAgent(a.uid)}
                className="rounded-lg gap-2 font-medium text-rose-500 focus:text-rose-500"
              >
                <UserMinus className="w-4 h-4" /> Deactivate
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      showOnTablet: true
    }
  ];

  const renderMobileCard = (a: any) => (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Avatar className="h-12 w-12 bg-teal-500 border-none shadow-md">
          <AvatarFallback className="text-white font-black text-sm bg-transparent">
            {getInitials(a.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-bold text-slate-900">{a.name}</h4>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{a.region}</p>
            </div>
            <Badge className={cn(
              "rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border-none",
              a.status === 'active' ? 'bg-teal-50 text-teal-600' : 'bg-slate-50 text-slate-400'
            )}>
              {a.status}
            </Badge>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-50 text-[11px] font-bold text-slate-500">
        <div className="flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 opacity-50" />
          <span className="truncate">{a.stockPoint}</span>
        </div>
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] font-black uppercase tracking-widest text-primary gap-1" onClick={() => navigate(`/admin/agents/${a.uid}`)}>
            View <ChevronRight className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-full bg-[#F8FAFC]">
      <AdminPageHeader 
        title="Field Agents" 
        subtitle="Manage territory assignments and monitor activity"
        actions={
          <Button size="sm" className="rounded-xl bg-teal-600 hover:bg-teal-700 font-black uppercase tracking-widest text-[10px] px-4 shadow-lg shadow-teal-100" onClick={() => haptics.light()}>
            <Plus className="w-4 h-4 mr-1.5" /> Add Agent
          </Button>
        }
      />

      <div className={cn(
        "flex-1 space-y-6 max-w-7xl mx-auto w-full",
        isMobile ? "px-4 py-4" : isTablet ? "px-6 py-5" : "px-8 py-6"
      )}>
        {/* Filter Bar */}
        <MobileFilterSheet 
          filters={filterConfigs} 
          onApply={() => toast.success('Agent list updated')}
          onReset={() => {
            setSearch('');
            setRegionFilter('All');
            setStatusFilter('All');
          }}
        />

        {/* Stats Grid */}
        <div className={cn(
          "grid gap-4",
          isMobile || isTablet ? "grid-cols-2" : "grid-cols-4"
        )}>
          <KPICard label="Total Agents" value={stats.total.toString()} icon={<Users className="w-6 h-6" />} />
          <KPICard label="Active Today" value={stats.activeToday.toString()} icon={<UserCheck className="w-6 h-6" />} />
          <KPICard label="Top Performer" value={stats.topPerformer.name} icon={<Trophy className="w-6 h-6" />} />
          <KPICard label="Target Met" value={`${Math.round(stats.avgAchievement)}%`} icon={<Target className="w-6 h-6" />} />
        </div>

        {/* List View */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-black text-slate-900 tracking-tight">Agent Directory</h3>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{filteredAgents.length} Agents</p>
          </div>
          <DataTable 
            columns={columns}
            data={filteredAgents}
            mobileCardRenderer={renderMobileCard}
            onRowClick={handleRowClick}
          />
        </div>
        <AddStockModal 
          isOpen={isStockModalOpen}
          onClose={() => setIsStockModalOpen(false)}
          agent={selectedAgent}
        />
      </div>
    </div>
  );
}
