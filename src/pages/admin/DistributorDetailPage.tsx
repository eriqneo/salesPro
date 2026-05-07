import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSalesStore } from '@/store/useSalesStore';
import { useAdminStore } from '@/store/useAdminStore';
import { 
  Truck, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  User, 
  TrendingUp, 
  Package, 
  Users, 
  Wallet,
  ArrowLeft,
  Search,
  Filter,
  Download,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { format } from 'date-fns';
import { haptics } from '@/lib/haptics';
import { usePageTitle } from '@/hooks/usePageTitle';
import { cn } from '@/lib/utils';

export default function DistributorDetailPage() {
  usePageTitle('Distributor Details');
  const { id } = useParams();
  const navigate = useNavigate();
  const { distributors, inventoryLogs, inventory, products } = useSalesStore();
  const { agents } = useAdminStore();

  const distributor = useMemo(() => 
    distributors.find(d => d.id === id), 
    [distributors, id]
  );

  const distributorLogs = useMemo(() => 
    inventoryLogs.filter(log => log.referenceId === id && log.type === 'addition'),
    [inventoryLogs, id]
  );

  const stats = useMemo(() => {
    const totalPurchases = distributorLogs.reduce((sum, log) => {
      const invItem = inventory.find(i => i.distributorId === id && i.productSku === log.productId);
      const cost = invItem?.unitCostKsh || 120;
      return sum + (log.quantityCartons * cost);
    }, 0);

    const totalCartons = distributorLogs.reduce((sum, log) => sum + log.quantityCartons, 0);
    const uniqueAgents = new Set(distributorLogs.map(log => log.agentId)).size;
    const avgPurchase = distributorLogs.length > 0 ? totalPurchases / distributorLogs.length : 0;

    return { totalPurchases, totalCartons, uniqueAgents, avgPurchase };
  }, [distributorLogs, inventory, id]);

  const monthlyData = useMemo(() => {
    const data: Record<string, number> = {};
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = format(d, 'MMM');
      data[key] = 0;
    }

    distributorLogs.forEach(log => {
      const logDate = new Date(log.timestamp);
      const key = format(logDate, 'MMM');
      if (data[key] !== undefined) {
        const invItem = inventory.find(i => i.distributorId === id && i.productSku === log.productId);
        const cost = invItem?.unitCostKsh || 120;
        data[key] += (log.quantityCartons * cost);
      }
    });

    return Object.entries(data).map(([name, value]) => ({ name, value }));
  }, [distributorLogs, inventory, id]);

  if (!distributor) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <Truck className="w-16 h-16 opacity-10 mb-4" />
        <h2 className="text-xl font-bold">Distributor not found</h2>
        <Button onClick={() => navigate('/admin/distributors')} variant="link">Back to list</Button>
      </div>
    );
  }

  const initials = distributor.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-brand p-8 text-white shrink-0 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-dark/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="flex items-center gap-6">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => { haptics.light(); navigate('/admin/distributors'); }}
              className="text-white hover:bg-white/10 rounded-xl"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <div className="w-20 h-20 rounded-[28px] bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-black shadow-2xl border border-white/30">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-black tracking-tight">{distributor.name}</h1>
                <Badge className="bg-white/20 text-white border-none text-[10px] font-black uppercase tracking-widest backdrop-blur-sm">
                  {distributor.region}
                </Badge>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-white/80">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {distributor.location}</span>
                <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> {distributor.contactPerson}</span>
                <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {distributor.phone}</span>
                <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {distributor.email}</span>
                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Since {format(distributor.createdAt, 'MMM yyyy')}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button className="bg-white text-primary hover:bg-slate-100 border-none rounded-xl font-black uppercase tracking-widest text-xs px-6 h-11 shadow-lg">
              Edit Profile
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-white border-b border-border px-8 shrink-0">
            <TabsList className="bg-transparent h-14 gap-8">
              <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-14 px-0 font-bold text-sm">Overview</TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-14 px-0 font-bold text-sm">Purchase History</TabsTrigger>
              <TabsTrigger value="agents" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-14 px-0 font-bold text-sm">Agents</TabsTrigger>
              <TabsTrigger value="products" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-primary data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-14 px-0 font-bold text-sm">Products</TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-8">
            <TabsContent value="overview" className="m-0 space-y-8">
              {/* Overview KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICardSmall title="Total Purchases" value={`Ksh ${stats.totalPurchases.toLocaleString()}`} icon={<Wallet className="w-4 h-4" />} color="text-primary" />
                <KPICardSmall title="Total Cartons" value={stats.totalCartons.toLocaleString()} icon={<Package className="w-4 h-4" />} color="text-teal-500" />
                <KPICardSmall title="Active Agents" value={stats.uniqueAgents.toString()} icon={<Users className="w-4 h-4" />} color="text-slate-600" />
                <KPICardSmall title="Avg Purchase" value={`Ksh ${Math.round(stats.avgPurchase).toLocaleString()}`} icon={<TrendingUp className="w-4 h-4" />} color="text-amber-500" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 border-border shadow-soft rounded-[24px] overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-lg font-black tracking-tight">Monthly Purchase Volume</CardTitle>
                    <CardDescription>Last 6 months revenue trend</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                          cursor={{ fill: '#f8fafc' }}
                        />
                        <Bar dataKey="value" fill="#0D9488" radius={[6, 6, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card className="border-border shadow-soft rounded-[24px] overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-lg font-black tracking-tight">Top Products</CardTitle>
                    <CardDescription>Most frequently supplied</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {products.slice(0, 4).map((p, i) => (
                      <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-xs font-bold border border-slate-200">
                            {i + 1}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-text-primary">{p.name}</p>
                            <p className="text-[10px] text-text-secondary font-medium">{p.sku}</p>
                          </div>
                        </div>
                        <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold">
                          {Math.floor(Math.random() * 50) + 20} Orders
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="history" className="m-0 space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex gap-4 flex-1 max-w-2xl">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                    <Input placeholder="Search invoice or agent..." className="pl-10 h-11 rounded-xl bg-white border-border" />
                  </div>
                  <Button variant="outline" className="rounded-xl border-border h-11 gap-2 font-bold">
                    <Filter className="w-4 h-4" /> Filter
                  </Button>
                </div>
                <Button variant="outline" className="rounded-xl border-border h-11 gap-2 font-bold">
                  <Download className="w-4 h-4" /> Export CSV
                </Button>
              </div>

              <Card className="border-border shadow-soft rounded-[24px] overflow-hidden bg-white">
                <Table>
                  <TableHeader className="bg-slate-50/50">
                    <TableRow>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest">Date</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest">Agent</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest">Products</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest">Cartons</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest">Total Cost</TableHead>
                      <TableHead className="text-[10px] font-black uppercase tracking-widest">Ref/Invoice</TableHead>
                      <TableHead className="text-right"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {distributorLogs.map((log) => {
                      const agent = agents.find(a => a.uid === log.agentId);
                      const product = products.find(p => p.sku === log.productId);
                      const cost = inventory.find(i => i.distributorId === id && i.productSku === log.productId)?.unitCostKsh || 120;
                      
                      return (
                        <TableRow key={log.id} className="hover:bg-slate-50/50">
                          <TableCell className="font-medium text-text-secondary">{format(log.timestamp, 'MMM d, yyyy')}</TableCell>
                          <TableCell className="font-bold text-text-primary">{agent?.name || 'Unknown Agent'}</TableCell>
                          <TableCell className="text-text-secondary font-medium">{product?.name || log.productId}</TableCell>
                          <TableCell className="font-bold">{log.quantityCartons}</TableCell>
                          <TableCell className="font-black text-primary">Ksh {(log.quantityCartons * cost).toLocaleString()}</TableCell>
                          <TableCell className="text-text-secondary font-mono text-xs">INV-{log.id.slice(0, 6).toUpperCase()}</TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="icon" className="rounded-lg">
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>

            <TabsContent value="agents" className="m-0 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {agents.slice(0, 3).map(agent => (
                  <Card key={agent.uid} className="border-border shadow-soft rounded-[24px] overflow-hidden hover:shadow-md transition-all">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-primary font-black text-lg border border-slate-200">
                          {agent.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-black text-text-primary tracking-tight">{agent.name}</h4>
                          <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">{agent.region}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">Purchases</p>
                          <p className="text-sm font-bold text-text-primary">14 Orders</p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-1">Total Spent</p>
                          <p className="text-sm font-bold text-primary">Ksh 145K</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-bold text-text-secondary">
                        <span>Last Purchase: Oct 10, 2023</span>
                        <Button variant="link" className="h-auto p-0 text-[10px] font-black uppercase tracking-widest text-primary">
                          View History
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="products" className="m-0 space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <h4 className="text-sm font-black text-text-primary uppercase tracking-widest">Supplied Products</h4>
                    <Button variant="ghost" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest text-primary">
                      Link New Product
                    </Button>
                  </div>
                  <div className="space-y-3">
                    {distributor.linkedProducts?.map(pid => {
                      const p = products.find(prod => prod.id === pid);
                      if (!p) return null;
                      return (
                        <div key={p.id} className="p-4 bg-white rounded-2xl border border-border shadow-sm flex justify-between items-center group hover:border-primary transition-colors cursor-pointer">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-primary font-bold border border-slate-100">
                              <Package className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-text-primary">{p.name}</p>
                              <p className="text-[10px] text-text-secondary font-medium">{p.sku}</p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary" />
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Card className="lg:col-span-2 border-border shadow-soft rounded-[24px] overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-lg font-black tracking-tight">Price Trend Analysis</CardTitle>
                    <CardDescription>Average purchase price per product over time</CardDescription>
                  </CardHeader>
                  <CardContent className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={[
                        { name: 'Jan', tea: 120, coffee: 380 },
                        { name: 'Feb', tea: 122, coffee: 385 },
                        { name: 'Mar', tea: 120, coffee: 380 },
                        { name: 'Apr', tea: 125, coffee: 390 },
                        { name: 'May', tea: 128, coffee: 400 },
                        { name: 'Jun', tea: 125, coffee: 395 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        />
                        <Line type="monotone" dataKey="tea" stroke="#0D9488" strokeWidth={3} dot={{ r: 4, fill: '#0D9488' }} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey="coffee" stroke="#334155" strokeWidth={3} dot={{ r: 4, fill: '#334155' }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-6 mt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-teal-600" />
                        <span className="text-xs font-bold text-text-secondary">Premium Tea 50g</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-slate-700" />
                        <span className="text-xs font-bold text-text-secondary">Classic Coffee 100g</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

function KPICardSmall({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-border shadow-soft flex items-center gap-4">
      <div className={cn("w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center", color)}>
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-0.5">{title}</p>
        <p className="text-lg font-black text-text-primary tracking-tight">{value}</p>
      </div>
    </div>
  );
}
