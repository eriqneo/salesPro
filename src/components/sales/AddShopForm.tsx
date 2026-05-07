import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSalesStore } from '@/store/useSalesStore';
import { toast } from 'sonner';
import { MapPin, User, Phone, Store } from 'lucide-react';

const shopSchema = z.object({
  name: z.string().min(3, 'Shop name must be at least 3 characters'),
  ownerName: z.string().min(3, 'Owner name must be at least 3 characters'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 characters'),
  region: z.string().min(1, 'Region is required'),
  routeName: z.string().min(1, 'Route is required'),
  address: z.string().optional(),
});

type ShopFormValues = z.infer<typeof shopSchema>;

interface AddShopFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AddShopForm({ onSuccess, onCancel }: AddShopFormProps) {
  const { addShop, routes } = useSalesStore();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ShopFormValues>({
    resolver: zodResolver(shopSchema),
    defaultValues: {
      region: '',
      routeName: '',
    },
  });

  const onSubmit = async (data: ShopFormValues) => {
    try {
      // In a real app, we might use geolocation here
      const newShop = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        location: {
          lat: -1.286389, // Default Nairobi coords for demo
          lng: 36.817223,
        },
        status: 'new' as const,
        lastVisited: 0,
        lastSaleAmount: 0,
      };

      addShop(newShop);
      toast.success('Shop added successfully!');
      onSuccess?.();
    } catch (error) {
      toast.error('Failed to add shop. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-xs font-black uppercase tracking-widest text-slate-500">Shop Name</Label>
          <div className="relative">
            <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              id="name"
              placeholder="e.g. Mama Lucy Shop"
              className="pl-10 h-12 rounded-xl border-slate-200 focus:ring-primary shadow-sm"
              {...register('name')}
            />
          </div>
          {errors.name && <p className="text-xs text-red-500 font-bold">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="ownerName" className="text-xs font-black uppercase tracking-widest text-slate-500">Owner Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              id="ownerName"
              placeholder="e.g. Lucy Wanjiku"
              className="pl-10 h-12 rounded-xl border-slate-200 focus:ring-primary shadow-sm"
              {...register('ownerName')}
            />
          </div>
          {errors.ownerName && <p className="text-xs text-red-500 font-bold">{errors.ownerName.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber" className="text-xs font-black uppercase tracking-widest text-slate-500">Phone Number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              id="phoneNumber"
              placeholder="07XX XXX XXX"
              className="pl-10 h-12 rounded-xl border-slate-200 focus:ring-primary shadow-sm"
              {...register('phoneNumber')}
            />
          </div>
          {errors.phoneNumber && <p className="text-xs text-red-500 font-bold">{errors.phoneNumber.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Region</Label>
            <Select onValueChange={(val: string) => setValue('region', val)}>
              <SelectTrigger className="h-12 rounded-xl border-slate-200 shadow-sm">
                <SelectValue placeholder="Select Region" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Central">Central</SelectItem>
                <SelectItem value="Coast">Coast</SelectItem>
                <SelectItem value="Western">Western</SelectItem>
                <SelectItem value="Rift Valley">Rift Valley</SelectItem>
              </SelectContent>
            </Select>
            {errors.region && <p className="text-xs text-red-500 font-bold">{errors.region.message}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-widest text-slate-500">Route</Label>
            <Select onValueChange={(val: string) => setValue('routeName', val)}>
              <SelectTrigger className="h-12 rounded-xl border-slate-200 shadow-sm">
                <SelectValue placeholder="Select Route" />
              </SelectTrigger>
              <SelectContent>
                {routes.map(route => (
                  <SelectItem key={route.id} value={route.name}>{route.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.routeName && <p className="text-xs text-red-500 font-bold">{errors.routeName.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address" className="text-xs font-black uppercase tracking-widest text-slate-500">Physical Address (Optional)</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              id="address"
              placeholder="e.g. Near Junction Mall"
              className="pl-10 h-12 rounded-xl border-slate-200 focus:ring-primary shadow-sm"
              {...register('address')}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 pt-4">
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full h-14 rounded-2xl bg-gradient-brand border-none text-base font-black shadow-lg shadow-primary/20 active:scale-95 transition-transform"
        >
          {isSubmitting ? 'Creating...' : 'Register Shop'}
        </Button>
        <Button 
          type="button" 
          variant="ghost" 
          onClick={onCancel}
          className="w-full h-12 rounded-xl text-slate-500 font-bold"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
