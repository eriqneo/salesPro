import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSalesStore } from '@/store/useSalesStore';
import { useAuthStore } from '@/store/useAuthStore';

export function SaleForm() {
  const [selectedShopId, setSelectedShopId] = useState('');
  const [items, setItems] = useState([{ productId: '', quantityCartons: 0, quantityPackets: 0 }]);
  const { inventory, shops, recordSale } = useSalesStore();
  const { user } = useAuthStore();

  const addItem = () => setItems([...items, { productId: '', quantityCartons: 0, quantityPackets: 0 }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !selectedShopId) return;

    const saleItems = items.map(item => {
      const invItem = inventory.find(p => p.productSku === item.productId);
      return {
        productId: item.productId,
        quantityCartons: item.quantityCartons,
        quantityPackets: item.quantityPackets,
        priceKsh: invItem?.unitCostKsh || 0
      };
    });

    const totalKsh = saleItems.reduce((sum, item) => sum + (item.quantityCartons * item.priceKsh), 0);

    recordSale({
      id: Math.random().toString(36).substr(2, 9),
      agentId: user.uid,
      shopId: selectedShopId,
      items: saleItems,
      totalKsh,
      routeName: 'Route A', // Mock for now
      timestamp: Date.now(),
      syncStatus: 'synced'
    });

    toast.success('Sale recorded successfully!');
    setSelectedShopId('');
    setItems([{ productId: '', quantityCartons: 0, quantityPackets: 0 }]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Record New Sale</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shop">Select Shop</Label>
            <Select required onValueChange={setSelectedShopId} value={selectedShopId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a shop" />
              </SelectTrigger>
              <SelectContent>
                {shops.map(s => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label>Items</Label>
            {items.map((item, index) => (
              <div key={index} className="space-y-2 p-3 border rounded-lg bg-slate-50">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Select 
                      required 
                      onValueChange={(val) => {
                        const newItems = [...items];
                        newItems[index].productId = val;
                        setItems(newItems);
                      }}
                      value={item.productId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Product" />
                      </SelectTrigger>
                      <SelectContent>
                        {inventory.map(p => (
                          <SelectItem key={p.id} value={p.productSku}>{p.productName}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 space-y-1">
                    <Label className="text-[10px]">Cartons</Label>
                    <Input 
                      type="number" 
                      min="0" 
                      value={item.quantityCartons}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[index].quantityCartons = parseInt(e.target.value) || 0;
                        setItems(newItems);
                      }}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <Label className="text-[10px]">Packets</Label>
                    <Input 
                      type="number" 
                      min="0" 
                      value={item.quantityPackets}
                      onChange={(e) => {
                        const newItems = [...items];
                        newItems[index].quantityPackets = parseInt(e.target.value) || 0;
                        setItems(newItems);
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button type="button" variant="outline" size="sm" className="w-full" onClick={addItem}>
              <Plus className="w-4 h-4 mr-2" /> Add Item
            </Button>
          </div>

          <Button type="submit" className="w-full">Complete Sale</Button>
        </form>
      </CardContent>
    </Card>
  );
}
