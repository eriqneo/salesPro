import { create } from 'zustand';
import { useAuthStore } from './useAuthStore';
import { useSalesStore } from './useSalesStore';
import { db } from '@/lib/db';

interface TodayStats {
  calls: number;
  sales: number;
  shopsVisited: number;
  reportSubmitted: boolean;
}

interface AgentState {
  getAgentName: () => string;
  getAgentInitials: () => string;
  getPhotoURL: () => string | undefined;
  getPendingSyncs: () => number;
  getTodayStats: () => TodayStats;
  isLowStock: () => boolean;
  hasUnvisitedShops: () => boolean;
}

export const useAgentStore = create<AgentState>((_set, get) => ({
  getAgentName: () => useAuthStore.getState().user?.name || 'Agent',
  getAgentInitials: () => {
    const name = get().getAgentName();
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  },
  getPhotoURL: () => useAuthStore.getState().user?.photoURL,
  getPendingSyncs: () => 0,
  getTodayStats: () => {
    const sales = useSalesStore.getState().sales;
    const reports = useSalesStore.getState().dailyReports;
    const today = new Date().toISOString().split('T')[0];
    
    const todaySales = sales.filter(s => new Date(s.timestamp).toISOString().split('T')[0] === today);
    const todayReport = reports.find(r => r.date === today);
    
    return {
      calls: todaySales.length,
      sales: todaySales.reduce((acc, s) => acc + s.totalKsh, 0),
      shopsVisited: new Set(todaySales.map(s => s.shopId)).size,
      reportSubmitted: !!todayReport
    };
  },
  isLowStock: () => {
    const inventory = useSalesStore.getState().inventory;
    const products = useSalesStore.getState().products;
    const user = useAuthStore.getState().user;
    if (!user) return false;
    return inventory
      .filter(inv => inv.agentId === user.uid)
      .some(inv => {
        const product = products.find(p => p.sku === inv.productSku);
        if (!product) return false;
        const totalPackets = (inv.quantityCartons * product.packetsPerCarton) + inv.quantityPackets;
        return totalPackets < product.reorderLevel;
      });
  },
  hasUnvisitedShops: () => {
    const shops = useSalesStore.getState().shops;
    const sales = useSalesStore.getState().sales;
    const today = new Date().toISOString().split('T')[0];
    const visitedShopIds = new Set(
      sales
        .filter(s => new Date(s.timestamp).toISOString().split('T')[0] === today)
        .map(s => s.shopId)
    );
    return shops.some(shop => shop.status === 'active' && !visitedShopIds.has(shop.id));
  }
}));
