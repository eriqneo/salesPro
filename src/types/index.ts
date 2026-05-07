export type UserRole = 'agent' | 'admin';

export interface UserPreferences {
  eodReportReminder: boolean;
  eodReportTime: string; // e.g. "17:30"
  dailyTargetAlert: boolean;
  lowStockWarning: boolean;
  syncAlerts: boolean;
  adminMessages: boolean; // always true
  language: 'en' | 'sw';
  textSize: 'small' | 'normal' | 'large';
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  region: string;
  stockPoint: string;
  phoneNumber: string;
  photoURL?: string;
  createdAt: number;
  status?: 'active' | 'inactive';
  lastActive?: number;
  assignedRoutes?: string[];
  preferences?: UserPreferences;
  firstLogin?: boolean;
}

export interface Distributor {
  id: string;
  name: string;
  location: string;
  region: string;
  contactPerson: string;
  phone: string;
  email: string;
  notes?: string;
  linkedProducts?: string[]; // Array of product IDs
  createdAt: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  packetsPerCarton: number;
  category?: string;
  basePriceKsh: number;
  reorderLevel: number; // in cartons
  costPriceKsh: number;
  status: 'active' | 'archived';
}

export interface InventoryLog {
  id: string;
  agentId: string;
  productId: string;
  type: 'addition' | 'deduction' | 'adjustment';
  quantityCartons: number;
  quantityPackets: number;
  referenceId?: string; // saleId or distributorId
  reason?: string;
  timestamp: number;
  balanceAfter: {
    cartons: number;
    packets: number;
  };
}

export interface InventoryItem {
  id: string;
  agentId: string;
  productName: string;
  productSku: string;
  quantityCartons: number;
  quantityPackets: number;
  unitCostKsh: number;
  addedAt: number;
  distributorId: string;
  expiryDate: string;
}

export interface SaleItem {
  productId: string;
  quantityCartons: number;
  quantityPackets: number;
  priceKsh: number;
  overrideReason?: string;
}

export interface Sale {
  id: string;
  agentId: string;
  shopId: string;
  items: SaleItem[];
  totalKsh: number;
  routeName: string;
  timestamp: number;
  syncStatus: 'pending' | 'synced';
}

export interface Shop {
  id: string;
  name: string;
  ownerName: string;
  region: string;
  routeName: string;
  location: {
    lat: number;
    lng: number;
  };
  phoneNumber: string;
  address?: string;
  status?: 'active' | 'inactive' | 'new';
  lastVisited?: number;
  lastSaleAmount?: number;
}

export interface DailyReport {
  id: string;
  agentId: string;
  agentName: string;
  stockPoint: string;
  region: string;
  date: string;
  route: string;
  targetCalls: number;
  achievedCalls: number;
  successfulCalls: number;
  targetCartons: number;
  achievedCartons: number;
  achievedPackets: number;
  targetSalesKsh: number;
  actualSalesKsh: number;
  percentageAchieved: number;
  marketInsights: string[];
  challenges: string[];
  planForTomorrow: string[];
  submittedAt: number;
  adminComments?: {
    text: string;
    adminName: string;
    timestamp: number;
  };
}

export interface Route {
  id: string;
  name: string;
  region: string;
  shops: string[]; // Array of shopIds
  color?: string;
  assignedAgents?: string[]; // Array of agent uids
}
