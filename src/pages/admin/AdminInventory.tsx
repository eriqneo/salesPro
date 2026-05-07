import React, { useState, useMemo } from 'react';
import { 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Search, 
  Filter, 
  Settings, 
  ArrowUpRight, 
  ArrowDownRight, 
  RefreshCcw,
  ChevronDown,
  ChevronUp,
  Bell,
  MoreVertical,
  Plus,
  History,
  LayoutDashboard,
  Box,
  Truck,
  ArrowRightLeft,
  Download,
  Edit
} from 'lucide-react';
import { useSalesStore } from '@/store/useSalesStore';
import { useAdminStore } from '@/store/useAdminStore';
import { PageHeader } from '@/components/ui/PageHeader';
import { KPICard } from '@/components/ui/KPICard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { ResponsiveModal } from '@/components/admin/responsive/ResponsiveModal';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { AddStockModal } from '@/components/admin/modals/AddStockModal';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { haptics } from '@/lib/haptics';
import { AnimatePresence, motion } from 'motion/react';
import { toast } from 'sonner';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function AdminInventory() {
  usePageTitle('Inventory');
  const { products, inventory, inventoryLogs, sales, adjustInventory, updateProduct, addProduct } = useSalesStore();
  const { agents } = useAdminStore();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedAgentForStock, setSelectedAgentForStock] = useState<any>(null);

  // KPI Calculations
  const kpis = useMemo(() => {
    const totalValue = inventory.reduce((sum, item) => sum + (item.quantityCartons * item.unitCostKsh), 0);
    const totalCartons = inventory.reduce((sum, item) => sum + item.quantityCartons, 0);
    
    const belowReorder = products.filter(p => {
      const totalStock = inventory
        .filter(i => i.productSku === p.sku)
        .reduce((sum, i) => sum + i.quantityCartons, 0);
      return totalStock < p.reorderLevel;
    }).length;

    const agentsWithZero = agents.filter(agent => {
      const agentStock = inventory.filter(i => i.agentId === agent.uid);
      return agentStock.length === 0 || agentStock.every(i => i.quantityCartons === 0 && i.quantityPackets === 0);
    }).length;

    return {
      totalValue,
      totalCartons,
      belowReorder,
      agentsWithZero
    };
  }, [products, inventory, agents]);

  // Product Summary Data
  const productSummary = useMemo(() => {
    return products.map(p => {
      const productInventory = inventory.filter(i => i.productSku === p.sku);
      const totalCartons = productInventory.reduce((sum, i) => sum + i.quantityCartons, 0);
      const totalPackets = productInventory.reduce((sum, i) => sum + i.quantityPackets, 0);
      const stockValue = totalCartons * p.costPriceKsh;
      
      let status: 'healthy' | 'low' | 'critical' = 'healthy';
      if (totalCartons < 10) status = 'critical';
      else if (totalCartons < p.reorderLevel) status = 'low';

      return {
        ...p,
        totalCartons,
        totalPackets,
        stockValue,
        status
      };
    }).filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [products, inventory, searchQuery]);

  // Agent Stock Data
  const agentStock = useMemo(() => {
    return agents.map(agent => {
      const agentInventory = inventory.filter(i => i.agentId === agent.uid);
      const totalCartons = agentInventory.reduce((sum, i) => sum + i.quantityCartons, 0);
      const stockValue = agentInventory.reduce((sum, i) => sum + (i.quantityCartons * i.unitCostKsh), 0);
      const productCount = agentInventory.length;
      
      return {
        ...agent,
        productCount,
        totalCartons,
        stockValue,
        lastUpdated: agentInventory.length > 0 ? Math.max(...agentInventory.map(i => i.addedAt)) : null
      };
    });
  }, [agents, inventory]);

  // Low Stock Alerts
  const alerts = useMemo(() => {
    const list: any[] = [];
    agents.forEach(agent => {
      products.forEach(product => {
        const inv = inventory.find(i => i.agentId === agent.uid && i.productSku === product.sku);
        const qty = inv ? inv.quantityCartons : 0;
        if (qty < (product.reorderLevel / Math.max(1, agents.length))) { // Simplified logic for per-agent alert
          list.push({
            agent,
            product,
            qty,
            suggested: Math.ceil(product.reorderLevel / Math.max(1, agents.length) * 2)
          });
        }
      });
    });
    return list.sort((a, b) => a.qty - b.qty);
  }, [agents, products, inventory]);

  // Fastest Moving Products Chart
  const chartData = useMemo(() => {
    const movement: Record<string, number> = {};
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    inventoryLogs
      .filter(log => log.type === 'deduction' && log.timestamp > oneWeekAgo)
      .forEach(log => {
        const product = products.find(p => p.sku === log.productId);
        const name = product?.name || log.productId;
        movement[name] = (movement[name] || 0) + log.quantityCartons;
      });

    return Object.entries(movement)
      .map(([name, cartons]) => ({ name, cartons }))
      .sort((a, b) => b.cartons - a.cartons)
      .slice(0, 5);
  }, [inventoryLogs, products]);

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <PageHeader 
        title="Inventory Management" 
        subtitle="Monitor stock levels, track movements, and manage product catalog"
        actions={
          <div className="flex gap-3">
            <InventorySettings />
            <Button 
              className="rounded-xl bg-slate-900 border-none font-black uppercase tracking-widest text-[10px] gap-2 h-11"
              onClick={() => {
                setSelectedAgentForStock(agents[0]); // Default to first agent for quick add
                setIsStockModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4" /> Allocate Stock
            </Button>
            <Button variant="outline" className="rounded-xl border-border font-bold gap-2 h-11">
              <Download className="w-4 h-4" /> Export
            </Button>
          </div>
        }
      />

      <AddStockModal 
        isOpen={isStockModalOpen}
        onClose={() => setIsStockModalOpen(false)}
        agent={selectedAgentForStock}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          label="Total Stock Value" 
          value={`Ksh ${kpis.totalValue.toLocaleString()}`} 
          icon={<TrendingUp className="w-6 h-6 text-teal-500" />}
          className="bg-slate-900 text-white shadow-xl shadow-slate-200 border-none"
        />
        <KPICard 
          label="Total Cartons" 
          value={kpis.totalCartons} 
          icon={<Box className="w-6 h-6" />}
        />
        <KPICard 
          label="Below Reorder" 
          value={kpis.belowReorder} 
          icon={<AlertTriangle className="w-6 h-6" />}
          trend={{ value: kpis.belowReorder, isPositive: false }}
          className={kpis.belowReorder > 0 ? "border-danger/20" : ""}
        />
        <KPICard 
          label="Zero Stock Agents" 
          value={kpis.agentsWithZero} 
          icon={<Users className="w-6 h-6" />}
          className={kpis.agentsWithZero > 0 ? "border-danger/20" : ""}
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-slate-100/50 p-1 rounded-xl border border-border w-fit">
          <TabsTrigger value="overview" className="rounded-lg px-6 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wider">
            Stock Overview
          </TabsTrigger>
          <TabsTrigger value="movement" className="rounded-lg px-6 py-2 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-wider">
            Movement Log
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3 space-y-8">
              {/* Product Summary */}
              <div className="bg-white rounded-[24px] border border-border shadow-soft overflow-hidden">
                <div className="p-6 border-b border-border flex justify-between items-center">
                  <h3 className="text-lg font-black tracking-tight text-text-primary">Product Summary</h3>
                  <div className="relative w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <Input 
                      placeholder="Search products..." 
                      className="pl-10 h-10 rounded-xl bg-slate-50 border-none"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead className="w-10"></TableHead>
                      <TableHead className="font-black uppercase tracking-widest text-[10px]">Product Name</TableHead>
                      <TableHead className="font-black uppercase tracking-widest text-[10px]">SKU</TableHead>
                      <TableHead className="font-black uppercase tracking-widest text-[10px] text-center">Total Cartons</TableHead>
                      <TableHead className="font-black uppercase tracking-widest text-[10px] text-center">Total Packets</TableHead>
                      <TableHead className="font-black uppercase tracking-widest text-[10px] text-right">Stock Value</TableHead>
                      <TableHead className="font-black uppercase tracking-widest text-[10px]">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {productSummary.map((product) => (
                      <React.Fragment key={product.id}>
                        <TableRow 
                          className="cursor-pointer hover:bg-slate-50 transition-colors group"
                          onClick={() => setExpandedProduct(expandedProduct === product.id ? null : product.id)}
                        >
                          <TableCell>
                            {expandedProduct === product.id ? <ChevronUp className="w-4 h-4 text-text-secondary" /> : <ChevronDown className="w-4 h-4 text-text-secondary" />}
                          </TableCell>
                          <TableCell className="font-bold text-text-primary">{product.name}</TableCell>
                          <TableCell className="text-[10px] font-black uppercase tracking-widest text-text-secondary">{product.sku}</TableCell>
                          <TableCell className="text-center font-black text-primary">{product.totalCartons}</TableCell>
                          <TableCell className="text-center font-medium text-text-secondary">{product.totalPackets}</TableCell>
                          <TableCell className="text-right font-black">Ksh {product.stockValue.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge className={cn(
                              "rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-widest border-none",
                              product.status === 'healthy' ? 'bg-success/10 text-success' : 
                              product.status === 'low' ? 'bg-warning/10 text-warning' : 'bg-danger/10 text-danger animate-pulse'
                            )}>
                              {product.status === 'critical' && <span className="w-1.5 h-1.5 rounded-full bg-danger mr-1.5 inline-block" />}
                              {product.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                        <AnimatePresence>
                          {expandedProduct === product.id && (
                            <TableRow className="bg-slate-50/30">
                              <TableCell colSpan={7} className="p-0">
                                <motion.div 
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: 'auto', opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="p-6 border-t border-border/50">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-4">Agent Breakdown</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                      {inventory.filter(i => i.productSku === product.sku).map(inv => {
                                        const agent = agents.find(a => a.uid === inv.agentId);
                                        return (
                                          <div key={inv.id} className="bg-white p-4 rounded-xl border border-border shadow-sm flex justify-between items-center">
                                            <div>
                                              <p className="font-bold text-sm">{agent?.name || 'Unknown'}</p>
                                              <p className="text-[10px] text-text-secondary font-medium">{agent?.region}</p>
                                            </div>
                                            <div className="text-right">
                                              <p className="font-black text-primary">{inv.quantityCartons} Ctn</p>
                                              <p className="text-[10px] text-text-secondary font-bold">{inv.quantityPackets} Pkt</p>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </motion.div>
                              </TableCell>
                            </TableRow>
                          )}
                        </AnimatePresence>
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Agent Stock Table */}
              <div className="bg-white rounded-[24px] border border-border shadow-soft overflow-hidden">
                <div className="p-6 border-b border-border">
                  <h3 className="text-lg font-black tracking-tight text-text-primary">Agent Stock Levels</h3>
                </div>
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead className="font-black uppercase tracking-widest text-[10px]">Agent</TableHead>
                      <TableHead className="font-black uppercase tracking-widest text-[10px]">Region</TableHead>
                      <TableHead className="font-black uppercase tracking-widest text-[10px] text-center">Products</TableHead>
                      <TableHead className="font-black uppercase tracking-widest text-[10px] text-center">Total Cartons</TableHead>
                      <TableHead className="font-black uppercase tracking-widest text-[10px] text-right">Stock Value</TableHead>
                      <TableHead className="font-black uppercase tracking-widest text-[10px]">Last Updated</TableHead>
                      <TableHead className="text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agentStock.map((agent) => (
                      <TableRow key={agent.uid} className="hover:bg-slate-50 transition-colors">
                        <TableCell className="font-bold text-text-primary">{agent.name}</TableCell>
                        <TableCell className="text-sm font-medium text-text-secondary">{agent.region}</TableCell>
                        <TableCell className="text-center font-bold">{agent.productCount}</TableCell>
                        <TableCell className="text-center font-black text-primary">{agent.totalCartons}</TableCell>
                        <TableCell className="text-right font-black">Ksh {agent.stockValue.toLocaleString()}</TableCell>
                        <TableCell className="text-sm text-text-secondary">
                          {agent.lastUpdated ? format(agent.lastUpdated, 'MMM d, HH:mm') : 'Never'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" className="rounded-lg text-xs font-bold" onClick={() => haptics.light()}>
                              View Details
                            </Button>
                            <Button variant="ghost" size="sm" className="rounded-lg text-xs font-bold text-primary" onClick={() => toast.success(`Alert sent to ${agent.name}`)}>
                              Alert Agent
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Fastest Moving Chart */}
              <div className="bg-white p-6 rounded-[24px] border border-border shadow-soft">
                <h3 className="text-sm font-black uppercase tracking-widest text-text-secondary mb-6">Fastest Moving (Weekly)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} layout="vertical" margin={{ left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F5F9" />
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748B' }} width={80} />
                      <RechartsTooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        cursor={{ fill: '#F8FAFC' }}
                      />
                      <Bar dataKey="cartons" radius={[0, 4, 4, 0]} barSize={20}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={index === 0 ? '#0D9488' : '#cbd5e1'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Low Stock Alerts Panel */}
              <div className="bg-white rounded-[24px] border border-border shadow-soft flex flex-col h-[600px] overflow-hidden">
                <div className="p-6 border-b border-border flex justify-between items-center bg-slate-50/50">
                  <h3 className="text-sm font-black uppercase tracking-widest text-text-secondary flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    Low Stock Alerts
                  </h3>
                  <Badge className="bg-rose-500 text-white border-none rounded-full px-2.5 py-0.5 text-[10px] font-black shadow-[0_0_10px_rgba(244,63,94,0.4)] animate-pulse">
                    {alerts.length}
                  </Badge>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
                  {alerts.map((alert, i) => (
                    <motion.div 
                      key={`${alert.agent.uid}-${alert.product.sku}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-5 rounded-[20px] border border-rose-100 bg-white shadow-sm hover:shadow-md hover:border-rose-200 transition-all group relative overflow-hidden"
                    >
                      <div className="absolute top-0 left-0 w-1 h-full bg-rose-500" />
                      <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-all pointer-events-none" />
                      
                      <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className="space-y-1">
                          <p className="font-black text-sm text-slate-900 tracking-tight">{alert.product.name}</p>
                          <div className="flex items-center gap-1.5">
                            <Users className="w-3 h-3 text-slate-400" />
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{alert.agent.name}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <Badge variant="outline" className="bg-rose-50 text-rose-600 border-rose-200 text-[11px] font-black px-2.5 py-0.5 shadow-sm flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                            {alert.qty} Ctn
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 mb-4 relative z-10">
                        <RefreshCcw className="w-3.5 h-3.5 text-teal-500" />
                        <span>Suggested Restock: <span className="text-teal-600 font-black">{alert.suggested} Ctn</span></span>
                      </div>
                      
                      <div className="flex gap-3 relative z-10">
                        <Button variant="ghost" size="sm" className="flex-1 h-9 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors" onClick={() => haptics.light()}>
                          Dismiss
                        </Button>
                        <Button size="sm" className="flex-1 h-9 rounded-xl text-[10px] font-black uppercase tracking-widest bg-slate-900 text-white hover:bg-slate-800 shadow-md transition-all flex items-center justify-center gap-2 group/btn" onClick={() => toast.success(`Notification sent to ${alert.agent.name}`)}>
                          <Bell className="w-3.5 h-3.5 group-hover/btn:rotate-12 transition-transform" />
                          Notify
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                  {alerts.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                        <LayoutDashboard className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">All stock levels are healthy</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="movement">
          <StockMovementLog />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StockMovementLog() {
  const { inventoryLogs, products } = useSalesStore();
  const { agents } = useAdminStore();
  const [filterAgent, setFilterAgent] = useState('All');
  const [filterType, setFilterType] = useState('All');

  const filteredLogs = useMemo(() => {
    return inventoryLogs.filter(log => {
      const matchesAgent = filterAgent === 'All' || log.agentId === filterAgent;
      const matchesType = filterType === 'All' || log.type === filterType;
      return matchesAgent && matchesType;
    });
  }, [inventoryLogs, filterAgent, filterType]);

  const getMovementTypeStyles = (type: string) => {
    switch (type) {
      case 'addition': return { color: 'text-success', bg: 'bg-success/10', icon: <ArrowUpRight className="w-3 h-3" />, label: 'Stock In' };
      case 'deduction': return { color: 'text-primary', bg: 'bg-primary/10', icon: <ArrowDownRight className="w-3 h-3" />, label: 'Sale' };
      case 'adjustment': return { color: 'text-warning', bg: 'bg-warning/10', icon: <ArrowRightLeft className="w-3 h-3" />, label: 'Adjustment' };
      default: return { color: 'text-slate-500', bg: 'bg-slate-100', icon: <RefreshCcw className="w-3 h-3" />, label: type };
    }
  };

  return (
    <div className="bg-white rounded-[24px] border border-border shadow-soft overflow-hidden">
      <div className="p-6 border-b border-border flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex gap-4 w-full md:w-auto">
          <select 
            className="h-10 px-4 rounded-xl bg-slate-50 border-none text-xs font-bold uppercase tracking-wider outline-none focus:ring-2 focus:ring-primary/20"
            value={filterAgent}
            onChange={(e) => setFilterAgent(e.target.value)}
          >
            <option value="All">All Agents</option>
            {agents.map(a => <option key={a.uid} value={a.uid}>{a.name}</option>)}
          </select>
          <select 
            className="h-10 px-4 rounded-xl bg-slate-50 border-none text-xs font-bold uppercase tracking-wider outline-none focus:ring-2 focus:ring-primary/20"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="All">All Movements</option>
            <option value="addition">Stock In</option>
            <option value="deduction">Sale Deduction</option>
            <option value="adjustment">Manual Adjustment</option>
          </select>
        </div>
        <Button variant="outline" className="rounded-xl border-border font-bold h-10 gap-2">
          <History className="w-4 h-4" /> Clear History
        </Button>
      </div>
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow>
            <TableHead className="font-black uppercase tracking-widest text-[10px]">Date & Time</TableHead>
            <TableHead className="font-black uppercase tracking-widest text-[10px]">Agent</TableHead>
            <TableHead className="font-black uppercase tracking-widest text-[10px]">Product</TableHead>
            <TableHead className="font-black uppercase tracking-widest text-[10px]">Movement Type</TableHead>
            <TableHead className="font-black uppercase tracking-widest text-[10px] text-center">Qty Change</TableHead>
            <TableHead className="font-black uppercase tracking-widest text-[10px]">Reference / Reason</TableHead>
            <TableHead className="font-black uppercase tracking-widest text-[10px] text-right">Balance After</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredLogs.map((log) => {
            const agent = agents.find(a => a.uid === log.agentId);
            const product = products.find(p => p.sku === log.productId);
            const styles = getMovementTypeStyles(log.type);
            
            return (
              <TableRow key={log.id} className="hover:bg-slate-50 transition-colors">
                <TableCell className="text-sm font-medium">
                  {format(log.timestamp, 'MMM d, HH:mm')}
                </TableCell>
                <TableCell className="font-bold text-text-primary">{agent?.name || 'Unknown'}</TableCell>
                <TableCell>
                  <p className="font-bold text-sm">{product?.name || log.productId}</p>
                  <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest">{log.productId}</p>
                </TableCell>
                <TableCell>
                  <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest", styles.bg, styles.color)}>
                    {styles.icon}
                    {styles.label}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <p className={cn("font-black text-sm", log.type === 'addition' ? 'text-success' : log.type === 'deduction' ? 'text-danger' : 'text-warning')}>
                    {log.type === 'addition' ? '+' : log.type === 'deduction' ? '-' : ''}{log.quantityCartons} Ctn
                  </p>
                  <p className="text-[10px] text-text-secondary font-bold">{log.quantityPackets} Pkt</p>
                </TableCell>
                <TableCell className="text-xs font-medium text-text-secondary max-w-xs truncate">
                  {log.referenceId || log.reason || '-'}
                </TableCell>
                <TableCell className="text-right">
                  <p className="font-black text-text-primary">{log.balanceAfter?.cartons} Ctn</p>
                  <p className="text-[10px] text-text-secondary font-bold">{log.balanceAfter?.packets} Pkt</p>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

function InventorySettings() {
  const { products, updateProduct, addProduct } = useSalesStore();
  const [editingProduct, setEditingProduct] = useState<any | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    haptics.medium();
    if (editingProduct.id) {
      updateProduct(editingProduct);
      toast.success("Product updated successfully");
    } else {
      addProduct({ ...editingProduct, id: Math.random().toString(36).substr(2, 9) });
      toast.success("Product added to catalogue");
    }
    setEditingProduct(null);
  };

  return (
    <>
      <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="rounded-xl border-border h-11 px-6 hover:bg-slate-50 transition-colors flex items-center gap-2" onClick={() => haptics.light()}>
              <Settings className="w-4 h-4 text-slate-400" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Registry</span>
            </Button>
          </DialogTrigger>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 border-none rounded-[32px] shadow-2xl">
          <DialogHeader className="p-10 bg-slate-900 border-none relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/10 blur-[100px] rounded-full -mr-32 -mt-32" />
            <div className="relative z-10 flex justify-between items-center w-full">
              <div className="space-y-1">
                <DialogTitle className="text-3xl font-black tracking-tighter text-white">Central Registry</DialogTitle>
                <DialogDescription className="text-slate-400 font-bold tracking-widest uppercase text-[10px]">Product Catalogue & Configuration</DialogDescription>
              </div>
              <Button 
                onClick={() => setEditingProduct({ name: '', sku: '', packetsPerCarton: 24, basePriceKsh: 0, costPriceKsh: 0, reorderLevel: 50, category: 'Tea', status: 'active' })}
                className="h-12 px-6 rounded-2xl bg-teal-500 hover:bg-teal-400 text-white font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-teal-500/20 group transition-all active:scale-95"
              >
                <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform" />
                Initialize Asset
              </Button>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto p-10 space-y-10 bg-white">
            <div className="space-y-6">
              <div className="flex items-center gap-3 px-1">
                <div className="h-1 w-8 bg-teal-500 rounded-full" />
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Deployed SKUs</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {products.map(p => (
                  <div key={p.id} className="bg-slate-50 p-6 rounded-[28px] border border-slate-100 shadow-sm flex justify-between items-center group hover:bg-white hover:border-teal-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                    <div className="space-y-1">
                      <p className="font-black text-slate-900 text-lg tracking-tight">{p.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{p.sku}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="text-[10px] text-teal-600 font-black uppercase tracking-widest">{p.packetsPerCarton} Pkt/Ctn</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs font-black text-slate-900">Ksh {p.basePriceKsh.toLocaleString()}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Min Reserve: {p.reorderLevel}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10 rounded-xl bg-white border border-slate-100 opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:border-teal-200 text-teal-600" 
                        onClick={() => setEditingProduct(p)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ResponsiveModal
        isOpen={!!editingProduct}
        onClose={() => setEditingProduct(null)}
        title={editingProduct?.id ? "Edit Product" : "New Intelligence Asset"}
      >
        {editingProduct && (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Product Designation</label>
                  <Input 
                    required 
                    value={editingProduct.name} 
                    onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} 
                    className="h-12 rounded-xl bg-slate-50 border-none font-bold"
                    placeholder="e.g. Premium Tea"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">SKU Identifier</label>
                  <Input 
                    required 
                    value={editingProduct.sku} 
                    onChange={e => setEditingProduct({...editingProduct, sku: e.target.value})} 
                    className="h-12 rounded-xl bg-slate-50 border-none font-black"
                    placeholder="SKU-XXXX"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Units/Ctn</label>
                  <Input 
                    type="number" 
                    required 
                    value={editingProduct.packetsPerCarton} 
                    onChange={e => setEditingProduct({...editingProduct, packetsPerCarton: parseInt(e.target.value)})} 
                    className="h-12 rounded-xl bg-slate-50 border-none font-bold text-center"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Cost (Ksh)</label>
                  <Input 
                    type="number" 
                    required 
                    value={editingProduct.costPriceKsh} 
                    onChange={e => setEditingProduct({...editingProduct, costPriceKsh: parseInt(e.target.value)})} 
                    className="h-12 rounded-xl bg-slate-50 border-none font-black text-emerald-600"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Price (Ksh)</label>
                  <Input 
                    type="number" 
                    required 
                    value={editingProduct.basePriceKsh} 
                    onChange={e => setEditingProduct({...editingProduct, basePriceKsh: parseInt(e.target.value)})} 
                    className="h-12 rounded-xl bg-slate-50 border-none font-black text-rose-600"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Critical Reorder Threshold (Cartons)</label>
                <div className="relative">
                  <Input 
                    type="number" 
                    required 
                    value={editingProduct.reorderLevel} 
                    onChange={e => setEditingProduct({...editingProduct, reorderLevel: parseInt(e.target.value)})} 
                    className="h-12 rounded-xl bg-slate-50 border-none font-black"
                  />
                  <AlertTriangle className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-3">
              <Button type="button" variant="ghost" className="flex-1 h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px]" onClick={() => setEditingProduct(null)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-[2] h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-slate-200">
                {editingProduct.id ? 'Push Updates' : 'Initialize Asset'}
              </Button>
            </div>
          </form>
        )}
      </ResponsiveModal>
    </>
  );
}
