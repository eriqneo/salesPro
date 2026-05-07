import React, { useState, useMemo } from 'react';
import { useSalesStore } from '@/store/useSalesStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  PlusIcon, 
  TrashIcon, 
  MagnifyingGlassIcon, 
  ExclamationCircleIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  Square3Stack3DIcon,
  BuildingStorefrontIcon,
  ReceiptPercentIcon
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { haptics } from '@/lib/haptics';
import { cn } from '@/lib/utils';
import { GradientButton } from '@/components/ui/GradientButton';
import { motion, AnimatePresence } from 'motion/react';

export const RecordSaleSheet: React.FC = () => {
  const { isRecordSaleOpen, setRecordSaleOpen } = useUIStore();
  const { inventory, shops, recordSale, products } = useSalesStore();
  const { user } = useAuthStore();

  const [step, setStep] = useState(1);
  const [shopId, setShopId] = useState('');
  const [items, setItems] = useState([{ productId: '', quantityCartons: 0, quantityPackets: 0 }]);
  const [shopSearch, setShopSearch] = useState('');

  const filteredShops = useMemo(() => 
    shops.filter(s => s.name.toLowerCase().includes(shopSearch.toLowerCase())),
  [shops, shopSearch]);

  const selectedShop = useMemo(() => shops.find(s => s.id === shopId), [shops, shopId]);

  const totalKsh = useMemo(() => {
    return items.reduce((sum, item) => {
      const product = products.find(p => p.sku === item.productId);
      if (!product) return sum;
      return sum + (item.quantityCartons * product.basePriceKsh);
    }, 0);
  }, [items, products]);

  const handleReset = () => {
    setStep(1);
    setShopId('');
    setItems([{ productId: '', quantityCartons: 0, quantityPackets: 0 }]);
    setShopSearch('');
  };

  const handleClose = () => {
    setRecordSaleOpen(false);
    setTimeout(handleReset, 300);
  };

  const handleAddItem = () => {
    haptics.light();
    setItems([...items, { productId: '', quantityCartons: 0, quantityPackets: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    haptics.light();
    setItems(items.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = () => {
    if (!user || !shopId || items.some(i => !i.productId)) {
      toast.error('Please complete all fields');
      return;
    }

    haptics.medium();
    const shop = shops.find(s => s.id === shopId);
    
    const newSale = {
      id: Math.random().toString(36).substr(2, 9),
      agentId: user.uid,
      shopId,
      items: items.map(item => {
        const product = products.find(p => p.sku === item.productId);
        return {
          productId: item.productId,
          quantityCartons: item.quantityCartons,
          quantityPackets: item.quantityPackets,
          priceKsh: product?.basePriceKsh || 0,
        };
      }),
      totalKsh,
      routeName: shop?.routeName || 'Unknown',
      timestamp: Date.now(),
      syncStatus: 'synced' as const
    };

    recordSale(newSale);
    toast.success('Sale recorded successfully!');
    handleClose();
  };

  const steps = [
    { id: 1, label: 'Select Shop', icon: BuildingStorefrontIcon },
    { id: 2, label: 'Add Items', icon: Square3Stack3DIcon },
    { id: 3, label: 'Confirm', icon: ReceiptPercentIcon }
  ];

  return (
    <BottomSheet
      isOpen={isRecordSaleOpen}
      onClose={handleClose}
      title="Quick Record Sale"
    >
      <div className="flex flex-col gap-6 py-2">
        {/* Premium Step Indicator */}
        <div className="flex items-center justify-between px-4 mb-8 bg-slate-50/50 p-6 rounded-[32px] border border-white shadow-inner">
          {steps.map((s, idx) => (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center gap-2 group flex-1">
                <div className={cn(
                  "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500",
                  step === s.id 
                    ? "bg-primary text-white shadow-xl shadow-primary/30 scale-110" 
                    : step > s.id 
                      ? "bg-success text-white scale-100" 
                      : "bg-slate-100 text-slate-400 scale-90"
                )}>
                  {step > s.id ? (
                    <CheckCircleIcon className="w-6 h-6" />
                  ) : (
                    <s.icon className="w-5 h-5" />
                  )}
                </div>
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-[0.1em] transition-colors",
                  step === s.id ? "text-primary" : "text-slate-400"
                )}>
                  {s.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className="flex-1 mx-2 h-[2px] bg-slate-100 relative -translate-y-4">
                  <motion.div 
                    initial={false}
                    animate={{ width: step > s.id ? '100%' : '0%' }}
                    className="absolute inset-0 bg-success transition-all duration-700"
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="relative group">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 transition-colors group-focus-within:text-primary" />
                <Input 
                  placeholder="Find shop by name or route..." 
                  className="pl-12 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white focus:ring-4 focus:ring-primary/5 rounded-2xl h-16 text-sm font-bold transition-all"
                  value={shopSearch}
                  onChange={(e) => setShopSearch(e.target.value)}
                />
              </div>
              <div className="max-h-[350px] overflow-y-auto space-y-2 pr-1 scrollbar-hide py-2">
                {filteredShops.map(s => (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    key={s.id}
                    onClick={() => {
                      haptics.light();
                      setShopId(s.id);
                      setStep(2);
                    }}
                    className={cn(
                      "w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between group",
                      shopId === s.id 
                        ? "bg-primary/5 border-primary shadow-lg shadow-primary/5" 
                        : "bg-white border-slate-50 hover:border-slate-200 active:bg-slate-50"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center transition-colors shadow-sm",
                        shopId === s.id ? "bg-primary text-white" : "bg-slate-50 text-slate-400 group-hover:bg-slate-100"
                      )}>
                        <BuildingStorefrontIcon className="w-6 h-6" />
                      </div>
                      <div>
                        <p className="font-black text-slate-900 tracking-tight">{s.name}</p>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{s.routeName}</p>
                      </div>
                    </div>
                    {shopId === s.id ? (
                      <CheckCircleIcon className="w-6 h-6 text-primary" />
                    ) : (
                      <ChevronRightIcon className="w-4 h-4 text-slate-300" />
                    )}
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="max-h-[450px] overflow-y-auto space-y-4 pr-1 scrollbar-hide">
                {items.map((item, index) => (
                  <motion.div 
                    layout
                    key={index} 
                    className="p-6 rounded-[28px] bg-white border border-slate-100 space-y-6 shadow-soft relative transition-all active:ring-2 active:ring-primary/10"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="relative flex-1">
                        <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 absolute -top-2 left-4 bg-white px-2 z-10">Product Selection</Label>
                        <select
                          value={item.productId}
                          onChange={(e) => handleUpdateItem(index, 'productId', e.target.value)}
                          className="w-full h-14 bg-slate-50 border-none focus:bg-white focus:ring-2 focus:ring-primary/20 rounded-2xl px-4 text-sm font-black outline-none transition-all appearance-none cursor-pointer"
                        >
                          <option value="">Select Product</option>
                          {inventory.filter(i => i.agentId === user?.uid).map(p => (
                            <option key={p.id} value={p.productSku}>{p.productName}</option>
                          ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                          <Square3Stack3DIcon className="w-5 h-5" />
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveItem(index)}
                        disabled={items.length === 1}
                        className="w-12 h-14 rounded-2xl flex items-center justify-center bg-white border-2 border-transparent hover:border-danger/20 text-danger disabled:opacity-30 transition-all shadow-sm active:scale-95"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative flex flex-col pt-3">
                        <Input 
                          type="number" 
                          inputMode="numeric"
                          value={item.quantityCartons}
                          onChange={(e) => handleUpdateItem(index, 'quantityCartons', parseInt(e.target.value) || 0)}
                          className="h-16 bg-white border-2 border-transparent focus:border-primary/20 rounded-2xl font-black text-xl text-center px-4 transition-all"
                        />
                        <span className="absolute top-0 left-1/2 -translate-x-1/2 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] bg-white px-2 rounded-full border border-slate-50">Cartons</span>
                      </div>
                      <div className="relative flex flex-col pt-3">
                        <Input 
                          type="number" 
                          inputMode="numeric"
                          value={item.quantityPackets}
                          onChange={(e) => handleUpdateItem(index, 'quantityPackets', parseInt(e.target.value) || 0)}
                          className="h-16 bg-white border-2 border-transparent focus:border-primary/20 rounded-2xl font-black text-xl text-center px-4 transition-all"
                        />
                        <span className="absolute top-0 left-1/2 -translate-x-1/2 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] bg-white px-2 rounded-full border border-slate-50">Packets</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <Button 
                variant="outline" 
                onClick={handleAddItem}
                className="w-full h-14 rounded-2xl border-dashed border-2 border-slate-200 bg-white text-slate-500 font-black uppercase tracking-widest hover:border-primary hover:text-primary transition-all active:scale-[0.98]"
              >
                <PlusIcon className="w-5 h-5 mr-2" /> Add Another Item
              </Button>

              <div className="flex gap-3 pt-4">
                <Button variant="ghost" onClick={() => setStep(1)} className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-slate-400 hover:bg-slate-50">
                  <ChevronLeftIcon className="w-4 h-4 mr-1" /> Back
                </Button>
                <GradientButton onClick={() => setStep(3)} className="flex-[2] h-16 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20">
                  Preview Sale <ChevronRightIcon className="w-4 h-4 ml-1" />
                </GradientButton>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Premium Receipt Design */}
              <div className="relative p-6 rounded-[32px] bg-white border-2 border-slate-100 shadow-2xl shadow-slate-200/50 overflow-hidden">
                {/* Decorative cutouts for receipt feel */}
                <div className="absolute -top-4 left-0 right-0 h-8 flex justify-center gap-1">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className="w-4 h-4 rounded-full bg-slate-50 shrink-0" />
                  ))}
                </div>
                
                <div className="mt-4 flex flex-col items-center text-center space-y-1 mb-8">
                  <div className="w-16 h-16 rounded-3xl bg-primary/5 flex items-center justify-center mb-2">
                    <ReceiptPercentIcon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Order Summary</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{selectedShop?.name}</p>
                </div>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center py-2 border-b border-dashed border-slate-100">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Date</span>
                    <span className="text-xs font-black text-slate-900">{new Date().toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="space-y-3">
                    {items.map((item, i) => {
                      const product = products.find(p => p.sku === item.productId);
                      return (
                        <div key={i} className="flex justify-between items-start text-sm">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-700">{product?.name}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{item.quantityCartons} Ctn, {item.quantityPackets} Pkt</span>
                          </div>
                          <span className="font-black text-slate-900 tabular-nums">Ksh {(item.quantityCartons * (product?.basePriceKsh || 0)).toLocaleString()}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-6 border-t-4 border-double border-slate-50 flex justify-between items-center">
                  <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Grand Total</span>
                  <span className="text-3xl font-black text-primary tracking-tighter tabular-nums">
                    Ksh {totalKsh.toLocaleString()}
                  </span>
                </div>

                {/* Bottom decorative cutouts */}
                <div className="absolute -bottom-4 left-0 right-0 h-8 flex justify-center gap-1">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className="w-4 h-4 rounded-full bg-slate-50 shrink-0" />
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <Button variant="ghost" onClick={() => setStep(2)} className="flex-1 h-16 rounded-2xl font-black uppercase tracking-widest text-slate-400">
                  Edit
                </Button>
                <GradientButton onClick={handleSubmit} className="flex-[3] h-18 rounded-3xl font-black text-lg uppercase tracking-widest shadow-2xl shadow-primary/30 active:scale-[0.98] transition-transform">
                  Record Sale
                </GradientButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </BottomSheet>
  );
};
