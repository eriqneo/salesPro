import React, { useState, useMemo, useEffect } from 'react';
import { useSalesStore } from '@/store/useSalesStore';
import { useAdminStore } from '@/store/useAdminStore';
import { 
  Map as MapIcon, 
  Search, 
  Plus, 
  MapPin, 
  Users, 
  ChevronRight, 
  MoreVertical,
  Edit2,
  Trash2,
  Phone,
  Calendar,
  TrendingUp,
  ArrowLeft,
  GripVertical,
  Download,
  Filter,
  Map as MapIconLucide
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Polyline,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { haptics } from '@/lib/haptics';
import { usePageTitle } from '@/hooks/usePageTitle';
import { cn } from '@/lib/utils';
import { Route, Shop } from '@/types';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useBreakpoint } from '@/hooks/useBreakpoint';
import { AdminPageHeader } from '@/components/admin/responsive/AdminPageHeader';
import { DataTable } from '@/components/admin/responsive/DataTable';
import { ResponsiveModal } from '@/components/admin/responsive/ResponsiveModal';

// Fix Leaflet icon issue
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function AdminRoutesShops() {
  usePageTitle('Routes & Shops');
  const { routes, shops, addRoute, updateRoute, deleteRoute, addShop, updateShop, deleteShop } = useSalesStore();
  const { agents } = useAdminStore();
  const { isMobile, isTablet } = useBreakpoint();
  
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddRouteOpen, setIsAddRouteOpen] = useState(false);
  const [isAddShopOpen, setIsAddShopOpen] = useState(false);
  const [selectedShopId, setSelectedShopId] = useState<string | null>(null);
  const [isShopDetailOpen, setIsShopDetailOpen] = useState(false);

  // Auto-select first route on desktop if none selected
  useEffect(() => {
    if (!selectedRouteId && routes.length > 0 && !isMobile) {
      setSelectedRouteId(routes[0].id);
    }
  }, [routes, selectedRouteId, isMobile]);

  const filteredRoutes = useMemo(() => {
    return routes.filter(r => 
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.region.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [routes, searchQuery]);

  const selectedRoute = useMemo(() => 
    routes.find(r => r.id === selectedRouteId), 
    [routes, selectedRouteId]
  );

  const routeShops = useMemo(() => {
    if (!selectedRoute) return [];
    return selectedRoute.shops
      .map(id => shops.find(s => s.id === id))
      .filter((s): s is Shop => !!s);
  }, [selectedRoute, shops]);

  const handleRouteClick = (id: string) => {
    haptics.light();
    setSelectedRouteId(id);
  };

  const showList = !isMobile || (isMobile && !selectedRouteId);
  const showDetail = !isMobile || (isMobile && selectedRouteId);

  return (
    <div className={cn(
      "flex flex-col h-full bg-slate-50 overflow-hidden",
      isMobile ? "" : ""
    )}>
      {showList && (
        <div className={cn(
          "shrink-0",
          isMobile ? "p-4" : isTablet ? "px-6 py-4" : "px-8 py-6"
        )}>
          <AdminPageHeader 
            title="Territories"
            subtitle="Manage sales routes and coverage"
            actions={
              <Button 
                onClick={() => {
                  haptics.light();
                  setIsAddRouteOpen(true);
                }}
                className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] h-11 px-6 shadow-lg shadow-teal-100"
              >
                <Plus className="w-4 h-4 mr-2" /> New Route
              </Button>
            }
          />
        </div>
      )}

      <div className="flex flex-1 overflow-hidden relative">
        {/* Left Panel: Routes List */}
        {showList && (
          <div className={cn(
            "bg-white border-r border-slate-200 flex flex-col shrink-0 transition-all duration-300",
            isMobile ? "w-full" : isTablet ? "w-72" : "w-80"
          )}>
            <div className="p-4 border-b border-slate-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Filter territories..." 
                  className="pl-10 bg-slate-100 border-none h-11 rounded-xl text-sm font-bold"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-hide">
              {filteredRoutes.map(route => (
                <button
                  key={route.id}
                  onClick={() => handleRouteClick(route.id)}
                  className={cn(
                    "w-full text-left p-4 rounded-2xl transition-all duration-200 group relative overflow-hidden",
                    selectedRouteId === route.id 
                      ? "bg-teal-50 shadow-sm ring-1 ring-teal-100" 
                      : "hover:bg-slate-50"
                  )}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <div 
                        className={cn(
                          "w-2.5 h-2.5 rounded-full",
                          selectedRouteId === route.id && "animate-pulse"
                        )}
                        style={{ backgroundColor: route.color || '#0D9488' }} 
                      />
                      <h3 className={cn(
                        "font-black tracking-tight",
                        selectedRouteId === route.id ? "text-teal-900" : "text-slate-900"
                      )}>{route.name}</h3>
                    </div>
                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-wider bg-white/50 border-slate-200 text-slate-500">
                      {route.region}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400">
                      <MapPin className="w-3 h-3" />
                      {route.shops.length} Hubs
                    </div>
                    <div className="flex -space-x-1.5">
                      {route.assignedAgents?.slice(0, 3).map(agentId => {
                        const agent = agents.find(a => a.uid === agentId);
                        return (
                          <div 
                            key={agentId}
                            className="w-7 h-7 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[9px] font-black text-slate-600 shadow-sm"
                            title={agent?.name}
                          >
                            {agent?.name.charAt(0)}
                          </div>
                        );
                      })}
                      {(route.assignedAgents?.length || 0) > 3 && (
                        <div className="w-7 h-7 rounded-full border-2 border-white bg-teal-50 flex items-center justify-center text-[9px] font-black text-teal-600">
                          +{(route.assignedAgents?.length || 0) - 3}
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronRight className={cn(
                    "absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 transition-all opacity-0",
                    selectedRouteId === route.id ? "opacity-100 translate-x-0" : "group-hover:opacity-40 group-hover:translate-x-1"
                  )} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Right Panel: Route Detail */}
        {showDetail && (
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-50">
            {selectedRoute ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <div className={cn(
                  "bg-white border-b border-slate-200 flex justify-between items-center shrink-0",
                  isMobile ? "p-4" : "p-6 px-8"
                )}>
                  <div className="flex items-center gap-4">
                    {isMobile && (
                      <Button variant="ghost" size="icon" onClick={() => setSelectedRouteId(null)} className="rounded-xl">
                        <ArrowLeft className="w-5 h-5 text-slate-600" />
                      </Button>
                    )}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className={cn(
                          "font-black tracking-tight text-slate-900",
                          isMobile ? "text-xl" : "text-2xl"
                        )}>{selectedRoute.name}</h2>
                        <Badge className="bg-teal-50 text-teal-600 border-none text-[10px] font-black uppercase tracking-widest hidden sm:flex">
                          {selectedRoute.region}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-400 font-bold">
                        <div className="flex items-center gap-1.5 uppercase tracking-widest">
                          <Users className="w-3.5 h-3.5" />
                          {selectedRoute.assignedAgents?.length || 0} Agents
                        </div>
                        <div className="flex items-center gap-1.5 uppercase tracking-widest hidden md:flex">
                          <Calendar className="w-3.5 h-3.5" />
                          Last: {format(Date.now() - 86400000, 'MMM d')}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 md:gap-8">
                    {!isMobile && (
                      <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Avg Sales / Day</p>
                        <p className="text-xl font-black text-teal-600">Ksh 8,450</p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" className="rounded-xl border-slate-200 transition-all hover:bg-teal-50 hover:text-teal-600">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="icon" className="rounded-xl border-slate-200 text-rose-600 hover:bg-rose-50 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Content Area */}
                <div className={cn(
                  "flex-1 overflow-y-auto space-y-6",
                  isMobile ? "p-4" : "p-8"
                )}>
                  {/* Map Section */}
                  <Card className="border-slate-200 shadow-soft rounded-[32px] overflow-hidden bg-white">
                    <div className={cn(
                      "relative group/map",
                      isMobile ? "h-[350px]" : "h-[450px]"
                    )}>
                      {/* Premium Overlay for Glassy Feel */}
                      <div className="absolute inset-0 border-[12px] border-white pointer-events-none z-[1000] rounded-[32px]" />
                      
                      <MapContainer 
                        center={[-1.286389, 36.817223]} 
                        zoom={13} 
                        className="h-full w-full z-0"
                        zoomControl={false}
                      >
                        <TileLayer
                          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                        />
                        {routeShops.map(shop => (
                          <Marker 
                            key={shop.id} 
                            position={[shop.location.lat, shop.location.lng]}
                            icon={L.divIcon({
                              className: 'custom-div-icon',
                              html: `<div style="background-color: ${shop.lastVisited && (Date.now() - shop.lastVisited < 604800000) ? '#0D9488' : '#94A3B8'}; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);"></div>`,
                              iconSize: [16, 16],
                              iconAnchor: [8, 8]
                            })}
                          >
                            <Popup className="premium-popup">
                              <div className="p-4 min-w-[200px] space-y-4">
                                <div>
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                                    <h4 className="font-black text-slate-900 leading-tight tracking-tight">{shop.name}</h4>
                                  </div>
                                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest pl-3.5">{shop.ownerName}</p>
                                </div>
                                <div className="space-y-2 py-3 border-y border-slate-50">
                                  <div className="flex justify-between items-center text-[11px] font-bold">
                                    <span className="text-slate-400">Volume Level:</span>
                                    <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest bg-slate-50 border-none text-slate-600">Premium</Badge>
                                  </div>
                                  <div className="flex justify-between items-center text-[11px] font-bold">
                                    <span className="text-slate-400">Last Sale:</span>
                                    <span className="text-teal-600 font-black">Ksh {shop.lastSaleAmount?.toLocaleString()}</span>
                                  </div>
                                </div>
                                <Button 
                                  size="sm" 
                                  className="w-full h-10 rounded-xl bg-slate-900 border-none font-black uppercase tracking-widest text-[10px] shadow-lg shadow-slate-200"
                                  onClick={() => {
                                    setSelectedShopId(shop.id);
                                    setIsShopDetailOpen(true);
                                  }}
                                >
                                  Open Command Profile
                                </Button>
                              </div>
                            </Popup>
                          </Marker>
                        ))}
                        {routeShops.length > 1 && (
                          <Polyline 
                            positions={routeShops.map(s => [s.location.lat, s.location.lng])} 
                            color={selectedRoute.color || '#0D9488'}
                            weight={4}
                            opacity={0.3}
                            dashArray="1, 10"
                            lineCap="round"
                          />
                        )}
                        <MapUpdater center={routeShops[0] ? [routeShops[0].location.lat, routeShops[0].location.lng] : [-1.286389, 36.817223]} />
                      </MapContainer>
                      
                      {/* Floating Controls */}
                      <div className="absolute top-8 right-8 z-[1001] flex flex-col gap-2">
                        <Button size="icon" className="w-12 h-12 bg-white/90 backdrop-blur-md text-slate-900 hover:text-teal-600 rounded-2xl shadow-2xl border border-white transition-all hover:scale-110 active:scale-95">
                          <MapIconLucide className="w-6 h-6" />
                        </Button>
                      </div>

                      {/* Map Status Indicator */}
                      <div className="absolute bottom-8 left-8 z-[1001] pointer-events-none">
                        <div className="bg-white/90 backdrop-blur-md border border-white p-4 rounded-2xl shadow-2xl flex items-center gap-3">
                          <div className="flex -space-x-2">
                            {routeShops.slice(0, 3).map((s, i) => (
                              <div key={s.id} className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[8px] font-black">{s.name[0]}</div>
                            ))}
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-900 leading-none">{routeShops.length} Hubs Linked</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real-time telemetry active</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>

                {/* Shops List Section */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-4 md:px-0">
                    <h3 className="text-lg font-black tracking-tight text-slate-900">Hubs Coverage</h3>
                    <Button 
                      onClick={() => {
                        haptics.light();
                        setIsAddShopOpen(true);
                      }}
                      className="rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-[10px] uppercase tracking-widest px-6 h-10 shadow-md shadow-teal-100"
                    >
                      <Plus className="w-4 h-4 mr-2" /> Link Hub
                    </Button>
                  </div>
                  
                  <Card className="border-slate-200 shadow-soft rounded-[32px] overflow-hidden bg-white">
                    <DataTable 
                      columns={[
                        {
                          id: 'order',
                          header: '#',
                          accessor: (_, i) => <span className="font-bold text-slate-400">{i + 1}</span>,
                          showOnTablet: true
                        },
                        {
                          id: 'shop',
                          header: 'Hub Name',
                          accessor: (shop) => (
                            <div>
                              <p className="font-bold text-slate-900">{shop.name}</p>
                              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{shop.ownerName}</p>
                            </div>
                          ),
                          showOnTablet: true
                        },
                        {
                          id: 'contact',
                          header: 'Phone',
                          accessor: (shop) => <span className="font-bold text-slate-600">{shop.phoneNumber}</span>,
                          showOnTablet: false
                        },
                        {
                          id: 'last_sale',
                          header: 'Last Sale',
                          accessor: (shop) => <span className="font-black text-teal-600 italic">Ksh {shop.lastSaleAmount?.toLocaleString()}</span>,
                          showOnTablet: true
                        },
                        {
                          id: 'status',
                          header: 'Status',
                          accessor: (shop) => (
                            <Badge className={cn(
                              "rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border-none",
                              shop.status === 'active' ? 'bg-emerald-50 text-emerald-600' : 
                              shop.status === 'new' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'
                            )}>
                              {shop.status}
                            </Badge>
                          ),
                          showOnTablet: true
                        },
                        {
                          id: 'actions',
                          header: '',
                          accessor: (shop) => (
                            <div className="flex justify-end pr-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="rounded-lg h-8 w-8 text-slate-400 hover:text-teal-600 hover:bg-teal-50"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedShopId(shop.id);
                                  setIsShopDetailOpen(true);
                                }}
                              >
                                <ChevronRight className="w-4 h-4" />
                              </Button>
                            </div>
                          ),
                          showOnTablet: true
                        }
                      ]}
                      data={routeShops}
                      mobileCardRenderer={(shop) => (
                        <div 
                          className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between"
                          onClick={() => {
                            setSelectedShopId(shop.id);
                            setIsShopDetailOpen(true);
                          }}
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-teal-600 border border-slate-100 italic font-black">
                              {shop.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-black text-slate-900 text-sm leading-tight">{shop.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">{shop.ownerName}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-teal-600 text-sm italic">Ksh {shop.lastSaleAmount?.toLocaleString()}</p>
                            <Badge className="rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-widest border-none mt-1 bg-slate-50 text-slate-400">
                              {shop.status}
                            </Badge>
                          </div>
                        </div>
                      )}
                    />
                  </Card>
                </div>
              </div>
            </div>
          ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-12 bg-white m-8 rounded-[32px] border-2 border-dashed border-slate-100">
                <div className="w-24 h-24 bg-slate-50 rounded-[32px] flex items-center justify-center mb-6 shadow-inner">
                  <MapIcon className="w-10 h-10 text-slate-200" />
                </div>
                <h3 className="font-black text-xl text-slate-900 tracking-tight">Select Territory</h3>
                <p className="text-sm font-medium text-center max-w-xs mt-2">Initialize a region from the side panel to view specific hubs and performance metrics.</p>
                <Button 
                  variant="outline" 
                  className="mt-8 rounded-xl border-slate-200 font-bold uppercase tracking-widest text-[10px]"
                  onClick={() => isMobile && setSelectedRouteId(null)}
                >
                  Explore Mapping Engine
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Shop Detail Drawer */}
      <ShopDetailDrawer 
        shopId={selectedShopId} 
        isOpen={isShopDetailOpen} 
        onClose={() => setIsShopDetailOpen(false)} 
      />

      {/* Add Route Modal */}
      <AddRouteModal 
        isOpen={isAddRouteOpen} 
        onClose={() => setIsAddRouteOpen(false)} 
      />

      {/* Add Shop Modal */}
      <AddShopModal 
        isOpen={isAddShopOpen} 
        onClose={() => setIsAddShopOpen(false)} 
      />
    </div>
  );
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, [center, map]);
  return null;
}

function AddShopModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { routes } = useSalesStore();
  const [formData, setFormData] = useState({
    name: '',
    ownerName: '',
    phoneNumber: '',
    region: 'Central',
    routeName: '',
    lat: -1.286389,
    lng: 36.817223,
    status: 'active' as const
  });

  const handleSubmit = () => {
    haptics.success();
    toast.success('Shop added successfully');
    onClose();
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="Link New Hub"
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2.5">
            <Label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Hub Name</Label>
            <Input 
              placeholder="e.g. Riverside Mart" 
              className="h-12 rounded-xl bg-slate-50 border-slate-200 font-bold"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          <div className="space-y-2.5">
            <Label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Primary Owner</Label>
            <Input 
              placeholder="e.g. Jane Doe" 
              className="h-12 rounded-xl bg-slate-50 border-slate-200 font-bold"
              value={formData.ownerName}
              onChange={e => setFormData({...formData, ownerName: e.target.value})}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2.5">
            <Label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Contact Phone</Label>
            <Input 
              placeholder="07..." 
              className="h-12 rounded-xl bg-slate-50 border-slate-200 font-bold"
              value={formData.phoneNumber}
              onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
            />
          </div>
          <div className="space-y-2.5">
            <Label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Vetting Status</Label>
            <select 
              className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm outline-none focus:ring-2 focus:ring-teal-500 appearance-none"
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value as any})}
            >
              <option value="active">Verified (Active)</option>
              <option value="inactive">Suspended</option>
              <option value="new">Prospect (New)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2.5">
            <Label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Region</Label>
            <select 
              className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm outline-none focus:ring-2 focus:ring-teal-500 appearance-none"
              value={formData.region}
              onChange={e => setFormData({...formData, region: e.target.value})}
            >
              <option>Central</option>
              <option>Coast</option>
              <option>Western</option>
            </select>
          </div>
          <div className="space-y-2.5">
            <Label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Territory Binding</Label>
            <select 
              className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm outline-none focus:ring-2 focus:ring-teal-500 appearance-none"
              value={formData.routeName}
              onChange={e => setFormData({...formData, routeName: e.target.value})}
            >
              <option value="">No Direct Binding</option>
              {routes.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-2.5">
          <Label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Geographical Coordinates (Lat/Lng)</Label>
          <div className="grid grid-cols-2 gap-4">
            <Input 
              type="number"
              placeholder="Lat" 
              className="h-12 rounded-xl bg-slate-50 border-slate-200 font-bold"
              value={formData.lat}
              onChange={e => setFormData({...formData, lat: parseFloat(e.target.value)})}
            />
            <Input 
              type="number"
              placeholder="Lng" 
              className="h-12 rounded-xl bg-slate-50 border-slate-200 font-bold"
              value={formData.lng}
              onChange={e => setFormData({...formData, lng: parseFloat(e.target.value)})}
            />
          </div>
        </div>

        <div className="pt-4 space-y-3">
          <Button onClick={handleSubmit} className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] h-12 shadow-lg shadow-teal-100">
            Confirm Territory Link
          </Button>
          <Button onClick={onClose} variant="ghost" className="w-full h-10 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Cancel
          </Button>
        </div>
      </div>
    </ResponsiveModal>
  );
}

function ShopDetailDrawer({ shopId, isOpen, onClose }: { shopId: string | null, isOpen: boolean, onClose: () => void }) {
  const { shops } = useSalesStore();
  const shop = shops.find(s => s.id === shopId);

  if (!shop) return null;

  const visitHistory = [
    { date: Date.now() - 86400000, agent: 'John Kamau', sales: 4500, products: 'Tea, Coffee' },
    { date: Date.now() - 259200000, agent: 'John Kamau', sales: 3200, products: 'Tea' },
    { date: Date.now() - 432000000, agent: 'John Kamau', sales: 5100, products: 'Coffee, Ginger' },
  ];

  const salesData = [
    { name: 'V1', sales: 4000 },
    { name: 'V2', sales: 3000 },
    { name: 'V3', sales: 2000 },
    { name: 'V4', sales: 2780 },
    { name: 'V5', sales: 1890 },
    { name: 'V6', sales: 2390 },
    { name: 'V7', sales: 3490 },
    { name: 'V8', sales: 2000 },
    { name: 'V9', sales: 3000 },
    { name: 'V10', sales: 4500 },
    { name: 'V11', sales: 3200 },
    { name: 'V12', sales: 5100 },
  ];

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="Hub Performance Profile"
    >
      <div className="space-y-8 pb-4">
        <div className="relative p-6 bg-slate-900 rounded-[32px] overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 blur-3xl rounded-full" />
          <div className="relative z-10 flex justify-between items-start">
            <div className="space-y-4">
              <Badge className="bg-teal-500/20 text-teal-400 border-none rounded-full px-3 py-0.5 text-[10px] font-black uppercase tracking-widest">
                {shop.status} Hub
              </Badge>
              <div>
                <h3 className="text-3xl font-black text-white tracking-tight">{shop.name}</h3>
                <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest mt-1">
                  Manager: {shop.ownerName}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="rounded-xl h-10 w-10 border-white/10 bg-white/5 text-white hover:bg-white/10 transition-colors">
                <Edit2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-5 rounded-[24px] border border-slate-100 shadow-inner space-y-1">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">Last Transaction</p>
            <p className="text-lg font-black text-slate-900 tracking-tight">Ksh {shop.lastSaleAmount?.toLocaleString()}</p>
          </div>
          <div className="bg-slate-50 p-5 rounded-[24px] border border-slate-100 shadow-inner space-y-1">
            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">Primary Route</p>
            <p className="text-lg font-black text-slate-900 tracking-tight truncate">{shop.routeName}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center px-1">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Revenue Momentum</h4>
            <Badge className="bg-emerald-50 text-emerald-600 border-none text-[10px] font-black">+14.2%</Badge>
          </div>
          <div className="h-44 w-full bg-slate-50 rounded-[24px] p-5 border border-slate-100 relative shadow-inner overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" strokeOpacity={0.5} />
                <XAxis dataKey="name" hide />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', padding: '12px' }}
                  itemStyle={{ fontWeight: '900', fontSize: '12px', color: '#0F172A' }}
                />
                <Bar dataKey="sales" fill="#0D9488" radius={[4, 4, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Engagement Log</h4>
          <div className="space-y-3">
            {visitHistory.slice(0, 2).map((visit, i) => (
              <div key={i} className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex justify-between items-center group hover:border-teal-200 transition-all">
                <div className="flex gap-4 items-center">
                  <div className="w-11 h-11 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-400 font-black text-[11px]">
                    {format(visit.date, 'dd')}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">{format(visit.date, 'MMM yyyy')}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none mt-1">Visit by {visit.agent}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-teal-600">Ksh {visit.sales.toLocaleString()}</p>
                  <p className="text-[9px] text-slate-300 font-bold uppercase tracking-widest leading-none mt-1">{visit.products}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 flex flex-col gap-3">
          <Button className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[11px] shadow-xl shadow-slate-200">
            Export Detailed Analytics
          </Button>
          <Button variant="ghost" className="w-full h-12 rounded-2xl text-rose-500 font-black uppercase tracking-widest text-[10px] hover:bg-rose-50">
            Unlink from Territory
          </Button>
        </div>
      </div>
    </ResponsiveModal>
  );
}

function AddRouteModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const { agents } = useAdminStore();
  const [formData, setFormData] = useState({
    name: '',
    region: 'Central',
    color: '#0D9488',
    assignedAgents: [] as string[]
  });

  const handleSubmit = () => {
    haptics.success();
    toast.success('Route created successfully');
    onClose();
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Territory"
    >
      <div className="space-y-6">
        <div className="space-y-2.5">
          <Label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Route Label</Label>
          <Input 
            placeholder="e.g. Westlands Main Loop" 
            className="h-12 rounded-xl bg-slate-50 border-slate-200 font-black text-sm tracking-tight"
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2.5">
            <Label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Region Anchor</Label>
            <select 
              className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 font-bold text-sm outline-none focus:ring-2 focus:ring-teal-500 appearance-none"
              value={formData.region}
              onChange={e => setFormData({...formData, region: e.target.value})}
            >
              <option>Central</option>
              <option>Coast</option>
              <option>Western</option>
              <option>Rift Valley</option>
            </select>
          </div>
          <div className="space-y-2.5">
            <Label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Map Color</Label>
            <div className="flex gap-2 h-12 items-center px-1">
              {['#0D9488', '#2563EB', '#7C3AED', '#DB2777', '#EA580C'].map(c => (
                <button
                  key={c}
                  onClick={() => setFormData({...formData, color: c})}
                  className={cn(
                    "w-7 h-7 rounded-full border-4 transition-all",
                    formData.color === c ? "border-slate-100 scale-125 shadow-md shadow-slate-200" : "border-transparent scale-90"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-2.5">
          <Label className="text-[10px] font-black text-slate-400 ml-1 uppercase tracking-widest">Operational Agents</Label>
          <div className="space-y-2 max-h-48 overflow-y-auto p-3 bg-slate-50 rounded-2xl border border-slate-100 shadow-inner">
            {agents.map(agent => (
              <label key={agent.uid} className="flex items-center gap-3 p-3 bg-white hover:bg-teal-50 rounded-xl cursor-pointer transition-all border border-transparent hover:border-teal-100 group shadow-sm">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 rounded-lg border-slate-200 text-teal-600 focus:ring-teal-500"
                  checked={formData.assignedAgents.includes(agent.uid)}
                  onChange={e => {
                    const newAgents = e.target.checked 
                      ? [...formData.assignedAgents, agent.uid]
                      : formData.assignedAgents.filter(id => id !== agent.uid);
                    setFormData({...formData, assignedAgents: newAgents});
                  }}
                />
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500 group-hover:bg-teal-100 group-hover:text-teal-600 transition-colors shadow-inner">
                    {agent.name.charAt(0)}
                  </div>
                  <span className="text-sm font-black text-slate-900">{agent.name}</span>
                </div>
              </label>
            ))}
          </div>
        </div>
        
        <div className="pt-4 space-y-3">
          <Button onClick={handleSubmit} className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-black uppercase tracking-widest text-[10px] h-12 shadow-lg shadow-teal-100">
            Initialize Territory
          </Button>
          <Button onClick={onClose} variant="ghost" className="w-full h-10 text-[10px] font-black uppercase tracking-widest text-slate-400">
            Cancel
          </Button>
        </div>
      </div>
    </ResponsiveModal>
  );
}
