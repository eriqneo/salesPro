import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  Sale, 
  Distributor, 
  Shop, 
  DailyReport, 
  Route,
  InventoryItem,
  Product,
  InventoryLog
} from '@/types';
import { syncManager } from '@/services/syncManager';

interface SalesState {
  products: Product[];
  inventory: InventoryItem[];
  inventoryLogs: InventoryLog[];
  sales: Sale[];
  distributors: Distributor[];
  shops: Shop[];
  dailyReports: DailyReport[];
  routes: Route[];
  
  // Actions
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  addInventory: (item: InventoryItem) => void;
  recordSale: (sale: Sale) => void;
  addShop: (shop: Shop) => void;
  updateShop: (shop: Shop) => void;
  deleteShop: (shopId: string) => void;
  addRoute: (route: Route) => void;
  updateRoute: (route: Route) => void;
  deleteRoute: (routeId: string) => void;
  addDistributor: (distributor: Distributor) => void;
  updateDistributor: (distributor: Distributor) => void;
  deleteDistributor: (distributorId: string) => void;
  submitReport: (report: DailyReport) => void;
  adjustInventory: (agentId: string, productSku: string, cartons: number, packets: number, type: 'addition' | 'deduction' | 'adjustment', reason?: string) => void;
  addReportComment: (reportId: string, comment: { text: string; adminName: string; timestamp: number }) => void;
}

export const useSalesStore = create<SalesState>()(
  persist(
    (set) => ({
      products: [
        { id: 'p1', name: 'Premium Tea 50g', sku: 'TEA-50G', packetsPerCarton: 24, basePriceKsh: 150, costPriceKsh: 120, reorderLevel: 50, category: 'Tea', status: 'active' },
        { id: 'p2', name: 'Classic Coffee 100g', sku: 'COF-100G', packetsPerCarton: 12, basePriceKsh: 450, costPriceKsh: 380, reorderLevel: 30, category: 'Coffee', status: 'active' },
        { id: 'p3', name: 'Ginger Tea 25g', sku: 'TEA-G25', packetsPerCarton: 48, basePriceKsh: 80, costPriceKsh: 60, reorderLevel: 100, category: 'Tea', status: 'active' },
      ],
      inventory: [
        { id: 'i1', agentId: 'a1', productName: 'Premium Tea 50g', productSku: 'TEA-50G', quantityCartons: 65, quantityPackets: 0, unitCostKsh: 120, addedAt: Date.now(), distributorId: 'd1', expiryDate: '2025-12-31' },
        { id: 'i2', agentId: 'a1', productName: 'Classic Coffee 100g', productSku: 'COF-100G', quantityCartons: 15, quantityPackets: 5, unitCostKsh: 380, addedAt: Date.now(), distributorId: 'd1', expiryDate: '2025-10-15' },
        { id: 'i3', agentId: 'a2', productName: 'Premium Tea 50g', productSku: 'TEA-50G', quantityCartons: 5, quantityPackets: 10, unitCostKsh: 120, addedAt: Date.now(), distributorId: 'd1', expiryDate: '2025-12-31' },
        { id: 'i4', agentId: 'a2', productName: 'Ginger Tea 25g', productSku: 'TEA-G25', quantityCartons: 120, quantityPackets: 0, unitCostKsh: 60, addedAt: Date.now(), distributorId: 'd1', expiryDate: '2026-06-20' },
      ],
      inventoryLogs: [
        { id: 'l1', agentId: 'a1', productId: 'TEA-50G', type: 'addition', quantityCartons: 65, quantityPackets: 0, referenceId: 'd1', timestamp: Date.now() - 86400000, balanceAfter: { cartons: 65, packets: 0 } },
        { id: 'l2', agentId: 'a1', productId: 'COF-100G', type: 'addition', quantityCartons: 15, quantityPackets: 5, referenceId: 'd1', timestamp: Date.now() - 172800000, balanceAfter: { cartons: 15, packets: 5 } },
      ],
      sales: [],
      distributors: [
        { 
          id: 'd1', 
          name: 'Main Warehouse Nairobi', 
          location: 'Industrial Area, Road A', 
          region: 'Central', 
          contactPerson: 'James Omondi',
          phone: '0712345678', 
          email: 'nairobi.warehouse@example.com',
          linkedProducts: ['p1', 'p2', 'p3'],
          createdAt: Date.now() - 1000 * 60 * 60 * 24 * 365 
        },
        { 
          id: 'd2', 
          name: 'Mombasa Coastal Supplies', 
          location: 'Mombasa Port Area', 
          region: 'Coast', 
          contactPerson: 'Fatuma Ali',
          phone: '0722334455', 
          email: 'mombasa.supplies@example.com',
          linkedProducts: ['p1', 'p3'],
          createdAt: Date.now() - 1000 * 60 * 60 * 24 * 180 
        },
        { 
          id: 'd3', 
          name: 'Western Region Depot', 
          location: 'Kisumu Town', 
          region: 'Western', 
          contactPerson: 'David Okoth',
          phone: '0733445566', 
          email: 'western.depot@example.com',
          linkedProducts: ['p2'],
          createdAt: Date.now() - 1000 * 60 * 60 * 24 * 90 
        }
      ],
      shops: [
        { id: 's1', name: 'Mama Lucy Shop', ownerName: 'Lucy W.', region: 'Central', routeName: 'Route A', location: { lat: -1.286389, lng: 36.817223 }, phoneNumber: '0722000000', status: 'active', lastVisited: Date.now() - 172800000, lastSaleAmount: 4500 },
        { id: 's2', name: 'Kariuki General Store', ownerName: 'John K.', region: 'Central', routeName: 'Route A', location: { lat: -1.288389, lng: 36.819223 }, phoneNumber: '0722111111', status: 'active', lastVisited: Date.now() - 86400000, lastSaleAmount: 12000 },
        { id: 's3', name: 'Sunrise Minimart', ownerName: 'Sarah M.', region: 'Central', routeName: 'Route A', location: { lat: -1.290389, lng: 36.821223 }, phoneNumber: '0722222222', status: 'new', lastVisited: 0, lastSaleAmount: 0 },
        { id: 's4', name: 'City Center Kiosk', ownerName: 'Peter O.', region: 'Central', routeName: 'Route B', location: { lat: -1.284389, lng: 36.815223 }, phoneNumber: '0722333333', status: 'inactive', lastVisited: Date.now() - 604800000, lastSaleAmount: 2500 },
      ],
      dailyReports: [
        {
          id: 'rep-1',
          agentId: 'agent-1',
          agentName: 'John Kamau',
          stockPoint: 'Nairobi Main',
          region: 'Central',
          date: '2026-04-11',
          route: 'Route A',
          targetCalls: 30,
          achievedCalls: 28,
          successfulCalls: 18,
          targetCartons: 50,
          achievedCartons: 45,
          achievedPackets: 12,
          targetSalesKsh: 150000,
          actualSalesKsh: 142000,
          percentageAchieved: 94.6,
          marketInsights: ['Competitor price drop in Route A', 'High demand for Premium Tea'],
          challenges: ['Heavy rain in the afternoon', 'Traffic congestion'],
          planForTomorrow: ['Visit remaining shops in Route A', 'Focus on Coffee sales'],
          submittedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
          adminComments: {
            text: 'Good effort despite the weather. Keep it up!',
            adminName: 'Admin',
            timestamp: Date.now() - 1000 * 60 * 60 * 24 * 1.5
          }
        },
        {
          id: 'rep-2',
          agentId: 'agent-2',
          agentName: 'Sarah Wanjiku',
          stockPoint: 'Mombasa Hub',
          region: 'Coast',
          date: '2026-04-11',
          route: 'Route C',
          targetCalls: 25,
          achievedCalls: 26,
          successfulCalls: 20,
          targetCartons: 40,
          achievedCartons: 42,
          achievedPackets: 5,
          targetSalesKsh: 120000,
          actualSalesKsh: 128000,
          percentageAchieved: 106.7,
          marketInsights: ['New shops opening in Route C', 'Positive feedback on Coffee'],
          challenges: ['None'],
          planForTomorrow: ['Expand into new area', 'Follow up on bulk orders'],
          submittedAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
        },
        // Generating more reports for the last 10 days for John and Sarah
        ...Array.from({ length: 10 }).map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (i + 3));
          const dateStr = date.toISOString().split('T')[0];
          return {
            id: `rep-john-${i}`,
            agentId: 'agent-1',
            agentName: 'John Kamau',
            stockPoint: 'Nairobi Main',
            region: 'Central',
            date: dateStr,
            route: 'Route A',
            targetCalls: 30,
            achievedCalls: Math.floor(Math.random() * 10) + 20,
            successfulCalls: Math.floor(Math.random() * 10) + 10,
            targetCartons: 50,
            achievedCartons: Math.floor(Math.random() * 20) + 35,
            achievedPackets: Math.floor(Math.random() * 20),
            targetSalesKsh: 150000,
            actualSalesKsh: Math.floor(Math.random() * 50000) + 120000,
            percentageAchieved: 0, // Will calculate below
            marketInsights: ['Insight 1', 'Insight 2'],
            challenges: ['Challenge 1'],
            planForTomorrow: ['Plan 1'],
            submittedAt: date.getTime() + 1000 * 60 * 60 * 18, // 6 PM
          };
        }).map(r => ({ ...r, percentageAchieved: (r.actualSalesKsh / r.targetSalesKsh) * 100 })),
        ...Array.from({ length: 10 }).map((_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (i + 3));
          const dateStr = date.toISOString().split('T')[0];
          return {
            id: `rep-sarah-${i}`,
            agentId: 'agent-2',
            agentName: 'Sarah Wanjiku',
            stockPoint: 'Mombasa Hub',
            region: 'Coast',
            date: dateStr,
            route: 'Route C',
            targetCalls: 25,
            achievedCalls: Math.floor(Math.random() * 10) + 20,
            successfulCalls: Math.floor(Math.random() * 10) + 10,
            targetCartons: 40,
            achievedCartons: Math.floor(Math.random() * 15) + 30,
            achievedPackets: Math.floor(Math.random() * 15),
            targetSalesKsh: 120000,
            actualSalesKsh: Math.floor(Math.random() * 40000) + 100000,
            percentageAchieved: 0, // Will calculate below
            marketInsights: ['Insight A', 'Insight B'],
            challenges: ['Challenge A'],
            planForTomorrow: ['Plan A'],
            submittedAt: date.getTime() + 1000 * 60 * 60 * 19, // 7 PM
          };
        }).map(r => ({ ...r, percentageAchieved: (r.actualSalesKsh / r.targetSalesKsh) * 100 })),
      ],
      routes: [
        { id: 'r1', name: 'Route A', region: 'Central', shops: ['s1', 's2', 's3'], color: '#0D9488', assignedAgents: ['a1'] },
        { id: 'r2', name: 'Route B', region: 'Central', shops: ['s4'], color: '#2563EB', assignedAgents: ['a2'] }
      ],

      addProduct: (product) => set((state) => ({ 
        products: [...state.products, product] 
      })),

      updateProduct: (product) => set((state) => ({
        products: state.products.map(p => p.id === product.id ? product : p)
      })),

      addInventory: (item) => {
        set((state) => {
          const product = state.products.find(p => p.sku === item.productSku);
          const packetsPerCarton = product?.packetsPerCarton || 24;
          
          const existingInv = state.inventory.find(i => i.agentId === item.agentId && i.productSku === item.productSku);
          
          let newCartons = item.quantityCartons;
          let newPackets = item.quantityPackets;
          
          if (existingInv) {
            const totalPackets = (existingInv.quantityCartons * packetsPerCarton) + existingInv.quantityPackets + 
                                (item.quantityCartons * packetsPerCarton) + item.quantityPackets;
            newCartons = Math.floor(totalPackets / packetsPerCarton);
            newPackets = totalPackets % packetsPerCarton;
          }

          const log: InventoryLog = {
            id: Math.random().toString(36).substr(2, 9),
            agentId: item.agentId,
            productId: item.productSku,
            type: 'addition',
            quantityCartons: item.quantityCartons,
            quantityPackets: item.quantityPackets,
            referenceId: item.distributorId,
            timestamp: Date.now(),
            balanceAfter: { cartons: newCartons, packets: newPackets }
          };
          
          const updatedInventory = existingInv 
            ? state.inventory.map(i => i.id === existingInv.id ? { ...i, quantityCartons: newCartons, quantityPackets: newPackets } : i)
            : [...state.inventory, item];

          return { 
            inventory: updatedInventory,
            inventoryLogs: [log, ...state.inventoryLogs]
          };
        });
        syncManager.addToQueue('inventory_add', item);
      },

      recordSale: (sale) => {
        set((state) => {
          const newLogs: InventoryLog[] = [];
          
          const updatedInventory = state.inventory.map(inv => {
            const saleItem = sale.items.find(si => si.productId === inv.productSku);
            if (saleItem && inv.agentId === sale.agentId) {
              const product = state.products.find(p => p.sku === inv.productSku);
              const packetsPerCarton = product?.packetsPerCarton || 24;

              let totalPacketsInInv = (inv.quantityCartons * packetsPerCarton) + inv.quantityPackets;
              let totalPacketsToDeduct = (saleItem.quantityCartons * packetsPerCarton) + saleItem.quantityPackets;
              
              let remainingTotalPackets = totalPacketsInInv - totalPacketsToDeduct;
              
              const newCartons = Math.floor(remainingTotalPackets / packetsPerCarton);
              const newPackets = remainingTotalPackets % packetsPerCarton;

              newLogs.push({
                id: Math.random().toString(36).substr(2, 9),
                agentId: sale.agentId,
                productId: inv.productSku,
                type: 'deduction',
                quantityCartons: saleItem.quantityCartons,
                quantityPackets: saleItem.quantityPackets,
                referenceId: sale.id,
                reason: saleItem.overrideReason,
                timestamp: Date.now(),
                balanceAfter: { cartons: newCartons, packets: newPackets }
              });

              return {
                ...inv,
                quantityCartons: newCartons,
                quantityPackets: newPackets
              };
            }
            return inv;
          });

          return {
            sales: [sale, ...state.sales],
            inventory: updatedInventory,
            inventoryLogs: [...newLogs, ...state.inventoryLogs]
          };
        });
        syncManager.addToQueue('sale', sale);
      },

      adjustInventory: (agentId, productSku, cartons, packets, type, reason) => {
        set((state) => {
          const product = state.products.find(p => p.sku === productSku);
          const packetsPerCarton = product?.packetsPerCarton || 24;
          const existingInv = state.inventory.find(i => i.agentId === agentId && i.productSku === productSku);
          
          if (!existingInv) return state;

          const currentTotal = (existingInv.quantityCartons * packetsPerCarton) + existingInv.quantityPackets;
          const adjustmentTotal = (cartons * packetsPerCarton) + packets;
          
          let newTotal = currentTotal;
          if (type === 'addition') newTotal += adjustmentTotal;
          else if (type === 'deduction') newTotal -= adjustmentTotal;
          else if (type === 'adjustment') newTotal = adjustmentTotal;

          const newCartons = Math.floor(newTotal / packetsPerCarton);
          const newPackets = newTotal % packetsPerCarton;

          const log: InventoryLog = {
            id: Math.random().toString(36).substr(2, 9),
            agentId,
            productId: productSku,
            type: type === 'adjustment' ? 'adjustment' : (type === 'addition' ? 'addition' : 'deduction'),
            quantityCartons: cartons,
            quantityPackets: packets,
            reason,
            timestamp: Date.now(),
            balanceAfter: { cartons: newCartons, packets: newPackets }
          };

          return {
            inventory: state.inventory.map(i => i.id === existingInv.id ? { ...i, quantityCartons: newCartons, quantityPackets: newPackets } : i),
            inventoryLogs: [log, ...state.inventoryLogs]
          };
        });
      },

      addShop: (shop) => set((state) => ({ 
        shops: [...state.shops, shop] 
      })),

      updateShop: (shop) => set((state) => ({
        shops: state.shops.map(s => s.id === shop.id ? shop : s)
      })),

      deleteShop: (shopId) => set((state) => ({
        shops: state.shops.filter(s => s.id !== shopId),
        routes: state.routes.map(r => ({
          ...r,
          shops: r.shops.filter(id => id !== shopId)
        }))
      })),

      addRoute: (route) => set((state) => ({
        routes: [...state.routes, route]
      })),

      updateRoute: (route) => set((state) => ({
        routes: state.routes.map(r => r.id === route.id ? route : r)
      })),

      deleteRoute: (routeId) => set((state) => ({
        routes: state.routes.filter(r => r.id !== routeId)
      })),

      addDistributor: (distributor) => set((state) => ({
        distributors: [...state.distributors, distributor]
      })),

      updateDistributor: (distributor) => set((state) => ({
        distributors: state.distributors.map(d => d.id === distributor.id ? distributor : d)
      })),

      deleteDistributor: (distributorId) => set((state) => ({
        distributors: state.distributors.filter(d => d.id !== distributorId)
      })),

      submitReport: (report) => {
        set((state) => ({ 
          dailyReports: [report, ...state.dailyReports] 
        }));
        syncManager.addToQueue('report', report);
      },

      addReportComment: (reportId, comment) => set((state) => ({
        dailyReports: state.dailyReports.map(r => r.id === reportId ? { ...r, adminComments: comment } : r)
      })),
    }),
    {
      name: 'sales-pro-storage',
    }
  )
);
