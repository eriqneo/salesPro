import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import AdminShell from '@/layouts/AdminShell';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/store/useAuthStore';
import { AgentRouter } from '@/router/AgentRouter';

// Lazy load pages
const LoginPage = lazy(() => import('@/pages/auth/LoginPage.tsx'));
const AdminOverview = lazy(() => import('@/pages/admin/AdminOverview'));
const AdminInventory = lazy(() => import('@/pages/admin/AdminInventory.tsx'));
const AdminSettings = lazy(() => import('@/pages/admin/AdminSettings.tsx'));
const AdminReportsPage = lazy(() => import('@/pages/admin/AdminReportsPage.tsx'));
const AdminAnalyticsPage = lazy(() => import('@/pages/admin/AdminAnalyticsPage.tsx'));
const AgentsListPage = lazy(() => import('@/pages/admin/AgentsListPage.tsx'));
const AgentProfilePage = lazy(() => import('@/pages/admin/AgentProfilePage.tsx'));
const SalesReportsPage = lazy(() => import('@/pages/admin/SalesReportsPage.tsx'));
const AdminRoutesShops = lazy(() => import('@/pages/admin/AdminRoutesShops.tsx'));
const DistributorsListPage = lazy(() => import('@/pages/admin/DistributorsListPage.tsx'));
const DistributorDetailPage = lazy(() => import('@/pages/admin/DistributorDetailPage.tsx'));
const DailyReportsPage = lazy(() => import('@/pages/admin/DailyReportsPage.tsx'));

const PageLoader = () => (
  <div className="p-4 space-y-4">
    <Skeleton className="h-8 w-48" />
    <Skeleton className="h-32 w-full rounded-2xl" />
    <Skeleton className="h-32 w-full rounded-2xl" />
    <Skeleton className="h-32 w-full rounded-2xl" />
  </div>
);

const RootRedirect = () => {
  const { user } = useAuthStore();
  
  if (!user) return <Navigate to="/login" replace />;
  
  if (user.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  
  return <Navigate to="/agent/home" replace />;
};

export default function App() {
  const { user, loading, setLoading } = useAuthStore();

  useEffect(() => {
    // Ensure loading is set to false after hydration if not already
    const checkHydration = () => {
      if (useAuthStore.persist.hasHydrated()) {
        setLoading(false);
      }
    };
    checkHydration();
  }, [setLoading]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (user?.preferences?.textSize) {
      const root = document.documentElement;
      const sizes = {
        small: '14px',
        normal: '16px',
        large: '18px'
      } as const;
      root.style.setProperty('--base-font-size', sizes[user.preferences.textSize as keyof typeof sizes] || '16px');
    }
  }, [user?.preferences?.textSize]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <PageLoader />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            <Route path="/" element={<RootRedirect />} />

            <Route path="/agent/*" element={<AgentRouter />} />

            {/* Admin Routes */}
            <Route element={<AdminShell />}>
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminOverview />
                </ProtectedRoute>
              } />
              <Route path="/admin/sales" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminAnalyticsPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/sales-reports" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <SalesReportsPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/agents" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AgentsListPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/agents/:id" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AgentProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/admin/inventory" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminInventory />
                </ProtectedRoute>
              } />
              <Route path="/admin/routes-shops" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminRoutesShops />
                </ProtectedRoute>
              } />
              <Route path="/admin/distributors" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DistributorsListPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/distributors/:id" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DistributorDetailPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/daily-reports" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <DailyReportsPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/settings" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminSettings />
                </ProtectedRoute>
              } />
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
        <Toaster position="top-center" richColors />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
