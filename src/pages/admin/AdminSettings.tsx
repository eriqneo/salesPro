import React, { useState } from 'react';
import { useSalesStore } from '@/store/useSalesStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  Package, 
  Map, 
  Plus, 
  Save, 
  Trash2,
  Edit2
} from 'lucide-react';
import { toast } from 'sonner';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function AdminSettings() {
  usePageTitle('Registry Configuration');
  const { products, addProduct, updateProduct, routes, shops } = useSalesStore();
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    packetsPerCarton: 24,
    basePriceKsh: 0,
    costPriceKsh: 0,
    reorderLevel: 50,
    category: '',
    status: 'active' as const
  });

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.sku) return;
    addProduct({
      ...newProduct,
      id: Math.random().toString(36).substr(2, 9)
    });
    setIsAddingProduct(false);
    setNewProduct({ 
      name: '', 
      sku: '', 
      packetsPerCarton: 24, 
      basePriceKsh: 0, 
      costPriceKsh: 0,
      reorderLevel: 50,
      category: '',
      status: 'active'
    });
    toast.success('Product registered in sovereign registry');
  };

  return (
    <div className="p-10 space-y-12 max-w-7xl mx-auto">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">System Registry</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Architectural configuration & asset management</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="h-12 rounded-2xl border-slate-200 font-black uppercase tracking-widest text-[10px] px-6">
            Cloud Sync
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12">
        <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[40px] overflow-hidden bg-white">
          <CardHeader className="flex flex-row items-center justify-between p-10 bg-slate-50/50 border-b border-slate-100">
            <div>
              <CardTitle className="flex items-center gap-3 text-2xl font-black text-slate-900 tracking-tight">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-teal-400">
                  <Package className="w-5 h-5" />
                </div>
                Master Asset List
              </CardTitle>
              <CardDescription className="font-bold text-slate-400 uppercase tracking-widest text-[10px] mt-2 ml-13">Primary product catalogue across all territories</CardDescription>
            </div>
            <Button 
              onClick={() => setIsAddingProduct(true)}
              className="h-12 px-8 rounded-2xl bg-teal-500 hover:bg-teal-400 text-white font-black uppercase tracking-[0.2em] text-xs shadow-xl shadow-teal-500/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4 mr-2" /> Register New Asset
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-slate-100">
                  <TableHead className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Designation</TableHead>
                  <TableHead className="py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">SKU</TableHead>
                  <TableHead className="py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Pkt/Ctn</TableHead>
                  <TableHead className="py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Listing Price</TableHead>
                  <TableHead className="py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Classification</TableHead>
                  <TableHead className="px-10 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-right">Ops</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isAddingProduct && (
                  <TableRow className="bg-slate-50/50">
                    <TableCell className="px-10 py-6"><Input placeholder="Product Name" className="h-11 rounded-xl bg-white border-slate-100 font-bold" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} /></TableCell>
                    <TableCell className="py-6"><Input placeholder="SKU-XXX" className="h-11 rounded-xl bg-white border-slate-100 font-mono font-black" value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} /></TableCell>
                    <TableCell className="py-6"><Input type="number" className="h-11 rounded-xl bg-white border-slate-100 font-black w-24" value={newProduct.packetsPerCarton} onChange={e => setNewProduct({...newProduct, packetsPerCarton: parseInt(e.target.value)})} /></TableCell>
                    <TableCell className="py-6"><Input type="number" className="h-11 rounded-xl bg-white border-slate-100 font-black w-32" value={newProduct.basePriceKsh} onChange={e => setNewProduct({...newProduct, basePriceKsh: parseInt(e.target.value)})} /></TableCell>
                    <TableCell className="py-6"><Input placeholder="Category" className="h-11 rounded-xl bg-white border-slate-100 font-bold" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} /></TableCell>
                    <TableCell className="px-10 py-6 text-right">
                      <div className="flex justify-end gap-3">
                        <Button size="sm" variant="ghost" className="h-11 rounded-xl font-bold px-4" onClick={() => setIsAddingProduct(false)}>Cancel</Button>
                        <Button size="sm" className="h-11 rounded-xl bg-slate-900 text-white font-black uppercase tracking-widest px-6" onClick={handleAddProduct}>Commit</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {products.map((product) => (
                  <TableRow key={product.id} className="hover:bg-slate-50/30 transition-colors border-slate-100 group">
                    <TableCell className="px-10 py-6 font-black text-slate-900">{product.name}</TableCell>
                    <TableCell className="py-6 font-mono text-[11px] font-black text-slate-400">{product.sku}</TableCell>
                    <TableCell className="py-6 font-bold">{product.packetsPerCarton}</TableCell>
                    <TableCell className="py-6 font-black text-teal-600">Ksh {product.basePriceKsh.toLocaleString()}</TableCell>
                    <TableCell className="py-6 font-bold text-slate-400 uppercase text-[10px] tracking-widest">{product.category}</TableCell>
                    <TableCell className="px-10 py-6 text-right">
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"><Edit2 className="w-4 h-4 text-slate-400" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="w-5 h-5" />
                Routes & Coverage
              </CardTitle>
              <CardDescription>Active routes and shop distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {routes.map(route => (
                  <div key={route.id} className="p-4 bg-slate-50 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="font-bold">{route.name}</p>
                      <p className="text-xs text-muted-foreground">{route.region}</p>
                    </div>
                    <Badge variant="secondary">{route.shops.length} Shops</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>Global application settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Default Region</label>
                <Input defaultValue="Central" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Currency Symbol</label>
                <Input defaultValue="Ksh" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Low Stock Threshold (Cartons)</label>
                <Input type="number" defaultValue="5" />
              </div>
              <Button className="w-full">
                <Save className="w-4 h-4 mr-2" /> Save Global Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
