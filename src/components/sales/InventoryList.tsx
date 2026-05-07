import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSalesStore } from '@/store/useSalesStore';

export function InventoryList() {
  const { inventory } = useSalesStore();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Inventory</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {inventory.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="font-medium">{item.productName}</p>
                <p className="text-xs text-muted-foreground">{item.productSku}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">{item.quantityCartons} Cartons</p>
                <p className="text-xs text-muted-foreground">{item.quantityPackets} Packets</p>
                {item.quantityCartons < 5 && (
                  <Badge variant="destructive" className="text-[10px]">Low Stock</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
