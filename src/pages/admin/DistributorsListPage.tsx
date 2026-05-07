import React, { useState, useMemo } from 'react';
import { useSalesStore } from '@/store/useSalesStore';
import { 
  Truck, 
  Search, 
  Plus, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Users, 
  MoreVertical,
  Edit2,
  Eye,
  Filter,
  TrendingUp,
  Package,
  Wallet
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { PageHeader } from '@/components/ui/PageHeader';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { haptics } from '@/lib/haptics';
import { usePageTitle } from '@/hooks/usePageTitle';
import { cn } from '@/lib/utils';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Distributor } from '@/types';

const distributorSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  region: z.string().min(1, 'Please select a region'),
  location: z.string().min(2, 'Location is required'),
  contactPerson: z.string().min(2, 'Contact person is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  email: z.string().email('Invalid email address'),
  notes: z.string().optional(),
});

type DistributorFormValues = z.infer<typeof distributorSchema>;

export default function DistributorsListPage() {
  usePageTitle('Distributors');
  const navigate = useNavigate();
  const { distributors, inventoryLogs, inventory, addDistributor } = useSalesStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [regionFilter, setRegionFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [selectedDistributorId, setSelectedDistributorId] = useState<string | null>(null);

  const regions = useMemo(() => {
    const r = new Set(distributors.map(d => d.region));
    return ['All', ...Array.from(r)];
  }, [distributors]);

  // Calculate KPIs
  const kpis = useMemo(() => {
    const totalDistributors = distributors.length;
    
    // Total stock purchased (all time)
    const totalPurchased = inventoryLogs
      .filter(log => log.type === 'addition' && log.referenceId?.startsWith('d'))
      .reduce((sum, log) => {
        // We need unit cost from inventory or products, but logs don't have it directly.
        // For mock purposes, let's assume an average cost or look up from inventory.
        const invItem = inventory.find(i => i.distributorId === log.referenceId && i.productSku === log.productId);
        const cost = invItem?.unitCostKsh || 120;
        return sum + (log.quantityCartons * cost);
      }, 0);

    // This month purchases
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const monthPurchased = inventoryLogs
      .filter(log => log.type === 'addition' && log.timestamp >= startOfMonth.getTime())
      .reduce((sum, log) => {
        const invItem = inventory.find(i => i.distributorId === log.referenceId && i.productSku === log.productId);
        const cost = invItem?.unitCostKsh || 120;
        return sum + (log.quantityCartons * cost);
      }, 0);

    // Most used distributor
    const usageMap: Record<string, number> = {};
    inventoryLogs.forEach(log => {
      if (log.referenceId) {
        usageMap[log.referenceId] = (usageMap[log.referenceId] || 0) + 1;
      }
    });
    
    let mostUsedId = '';
    let maxUsage = 0;
    Object.entries(usageMap).forEach(([id, count]) => {
      if (count > maxUsage) {
        maxUsage = count;
        mostUsedId = id;
      }
    });
    
    const mostUsedName = distributors.find(d => d.id === mostUsedId)?.name || 'N/A';

    return {
      totalDistributors,
      totalPurchased,
      monthPurchased,
      mostUsedName
    };
  }, [distributors, inventoryLogs, inventory]);

  const filteredDistributors = useMemo(() => {
    return distributors.filter(d => {
      const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           d.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRegion = regionFilter === 'All' || d.region === regionFilter;
      return matchesSearch && matchesRegion;
    });
  }, [distributors, searchQuery, regionFilter]);

  const handleViewDetails = (id: string) => {
    haptics.light();
    navigate(`/admin/distributors/${id}`);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden">
      <PageHeader 
        title="Distributors" 
        subtitle={`Manage ${distributors.length} supply partners across regions`}
        actions={
          <Button 
            onClick={() => {
              haptics.light();
              setIsAddModalOpen(true);
            }}
            className="bg-white/10 hover:bg-white/20 text-white border-none rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Distributor
          </Button>
        }
      />

      <AddDistributorModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={addDistributor}
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KPICard 
            title="Total Distributors" 
            value={kpis.totalDistributors.toString()} 
            icon={<Truck className="w-5 h-5" />}
            color="bg-blue-500"
          />
          <KPICard 
            title="Total Purchased" 
            value={`Ksh ${kpis.totalPurchased.toLocaleString()}`} 
            icon={<Wallet className="w-5 h-5" />}
            color="bg-teal-500"
          />
          <KPICard 
            title="This Month" 
            value={`Ksh ${kpis.monthPurchased.toLocaleString()}`} 
            icon={<TrendingUp className="w-5 h-5" />}
            color="bg-indigo-500"
          />
          <KPICard 
            title="Most Used" 
            value={kpis.mostUsedName} 
            icon={<Package className="w-5 h-5" />}
            color="bg-amber-500"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-border">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <Input 
              placeholder="Search by name or location..." 
              className="pl-10 bg-slate-50 border-none h-11 rounded-xl"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-border">
              <Filter className="w-4 h-4 text-text-secondary" />
              <select 
                className="bg-transparent border-none text-sm font-bold outline-none"
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
              >
                {regions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Distributors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDistributors.map(distributor => (
            <DistributorCard 
              key={distributor.id} 
              distributor={distributor} 
              onView={() => handleViewDetails(distributor.id)}
              onLink={() => {
                setSelectedDistributorId(distributor.id);
                setIsLinkModalOpen(true);
              }}
            />
          ))}
        </div>

        <LinkProductModal 
          isOpen={isLinkModalOpen}
          onClose={() => setIsLinkModalOpen(false)}
          distributorId={selectedDistributorId}
        />

        {filteredDistributors.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-text-secondary">
            <Truck className="w-16 h-16 opacity-10 mb-4" />
            <p className="font-bold text-lg">No distributors found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}

function KPICard({ title, value, icon, color }: { title: string, value: string, icon: React.ReactNode, color: string }) {
  return (
    <Card className="border-none shadow-soft rounded-[24px] overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("p-3 rounded-2xl text-white shadow-lg", color)}>
            {icon}
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-black text-text-secondary uppercase tracking-widest">{title}</p>
          <p className="text-2xl font-black text-text-primary tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function DistributorCard({ distributor, onView, onLink }: { distributor: any, onView: () => void, onLink: () => void }) {
  const initials = distributor.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
  
  return (
    <Card className="border-border shadow-soft rounded-[24px] overflow-hidden hover:shadow-md transition-all duration-300 group">
      <CardContent className="p-0">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-brand flex items-center justify-center text-white font-black text-lg shadow-lg shadow-primary/20">
              {initials}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-xl">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl border-border">
                <DropdownMenuItem className="rounded-lg gap-2 font-medium">
                  <Edit2 className="w-4 h-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={onLink}
                  className="rounded-lg gap-2 font-medium text-primary focus:text-primary"
                >
                  <Package className="w-4 h-4" /> Link Product
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-1 mb-4">
            <h3 className="text-lg font-black text-text-primary tracking-tight group-hover:text-primary transition-colors">
              {distributor.name}
            </h3>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-slate-50 text-[10px] font-bold uppercase tracking-wider border-border">
                {distributor.region}
              </Badge>
              <span className="text-xs text-text-secondary font-medium flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {distributor.location}
              </span>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-secondary font-medium flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> {distributor.phone}
              </span>
              <span className="text-text-secondary font-medium flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" /> 12 Agents
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-0.5">Total Purchases</p>
                <p className="text-sm font-black text-primary">Ksh 1.2M</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-0.5">Last Purchase</p>
                <p className="text-sm font-bold text-text-primary">Oct 12, 2023</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 bg-slate-50 border-t border-border flex gap-2">
          <Button 
            onClick={onView}
            className="flex-1 bg-white hover:bg-slate-100 text-text-primary border border-border rounded-xl font-bold text-xs h-10"
          >
            <Eye className="w-4 h-4 mr-2" /> View Details
          </Button>
          <Button 
            variant="outline"
            className="flex-1 bg-white hover:bg-slate-100 text-text-primary border border-border rounded-xl font-bold text-xs h-10"
          >
            <Edit2 className="w-4 h-4 mr-2" /> Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function AddDistributorModal({ isOpen, onClose, onAdd }: { isOpen: boolean, onClose: () => void, onAdd: (d: Distributor) => void }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<DistributorFormValues>({
    resolver: zodResolver(distributorSchema),
    defaultValues: {
      region: 'Central',
    }
  });

  const onSubmit = (data: DistributorFormValues) => {
    const newDistributor: Distributor = {
      id: `d${Math.random().toString(36).substr(2, 9)}`,
      ...data,
      createdAt: Date.now(),
      linkedProducts: [],
    };
    onAdd(newDistributor);
    toast.success('Distributor added successfully');
    reset();
    onClose();
    haptics.success();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] rounded-[32px] p-8 border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight text-text-primary">Add New Distributor</DialogTitle>
          <DialogDescription className="text-sm text-text-secondary font-medium">Register a new supply partner in your distribution network</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest px-1">Distributor Name</label>
              <Input 
                {...register('name')}
                placeholder="e.g. Nairobi Supplies Ltd" 
                className={cn("h-12 rounded-xl bg-slate-50 border-border font-bold", errors.name && "border-danger")}
              />
              {errors.name && <p className="text-[10px] text-danger font-bold px-1">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest px-1">Region</label>
              <select 
                {...register('region')}
                className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-border font-bold text-sm outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Central">Central</option>
                <option value="Coast">Coast</option>
                <option value="Western">Western</option>
                <option value="Rift Valley">Rift Valley</option>
                <option value="Eastern">Eastern</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest px-1">Location / Address</label>
            <Input 
              {...register('location')}
              placeholder="e.g. Industrial Area, Road A" 
              className={cn("h-12 rounded-xl bg-slate-50 border-border font-bold", errors.location && "border-danger")}
            />
            {errors.location && <p className="text-[10px] text-danger font-bold px-1">{errors.location.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest px-1">Contact Person</label>
              <Input 
                {...register('contactPerson')}
                placeholder="e.g. John Doe" 
                className={cn("h-12 rounded-xl bg-slate-50 border-border font-bold", errors.contactPerson && "border-danger")}
              />
              {errors.contactPerson && <p className="text-[10px] text-danger font-bold px-1">{errors.contactPerson.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest px-1">Phone Number</label>
              <Input 
                {...register('phone')}
                placeholder="07..." 
                className={cn("h-12 rounded-xl bg-slate-50 border-border font-bold", errors.phone && "border-danger")}
              />
              {errors.phone && <p className="text-[10px] text-danger font-bold px-1">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest px-1">Email Address</label>
            <Input 
              {...register('email')}
              placeholder="distributor@example.com" 
              className={cn("h-12 rounded-xl bg-slate-50 border-border font-bold", errors.email && "border-danger")}
            />
            {errors.email && <p className="text-[10px] text-danger font-bold px-1">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-text-secondary uppercase tracking-widest px-1">Notes (Optional)</label>
            <Input 
              {...register('notes')}
              placeholder="Any additional information..." 
              className="h-12 rounded-xl bg-slate-50 border-border font-bold"
            />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" onClick={onClose} variant="ghost" className="rounded-xl font-bold">Cancel</Button>
            <Button type="submit" className="bg-gradient-brand hover:opacity-90 text-white rounded-xl font-black uppercase tracking-widest text-xs px-8 h-12 shadow-lg">
              Save Distributor
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function LinkProductModal({ isOpen, onClose, distributorId }: { isOpen: boolean, onClose: () => void, distributorId: string | null }) {
  const { products, distributors, updateDistributor } = useSalesStore();
  const distributor = distributors.find(d => d.id === distributorId);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  React.useEffect(() => {
    if (distributor) {
      setSelectedProducts(distributor.linkedProducts || []);
    }
  }, [distributor, isOpen]);

  const handleToggleProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId) 
        : [...prev, productId]
    );
  };

  const handleSave = () => {
    if (distributor) {
      updateDistributor({
        ...distributor,
        linkedProducts: selectedProducts
      });
      toast.success('Linked products updated');
      onClose();
      haptics.success();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] rounded-[32px] p-8 border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-tight text-text-primary">Link Products</DialogTitle>
          <DialogDescription className="text-sm text-text-secondary font-medium">Tag products supplied by {distributor?.name}</DialogDescription>
        </DialogHeader>
        <div className="py-6 space-y-4 max-h-[400px] overflow-y-auto pr-2">
          {products.map(product => (
            <div 
              key={product.id}
              onClick={() => handleToggleProduct(product.id)}
              className={cn(
                "flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer",
                selectedProducts.includes(product.id)
                  ? "bg-primary/5 border-primary shadow-sm"
                  : "bg-slate-50 border-transparent hover:border-slate-200"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold border",
                  selectedProducts.includes(product.id)
                    ? "bg-white text-primary border-primary/20"
                    : "bg-white text-slate-400 border-slate-200"
                )}>
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-text-primary">{product.name}</p>
                  <p className="text-[10px] text-text-secondary font-black uppercase tracking-widest">{product.sku}</p>
                </div>
              </div>
              <div className={cn(
                "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                selectedProducts.includes(product.id)
                  ? "bg-primary border-primary"
                  : "border-slate-300"
              )}>
                {selectedProducts.includes(product.id) && <Plus className="w-4 h-4 text-white rotate-45" />}
              </div>
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold">Cancel</Button>
          <Button onClick={handleSave} className="bg-gradient-brand hover:opacity-90 text-white rounded-xl font-black uppercase tracking-widest text-xs px-8 h-12 shadow-lg">
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
