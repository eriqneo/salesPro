import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AgentShell } from '@/components/navigation/AgentShell';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AgentSkeleton } from '@/components/navigation/AgentSkeleton';

// Lazy load agent pages
const HomeScreen = lazy(() => import('@/pages/sales/AgentDashboard.tsx'));
const InventoryScreen = lazy(() => import('@/pages/sales/InventoryPage.tsx'));
const ShopsScreen = lazy(() => import('@/pages/sales/ShopsPage.tsx'));
const ReportScreen = lazy(() => import('@/pages/sales/ReportPage.tsx'));
const SettingsScreen = lazy(() => import('@/pages/sales/SettingsPage.tsx'));
const SalesHistoryScreen = lazy(() => import('@/pages/sales/SalesHistoryPage.tsx'));
const SaleDetailScreen = lazy(() => import('@/pages/sales/SaleDetailPage.tsx'));
const ReportHistoryScreen = lazy(() => import('@/pages/sales/ReportHistoryPage.tsx'));
const RecordSaleScreen = lazy(() => import('@/pages/sales/RecordSalePage.tsx'));
const ProfileScreen = lazy(() => import('@/pages/sales/ProfilePage.tsx'));
const HelpScreen = lazy(() => import('@/pages/sales/HelpPage.tsx'));

// Placeholders for missing screens
const ProductDetailScreen = () => <div className="p-4">Product Detail Screen</div>;
const ShopDetailScreen = () => <div className="p-4">Shop Detail Screen</div>;
const ReportDetailScreen = () => <div className="p-4">Report Detail Screen</div>;

export const AgentRouter = () => (
  <Routes>
    <Route element={
      <ProtectedRoute allowedRoles={['agent']}>
        <AgentShell />
      </ProtectedRoute>
    }>
      <Route index element={<Navigate to="home" replace />} />
      <Route path="home" element={<Suspense fallback={<AgentSkeleton />}><HomeScreen /></Suspense>} />
      <Route path="inventory" element={<Suspense fallback={<AgentSkeleton />}><InventoryScreen /></Suspense>} />
      <Route path="inventory/:id" element={<Suspense fallback={<AgentSkeleton />}><ProductDetailScreen /></Suspense>} />
      <Route path="shops" element={<Suspense fallback={<AgentSkeleton />}><ShopsScreen /></Suspense>} />
      <Route path="shops/:id" element={<Suspense fallback={<AgentSkeleton />}><ShopDetailScreen /></Suspense>} />
      <Route path="report" element={<Suspense fallback={<AgentSkeleton />}><ReportScreen /></Suspense>} />
      <Route path="report/history" element={<Suspense fallback={<AgentSkeleton />}><ReportHistoryScreen /></Suspense>} />
      <Route path="report/history/:id" element={<Suspense fallback={<AgentSkeleton />}><ReportDetailScreen /></Suspense>} />
      <Route path="record" element={<Suspense fallback={<AgentSkeleton />}><RecordSaleScreen /></Suspense>} />
      <Route path="history" element={<Suspense fallback={<AgentSkeleton />}><SalesHistoryScreen /></Suspense>} />
      <Route path="history/:id" element={<Suspense fallback={<AgentSkeleton />}><SaleDetailScreen /></Suspense>} />
      <Route path="profile" element={<Suspense fallback={<AgentSkeleton />}><ProfileScreen /></Suspense>} />
      <Route path="settings" element={<Suspense fallback={<AgentSkeleton />}><SettingsScreen /></Suspense>} />
      <Route path="help" element={<Suspense fallback={<AgentSkeleton />}><HelpScreen /></Suspense>} />
    </Route>
  </Routes>
);
