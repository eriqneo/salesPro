// Sales Reports Page
import React, { useState, useMemo } from 'react';
import { 
  TrendingUp,
  Package,
  ShoppingBag,
  Building2,
  RefreshCcw,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  ChevronRight,
  Download,
  FileSpreadsheet,
  Printer
} from 'lucide-react';
import { useSalesStore } from '@/store/useSalesStore';
import { useAdminStore } from '@/store/useAdminStore';
import { AdminPageHeader } from '@/components/admin/responsive/AdminPageHeader';
import { DataTable, ColumnConfig } from '@/components/admin/responsive/DataTable';
import { MobileFilterSheet, FilterConfig } from '@/components/admin/responsive/MobileFilterSheet';
import { ResponsiveModal } from '@/components/admin/responsive/ResponsiveModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  LineChart, Line, PieChart, Pie
} from 'recharts';
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import { cn } from '@/lib/utils';
import { haptics } from '@/lib/haptics';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { toast } from 'sonner';

const COLORS = ['#0F172A', '#0D9488', '#14B8A6', '#334155', '#64748B'];

export default function SalesReportsPage() {
  const { isMobile, isTablet } = useBreakpoint();
  const { sales, products, shops, routes } = useSalesStore();
  const { agents } = useAdminStore();

  // Filters State
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [agentFilter, setAgentFilter] = useState('All');
  const [regionFilter, setRegionFilter] = useState('All');
  const [routeFilter, setRouteFilter] = useState('All');
  const [productSearch, setProductSearch] = useState('');
  const [selectedSale, setSelectedSale] = useState<any | null>(null);

  // Filtered Data
  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const saleDate = new Date(sale.timestamp);
      const inDateRange = isWithinInterval(saleDate, { 
        start: startOfDay(dateRange.from), 
        end: endOfDay(dateRange.to) 
      });
      
      const agent = agents.find(a => a.uid === sale.agentId);
      const matchesAgent = agentFilter === 'All' || sale.agentId === agentFilter;
      const matchesRegion = regionFilter === 'All' || (agent && agent.region === regionFilter);
      const matchesRoute = routeFilter === 'All' || sale.routeName === routeFilter;
      const matchesProduct = productSearch === '' || sale.items.some(item => 
        item.productId.toLowerCase().includes(productSearch.toLowerCase())
      );

      return inDateRange && matchesAgent && matchesRegion && matchesRoute && matchesProduct;
    });
  }, [sales, dateRange, agentFilter, regionFilter, routeFilter, productSearch, agents]);

  // KPIs
  const kpis = useMemo(() => {
    const totalSales = filteredSales.reduce((sum, s) => sum + s.totalKsh, 0);
    const totalCartons = filteredSales.reduce((sum, s) => sum + s.items.reduce((iSum, i) => iSum + i.quantityCartons, 0), 0);
    const transactions = filteredSales.length;
    const uniqueShops = new Set(filteredSales.map(s => s.shopId)).size;
    return { totalSales, totalCartons, transactions, uniqueShops };
  }, [filteredSales]);

  // Chart Data
  const salesByAgentData = useMemo(() => {
    const data: Record<string, number> = {};
    filteredSales.forEach(s => {
      const agent = agents.find(a => a.uid === s.agentId);
      const name = agent?.name || 'Unknown';
      data[name] = (data[name] || 0) + s.totalKsh;
    });
    return Object.entries(data).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value);
  }, [filteredSales, agents]);

  const filterConfigs: FilterConfig[] = [
    {
      id: 'search',
      label: 'Search SKU',
      type: 'search',
      placeholder: 'Enter product SKU...',
      value: productSearch,
      onChange: setProductSearch
    },
    {
      id: 'agent',
      label: 'Agent',
      type: 'select',
      options: [{ label: 'All Agents', value: 'All' }, ...agents.map(a => ({ label: a.name, value: a.uid }))],
      value: agentFilter,
      onChange: setAgentFilter
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
      id: 'route',
      label: 'Route',
      type: 'select',
      options: [{ label: 'All Routes', value: 'All' }, ...routes.map(r => ({ label: r.name, value: r.name }))],
      value: routeFilter,
      onChange: setRouteFilter
    }
  ];

  const columns: ColumnConfig<any>[] = [
    {
      id: 'date',
      header: 'Date & Time',
      accessor: (s) => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-900">{format(s.timestamp, 'MMM d, yyyy')}</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{format(s.timestamp, 'h:mm a')}</span>
        </div>
      ),
      showOnTablet: true
    },
    {
      id: 'agent',
      header: 'Agent',
      accessor: (s) => <span className="font-bold">{agents.find(a => a.uid === s.agentId)?.name}</span>,
      showOnTablet: true
    },
    {
      id: 'shop',
      header: 'Shop',
      accessor: (s) => <span className="font-medium text-slate-600 truncate max-w-[140px] block">{shops.find(sh => sh.id === s.shopId)?.name}</span>,
      showOnTablet: false
    },
    {
      id: 'total',
      header: 'Total (Ksh)',
      accessor: (s) => <span className="font-black text-primary">Ksh {s.totalKsh.toLocaleString()}</span>,
      showOnTablet: true
    },
    {
      id: 'status',
      header: 'Status',
      accessor: (s) => (
        <div className="flex items-center gap-1.5">
          {s.syncStatus === 'synced' ? <CheckCircle2 className="w-4 h-4 text-teal-500" /> : <Clock className="w-4 h-4 text-amber-500" />}
          <span className={cn("text-[10px] font-black uppercase tracking-widest", s.syncStatus === 'synced' ? "text-teal-600" : "text-amber-600")}>
            {s.syncStatus}
          </span>
        </div>
      ),
      showOnTablet: false
    }
  ];

  const renderMobileCard = (s: any) => (
    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-bold text-slate-900 leading-tight">{agents.find(a => a.uid === s.agentId)?.name}</h4>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{format(s.timestamp, 'MMM d, h:mm a')}</p>
        </div>
        <Badge className="bg-slate-100 text-slate-600 border-none text-[9px] font-black uppercase tracking-widest">
          {s.routeName}
        </Badge>
      </div>
      <div className="py-2 border-y border-slate-50">
        <p className="text-xs font-medium text-slate-500">Shop: <span className="text-slate-900 font-bold">{shops.find(sh => sh.id === s.shopId)?.name}</span></p>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex flex-col">
          <span className="text-xl font-black text-primary">Ksh {s.totalKsh.toLocaleString()}</span>
          <span className="text-[10px] font-bold text-slate-400">{s.items.length} Products</span>
        </div>
        <Button variant="ghost" size="sm" className="text-xs font-black uppercase text-primary tracking-widest h-8 px-3 rounded-lg flex items-center gap-1">
          Details <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-full bg-[#F8FAFC]">
      <AdminPageHeader 
        title="Sales Reports" 
        subtitle="Analyze transactions and field sales performance"
        actions={
          <div className="flex gap-2">
            {!isMobile && (
              <>
                <Button variant="outline" size="sm" className="rounded-xl border-slate-200" onClick={() => toast.success('CSV Exported')}>
                  <Download className="w-4 h-4 mr-2" /> CSV
                </Button>
                <Button variant="outline" size="sm" className="rounded-xl border-slate-200" onClick={() => toast.success('Excel Exported')}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" /> Excel
                </Button>
              </>
            )}
            <Button variant="outline" size="sm" className="rounded-xl border-slate-200" onClick={() => window.print()}>
              <Printer className="w-4 h-4 mr-2" /> Print
            </Button>
          </div>
        }
      />

      <div className={cn(
        "flex-1 space-y-6 max-w-7xl mx-auto w-full",
        isMobile ? "px-4 py-4" : isTablet ? "px-6 py-5" : "px-8 py-6"
      )}>
        {/* Filter Bar */}
        <MobileFilterSheet 
          filters={filterConfigs} 
          onApply={() => toast.success('Filters applied')}
          onReset={() => {
            setAgentFilter('All');
            setRegionFilter('All');
            setRouteFilter('All');
            setProductSearch('');
          }}
        />

        {/* KPIs */}
        <div className={cn(
          "grid gap-4",
          isMobile || isTablet ? "grid-cols-2" : "grid-cols-4"
        )}>
          <KPISmallCard label="Total Revenue" value={`Ksh ${kpis.totalSales.toLocaleString()}`} icon={<TrendingUp className="w-5 h-5" />} color="teal" />
          <KPISmallCard label="Cartons Sold" value={kpis.totalCartons.toString()} icon={<Package className="w-5 h-5" />} color="blue" />
          <KPISmallCard label="Transactions" value={kpis.transactions.toString()} icon={<RefreshCcw className="w-5 h-5" />} color="amber" />
          <KPISmallCard label="Unique Shops" value={kpis.uniqueShops.toString()} icon={<Building2 className="w-5 h-5" />} color="purple" />
        </div>

        {/* Main Content */}
        {!isMobile && (
          <Card className="border-none shadow-soft rounded-[32px] overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg font-black tracking-tight">Sales Data Explorer</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable 
                columns={columns}
                data={filteredSales}
                mobileCardRenderer={renderMobileCard}
                onRowClick={setSelectedSale}
              />
            </CardContent>
          </Card>
        )}

        {isMobile && (
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Transactions</h3>
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{filteredSales.length} Total</p>
            </div>
            <DataTable 
              columns={columns}
              data={filteredSales}
              mobileCardRenderer={renderMobileCard}
              onRowClick={setSelectedSale}
            />
          </div>
        )}
      </div>

      {/* Sale Detail Modal */}
      <ResponsiveModal
        isOpen={!!selectedSale}
        onClose={() => setSelectedSale(null)}
        title="Sale Transaction Details"
      >
        {selectedSale && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-2xl">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Total Value</p>
                <p className="text-2xl font-black text-primary">Ksh {selectedSale.totalKsh.toLocaleString()}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Sync Status</p>
                <Badge className={cn(
                  "border-none rounded-full px-3 text-[10px] font-black uppercase tracking-widest",
                  selectedSale.syncStatus === 'synced' ? "bg-teal-100 text-teal-600" : "bg-amber-100 text-amber-600"
                )}>
                  {selectedSale.syncStatus}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <h5 className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Order Summary</h5>
              <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Product</th>
                      <th className="px-4 py-3 text-center">Qty</th>
                      <th className="px-4 py-3 text-right">Price</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {selectedSale.items.map((item: any, i: number) => (
                      <tr key={i} className="text-sm">
                        <td className="px-4 py-3 font-bold">{products.find(p => p.sku === item.productId)?.name || item.productId}</td>
                        <td className="px-4 py-3 text-center font-black">{item.quantityCartons} Ctn</td>
                        <td className="px-4 py-3 text-right font-black text-teal-600">Ksh {item.priceKsh.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-primary">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400">Shop Name</p>
                <p className="font-black text-slate-900">{shops.find(sh => sh.id === selectedSale.shopId)?.name}</p>
              </div>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-2xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-primary font-black">
                {agents.find(a => a.uid === selectedSale.agentId)?.name[0]}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-slate-400">Handled By</p>
                <p className="font-black text-slate-900">{agents.find(a => a.uid === selectedSale.agentId)?.name}</p>
              </div>
            </div>
          </div>
        )}
      </ResponsiveModal>
    </div>
  );
}

function KPISmallCard({ label, value, icon, color }: any) {
  const colorMap: any = {
    teal: "bg-teal-50 text-teal-500",
    blue: "bg-blue-50 text-blue-500",
    amber: "bg-amber-50 text-amber-500",
    purple: "bg-purple-50 text-purple-500",
  };
  return (
    <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
      <CardContent className="p-4 flex flex-col gap-3">
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", colorMap[color])}>
          {icon}
        </div>
        <div>
          <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{label}</p>
          <p className="text-xl font-black text-slate-900 tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
