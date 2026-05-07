import React, { useState, useMemo } from 'react';
import { useSalesStore } from '@/store/useSalesStore';
import { motion, AnimatePresence } from 'motion/react';
import { useAuthStore } from '@/store/useAuthStore';
import { 
  ArchiveBoxIcon as Package, 
  PlusIcon as Plus, 
  MagnifyingGlassIcon as Search, 
  ClockIcon as History, 
  ArrowUpRightIcon as ArrowUpRight, 
  ArrowDownRightIcon as ArrowDownRight,
  QrCodeIcon as Barcode,
  XMarkIcon as X
} from '@heroicons/react/24/outline';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Drawer, 
  DrawerContent, 
  DrawerHeader, 
  DrawerTitle, 
  DrawerTrigger,
  DrawerFooter,
} from '@/components/ui/drawer';
import { format } from 'date-fns';
import { BarcodeScanner } from '@/components/sales/BarcodeScanner';
import { toast } from 'sonner';
import { haptics } from '@/lib/haptics';
import { AgentPageHeader } from '@/components/navigation/AgentPageHeader';
import { useSwipeBack } from '@/hooks/useSwipeBack';
import { cn } from '@/lib/utils';
import { GradientButton } from '@/components/ui/GradientButton';

import { TabSkeleton } from '@/components/navigation/TabSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { PullToRefresh } from '@/components/common/PullToRefresh';

export default function InventoryPage() {
  const { inventory, inventoryLogs, distributors, addInventory, products } = useSalesStore();
  const { user } = useAuthStore();
  const [search, setSearch] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useSwipeBack();

  const handleRefresh = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
  };

  const filteredInventory = useMemo(() => {
    return inventory
      .filter(item => item.agentId === user?.uid)
      .filter(item => 
        item.productName.toLowerCase().includes(search.toLowerCase()) ||
        item.productSku.toLowerCase().includes(search.toLowerCase())
      );
  }, [inventory, search, user]);

  const agentLogs = useMemo(() => {
    return inventoryLogs.filter(log => log.agentId === user?.uid);
  }, [inventoryLogs, user]);

  const getStockColor = (cartons: number) => {
    if (cartons >= 10) return 'bg-success';
    if (cartons >= 5) return 'bg-warning';
    return 'bg-danger';
  };

  const handleScan = (sku: string) => {
    haptics.success();
    setSearch(sku);
    toast.success(`Scanned SKU: ${sku}`);
  };

  const lowStockItems = filteredInventory.filter(item => item.quantityCartons < 5);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="flex flex-col min-h-full pb-32">
        {/* Sticky Low Stock Banner */}
        <AnimatePresence>
          {lowStockItems.length > 0 && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-rose-500 text-white px-5 py-3 flex items-center justify-between shadow-lg relative z-20"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                  <Package className="w-4 h-4" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider">
                  {lowStockItems.length} items critical
                </span>
              </div>
              <button className="text-[10px] font-black uppercase tracking-[0.2em] bg-white/20 px-3 py-1.5 rounded-lg active:scale-95 transition-transform">
                Restock Now →
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="p-5 space-y-8">
          {/* Refined Search Pill */}
          <div className="relative group">
            <div className="absolute inset-0 bg-teal-500/5 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <div className="relative flex items-center bg-white border border-slate-200 rounded-[22px] shadow-sm focus-within:border-teal-500/50 focus-within:shadow-md transition-all overflow-hidden">
              <Search className="ml-4 w-5 h-5 text-slate-400 shrink-0" />
              <Input 
                placeholder="Search products or SKU..." 
                className="flex-1 border-none bg-transparent h-14 text-sm font-bold focus-visible:ring-0"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button 
                onClick={() => setIsScannerOpen(true)}
                className="mr-2 p-3 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 active:scale-90 transition-all"
              >
                <Barcode className="w-5 h-5" />
              </button>
            </div>
          </div>

          <Tabs defaultValue="current" className="w-full space-y-8">
            <TabsList className="grid w-full grid-cols-2 bg-slate-100/50 p-1 rounded-2xl border border-slate-200/30">
              <TabsTrigger 
                value="current" 
                onClick={() => haptics.light()}
                className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md font-black text-[10px] uppercase tracking-[0.2em] h-11"
              >
                Current Stock
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                onClick={() => haptics.light()}
                className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md font-black text-[10px] uppercase tracking-[0.2em] h-11"
              >
                Movement Log
              </TabsTrigger>
            </TabsList>

            <TabsContent value="current" className="mt-0 space-y-5">
              {filteredInventory.length === 0 ? (
                <EmptyState 
                  title="Inventory is empty"
                  subtitle="Add stock from a distributor to start recording sales."
                  illustration="inventory"
                />
              ) : (
                filteredInventory.map((item, index) => {
                  const isCritical = item.quantityCartons < 5;
                  const isLow = item.quantityCartons < 10;
                  
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="border-none shadow-[0_4px_20px_rgba(0,0,0,0.04)] rounded-[28px] overflow-hidden bg-white relative group">
                        {/* Status Accent */}
                        <div className={cn(
                          "absolute left-0 top-0 bottom-0 w-2",
                          isCritical ? "bg-rose-500" : isLow ? "bg-amber-500" : "bg-teal-500"
                        )} />
                        
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-6">
                            <div className="space-y-1">
                              <h3 className="font-black text-slate-900 text-xl tracking-tight leading-none">{item.productName}</h3>
                              <div className="flex items-center gap-2">
                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{item.productSku}</p>
                                <div className="w-1 h-1 rounded-full bg-slate-200" />
                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                                  {distributors.find(d => d.id === item.distributorId)?.name || 'Direct'}
                                </p>
                              </div>
                            </div>
                            
                            <div className={cn(
                              "w-12 h-12 rounded-[18px] flex items-center justify-center shrink-0 border-2",
                              isCritical ? "bg-rose-50 border-rose-100 text-rose-600" : 
                              isLow ? "bg-amber-50 border-amber-100 text-amber-600" : 
                              "bg-teal-50 border-teal-100 text-teal-600"
                            )}>
                              <span className="text-sm font-black tracking-tighter">
                                {Math.round((item.quantityCartons / 20) * 100)}%
                              </span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group-hover:bg-white group-hover:border-slate-200 transition-all">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Cartons</p>
                                {isCritical && <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />}
                              </div>
                              <p className="text-2xl font-black text-slate-900 tracking-tighter">{item.quantityCartons}</p>
                            </div>
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 group-hover:bg-white group-hover:border-slate-200 transition-all">
                              <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest mb-1">Packets</p>
                              <p className="text-2xl font-black text-slate-900 tracking-tighter">{item.quantityPackets}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })
              )}
            </TabsContent>

            <TabsContent value="history" className="mt-0 space-y-0 pl-3 border-l-2 border-slate-100 ml-2">
              {agentLogs.length === 0 ? (
                <div className="pl-6 pt-2">
                  <EmptyState 
                    title="No activity yet"
                    subtitle="Stock additions and sales will be logged here."
                    illustration="inventory"
                  />
                </div>
              ) : (
                agentLogs.map((log, idx) => (
                  <div key={log.id} className="relative pl-8 pb-8 last:pb-0 group">
                    <div className={cn(
                      "absolute left-[-9px] top-1 w-4 h-4 rounded-full border-4 border-white shadow-sm",
                      log.type === 'addition' ? "bg-teal-500" : "bg-rose-500"
                    )} />
                    
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 group-active:scale-[0.98] transition-transform">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                        log.type === 'addition' ? 'bg-teal-50 text-teal-600' : 'bg-rose-50 text-rose-600'
                      )}>
                        {log.type === 'addition' ? <ArrowUpRight className="w-6 h-6" /> : <ArrowDownRight className="w-6 h-6" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-black text-slate-900 tracking-tight">
                          {log.type === 'addition' ? 'Inventory Restock' : 'Inventory Deduction'}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                          {log.productId} • {format(log.timestamp, 'MMM d, h:mm a')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={cn(
                          "text-sm font-black tracking-tighter",
                          log.type === 'addition' ? 'text-teal-600' : 'text-rose-600'
                        )}>
                          {log.type === 'addition' ? '+' : '-'}{log.quantityCartons} Ctn
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold">{log.quantityPackets} Pkt</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>

        {isScannerOpen && (
          <BarcodeScanner 
            onScan={handleScan} 
            onClose={() => setIsScannerOpen(false)} 
          />
        )}

        {/* Sticky Bottom Action Bar */}
        <div className="fixed bottom-24 left-0 right-0 px-6 z-40">
          <div className="max-w-md mx-auto flex gap-3">
            <button 
              onClick={() => setIsScannerOpen(true)}
              className="flex-[1] h-14 rounded-2xl bg-white border border-slate-200 shadow-xl flex items-center justify-center text-slate-600 active:scale-95 transition-all"
            >
              <Barcode className="w-6 h-6" />
            </button>
            <AddStockDrawer />
          </div>
        </div>
      </div>
    </PullToRefresh>
  );
}

function AddStockDrawer() {
  const { distributors, products, addInventory } = useSalesStore();
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    distributorId: '',
    productId: '',
    cartons: '',
    packets: '',
    cost: ''
  });

  const handleSubmit = () => {
    if (!formData.distributorId || !formData.productId || (!formData.cartons && !formData.packets)) {
      toast.error('Please fill in required fields');
      return;
    }
    
    haptics.success();
    const product = products.find(p => p.id === formData.productId);
    if (!product) return;

    addInventory({
      id: Math.random().toString(36).substr(2, 9),
      agentId: user?.uid || '',
      productName: product.name,
      productSku: product.sku,
      quantityCartons: parseInt(formData.cartons) || 0,
      quantityPackets: parseInt(formData.packets) || 0,
      unitCostKsh: parseFloat(formData.cost) || 0,
      addedAt: Date.now(),
      distributorId: formData.distributorId,
      expiryDate: ''
    });

    toast.success('Stock added successfully');
    setIsOpen(false);
    // Reset form
    setFormData({
      distributorId: '',
      productId: '',
      cartons: '',
      packets: '',
      cost: ''
    });
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button 
          onClick={() => haptics.light()}
          className="rounded-2xl shadow-xl shadow-primary/30 h-16 w-16 p-0 bg-gradient-brand border-none hover:scale-105 active:scale-95 transition-all group"
        >
          <div className="relative">
            <Plus className="w-8 h-8 text-white transition-transform group-hover:rotate-90" />
            <div className="absolute inset-0 bg-white/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="pb-[calc(env(safe-area-inset-bottom)+16px)] rounded-t-[40px] border-none shadow-2xl bg-white max-h-[85vh]">
        <div className="mx-auto w-full max-w-lg overflow-y-auto">
          <div className="flex justify-center pt-2 pb-1">
            <div className="w-12 h-1 bg-slate-100 rounded-full" />
          </div>
          
          <DrawerHeader className="pt-6 relative">
            <DrawerTitle className="text-2xl font-black tracking-tighter text-slate-900 text-center">Add Stock</DrawerTitle>
            <p className="text-center text-sm text-slate-400 font-medium mt-1">Register new inventory from distribution</p>
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute right-4 top-6 p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-slate-600 active:scale-90 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </DrawerHeader>

          <div className="p-6 space-y-6">
            {/* Form Sections with Dividers */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-primary" /> Source
                </label>
                <div className="relative group">
                  <select 
                    className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none text-sm h-16 font-bold transition-all appearance-none cursor-pointer"
                    value={formData.distributorId}
                    onChange={(e) => setFormData({...formData, distributorId: e.target.value})}
                  >
                    <option value="">Select Distributor</option>
                    {distributors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <History className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                  <div className="w-1 h-1 rounded-full bg-primary" /> Product
                </label>
                <div className="relative group">
                  <select 
                    className="w-full p-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/5 outline-none text-sm h-16 font-bold transition-all appearance-none cursor-pointer"
                    value={formData.productId}
                    onChange={(e) => setFormData({...formData, productId: e.target.value})}
                  >
                    <option value="">Select Product Entry</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <Package className="w-5 h-5" />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 mb-3 block flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-success" /> Quantity & Cost
              </label>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="relative group">
                    <Input 
                      type="number" 
                      inputMode="numeric"
                      placeholder="0" 
                      className="bg-slate-50 border-2 border-transparent focus:border-success/20 focus:bg-white focus:ring-4 focus:ring-success/5 rounded-2xl h-16 font-black text-xl text-center px-4 transition-all"
                      value={formData.cartons}
                      onChange={(e) => setFormData({...formData, cartons: e.target.value})}
                    />
                    <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] font-black text-slate-400 uppercase tracking-tighter">Cartons</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="relative group">
                    <Input 
                      type="number" 
                      inputMode="numeric"
                      placeholder="0" 
                      className="bg-slate-50 border-2 border-transparent focus:border-success/20 focus:bg-white focus:ring-4 focus:ring-success/5 rounded-2xl h-16 font-black text-xl text-center px-4 transition-all"
                      value={formData.packets}
                      onChange={(e) => setFormData({...formData, packets: e.target.value})}
                    />
                    <span className="absolute top-2 left-1/2 -translate-x-1/2 text-[9px] font-black text-slate-400 uppercase tracking-tighter">Packets</span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="relative group">
                  <Input 
                    type="number" 
                    inputMode="numeric"
                    placeholder="0.00" 
                    className="bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/5 rounded-2xl h-16 font-black text-xl pl-14 transition-all"
                    value={formData.cost}
                    onChange={(e) => setFormData({...formData, cost: e.target.value})}
                  />
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-slate-300 text-lg">Ksh</div>
                  <span className="absolute top-2 left-14 text-[9px] font-black text-slate-400 uppercase tracking-tighter">Unit Buying Cost</span>
                </div>
              </div>
            </div>
          </div>

          <DrawerFooter className="p-6">
            <GradientButton 
              onClick={handleSubmit} 
              className="w-full h-18 rounded-3xl text-xl font-black shadow-2xl shadow-primary/30 active:scale-[0.98] transition-transform overflow-hidden relative group"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform" />
              <span className="relative">Confirm Stock Entry</span>
            </GradientButton>
            <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-4">
              Inventory will be updated instantly
            </p>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
