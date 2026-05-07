import React, { useState } from 'react';
import { 
  Package, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  ArrowUpCircle,
  Search,
  Box,
  ChevronDown
} from 'lucide-react';
import { useSalesStore } from '@/store/useSalesStore';
import { useAdminStore } from '@/store/useAdminStore';
import { ResponsiveModal } from '../responsive/ResponsiveModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { haptics } from '@/lib/haptics';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface AddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: { uid: string, name: string, region: string } | null;
}

export function AddStockModal({ isOpen, onClose, agent }: AddStockModalProps) {
  const { products, adjustInventory } = useSalesStore();
  const { agents } = useAdminStore();
  const [items, setItems] = useState([{ productId: '', quantityCartons: 0, quantityPackets: 0 }]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [targetAgentId, setTargetAgentId] = useState(agent?.uid || '');

  // Update target agent if prop changes
  React.useEffect(() => {
    if (agent) setTargetAgentId(agent.uid);
  }, [agent]);

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

  const handleSubmit = async () => {
    const finalAgent = agents.find(a => a.uid === targetAgentId);
    if (!finalAgent) return;
    
    const validItems = items.filter(i => i.productId && (i.quantityCartons > 0 || i.quantityPackets > 0));
    
    if (validItems.length === 0) {
      toast.error('Please add at least one valid item');
      return;
    }

    setIsSubmitting(true);
    haptics.medium();

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      validItems.forEach(item => {
        adjustInventory(
          finalAgent.uid,
          item.productId,
          item.quantityCartons,
          item.quantityPackets,
          'addition',
          'Admin Allocation'
        );
      });

      toast.success(`Inventory dispatched to ${finalAgent.name}`);
      setItems([{ productId: '', quantityCartons: 0, quantityPackets: 0 }]);
      onClose();
    } catch (error) {
      toast.error('Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentAgent = agents.find(a => a.uid === targetAgentId);

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="Inventory Resource Allocation"
      className="sm:max-w-xl"
    >
      <div className="space-y-8 pb-4">
        {/* Destination Selection */}
        <div className="space-y-3 px-1">
          <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Target Destination</label>
          <div className="bg-slate-50 border border-slate-100 p-6 rounded-[28px] shadow-inner relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 blur-2xl rounded-full -mr-12 -mt-12" />
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-200 shrink-0">
                <span className="text-xl font-black italic">{currentAgent?.name?.[0] || '?'}</span>
              </div>
              <div className="flex-1">
                <select
                  value={targetAgentId}
                  onChange={(e) => setTargetAgentId(e.target.value)}
                  className="w-full bg-transparent text-lg font-black text-slate-900 outline-none cursor-pointer appearance-none pr-8"
                >
                  {agents.map(a => (
                    <option key={a.uid} value={a.uid}>{a.name}</option>
                  ))}
                </select>
                <p className="text-[10px] font-black uppercase tracking-widest text-teal-600 mt-1">
                  {currentAgent?.region || 'Select Territory'} • Secure Transport
                </p>
              </div>
              <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 group-hover:text-slate-900 transition-colors pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Dynamic Items List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Manifest Items</h4>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleAddItem}
              className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-900 bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 mr-2 text-teal-500" /> Add Resource
            </Button>
          </div>

          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 scrollbar-hide">
            <AnimatePresence initial={false}>
              {items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white border border-slate-100 p-5 rounded-[24px] shadow-sm hover:shadow-md transition-shadow relative group/item"
                >
                  <div className="grid grid-cols-1 gap-5">
                    <div className="space-y-2">
                      <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Select Product SKU</Label>
                      <div className="relative">
                        <select
                          value={item.productId}
                          onChange={(e) => handleUpdateItem(index, 'productId', e.target.value)}
                          className="w-full h-12 bg-slate-50 border-none rounded-xl px-4 text-[13px] font-black text-slate-900 outline-none appearance-none cursor-pointer focus:ring-2 focus:ring-teal-500/20"
                        >
                          <option value="">Choose item...</option>
                          {products.map(p => (
                            <option key={p.id} value={p.sku}>{p.name}</option>
                          ))}
                        </select>
                        <Box className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1 text-center block">Cartons (Bulk)</Label>
                        <Input 
                          type="number" 
                          placeholder="0"
                          value={item.quantityCartons || ''}
                          onChange={(e) => handleUpdateItem(index, 'quantityCartons', parseInt(e.target.value) || 0)}
                          className="h-12 rounded-xl bg-slate-50 border-none font-black text-center text-lg focus:ring-2 focus:ring-teal-500/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1 text-center block">Packets (Retail)</Label>
                        <Input 
                          type="number" 
                          placeholder="0"
                          value={item.quantityPackets || ''}
                          onChange={(e) => handleUpdateItem(index, 'quantityPackets', parseInt(e.target.value) || 0)}
                          className="h-12 rounded-xl bg-slate-50 border-none font-black text-center text-lg focus:ring-2 focus:ring-teal-500/20"
                        />
                      </div>
                    </div>
                  </div>

                  {items.length > 1 && (
                    <button
                      onClick={() => handleRemoveItem(index)}
                      className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white shadow-xl border border-slate-50 flex items-center justify-center text-rose-500 hover:bg-rose-50 transition-all opacity-0 group-hover/item:opacity-100 hover:scale-110 active:scale-95"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Summary & Footer */}
        <div className="pt-4 flex flex-col gap-4">
          <div className="flex justify-between items-center px-2 py-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Items Prepared</span>
            <span className="text-lg font-black text-slate-900">{items.filter(i => i.productId).length} / {items.length}</span>
          </div>
          
          <div className="flex gap-3 mt-2">
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="flex-1 h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] text-slate-400 hover:text-slate-900"
            >
              Abort
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-[2] h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 shadow-2xl shadow-slate-200 font-black uppercase tracking-[0.2em] text-[10px] gap-3 text-white transition-all active:scale-[0.98]"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 text-teal-400" /> Confirm Dispatch
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </ResponsiveModal>
  );
}
