import React, { useState, useMemo } from 'react';
import { useSalesStore } from '@/store/useSalesStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  PlusIcon as Plus, 
  TrashIcon as Trash2, 
  ShoppingBagIcon as ShoppingCart, 
  MagnifyingGlassIcon as Search, 
  ExclamationCircleIcon as AlertCircle 
} from '@heroicons/react/24/outline';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { haptics } from '@/lib/haptics';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const saleSchema = z.object({
  shopId: z.string().min(1, 'Please select a shop'),
  items: z.array(z.object({
    productId: z.string().min(1, 'Select a product'),
    quantityCartons: z.number().min(0),
    quantityPackets: z.number().min(0),
    overrideReason: z.string().optional()
  })).min(1, 'Add at least one item')
});

type SaleFormValues = z.infer<typeof saleSchema>;

import { AgentPageHeader } from '@/components/navigation/AgentPageHeader';
import { useSwipeBack } from '@/hooks/useSwipeBack';
import { cn } from '@/lib/utils';
import { GradientButton } from '@/components/ui/GradientButton';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function RecordSalePage() {
  const { inventory, shops, recordSale, products } = useSalesStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [shopSearch, setShopSearch] = useState('');
  const [step, setStep] = useState(1);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);

  useSwipeBack();

  const { register, control, handleSubmit, watch, setValue, formState: { errors, isSubmitting, isDirty } } = useForm<SaleFormValues>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      shopId: '',
      items: [{ productId: '', quantityCartons: 0, quantityPackets: 0 }]
    }
  });

  const handleBack = () => {
    if (isDirty) {
      setShowDiscardDialog(true);
    } else {
      navigate('/agent/home');
    }
  };

  const nextStep = () => {
    if (step === 1 && !watchedShopId) {
      toast.error('Please select a shop first');
      return;
    }
    haptics.light();
    setStep(step + 1);
  };

  const prevStep = () => {
    haptics.light();
    setStep(step - 1);
  };

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  const watchedItems = watch('items');
  const watchedShopId = watch('shopId');

  const selectedShop = useMemo(() => shops.find(s => s.id === watchedShopId), [shops, watchedShopId]);

  const filteredShops = useMemo(() => 
    shops.filter(s => s.name.toLowerCase().includes(shopSearch.toLowerCase())),
  [shops, shopSearch]);

  const totalKsh = useMemo(() => {
    return watchedItems.reduce((sum, item) => {
      const product = products.find(p => p.sku === item.productId);
      if (!product) return sum;
      return sum + (item.quantityCartons * product.basePriceKsh);
    }, 0);
  }, [watchedItems, products]);

  const onSubmit = (data: SaleFormValues) => {
    if (!user) return;
    haptics.medium();

    const shop = shops.find(s => s.id === data.shopId);
    
    const newSale = {
      id: Math.random().toString(36).substr(2, 9),
      agentId: user.uid,
      shopId: data.shopId,
      items: data.items.map(item => {
        const product = products.find(p => p.sku === item.productId);
        return {
          productId: item.productId,
          quantityCartons: item.quantityCartons,
          quantityPackets: item.quantityPackets,
          priceKsh: product?.basePriceKsh || 0,
          overrideReason: item.overrideReason
        };
      }),
      totalKsh,
      routeName: shop?.routeName || 'Unknown',
      timestamp: Date.now(),
      syncStatus: 'synced' as const
    };

    recordSale(newSale);
    toast.success('Sale recorded successfully!');
    navigate('/agent/home');
  };

  return (
    <div className="flex flex-col min-h-full pb-32">
      <AgentPageHeader 
        title="Record Sale" 
        showBack 
        onBack={handleBack}
        // Override back button behavior for dirty check
        className="z-[60]"
      />

      {/* Step Indicator */}
      <div className="px-6 py-4 bg-white border-b border-border flex items-center justify-between sticky top-[calc(56px+env(safe-area-inset-top))] z-40">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black transition-colors",
              step === s ? "bg-primary text-white" : step > s ? "bg-success text-white" : "bg-slate-100 text-text-secondary"
            )}>
              {s}
            </div>
            <span className={cn(
              "text-[10px] font-black uppercase tracking-tighter",
              step === s ? "text-primary" : "text-text-secondary"
            )}>
              {s === 1 ? 'Shop' : s === 2 ? 'Items' : 'Confirm'}
            </span>
            {s < 3 && <div className="w-8 h-[2px] bg-slate-100 mx-1" />}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-6">
        {step === 1 && (
          <Card className="bg-white border-border rounded-2xl shadow-soft overflow-hidden animate-in slide-in-from-right duration-300">
            <CardContent className="p-6 space-y-4">
              <Label className="text-xs font-black uppercase tracking-widest text-text-secondary">Select Shop</Label>
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                  <Input 
                    placeholder="Search shop by name..." 
                    className="pl-10 bg-slate-50 border-none rounded-xl h-12 text-sm"
                    value={shopSearch}
                    onChange={(e) => setShopSearch(e.target.value)}
                  />
                </div>
                <Select value={watchedShopId} onValueChange={(val) => setValue('shopId', val, { shouldDirty: true })}>
                  <SelectTrigger className="bg-white border-border rounded-xl h-12">
                    <SelectValue placeholder="Choose a shop from list" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border">
                    {filteredShops.map(s => (
                      <SelectItem key={s.id} value={s.id} className="rounded-lg">
                        <div className="flex flex-col items-start">
                          <span className="font-bold text-text-primary">{s.name}</span>
                          <span className="text-[10px] text-text-secondary font-bold uppercase tracking-tighter">{s.routeName}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.shopId && <p className="text-danger text-[10px] font-black uppercase px-1">{errors.shopId.message}</p>}
              </div>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <div className="space-y-4 animate-in slide-in-from-right duration-300">
            <Label className="text-xs font-black uppercase tracking-widest text-text-secondary px-1">Add Products</Label>
            {fields.map((field, index) => (
              <Card key={field.id} className="border-border shadow-soft bg-white rounded-2xl overflow-hidden">
                <CardContent className="p-5 space-y-5">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <Select 
                        value={watchedItems[index].productId} 
                        onValueChange={(val) => setValue(`items.${index}.productId`, val, { shouldDirty: true })}
                      >
                        <SelectTrigger className="border-border rounded-xl h-11">
                          <SelectValue placeholder="Select Product" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border">
                          {inventory.filter(i => i.agentId === user?.uid).map(p => (
                            <SelectItem key={p.id} value={p.productSku} className="rounded-lg">
                              <span className="font-medium">{p.productName}</span>
                              <span className="ml-2 text-[10px] text-text-secondary font-bold">({p.quantityCartons} ctn left)</span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      className="text-danger min-h-[44px] min-w-[44px] rounded-xl hover:bg-danger/5"
                      onClick={() => {
                        haptics.light();
                        remove(index);
                      }}
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-text-secondary px-1">Cartons</Label>
                      <Input 
                        type="number" 
                        inputMode="numeric"
                        className="bg-slate-50 border-none h-12 rounded-xl font-bold text-lg"
                        {...register(`items.${index}.quantityCartons`, { valueAsNumber: true })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-text-secondary px-1">Packets</Label>
                      <Input 
                        type="number" 
                        inputMode="numeric"
                        className="bg-slate-50 border-none h-12 rounded-xl font-bold text-lg"
                        {...register(`items.${index}.quantityPackets`, { valueAsNumber: true })}
                      />
                    </div>
                  </div>

                  {/* Stock Warning */}
                  {(() => {
                    const invItem = inventory.find(i => i.productSku === watchedItems[index].productId && i.agentId === user?.uid);
                    const product = products.find(p => p.sku === watchedItems[index].productId);
                    if (invItem && product) {
                      const totalPacketsInInv = (invItem.quantityCartons * product.packetsPerCarton) + invItem.quantityPackets;
                      const totalPacketsToDeduct = (watchedItems[index].quantityCartons * product.packetsPerCarton) + watchedItems[index].quantityPackets;
                      
                      if (totalPacketsToDeduct > totalPacketsInInv) {
                        return (
                          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 space-y-3">
                            <div className="flex items-center gap-2 text-warning text-[10px] font-black uppercase tracking-widest">
                              <AlertCircle className="w-4 h-4" /> Insufficient Stock
                            </div>
                            <Input 
                              placeholder="Reason for override..." 
                              className="bg-white border-border text-xs h-10 rounded-lg"
                              {...register(`items.${index}.overrideReason`)}
                            />
                          </div>
                        );
                      }
                    }
                    return null;
                  })()}
                </CardContent>
              </Card>
            ))}
            <Button 
              type="button" 
              variant="outline" 
              className="w-full border-dashed border-2 border-border h-14 rounded-2xl text-text-secondary font-bold hover:bg-slate-50 hover:text-text-primary transition-all" 
              onClick={() => {
                haptics.light();
                append({ productId: '', quantityCartons: 0, quantityPackets: 0 });
              }}
            >
              <Plus className="w-4 h-4 mr-2" /> Add Another Item
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <Card className="bg-white border-border rounded-2xl shadow-soft overflow-hidden">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase text-text-secondary tracking-widest">Selected Shop</span>
                    <span className="text-lg font-black text-text-primary">{selectedShop?.name}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setStep(1)} className="text-primary font-bold">Change</Button>
                </div>
                
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase text-text-secondary tracking-widest">Items Summary</span>
                  {watchedItems.map((item, i) => {
                    const product = products.find(p => p.sku === item.productId);
                    if (!product) return null;
                    return (
                      <div key={i} className="flex justify-between items-center py-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-text-primary">{product.name}</span>
                          <span className="text-xs text-text-secondary">{item.quantityCartons} Ctn, {item.quantityPackets} Pkt</span>
                        </div>
                        <span className="font-black text-text-primary">Ksh {(item.quantityCartons * product.basePriceKsh).toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-border shadow-[0_-4px_12px_rgba(0,0,0,0.05)] flex items-center justify-between gap-4 z-40 pb-[calc(1rem+env(safe-area-inset-bottom))]">
          {step > 1 ? (
            <Button 
              type="button" 
              variant="outline" 
              onClick={prevStep}
              className="h-14 px-6 rounded-2xl border-border font-bold text-text-secondary"
            >
              Back
            </Button>
          ) : (
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-black text-text-secondary tracking-widest">Total Amount</span>
              <span className="text-2xl font-black text-primary">Ksh {totalKsh.toLocaleString()}</span>
            </div>
          )}
          
          {step < 3 ? (
            <GradientButton 
              type="button" 
              onClick={nextStep}
              className="flex-1 h-14 rounded-2xl text-lg font-black shadow-lg shadow-primary/20"
            >
              Next Step
            </GradientButton>
          ) : (
            <GradientButton 
              type="submit" 
              disabled={isSubmitting}
              className="flex-1 h-14 rounded-2xl text-lg font-black shadow-lg shadow-primary/20"
            >
              {isSubmitting ? 'Submitting...' : 'Confirm & Submit'}
            </GradientButton>
          )}
        </div>
      </form>

      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent className="rounded-[32px] border-none">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black tracking-tight">Discard changes?</AlertDialogTitle>
            <AlertDialogDescription className="font-medium">
              You have unsaved changes in your sale record. Are you sure you want to discard them?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-3">
            <AlertDialogCancel className="flex-1 rounded-2xl h-12 mt-0 font-bold border-border">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => navigate('/sales')}
              className="flex-1 rounded-2xl h-12 bg-danger hover:bg-danger/90 font-bold"
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
