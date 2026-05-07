import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useSalesStore } from '@/store/useSalesStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  MagnifyingGlassIcon as Search, 
  MapPinIcon as MapPin, 
  UserIcon as User, 
  ChevronRightIcon as ChevronRight, 
  BuildingStorefrontIcon as Store,
  PlusIcon as Plus
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

import { AgentPageHeader } from '@/components/navigation/AgentPageHeader';
import { useSwipeBack } from '@/hooks/useSwipeBack';

import { TabSkeleton } from '@/components/navigation/TabSkeleton';
import { EmptyState } from '@/components/common/EmptyState';
import { PullToRefresh } from '@/components/common/PullToRefresh';
import { ResponsiveModal } from '@/components/admin/responsive/ResponsiveModal';
import { AddShopForm } from '@/components/sales/AddShopForm';
import { haptics } from '@/lib/haptics';

export default function ShopsPage() {
  const { shops, sales } = useSalesStore();
  const [search, setSearch] = useState('');
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useSwipeBack();

  const handleRefresh = async () => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsLoading(false);
  };

  const filteredShops = shops.filter(s => 
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.ownerName.toLowerCase().includes(search.toLowerCase()) ||
    s.routeName.toLowerCase().includes(search.toLowerCase())
  );

  const selectedShop = shops.find(s => s.id === selectedShopId);

  const getLastVisit = (shopId: string) => {
    const shopSales = sales
      .filter(s => s.shopId === shopId)
      .sort((a, b) => b.timestamp - a.timestamp);
    
    return shopSales.length > 0 ? format(shopSales[0].timestamp, 'MMM d, yyyy') : 'Never visited';
  };

  if (isLoading) return <TabSkeleton variant="shops" />;

  if (selectedShopId && selectedShop) {
    return (
      <div className="flex flex-col min-h-full pb-32">
        <div className="bg-[#0F172A] pt-[calc(env(safe-area-inset-top)+16px)] pb-12 px-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#0D948830,transparent_70%)]" />
          
          <button 
            onClick={() => setSelectedShopId(null)}
            className="relative z-10 w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white active:scale-90 transition-transform mb-6"
          >
            <ChevronRight className="w-5 h-5 rotate-180" />
          </button>
          
          <div className="relative z-10 flex flex-col items-center text-center space-y-4">
            <div className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white shadow-2xl shadow-teal-500/20 border-4 border-white/10">
              <Store className="w-12 h-12" />
            </div>
            <div className="space-y-1">
              <h2 className="text-3xl font-black tracking-tight text-white">{selectedShop.name}</h2>
              <div className="flex items-center justify-center gap-2">
                <Badge className="bg-teal-500/20 text-teal-300 border-none text-[9px] font-black uppercase tracking-widest px-2.5 py-1">
                  {selectedShop.routeName}
                </Badge>
                <div className="w-1 h-1 rounded-full bg-slate-600" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{selectedShop.region}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-5 space-y-8 -mt-6 relative z-10 animate-in slide-in-from-bottom duration-500">
          <Card className="bg-white border-none rounded-[32px] shadow-xl shadow-slate-200/50 overflow-hidden">
            <CardContent className="p-8">
              <div className="grid grid-cols-2 gap-6 w-full">
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact Person</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-black text-slate-900">{selectedShop.ownerName}</p>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Last Visit</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-black text-slate-900">{getLastVisit(selectedShop.id)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-5">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 px-1">Business Actions</h3>
            <div className="grid grid-cols-1 gap-4">
              <Button 
                onClick={() => navigate('/agent/record', { state: { shopId: selectedShop.id } })}
                className="w-full h-18 rounded-[24px] bg-[#0F172A] hover:bg-slate-900 border-none text-lg font-black shadow-2xl shadow-slate-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
              >
                <Plus className="w-6 h-6 text-teal-400 group-hover:rotate-90 transition-transform" />
                <span>Record New Sale</span>
              </Button>
              <Button 
                variant="outline"
                className="w-full h-14 rounded-2xl border-slate-200 text-slate-600 font-bold hover:bg-slate-50"
              >
                View Sales History
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="flex flex-col min-h-full pb-32">
        <div className="p-5 space-y-8">
          {/* Refined Search Pill */}
          <div className="relative group">
            <div className="absolute inset-0 bg-teal-500/5 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
            <div className="relative flex items-center bg-white border border-slate-200 rounded-[22px] shadow-sm focus-within:border-teal-500/50 focus-within:shadow-md transition-all overflow-hidden">
              <Search className="ml-4 w-5 h-5 text-slate-400 shrink-0" />
              <Input 
                placeholder="Search shops or owners..." 
                className="flex-1 border-none bg-transparent h-14 text-sm font-bold focus-visible:ring-0"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">My Portfolio</h3>
              <span className="text-[10px] font-black text-teal-600 bg-teal-50 px-2 py-1 rounded-lg uppercase tracking-widest">
                {filteredShops.length} Total
              </span>
            </div>

            {filteredShops.length === 0 ? (
              <EmptyState 
                title="No shops registered"
                subtitle="Start building your route by adding a new shop."
                illustration="shops"
              />
            ) : (
              filteredShops.map((shop, index) => (
                <motion.div
                  key={shop.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card 
                    className="border-none shadow-[0_4px_20px_rgba(0,0,0,0.04)] bg-white active:bg-slate-50 transition-all cursor-pointer rounded-[28px] overflow-hidden group"
                    onClick={() => {
                      haptics.light();
                      setSelectedShopId(shop.id);
                    }}
                  >
                    <CardContent className="p-6 flex items-center gap-5">
                      <div className="w-16 h-16 rounded-[22px] bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 group-hover:bg-teal-50 group-hover:text-teal-600 group-hover:border-teal-100 transition-all shadow-inner">
                        <Store className="w-8 h-8" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="font-black text-slate-900 text-xl tracking-tight leading-none">{shop.name}</p>
                          <Badge className="bg-slate-100 text-slate-500 border-none text-[8px] uppercase font-black px-2 py-0.5 tracking-[0.15em] group-hover:bg-teal-500 group-hover:text-white transition-colors">
                            {shop.routeName}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] text-slate-400 font-black uppercase tracking-widest">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" /> {shop.ownerName}
                          </div>
                          <div className="flex items-center justify-center w-1 h-1 rounded-full bg-slate-200" />
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" /> {shop.region}
                          </div>
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-teal-600 flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-teal-500" />
                          Last Visit: <span className="text-slate-900">{getLastVisit(shop.id)}</span>
                        </p>
                      </div>
                      <ChevronRight className="w-6 h-6 text-slate-200 group-hover:text-teal-500 group-hover:translate-x-1 transition-all" />
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Labeled Floating Bottom Action */}
        <div className="fixed bottom-24 left-0 right-0 px-6 z-40">
          <Button
            onClick={() => {
              haptics.medium();
              setIsAddModalOpen(true);
            }}
            className="max-w-md mx-auto w-full h-16 rounded-[24px] bg-[#0F172A] shadow-2xl shadow-slate-900/30 flex items-center justify-center gap-3 border-none animate-in zoom-in duration-300 active:scale-[0.98] transition-all"
          >
            <Plus className="w-6 h-6 text-teal-400 stroke-[3px]" />
            <span className="text-sm font-black uppercase tracking-[0.2em] text-white">Register New Shop</span>
          </Button>
        </div>

        <ResponsiveModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="Register New Shop"
          description="Enter the shop details to add it to your route"
        >
          <AddShopForm 
            onSuccess={() => setIsAddModalOpen(false)}
            onCancel={() => setIsAddModalOpen(false)}
          />
        </ResponsiveModal>
      </div>
    </PullToRefresh>
  );
}
