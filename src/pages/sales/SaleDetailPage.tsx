import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSalesStore } from '@/store/useSalesStore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Calendar, Store, MapPin, Package, ChevronLeft } from 'lucide-react';
import { format } from 'date-fns';
import { AgentPageHeader } from '@/components/navigation/AgentPageHeader';
import { useSwipeBack } from '@/hooks/useSwipeBack';

export default function SaleDetailPage() {
  const { id } = useParams();
  const { sales, shops, products } = useSalesStore();
  const navigate = useNavigate();

  useSwipeBack();

  const sale = sales.find(s => s.id === id);
  const shop = shops.find(s => s.id === sale?.shopId);

  if (!sale) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <p className="text-text-secondary font-bold mb-4">Sale not found</p>
        <button onClick={() => navigate('/sales/history')} className="text-primary font-black uppercase tracking-widest text-sm">
          Back to History
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full pb-24 pt-[calc(56px+env(safe-area-inset-top))]">
      <AgentPageHeader 
        title="Sale Details" 
        showBack 
        backTo="/sales/history"
      />

      <div className="p-4 space-y-6 animate-in slide-in-from-right duration-300">
        <Card className="bg-white border-border rounded-3xl shadow-soft overflow-hidden">
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-4 border-b border-border pb-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center text-primary">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase text-text-secondary tracking-widest mb-1">Total Amount</p>
                <p className="text-3xl font-black text-primary">Ksh {sale.totalKsh.toLocaleString()}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-text-secondary tracking-widest flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" /> Date & Time
                </p>
                <p className="text-sm font-bold text-text-primary">{format(sale.timestamp, 'MMM d, yyyy')}</p>
                <p className="text-xs text-text-secondary">{format(sale.timestamp, 'h:mm a')}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase text-text-secondary tracking-widest flex items-center gap-1.5">
                  <Store className="w-3 h-3" /> Shop
                </p>
                <p className="text-sm font-bold text-text-primary">{shop?.name || 'Unknown'}</p>
                <p className="text-xs text-text-secondary">{sale.routeName}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-text-secondary px-1">Items Sold</h3>
          <div className="space-y-3">
            {sale.items.map((item, index) => {
              const product = products.find(p => p.sku === item.productId);
              return (
                <Card key={index} className="border-border shadow-soft bg-white rounded-2xl overflow-hidden">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-text-secondary">
                        <Package className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-text-primary">{product?.name || item.productId}</span>
                        <span className="text-[10px] text-text-secondary font-black uppercase tracking-widest">
                          {item.quantityCartons} Ctn, {item.quantityPackets} Pkt
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-text-primary">Ksh {(item.priceKsh * (item.quantityCartons + (item.quantityPackets / (product?.packetsPerCarton || 24)))).toLocaleString()}</p>
                      <p className="text-[10px] text-text-secondary font-medium">Ksh {item.priceKsh}/ctn</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
