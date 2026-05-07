import * as React from 'react';
import { useSalesStore } from '@/store/useSalesStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingBag, ChevronRight, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { AgentPageHeader } from '@/components/navigation/AgentPageHeader';
import { useSwipeBack } from '@/hooks/useSwipeBack';

export default function SalesHistoryPage() {
  const { sales, shops } = useSalesStore();
  const { user } = useAuthStore();
  const [search, setSearch] = React.useState('');
  const navigate = useNavigate();

  useSwipeBack();

  const agentSales = React.useMemo(() => {
    return sales
      .filter(s => s.agentId === user?.uid)
      .sort((a, b) => b.timestamp - a.timestamp);
  }, [sales, user]);

  const filteredSales = React.useMemo(() => {
    return agentSales.filter(sale => {
      const shop = shops.find(s => s.id === sale.shopId);
      return shop?.name.toLowerCase().includes(search.toLowerCase()) || 
             sale.routeName.toLowerCase().includes(search.toLowerCase());
    });
  }, [agentSales, search, shops]);

  return (
    <div className="flex flex-col min-h-full pb-24 pt-[calc(56px+env(safe-area-inset-top))]">
      <AgentPageHeader 
        title="Sales History" 
        showBack 
        backTo="/sales"
      />

      <div className="p-4 space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <Input 
            placeholder="Search by shop or route..." 
            className="pl-10 bg-white border-none shadow-soft h-12 rounded-xl text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="space-y-4">
          {filteredSales.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-border shadow-soft">
              <ShoppingBag className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-text-secondary font-bold">No sales found</p>
            </div>
          ) : (
            filteredSales.map((sale) => {
              const shop = shops.find(s => s.id === sale.shopId);
              return (
                <Card 
                  key={sale.id} 
                  className="border-border shadow-soft bg-white active:bg-slate-50 transition-all cursor-pointer rounded-2xl overflow-hidden"
                  onClick={() => navigate(`/sales/history/${sale.id}`)}
                >
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/5 flex items-center justify-center text-primary">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-black text-text-primary tracking-tight">{shop?.name || 'Unknown Shop'}</p>
                        <span className="text-sm font-black text-primary">Ksh {sale.totalKsh.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-text-secondary font-black uppercase tracking-widest">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" /> {format(sale.timestamp, 'MMM d, h:mm a')}
                        </div>
                        <Badge variant="outline" className="border-border text-[8px] h-5 px-2">
                          {sale.routeName}
                        </Badge>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300" />
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
